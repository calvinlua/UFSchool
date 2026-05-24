import { QueryTypes } from 'sequelize';
import sequelize from '../config/database';

interface WorkloadRow {
  teacherName: string;
  subjectCode: string;
  subjectName: string;
  numberOfClasses: number;
}

export interface WorkloadEntry {
  subjectCode: string;
  subjectName: string;
  numberOfClasses: number;
}

export type WorkloadReport = Record<string, WorkloadEntry[]>;

/**
 * Returns each teacher's workload: the subjects they teach and how many
 * distinct classes they teach each subject in.
 */
export const getWorkloadReport = async (): Promise<WorkloadReport> => {
  const rows = await sequelize.query<WorkloadRow>(
    `SELECT
       t.name                        AS teacherName,
       s.subject_code                AS subjectCode,
       s.subject_name                AS subjectName,
       COUNT(DISTINCT ta.class_id)   AS numberOfClasses
     FROM teaching_assignments ta
     JOIN teachers t  ON ta.teacher_id  = t.id
     JOIN subjects s  ON ta.subject_id  = s.id
     GROUP BY t.id, t.name, s.id, s.subject_code, s.subject_name
     ORDER BY t.name, s.subject_code`,
    { type: QueryTypes.SELECT },
  );

  const report: WorkloadReport = {};

  for (const row of rows) {
    if (!report[row.teacherName]) {
      report[row.teacherName] = [];
    }
    report[row.teacherName].push({
      subjectCode: row.subjectCode,
      subjectName: row.subjectName,
      numberOfClasses: Number(row.numberOfClasses),
    });
  }

  return report;
};
