/** Mirrors the exact CSV column headers (note: classname is lowercase). */
export interface CsvItem {
  teacherEmail: string;
  teacherName: string;
  studentEmail: string;
  studentName: string;
  classCode: string;
  classname: string;
  subjectCode: string;
  subjectName: string;
  toDelete: string;
}
