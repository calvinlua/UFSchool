import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface SubjectAttributes {
  id: number;
  subjectCode: string;
  subjectName: string;
}

type SubjectCreationAttributes = Optional<SubjectAttributes, 'id'>;

class Subject extends Model<SubjectAttributes, SubjectCreationAttributes> implements SubjectAttributes {
  public id!: number;
  public subjectCode!: string;
  public subjectName!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Subject.init({
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  subjectCode: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
  },
  subjectName: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
}, {
  sequelize,
  tableName: 'subjects',
  underscored: true,
});

export default Subject;
