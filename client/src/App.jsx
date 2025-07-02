// src/App.jsx

import React, { useState, useEffect } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';

import Navbar from './components/navbar/Navbar.jsx';

// public pages
import Home        from './pages/Home.jsx';
import University  from './pages/University.jsx';
import Programs    from './pages/Programs.jsx';
import ProgramDetail from './pages/ProgramDetail.jsx';
import Syllabus    from './pages/Syllabus.jsx';
import Materials   from './pages/Materials.jsx';

// auth pages
import Login       from './pages/Login.jsx';
import Register    from './pages/Register.jsx';
import Profile     from './pages/Profile.jsx';
import EditProfile from './pages/EditProfile.jsx';

// student pages
import StudentCourses      from './pages/students/Courses.jsx';
import StudentNotifications from './pages/students/Notifications.jsx';
import StudentHistory      from './pages/students/History.jsx';
import StudentExams        from './pages/students/Exams.jsx';

// teacher pages
import TeacherCourses from './pages/teacher/TeacherCourses.jsx';
import TeacherEditSyllabus from './pages/teacher/TeacherEditSyllabus.jsx';
import TeacherTerms          from './pages/teacher/TeacherTerms.jsx';
import TeacherInstruments    from './pages/teacher/TeacherInstruments.jsx';
import TeacherNotifications from "./pages/teacher/TeacherNotifications";
import TeacherStudents from './pages/teacher/TeacherStudents.jsx';
import TeacherStudentSearch from "./pages/teacher/TeacherStudentSearch.jsx";

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // učitaj korisnika iz localStorage pri startu
  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored && stored !== 'undefined') {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  // poziva se pri prijavi i izmeni profila
  const handleLogin = (u) => {
    setUser(u);
    localStorage.setItem('user', JSON.stringify(u));
  };

  // odjavi korisnika
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  if (loading) return <div>Loading...</div>;

  return (
    <BrowserRouter>
      <Navbar user={user} onLogout={handleLogout} />

      <Routes>
        {/* javne rute */}
        <Route path="/" element={<Home />} />
        <Route path="/university" element={<University />} />
        <Route path="/programs" element={<Programs />} />
        <Route path="/programs/:id" element={<ProgramDetail />} />
        <Route path="/course/:courseId/syllabus" element={<Syllabus />} />
        <Route path="/course/:courseId/materials" element={<Materials />} />

        {/* autentikacija */}
        <Route
          path="/login"
          element={user ? <Navigate to="/" /> : <Login onLogin={handleLogin} />}
        />
        <Route
          path="/register"
          element={user ? <Navigate to="/" /> : <Register />}
        />

        {/* profil */}
        <Route
          path="/profile"
          element={user ? <Profile onLogout={handleLogout} /> : <Navigate to="/login" />}
        />
        <Route
          path="/profile/edit"
          element={
            user
              ? <EditProfile user={user} onUpdate={handleLogin} />
              : <Navigate to="/login" />
          }
        />

        {/* studentske rute */}
        <Route
          path="/student/courses"
          element={user && user.role === 'student'
            ? <StudentCourses />
            : <Navigate to="/login" />}
        />
        <Route
          path="/student/notifications"
          element={user && user.role === 'student'
            ? <StudentNotifications />
            : <Navigate to="/login" />}
        />
        <Route
          path="/student/history"
          element={user && user.role === 'student'
            ? <StudentHistory />
            : <Navigate to="/login" />}
        />
        <Route
          path="/student/exams"
          element={user && user.role === 'student'
            ? <StudentExams />
            : <Navigate to="/login" />}
        />

        {/* nastavničke rute */}
        <Route
          path="/teacher/courses"
          element={user && user.role === 'professor'
            ? <TeacherCourses />
            : <Navigate to="/login" />}
        />
        <Route
          path="/teacher/course/:courseId/edit-syllabus"
          element={user && user.role === 'professor'
            ? <TeacherEditSyllabus />
            : <Navigate to="/login" />}
        />
          <Route
            path="/teacher/course/:courseId/terms"
            element={user && user.role === 'professor'
              ? <TeacherTerms />
              : <Navigate to="/login" />}
          />

          <Route
            path="/teacher/course/:courseId/instruments"
            element={user && user.role === 'professor'
              ? <TeacherInstruments />
              : <Navigate to="/login" />}
          />
          <Route
            path="/teacher/courses/:courseId/notifications"
            element={user && user.role === 'professor'
              ? <TeacherNotifications />
              : <Navigate to="/login" />
            }
          />
          <Route
            path="/teacher/course/:courseId/students"
            element={user && user.role === 'professor'
              ? <TeacherStudents />
              : <Navigate to="/login" />
            }
          />
          <Route
            path="/teacher/course/:courseId/students"
            element={user && user.role === 'professor'
              ? <TeacherStudentSearch />
              : <Navigate to="/login" />}
          />

        {/* fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
