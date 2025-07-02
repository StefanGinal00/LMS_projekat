// server/routes/teacher.js
import express from 'express';
import auth    from '../middleware/auth.js';
import Course  from '../models/Courses.js';
import { User } from '../models/User.js';
import CourseInstructor from '../models/CourseInstructor.js';
import Term from '../models/Term.js';

const router = express.Router();

// ➤ GET /api/teacher/courses
router.get('/courses', auth, async (req, res) => {
  try {
    const courses = await Course.findAll({
      include: {
        model: User,
        where: { id: req.user.id },
        through: { attributes: [] }
      }
    });
    res.json(courses);
  } catch (err) {
    console.error('GET /api/teacher/courses error', err);
    res.status(500).json({ message: err.message });
  }
});

// ➤ PUT /api/teacher/courses/:courseId/syllabus
//      – update silabus samo ako je profesor angažovan
router.put(
  '/courses/:courseId/syllabus',
  auth,
  async (req, res) => {
    try {
      const { courseId } = req.params;
      const { syllabus } = req.body;

      // 1) proverimo da li je req.user.id instruktor tog kursa
      const link = await CourseInstructor.findOne({
        where: { courseId, userId: req.user.id }
      });
      if (!link) {
        return res
          .status(403)
          .json({ message: 'Nemate pravo da izmenite silabus za ovaj kurs' });
      }

      // 2) dohvatimo kurs i updejtujemo silabus
      const course = await Course.findByPk(courseId);
      if (!course) {
        return res.status(404).json({ message: 'Kurs nije pronađen' });
      }
      course.syllabus = syllabus;
      await course.save();

      // 3) vratimo novi objekat
      res.json({ id: course.id, name: course.name, syllabus: course.syllabus });
    } catch (err) {
      console.error('PUT /api/teacher/courses/:courseId/syllabus error', err);
      res.status(500).json({ message: err.message });
    }
  }
);

/**
 * GET  /api/teacher/courses/:courseId/terms
 * Vraća sve termine (sessionNumber + topic) za dati kurs,
 * samo ako je profesor angažovan na tom kursu.
 */
router.get(
  '/courses/:courseId/terms',
  auth,
  async (req, res) => {
    try {
      const { courseId } = req.params;
      // proverimo angažman
      const link = await CourseInstructor.findOne({
        where: { courseId, userId: req.user.id }
      });
      if (!link) {
        return res.status(403).json({ message: 'Nemate pristup terminima ovog kursa' });
      }
      // dohvatimo termine
      const terms = await Term.findAll({
        where: { courseId },
        order: [['sessionNumber','ASC']]
      });
      res.json(terms);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  }
);

/**
 * POST /api/teacher/courses/:courseId/terms
 * Dodaje novi termin (sessionNumber + topic) za kurs.
 */
router.post(
  '/courses/:courseId/terms',
  auth,
  async (req, res) => {
    try {
      const { courseId } = req.params;
      const { sessionNumber, topic } = req.body;
      // proveri angažman
      const link = await CourseInstructor.findOne({
        where: { courseId, userId: req.user.id }
      });
      if (!link) {
        return res.status(403).json({ message: 'Nemate pravo da dodate termin' });
      }
      // kreiraj termin
      const term = await Term.create({ courseId, sessionNumber, topic });
      res.status(201).json(term);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  }
);

/**
 * PUT /api/teacher/terms/:termId
 * Menja postojeći termin (sessionNumber ili topic).
 */
router.put(
  '/terms/:termId',
  auth,
  async (req, res) => {
    try {
      const { termId } = req.params;
      const { sessionNumber, topic } = req.body;
      // dohvatimo termin zajedno sa courseId
      const term = await Term.findByPk(termId);
      if (!term) {
        return res.status(404).json({ message: 'Termin nije pronađen' });
      }
      // proverimo angažman na tom kursu
      const link = await CourseInstructor.findOne({
        where: { courseId: term.courseId, userId: req.user.id }
      });
      if (!link) {
        return res.status(403).json({ message: 'Nemate pravo da izmenite ovaj termin' });
      }
      // update
      term.sessionNumber = sessionNumber ?? term.sessionNumber;
      term.topic         = topic         ?? term.topic;
      await term.save();
      res.json(term);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  }
);

/**
 * DELETE /api/teacher/terms/:termId
 */
router.delete(
  '/terms/:termId',
  auth,
  async (req, res) => {
    try {
      const { termId } = req.params;
      const term = await Term.findByPk(termId);
      if (!term) {
        return res.status(404).json({ message: 'Termin nije pronađen' });
      }
      // proveri angažman
      const link = await CourseInstructor.findOne({
        where: { courseId: term.courseId, userId: req.user.id }
      });
      if (!link) {
        return res.status(403).json({ message: 'Nemate pravo da obrišete ovaj termin' });
      }
      await term.destroy();
      res.json({ message: 'Termin obrisan' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  }
);

export default router;
