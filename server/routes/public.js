import express from 'express';
import Faculty from '../models/Faculty.js';
import Program from '../models/Program.js';
import University from '../models/University.js';
import Course     from '../models/Courses.js';

const router = express.Router();

// GET /api/faculties - Lista svih fakulteta
router.get('/faculties', async (req, res) => {
  try {
    const faculties = await Faculty.findAll(); // Sequelize metod umesto find()
    res.json(faculties);
  } catch (err) {
    console.error('Greška pri dohvatanju fakulteta:', err);
    res.status(500).json({ 
      message: 'Greška pri dohvatanju fakulteta',
      error: err.message 
    });
  }
});

// GET /api/faculties/:id - Detalji fakulteta
router.get('/faculties/:id', async (req, res) => {
  try {
    const faculty = await Faculty.findByPk(req.params.id); // findByPk za primarni ključ
    if (!faculty) return res.status(404).json({ message: 'Fakultet nije pronađen' });
    res.json(faculty);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/programs - Lista studijskih programa sa pripadnim fakultetom
router.get('/programs', async (req, res) => {
  try {
    // U Sequelize za relacije koristi include da ubaciš povezani model
    const programs = await Program.findAll({ include: Faculty });
    res.json(programs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/programs/:id - Detalji programa sa fakultetom
router.get('/programs/:id', async (req, res) => {
  try {
    const program = await Program.findByPk(req.params.id, { include: Faculty });
    if (!program) return res.status(404).json({ message: 'Program nije pronađen' });
    res.json(program);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/courses/:id/syllabus - Silabus kursa
router.get('/courses/:id/syllabus', async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id);
    if (!course) return res.status(404).json({ message: 'Kurs nije pronađen' });

    res.json({
      courseName: course.name,
      content: course.syllabus || 'Silabus nije dostupan'
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/courses/:id/materials - Materijali za kurs
router.get('/courses/:id/materials', async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id);
    if (!course) return res.status(404).json({ message: 'Kurs nije pronađen' });

    res.json({
      courseName: course.name,
      materials: course.materials || []
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/university
router.get('/university', async (req, res) => {
  try {
    const uni = await University.findOne();
    res.json(uni);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/programs/:id/courses
router.get('/programs/:id/courses', async (req, res) => {
  try {
    const courses = await Course.findAll({
      where: { programId: req.params.id },
      attributes: ['id','name','description']
    });
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;