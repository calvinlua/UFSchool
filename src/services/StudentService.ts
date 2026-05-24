import axios from 'axios';
import { Op } from 'sequelize';
import { Student, SchoolClass, TeachingAssignment } from '../models';
import { ExternalStudentResponse } from 'ExternalStudentResponse';
import BadRequestError from '../errors/BadRequestError';

export interface StudentListItem {
  id: number;
  name: string;
  email: string;
  isExternal: boolean;
}

export interface StudentListResult {
  count: number;
  students: StudentListItem[];
}

const getExternalBaseUrl = (): string =>
  process.env.EXTERNAL_BASE_URL || 'http://localhost:5000';

/**
 * Fetches all external students for a class in one request.
 * A large limit (10 000) covers any realistic class size; the service
 * returns the true total in `count`.
 */
const fetchAllExternalStudents = async (classCode: string): Promise<ExternalStudentResponse> => {
  const url = `${getExternalBaseUrl()}/students`;
  const response = await axios.get<ExternalStudentResponse>(url, {
    params: { class: classCode, offset: 0, limit: 10000 },
  });
  return response.data;
};

/**
 * Returns a paginated, alphanumerically sorted list of all students
 * (internal + external) enrolled in the given class.
 *
 * Two-query approach avoids GROUP BY / ONLY_FULL_GROUP_BY issues on MySQL 8:
 *  1. Fetch distinct student IDs from teaching_assignments for the class.
 *  2. Fetch student rows by those IDs.
 */
export const getStudentsForClass = async (
  classCode: string,
  offset: number,
  limit: number,
): Promise<StudentListResult> => {
  const cls = await SchoolClass.findOne({ where: { classCode } });
  if (!cls) {
    throw new BadRequestError(`Class '${classCode}' not found`);
  }

  // Step 1: distinct student IDs enrolled in this class.
  const assignments = await TeachingAssignment.findAll({
    where: { classId: cls.id },
    attributes: ['studentId'],
  });
  const studentIds = [...new Set(assignments.map(a => a.studentId))];

  // Step 2: fetch student details (empty array is valid when no internal students).
  const internalStudents = studentIds.length > 0
    ? await Student.findAll({
        where: { id: { [Op.in]: studentIds } },
        attributes: ['id', 'name', 'email'],
      })
    : [];

  // Fetch external students on demand — must NOT be stored locally.
  const externalData = await fetchAllExternalStudents(classCode);

  const internalList: StudentListItem[] = internalStudents.map(s => ({
    id: s.id,
    name: s.name,
    email: s.email,
    isExternal: false,
  }));

  const externalList: StudentListItem[] = externalData.students.map(s => ({
    id: s.id,
    name: s.name,
    email: s.email,
    isExternal: true,
  }));

  // Merge and sort alphanumerically by student name.
  const allStudents = [...internalList, ...externalList].sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }),
  );

  return {
    count: allStudents.length,
    students: allStudents.slice(offset, offset + limit),
  };
};
