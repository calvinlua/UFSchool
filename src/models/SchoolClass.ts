import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface SchoolClassAttributes {
  id: number;
  classCode: string;
  className: string;
}

type SchoolClassCreationAttributes = Optional<SchoolClassAttributes, 'id'>;

class SchoolClass extends Model<SchoolClassAttributes, SchoolClassCreationAttributes> implements SchoolClassAttributes {
  public id!: number;
  public classCode!: string;
  public className!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

SchoolClass.init({
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  classCode: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
  },
  className: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
}, {
  sequelize,
  tableName: 'classes',
  underscored: true,
});

export default SchoolClass;
