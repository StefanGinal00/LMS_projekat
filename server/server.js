import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sequelize from './config/database.js';

// Rute
import authRoutes from './routes/auth.js';
import publicRoutes from './routes/public.js';
import studentRoutes from './routes/student.js';
import teacherRoutes  from './routes/teacher.js';

// Učitavanje .env varijabli
dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Test ruta
app.get('/', (req, res) => {
  res.send('LMS Server je pokrenut');
});

// Rute
app.use('/api/auth', authRoutes);
app.use('/api', publicRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/teacher', teacherRoutes);

// Povezivanje sa bazom
sequelize.authenticate()
  .then(() => {
    console.log('Konekcija sa MySQL uspešna');
    return sequelize.sync({ alter: true }); // automatski prilagođava tabele ako su modeli menjani
  })
  .then(() => {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server pokrenut na http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('Greška pri povezivanju sa bazom:', err.message);
  });
