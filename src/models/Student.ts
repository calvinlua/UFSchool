import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface StudentAttributes {
  id: number;
  email: string;
  name: string;
}

type StudentCreationAttributes = Optional<StudentAttributes, 'id'>;

class Student extends Model<StudentAttributes, StudentCreationAttributes> implements StudentAttributes {
  public id!: number;
  public email!: string;
  public name!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Student.init({
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
}, {
  sequelize,
  tableName: 'students',
  underscored: true,
});

export default Student;
