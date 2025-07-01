// server/routes/student.js
import express from 'express';
import { Op } from 'sequelize';
import auth from '../middleware/auth.js';

import Enrollment   from '../models/Enrollment.js';
import Notification from '../models/Notification.js';
import Course       from '../models/Courses.js';
import Attempt      from '../models/Attempt.js';

const router = express.Router();

// GET /api/student/courses – trenutačni predmeti
router.get('/courses', auth, async (req, res) => {
  try {
    const enrolls = await Enrollment.findAll({
      where: { studentId: req.user.id, current: true },
      include: [
        { model: Course },
        { model: Attempt}
      ]
    });
    res.json(enrolls);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// GET /api/student/notifications – obaveštenja
router.get('/notifications', auth, async (req, res) => {
  try {
    // Prvo skupimo sve programId (tj. courseId) za tog studenta
    const myEnrolls = await Enrollment.findAll({
      where: { studentId: req.user.id },
      attributes: ['programId']
    });
    const courseIds = myEnrolls.map(e => e.programId);

    const notes = await Notification.findAll({
      where: {
        [Op.or]: [
          { target: 'all' },
          { target: 'current', courseId: { [Op.in]: courseIds } }
        ]
      },
      include: { model: Course },
      order: [['date', 'DESC']]
    });
    res.json(notes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// GET /api/student/history – istorija studiranja
router.get('/history', auth, async (req, res) => {
  try {
    const enrolls = await Enrollment.findAll({
      where: { studentId: req.user.id },
      include: [ Course, Attempt ]
    });
    const history = enrolls.map(e => ({
      course:      e.Course.name,
      attempts:    e.Attempts.length,
      passed:      e.Attempts.some(a => a.passed),
      lastGrade:   e.Attempts.length ? e.Attempts.slice(-1)[0].grade : null
    }));
    res.json(history);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// POST /api/student/exams/:courseId – prijava ispita
router.post('/exams/:courseId', auth, async (req, res) => {
  try {
    const enrollment = await Enrollment.findOne({
      where: {
        studentId: req.user.id,
        programId: req.params.courseId,
        current: true
      }
    });
    if (!enrollment) {
      return res.status(404).json({ message: 'Niste upisani na ovaj kurs' });
    }
    await Attempt.create({ enrollmentId: enrollment.id });
    res.json({ message: 'Uspešno prijavljen ispit' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

export default router;
