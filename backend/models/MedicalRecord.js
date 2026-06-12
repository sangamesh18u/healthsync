import { DataTypes } from 'sequelize';
import sequelize from '../db.js';
import Patient from './Patient.js';
import User from './User.js';

const MedicalRecord = sequelize.define('MedicalRecord', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  visitDate: { type: DataTypes.DATEONLY, allowNull: false },
  diagnosis: { type: DataTypes.TEXT, allowNull: false },
  prescription: { type: DataTypes.TEXT, allowNull: true },
  labResults: { type: DataTypes.TEXT, allowNull: true },
  notes: { type: DataTypes.TEXT, allowNull: true },
});

Patient.hasMany(MedicalRecord, { foreignKey: 'patientId' });
MedicalRecord.belongsTo(Patient, { foreignKey: 'patientId' });

User.hasMany(MedicalRecord, { foreignKey: 'doctorId' });
MedicalRecord.belongsTo(User, { as: 'doctor', foreignKey: 'doctorId' });

export default MedicalRecord;
