import express from 'express';
import auth    from '../middleware/auth.js';
import { Op } from 'sequelize';
import Course  from '../models/Courses.js';
import { User } from '../models/User.js';
import Notification from '../models/Notification.js';
import CourseInstructor from '../models/CourseInstructor.js';
import Term from '../models/Term.js';
import EvaluationInstrument from '../models/EvaluationInstrument.js';
import Enrollment from '../models/Enrollment.js'; 
import Attempt from '../models/Attempt.js';
import Misconduct from '../models/Misconduct.js';
import Thesis     from '../models/Thesis.js';

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
 * POST /api/teacher/courses/:courseId/terms
 */
router
  .route('/courses/:courseId/terms')
  .all(auth)
  .get(async (req, res) => {
    const { courseId } = req.params;
    // provera da je profesor na tom kursu
    const link = await CourseInstructor.findOne({
      where: { courseId, userId: req.user.id }
    });
    if (!link) return res.status(403).json({ message: 'Nemate pristup' });

    const terms = await Term.findAll({
      where: { courseId },
      order: [['sessionNumber','ASC']]
    });
    res.json(terms);
  })
  .post(async (req, res) => {
    const { courseId } = req.params;
    const { sessionNumber, topic, date } = req.body;
    // ista provera opet
    const link = await CourseInstructor.findOne({
      where: { courseId, userId: req.user.id }
    });
    if (!link) return res.status(403).json({ message: 'Nemate pristup' });

    const term = await Term.create({ courseId, sessionNumber, topic, date });
    res.status(201).json(term);
  });

/**
 * PUT  /api/teacher/terms/:termId
 * DELETE /api/teacher/terms/:termId
 */
router
  .route('/terms/:termId')
  .all(auth)
  .put(async (req, res) => {
    const { termId } = req.params;
    const term = await Term.findByPk(termId);
    if (!term) return res.status(404).json({ message: 'Termin nije pronađen' });

    // provera angažmana
    const link = await CourseInstructor.findOne({
      where: { courseId: term.courseId, userId: req.user.id }
    });
    if (!link) return res.status(403).json({ message: 'Nemate pristup' });

    const { sessionNumber, topic, date } = req.body;
    term.sessionNumber = sessionNumber ?? term.sessionNumber;
    term.topic         = topic         ?? term.topic;
    term.date          = date          ?? term.date;
    await term.save();
    res.json(term);
  })
  .delete(async (req, res) => {
    const { termId } = req.params;
    const term = await Term.findByPk(termId);
    if (!term) return res.status(404).json({ message: 'Termin nije pronađen' });

    const link = await CourseInstructor.findOne({
      where: { courseId: term.courseId, userId: req.user.id }
    });
    if (!link) return res.status(403).json({ message: 'Nemate pristup' });

    await term.destroy();
    res.json({ message: 'Termin obrisan' });
  });


