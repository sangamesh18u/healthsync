import { DataTypes } from 'sequelize';
import sequelize from '../db.js';
import User from './User.js';
import Patient from './Patient.js';

const Appointment = sequelize.define('Appointment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  time: {
    type: DataTypes.TIME,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('Scheduled', 'Completed', 'Cancelled'),
    defaultValue: 'Scheduled'
  },
  reason: {
    type: DataTypes.STRING,
    allowNull: true
  }
});

// Relationships
Patient.hasMany(Appointment, { foreignKey: 'patientId' });
Appointment.belongsTo(Patient, { foreignKey: 'patientId' });

User.hasMany(Appointment, { foreignKey: 'doctorId' });
Appointment.belongsTo(User, { as: 'doctor', foreignKey: 'doctorId' });

export default Appointment;
