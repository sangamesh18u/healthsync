import { DataTypes } from 'sequelize';
import sequelize from '../db.js';
import Patient from './Patient.js';
import User from './User.js';

const Bill = sequelize.define('Bill', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  visitDate: { type: DataTypes.DATEONLY, allowNull: false },
  consultationFee: { type: DataTypes.FLOAT, defaultValue: 0 },
  medicationFee: { type: DataTypes.FLOAT, defaultValue: 0 },
  labFee: { type: DataTypes.FLOAT, defaultValue: 0 },
  otherFee: { type: DataTypes.FLOAT, defaultValue: 0 },
  totalAmount: { type: DataTypes.FLOAT, allowNull: false },
  paidAmount: { type: DataTypes.FLOAT, defaultValue: 0 },
  status: { type: DataTypes.STRING, defaultValue: 'Unpaid' }, // Unpaid, Paid, Partial
  notes: { type: DataTypes.TEXT, allowNull: true },
});

Patient.hasMany(Bill, { foreignKey: 'patientId' });
Bill.belongsTo(Patient, { foreignKey: 'patientId' });

User.hasMany(Bill, { foreignKey: 'doctorId' });
Bill.belongsTo(User, { as: 'doctor', foreignKey: 'doctorId' });

export default Bill;
