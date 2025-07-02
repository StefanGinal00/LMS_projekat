// server/routes/teacher.js
import express from 'express';
import auth    from '../middleware/auth.js';
import Course  from '../models/Courses.js';
import { User }    from '../models/User.js';
import CourseInstructor from '../models/CourseInstructor.js';

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

export default router;