// ➤ GET  /api/teacher/courses/:courseId/instruments
router.get(
  '/courses/:courseId/instruments',
  auth,
  async (req, res) => {
    try {
      const { courseId } = req.params;
      // Provera da li je profesor na tom kursu
      const link = await CourseInstructor.findOne({
        where: { courseId, userId: req.user.id }
      });
      if (!link) return res.status(403).json({ message: 'Nema pristupa' });

      const instruments = await EvaluationInstrument.findAll({
        where: { courseId },
        order: [['createdAt','ASC']]
      });
      res.json(instruments);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  }
);

// ➤ POST /api/teacher/courses/:courseId/instruments
router.post(
  '/courses/:courseId/instruments',
  auth,
  async (req, res) => {
    try {
      const { courseId } = req.params;
      const { name, type, description, maxScore } = req.body;
      // Provera angažmana
      const link = await CourseInstructor.findOne({
        where: { courseId, userId: req.user.id }
      });
      if (!link) return res.status(403).json({ message: 'Nema pristupa' });

      const inst = await EvaluationInstrument.create({
        courseId, name, type, description, maxScore
      });
      res.status(201).json(inst);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  }
);

// ➤ PUT /api/teacher/instruments/:instrumentId
router.put(
  '/instruments/:instrumentId',
  auth,
  async (req, res) => {
    try {
      const { instrumentId } = req.params;
      const { name, type, description, maxScore } = req.body;
      const inst = await EvaluationInstrument.findByPk(instrumentId);
      if (!inst) return res.status(404).json({ message: 'Instrument nije pronađen' });
      // Provera da je profesor angažovan na tom kursu
      const link = await CourseInstructor.findOne({
        where: { courseId: inst.courseId, userId: req.user.id }
      });
      if (!link) return res.status(403).json({ message: 'Nema pristupa' });

      // Ažuriranje
      inst.name        = name        ?? inst.name;
      inst.type        = type        ?? inst.type;
      inst.description = description ?? inst.description;
      inst.maxScore    = maxScore    ?? inst.maxScore;
      await inst.save();

      res.json(inst);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  }
);

// ➤ DELETE /api/teacher/instruments/:instrumentId
router.delete(
  '/instruments/:instrumentId',
  auth,
  async (req, res) => {
    try {
      const { instrumentId } = req.params;
      const inst = await EvaluationInstrument.findByPk(instrumentId);
      if (!inst) return res.status(404).json({ message: 'Instrument nije pronađen' });
      const link = await CourseInstructor.findOne({
        where: { courseId: inst.courseId, userId: req.user.id }
      });
      if (!link) return res.status(403).json({ message: 'Nema pristupa' });

      await inst.destroy();
      res.json({ message: 'Instrument obrisan' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  }
);

// GET /api/teacher/courses/:courseId/notifications
router.get(
  '/courses/:courseId/notifications',
  auth,
  async (req, res) => {
    try {
      const { courseId } = req.params;
      // provera da je nastavnik angažovan
      const engaged = await CourseInstructor.findOne({
        where: { courseId, userId: req.user.id }
      });
      if (!engaged) {
        return res.status(403).json({ message: 'Nemate pristup ovom kursu' });
      }
      // dohvatimo notifikacije
      const notes = await Notification.findAll({
        where: { courseId },
        order: [['date','DESC']]
      });
      res.json(notes);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  }
);

// POST /api/teacher/courses/:courseId/notifications
router.post('/courses/:courseId/notifications', auth, async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, content } = req.body;

    const isEngaged = await CourseInstructor.findOne({
      where: { courseId, userId: req.user.id }
    });
    if (!isEngaged) return res.status(403).json({ message: 'Nemate pristup ovom kursu' });

    const notification = await Notification.create({
      courseId,
      title,
      content,
      createdAt: new Date()
    });

    res.status(201).json(notification);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/teacher/notifications/:id
router.put('/notifications/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;

    const notification = await Notification.findByPk(id);
    if (!notification) return res.status(404).json({ message: 'Obaveštenje nije pronađeno' });

    // Provera da li je nastavnik angažovan na kursu gde je notifikacija
    const isEngaged = await CourseInstructor.findOne({
      where: { courseId: notification.courseId, userId: req.user.id }
    });
    if (!isEngaged) return res.status(403).json({ message: 'Nemate pravo izmene' });

    notification.title = title;
    notification.content = content;
    await notification.save();

    res.json(notification);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/teacher/notifications/:id
router.delete('/notifications/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findByPk(id);
    if (!notification) return res.status(404).json({ message: 'Obaveštenje nije pronađeno' });

    const isEngaged = await CourseInstructor.findOne({
      where: { courseId: notification.courseId, userId: req.user.id }
    });
    if (!isEngaged) return res.status(403).json({ message: 'Nemate pravo brisanja' });

    await notification.destroy();
    res.json({ message: 'Obaveštenje je obrisano' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// GET /api/teacher/courses/:courseId/students
router.get('/courses/:courseId/students', auth, async (req, res) => {
  try {
    const { courseId } = req.params;
    const { name, surname, indexNumber, yearOfEnrollment, avgFrom, avgTo } = req.query;

    const link = await CourseInstructor.findOne({
      where: { courseId, userId: req.user.id }
    });
    if (!link) {
      return res.status(403).json({ message: 'Nemate pristup ovom kursu' });
    }

    let userWhere = { role: 'student' };
    if (name) userWhere.name = { [Op.like]: `%${name}%` };
    if (surname) userWhere.surname = { [Op.like]: `%${surname}%` };
    if (indexNumber) userWhere.indexNumber = { [Op.like]: `%${indexNumber}%` };
    if (yearOfEnrollment) userWhere.yearOfEnrollment = yearOfEnrollment;

    const enrollments = await Enrollment.findAll({
      where: { programId: courseId, current: true },
      include: [
        {
          model: User,
          as: 'User',
          attributes: [
            'id', 'name', 'surname', 'email',
            'role', 'indexNumber', 'yearOfEnrollment'
          ],
          where: userWhere
        },
        {
          model: Attempt,
          as: 'Attempts',
          attributes: ['grade', 'passed', 'examDate'],
        }
      ]
    });

    let students = enrollments
      .filter(e => e.User && e.User.role === 'student')
      .map(e => {
        const grades = e.Attempts
          .map(a => a.grade)
          .filter(grade => typeof grade === 'number');

        const avg = grades.length ? (grades.reduce((s, g) => s + g, 0) / grades.length) : null;
        const maxGrade = grades.length ? Math.max(...grades) : null;

        return {
          id: e.User.id,
          name: e.User.name,
          surname: e.User.surname || '',
          email: e.User.email,
          indexNumber: e.User.indexNumber || '',
          yearOfEnrollment: e.User.yearOfEnrollment || '',
          current: e.current,
          numAttempts: e.Attempts?.length || 0,
          lastGrade: maxGrade,
          average: avg
        };
      });

    if (avgFrom) students = students.filter(s => s.average !== null && s.average >= Number(avgFrom));
    if (avgTo) students = students.filter(s => s.average !== null && s.average <= Number(avgTo));

    res.json(students);

  } catch (err) {
    console.error('GET /api/teacher/courses/:courseId/students', err);
    res.status(500).json({ message: err.message });
  }
});

// /api/teacher/students/search?name=Petar&index=2020-123
router.get('/students/search', auth, async (req, res) => {
  try {
    const { name, surname, indexNumber, year, avgFrom, avgTo } = req.query;

    // Sklopamo WHERE klauzulu po onome što je popunjeno
    let where = { role: 'student' };
    if (name)        where.name        = { [Op.like]: `%${name}%` };
    if (surname)     where.surname     = { [Op.like]: `%${surname}%` };
    if (indexNumber) where.indexNumber = { [Op.like]: `%${indexNumber}%` };
    if (year)        where.yearOfEnrollment = year;

    // Pronađi sve studente po WHERE
    const students = await User.findAll({ where });

    // Ako treba i po proseku ocene (avgFrom, avgTo):
    if (avgFrom || avgTo) {
      // Za svakog studenta izračunaj prosek ocena
      const filtered = [];
      for (const student of students) {
        const enrollments = await Enrollment.findAll({ where: { studentId: student.id } });
        let grades = [];
        for (const enroll of enrollments) {
          const attempts = await Attempt.findAll({ where: { enrollmentId: enroll.id } });
          grades = grades.concat(attempts.filter(a => a.grade != null).map(a => a.grade));
        }
        const avg = grades.length ? grades.reduce((a, b) => a + b, 0) / grades.length : null;
        if (
          (!avgFrom || (avg !== null && avg >= avgFrom)) &&
          (!avgTo   || (avg !== null && avg <= avgTo))
        ) {
          filtered.push({ ...student.dataValues, average: avg });
        }
      }
      return res.json(filtered);
    }

    res.json(students);

  } catch (err) {
    console.error('GET /api/teacher/students/search', err);
    res.status(500).json({ message: err.message });
  }
});

router.get(
  '/courses/:courseId/students/:studentId',
  auth,
  async (req, res) => {
    try {
      const { courseId, studentId } = req.params;

      // 1) Provera da profesor predaje dati kurs
      const engaged = await CourseInstructor.findOne({
        where: { courseId, userId: req.user.id }
      });
      if (!engaged) {
        return res.status(403).json({ message: 'Nemate pristup ovom kursu' });
      }

      // 2) Osnovni podaci o studentu
       const student = await User.findByPk(studentId);
      if (!student) {
        return res.status(404).json({ message: 'Student nije pronađen' });
      }

      // 3) Svi upisi studenta (Enrollment), uključujući Course i ECTS
      const enrollments = await Enrollment.findAll({
        where: { studentId },
        include: [{ model: Course, as: 'Course', attributes:['name','ects'] }]
      });

      // 4) Svi pokušaji (Attempt) za te upise
      const allAttempts = await Attempt.findAll({
        where: { enrollmentId: enrollments.map(e => e.id) }
      });

      // 5) Podela na položene i neuspešne
      const passedExams = [];
      const failedExams = [];
      for (let a of allAttempts) {
        // nađemo upis da dohvatimo naziv kursa i ECTS
        const enr = enrollments.find(e => e.id === a.enrollmentId);
        const courseName = enr.Course.name;
        const date       = a.examDate;
        const grade      = a.grade;
        const points     = a.grade != null ? a.grade * 10 : null;
        const row = { courseName, date, grade, points };

        if (a.grade != null && a.passed) {
          passedExams.push(row);
        } else if (a.grade != null && !a.passed) {
          failedExams.push(row);
        }
      }

      // 6) Prijave ispita koje još nisu ocenjivane
      const pendingRegistrations = allAttempts
        .filter(a => a.grade == null)
        .map(a => {
          const enr = enrollments.find(e => e.id === a.enrollmentId);
          return {
            courseName: enr.Course.name,
            date:       a.examDate
          };
        });

      // 7) Prosečna ocena i ukupni ECTS
      const grades = passedExams.map(e => e.grade);
      const averageGrade = grades.length
        ? (grades.reduce((s,x) => s + x, 0) / grades.length).toFixed(2)
        : null;
      // svaki Course.ects dodamo samo jednom
      const uniquePassedCourses = new Set(passedExams.map(e => e.courseName));
      let totalEcts = 0;
      enrollments.forEach(e => {
        if (uniquePassedCourses.has(e.Course.name)) {
          totalEcts += e.Course.ects;
        }
      });

      // 8) Prijave prestupa
      const misconducts = await Misconduct.findAll({
        where: { attemptId: allAttempts.map(a => a.id) },
        include: [{
          model: Attempt, as: 'Attempt',
          include: [{
            model: Enrollment, as: 'Enrollment',
            include: [{ model: Course, as: 'Course', attributes: ['name'] }]
          }]
        }]
      }).then(rows =>
        rows.map(m => ({
          courseName: m.Attempt.Enrollment.Course.name,
          date:       m.Attempt.examDate,
          description:m.description
        }))
      ); 

      // 9) Završni rad
      const thesisInst = await Thesis.findOne({ where: { studentId }});
      const thesis = thesisInst
        ? {
            title:        thesisInst.title,
            grade:        thesisInst.grade,
            dateDefended: thesisInst.dateDefended
          }
        : null; 

      // 10) Vratimo sklopljene podatke
      res.json({
        student,
        averageGrade,
        totalEcts,
        enrollments,
        passedExams,
        failedExams,
        misconducts,
        pendingRegistrations,
        thesis
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  }
);

// GET /api/teacher/courses/:courseId/attempts/pending
// Vraća sve pokušaje (ispite) za dati kurs koje još nisi ocenio,
// i gde je datum ispita u prošlosti ali ne stariji od 15 dana.
router.get(
  '/courses/:courseId/attempts/pending',
  auth,
  async (req, res) => {

    // Parsiramo parametar u broj
    const courseIdRaw = req.params.courseId;
    const courseId    = parseInt(courseIdRaw, 10);
    const profId      = req.user && req.user.id;

    if (isNaN(courseId)) {
      return res.status(400).json({ message: 'Nevažeći courseId' });
    }
    if (!profId) {
      return res.status(401).json({ message: 'Niste autentifikovani' });
    }

    try {
      // 1) Provera angažmana
         const engaged = await CourseInstructor.findOne({
          where: { 
            CourseId: courseId,
            UserId:   profId
          }
        });
      console.log('  › engaged =', engaged);
      if (!engaged) {
        return res.status(403).json({ message: 'Nemate pristup ovom kursu' });
      }

      // 2) Rok od 15 dana unazad
      const now = new Date();
      const cutoff = new Date(now);
      cutoff.setDate(cutoff.getDate() - 15);

      // 3) Dohvati neocenjene pokušaje
      const pending = await Attempt.findAll({
        where: {
          grade:    { [Op.is]: null },
          examDate: { [Op.lte]: now, [Op.gte]: cutoff }
        },
        include: [{
          model: Enrollment, as: 'Enrollment',
          where: { programId: courseId },
          include: [
            { model: User,   as: 'User',   attributes: ['id','name','surname'] },
            { model: Course, as: 'Course', attributes: ['id','name'] }
          ]
        }],
        order: [['examDate','ASC']]
      });

      // 4) Map na prost JSON
      const result = pending.map(a => ({
        attemptId:   a.id,
        studentId:   a.Enrollment.User.id,
        studentName: `${a.Enrollment.User.name} ${a.Enrollment.User.surname}`,
        courseName:  a.Enrollment.Course.name,
        examDate:    a.examDate
      }));

      return res.json(result);

    } catch (err) {
      console.error('!!! [pending] ERROR →', err);
      return res.status(500).json({ message: err.message });
    }
  }
);


// PUT /api/teacher/attempts/:attemptId/grade
// Unos ocene za dati pokušaj (grade + passed + points), samo ako 
// je u roku od 15 dana od ispita.
router.put(
  '/attempts/:attemptId/grade',
  auth,
  async (req, res) => {
    try {
      const { attemptId } = req.params;
      const profId = req.user.id;
      const { grade } = req.body;

      // 1) Učitaj attempt zajedno sa Enrollment->Course
      const attempt = await Attempt.findByPk(attemptId, {
        include: [
          {
            model: Enrollment, as: 'Enrollment',
            include: [{ model: Course, as: 'Course' }]
          }
        ]
      });
      if (!attempt) {
        return res.status(404).json({ message: 'Pokušaj nije pronađen' });
      }

      // 2) Provera da profesor predaje taj kurs
      const courseId = attempt.Enrollment.courseId;
      const engaged  = await CourseInstructor.findOne({
        where: {
          CourseId: courseId,
          UserId:   profId
        }
      });
      if (!engaged) {
        return res.status(403).json({ message: 'Nemate pristup ovom kursu' });
      }

      // 3) Provera vremenskog roka: examDate <= now <= examDate+15 dana
      const now   = new Date();
      const examD = new Date(attempt.examDate);
      const last  = new Date(examD);
      last.setDate(last.getDate() + 15);

      if (now < examD || now > last) {
        return res
          .status(400)
          .json({ message: 'Rok za unos ocene istekao' });
      }

      // 4) Ažuriraj
      attempt.grade  = grade;
      attempt.points = points;
      attempt.passed = grade >= 6;
      await attempt.save();

      res.json({ message: 'Ocena uspešno sačuvana' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  }
);

// GET /api/teacher/courses/:courseId
router.get(
  '/courses/:courseId',
  auth,
  async (req, res) => {
    try {
      const { courseId } = req.params;
      // Provera angažmana
      const engaged = await CourseInstructor.findOne({
        where: {
          CourseId: courseId,
          UserId:   req.user.id
        }
      });
      if (!engaged) {
        return res.status(403).json({ message: 'Nemate pristup ovom kursu' });
      }
      const course = await Course.findByPk(courseId, {
        attributes: ['id','name']
      });
      if (!course) {
        return res.status(404).json({ message: 'Predmet nije pronađen' });
      }
      res.json(course);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  }
);

export default router;
