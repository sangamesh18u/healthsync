import express from 'express';
import { User } from '../models/index.js';
import { authenticate } from '../middleware/authMiddleware.js';
import bcrypt from 'bcryptjs';

const router = express.Router();

router.use(authenticate);

// Get all users (staff)
router.get('/', async (req, res) => {
  try {
    const users = await User.findAll({ attributes: { exclude: ['password'] } });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all doctors
router.get('/doctors', async (req, res) => {
  try {
    const doctors = await User.findAll({
      where: { role: 'doctor' },
      attributes: { exclude: ['password'] }
    });
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create staff member
router.post('/', async (req, res) => {
  try {
    const { name, email, password, role, department } = req.body;
    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(400).json({ message: 'Email already in use' });
    const hashed = await bcrypt.hash(password || 'password123', 10);
    const user = await User.create({ name, email, password: hashed, role, department });
    const { password: _, ...userData } = user.toJSON();
    res.status(201).json(userData);
  } catch (error) {
    res.status(400).json({ message: 'Bad request', error: error.message });
  }
});

// Update staff member
router.put('/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const { password, ...rest } = req.body;
    if (password) {
      rest.password = await bcrypt.hash(password, 10);
    }
    await user.update(rest);
    const { password: _, ...userData } = user.toJSON();
    res.json(userData);
  } catch (error) {
    res.status(400).json({ message: 'Bad request' });
  }
});

// Delete staff member
router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    await user.destroy();
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
