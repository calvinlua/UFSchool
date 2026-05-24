import { Op, Transaction } from 'sequelize';
import sequelize from '../config/database';
import { Teacher, Student, SchoolClass, Subject, TeachingAssignment } from '../models';
import { CsvItem } from 'CsvItem';
import BadRequestError from '../errors/BadRequestError';

const REQUIRED_FIELDS: (keyof CsvItem)[] = [
  'teacherEmail', 'teacherName',
  'studentEmail', 'studentName',
  'classCode', 'classname',
  'subjectCode', 'subjectName',
  'toDelete',
];

const validateRows = (rows: CsvItem[]): void => {
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNumber = i + 2; // +2: 1-indexed, row 1 is the header

    for (const field of REQUIRED_FIELDS) {
      if (row[field] === undefined || row[field] === null || row[field] === '') {
        throw new BadRequestError(`Missing required field '${field}' on CSV row ${rowNumber}`);
      }
    }

    if (row.toDelete !== '0' && row.toDelete !== '1') {
      throw new BadRequestError(
        `Invalid toDelete value '${row.toDelete}' on CSV row ${rowNumber}. Must be 0 or 1.`,
      );
    }
  }
};

/**
 * Upserts all teachers, students, classes and subjects from the CSV rows, then
 * creates or deletes teaching assignments per the toDelete flag.
 *
 * "Latest record wins" is naturally enforced: we iterate rows in order so each
 * upsert overwrites the previous name for the same unique key.
 */
export const processImport = async (rows: CsvItem[]): Promise<void> => {
  if (rows.length === 0) return;

  validateRows(rows);

  // Build maps of unique keys → latest names (last row for a key wins).
  const teacherMap = new Map<string, string>();
  const studentMap = new Map<string, string>();
  const classMap   = new Map<string, string>();
  const subjectMap = new Map<string, string>();

  for (const row of rows) {
    teacherMap.set(row.teacherEmail, row.teacherName);
    studentMap.set(row.studentEmail, row.studentName);
    classMap.set(row.classCode, row.classname);
    subjectMap.set(row.subjectCode, row.subjectName);
  }

  await sequelize.transaction(async (t: Transaction) => {
    // Upsert all entity tables in parallel (independent tables, no FK issues).
    const upserts: Promise<unknown>[] = [
      ...Array.from(teacherMap.entries()).map(([email, name]) =>
        Teacher.upsert({ email, name }, { transaction: t }),
      ),
      ...Array.from(studentMap.entries()).map(([email, name]) =>
        Student.upsert({ email, name }, { transaction: t }),
      ),
      ...Array.from(classMap.entries()).map(([classCode, className]) =>
        SchoolClass.upsert({ classCode, className }, { transaction: t }),
      ),
      ...Array.from(subjectMap.entries()).map(([subjectCode, subjectName]) =>
        Subject.upsert({ subjectCode, subjectName }, { transaction: t }),
      ),
    ];
    await Promise.all(upserts);

    // Fetch all just-upserted rows so we have their IDs.
    const [teachers, students, classes, subjects] = await Promise.all([
      Teacher.findAll({ where: { email: { [Op.in]: Array.from(teacherMap.keys()) } }, transaction: t }),
      Student.findAll({ where: { email: { [Op.in]: Array.from(studentMap.keys()) } }, transaction: t }),
      SchoolClass.findAll({ where: { classCode: { [Op.in]: Array.from(classMap.keys()) } }, transaction: t }),
      Subject.findAll({ where: { subjectCode: { [Op.in]: Array.from(subjectMap.keys()) } }, transaction: t }),
    ]);

    const teacherIdMap = new Map(teachers.map(r => [r.email, r.id]));
    const studentIdMap = new Map(students.map(r => [r.email, r.id]));
    const classIdMap   = new Map(classes.map(r => [r.classCode, r.id]));
    const subjectIdMap = new Map(subjects.map(r => [r.subjectCode, r.id]));

    // Process each CSV row's teaching assignment.
    for (const row of rows) {
      const teacherId = teacherIdMap.get(row.teacherEmail)!;
      const studentId = studentIdMap.get(row.studentEmail)!;
      const classId   = classIdMap.get(row.classCode)!;
      const subjectId = subjectIdMap.get(row.subjectCode)!;

      if (row.toDelete === '1') {
        await TeachingAssignment.destroy({
          where: { teacherId, studentId, classId, subjectId },
          transaction: t,
        });
      } else {
        await TeachingAssignment.findOrCreate({
          where:    { teacherId, studentId, classId, subjectId },
          defaults: { teacherId, studentId, classId, subjectId },
          transaction: t,
        });
      }
    }
  });
};
