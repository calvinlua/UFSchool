import Teacher from './Teacher';
import Student from './Student';
import SchoolClass from './SchoolClass';
import Subject from './Subject';
import TeachingAssignment from './TeachingAssignment';

Teacher.hasMany(TeachingAssignment, { foreignKey: 'teacherId' });
TeachingAssignment.belongsTo(Teacher, { foreignKey: 'teacherId' });

Student.hasMany(TeachingAssignment, { foreignKey: 'studentId' });
TeachingAssignment.belongsTo(Student, { foreignKey: 'studentId' });

SchoolClass.hasMany(TeachingAssignment, { foreignKey: 'classId' });
TeachingAssignment.belongsTo(SchoolClass, { foreignKey: 'classId' });

Subject.hasMany(TeachingAssignment, { foreignKey: 'subjectId' });
TeachingAssignment.belongsTo(Subject, { foreignKey: 'subjectId' });

export { Teacher, Student, SchoolClass, Subject, TeachingAssignment };
