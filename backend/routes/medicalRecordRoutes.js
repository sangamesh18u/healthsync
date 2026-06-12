import express from 'express';
import MedicalRecord from '../models/MedicalRecord.js';
import Patient from '../models/Patient.js';
import User from '../models/User.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const records = await MedicalRecord.findAll({
      include: [
        { model: Patient },
        { model: User, as: 'doctor', attributes: ['id', 'name', 'department'] }
      ],
      order: [['visitDate', 'DESC']]
    });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/patient/:patientId', async (req, res) => {
  try {
    const records = await MedicalRecord.findAll({
      where: { patientId: req.params.patientId },
      include: [{ model: User, as: 'doctor', attributes: ['id', 'name'] }],
      order: [['visitDate', 'DESC']]
    });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const record = await MedicalRecord.create(req.body);
    res.status(201).json(record);
  } catch (error) {
    res.status(400).json({ message: 'Bad request', error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const record = await MedicalRecord.findByPk(req.params.id);
    if (!record) return res.status(404).json({ message: 'Not found' });
    await record.destroy();
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
