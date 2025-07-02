// server/routes/student.js
import express from 'express';
import { Op } from 'sequelize';
import auth from '../middleware/auth.js';
import Term from '../models/Term.js';

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
        { model: Course,  as: 'Course'   },
        { model: Attempt, as: 'Attempts' }
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
      include: { model: Course, as: 'Course' },
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
      include: [
        { model: Course, as: 'Course' },
        { model: Attempt, as: 'Attempts' }
      ]
    });
    const history = enrolls.map(e => ({
      course:      e.Course ? e.Course.name : "Nepoznat kurs",
      attempts:    e.Attempts ? e.Attempts.length : 0,
      passed:      e.Attempts ? e.Attempts.some(a => a.passed) : false,
      lastGrade:   (e.Attempts && e.Attempts.length)
                    ? e.Attempts[e.Attempts.length - 1].grade
                    : null
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

/**
 * GET  /api/student/terms
 * Vraća sve termine za kurseve na kojima je student upisan (current = true),
 * sortirane po kursu i broju sesije.
 */
router.get('/terms', auth, async (req, res) => {
  try {
    // 1) Skupimo sve courseId na kojima je student upisan
    const myEnrolls = await Enrollment.findAll({
      where: { studentId: req.user.id, current: true },
      attributes: ['programId']
    });
    const courseIds = myEnrolls.map(e => e.programId);

    // 2) Dohvatimo sve termine za te kurseve
    const terms = await Term.findAll({
      where: { courseId: { [Op.in]: courseIds } },
      order: [
        ['courseId',      'ASC'],
        ['sessionNumber', 'ASC']
      ]
    });

    res.json(terms);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

/**
 * POST /api/student/terms/:termId/register
 * Prijavljuje ispit za datum tog termina (examDate = term.date).
 * Ne dozvoljava duplu prijavu istog termina.
 */
router.post('/terms/:termId/register', auth, async (req, res) => {
  try {
    const { termId } = req.params;
    // 1) Proveri da termin postoji
    const term = await Term.findByPk(termId);
    if (!term) {
      return res.status(404).json({ message: 'Termin nije pronađen' });
    }
    // 2) Proveri da je student upisan na kurs tog termina
    const enrollment = await Enrollment.findOne({
      where: {
        studentId: req.user.id,
        programId: term.courseId,
        current:   true
      }
    });
    if (!enrollment) {
      return res.status(403).json({ message: 'Niste upisani na ovaj kurs' });
    }
    // 3) Proveri da li je već prijavio taj termin
    const already = await Attempt.findOne({
      where: {
        enrollmentId: enrollment.id,
        examDate:     term.date
      }
    });
    if (already) {
      return res.status(400).json({ message: 'Već ste prijavili ovaj termin' });
    }
    // 4) Kreiraj novi pokušaj sa examDate = term.date
    const attempt = await Attempt.create({
      enrollmentId: enrollment.id,
      examDate:     term.date
    });
    res.status(201).json(attempt);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

export default router;

