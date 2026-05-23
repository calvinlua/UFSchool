import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

export interface TeachingAssignmentAttributes {
  teacherId: number;
  studentId: number;
  classId: number;
  subjectId: number;
}

class TeachingAssignment extends Model<TeachingAssignmentAttributes> implements TeachingAssignmentAttributes {
  public teacherId!: number;
  public studentId!: number;
  public classId!: number;
  public subjectId!: number;
}

TeachingAssignment.init({
  teacherId: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    field: 'teacher_id',
  },
  studentId: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    field: 'student_id',
  },
  classId: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    field: 'class_id',
  },
  subjectId: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    field: 'subject_id',
  },
}, {
  sequelize,
  tableName: 'teaching_assignments',
  underscored: true,
  timestamps: false,
});

export default TeachingAssignment;
