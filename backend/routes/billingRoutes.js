import express from 'express';
import Bill from '../models/Bill.js';
import Patient from '../models/Patient.js';
import User from '../models/User.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const bills = await Bill.findAll({
      include: [
        { model: Patient },
        { model: User, as: 'doctor', attributes: ['id', 'name'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(bills);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const bill = await Bill.create(req.body);
    res.status(201).json(bill);
  } catch (error) {
    res.status(400).json({ message: 'Bad request', error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const bill = await Bill.findByPk(req.params.id);
    if (!bill) return res.status(404).json({ message: 'Not found' });
    await bill.update(req.body);
    res.json(bill);
  } catch (error) {
    res.status(400).json({ message: 'Bad request' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const bill = await Bill.findByPk(req.params.id);
    if (!bill) return res.status(404).json({ message: 'Not found' });
    await bill.destroy();
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
