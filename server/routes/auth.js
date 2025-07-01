import express from 'express';
import auth   from '../middleware/auth.js';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
const jwtSecret = process.env.JWT_SECRET; 

// Prijava
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Pronalaženje korisnika
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'Korisnik nije pronađen' });
    }

    // Provera lozinke
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Pogrešna lozinka' });
    }

    // Generisanje JWT tokena
    const token = jwt.sign(
      { id: user.id, role: user.role },
      jwtSecret,
      { expiresIn: '1h' }
    );

    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Registracija
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    // Provera da li korisnik već postoji
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Korisnik već postoji' });
    }

    // Hash lozinke
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Kreiranje korisnika
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role
    });

    res.status(201).json({ message: 'Korisnik uspešno registrovan' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/auth/me - Dobijanje podataka o ulogovanom korisniku
router.get('/me', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Niste prijavljeni' });

  try {
    const decoded = jwt.verify(token, jwtSecret);
    const user = await User.findByPk(decoded.id, {
      attributes: ['id', 'name', 'email', 'role']
    });
    res.json(user);
  } catch (err) {
    res.status(401).json({ message: 'Nevažeći token' });
  }
});

// UPDATE /api/auth/me
router.put('/me', auth, async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const user = await User.findByPk(req.user.id);
    if (name)  user.name  = name;
    if (email) user.email = email;
    if (password) {
      user.password = await bcrypt.hash(password, 12);
    }
    await user.save();
    res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;