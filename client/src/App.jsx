// src/App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Navbar from './components/navbar/Navbar.jsx';

import Home             from './pages/Home.jsx';
import University       from './pages/University.jsx';
import Programs         from './pages/Programs.jsx';
import ProgramDetail    from './pages/ProgramDetail.jsx';
import Syllabus         from './pages/Syllabus.jsx';
import Materials        from './pages/Materials.jsx';

import Login            from './pages/Login.jsx';
import Register         from './pages/Register.jsx';
import Profile          from './pages/Profile.jsx';
import EditProfile      from './pages/EditProfile.jsx';

import StudentCourses      from './pages/students/Courses.jsx';
import StudentNotifications from './pages/students/Notifications.jsx';
import StudentHistory      from './pages/students/History.jsx';
import StudentExams        from './pages/students/Exams.jsx';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Učitaj korisnika iz localStorage
  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored && stored !== 'undefined') {
      try {
        setUser(JSON.parse(stored));
      } catch (e) {
        console.error('Nevalidan JSON u localStorage:', e);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <BrowserRouter>
      <Navbar user={user} onLogout={handleLogout} />
      <Routes>
        {/* Početna */}
        <Route path="/" element={<Home />} />

        {/* Univerzitet */}
        <Route path="/university" element={<University />} />

        {/* Studijski programi */}
        <Route path="/programs" element={<Programs />} />
        <Route path="/programs/:id" element={<ProgramDetail />} />

        {/* Kurs */}
        <Route path="/course/:courseId/syllabus" element={<Syllabus />} />
        <Route path="/course/:courseId/materials" element={<Materials />} />

        {/* Autentikacija */}
        <Route
          path="/login"
          element={user ? <Navigate to="/" /> : <Login onLogin={handleLogin} />}
        />
        <Route
          path="/register"
          element={user ? <Navigate to="/" /> : <Register />}
        />
        <Route
          path="/profile"
          element={user ? <Profile /> : <Navigate to="/login" />}
        />
        <Route
          path="/profile/edit"
          element={
            user
              ? <EditProfile user={user} onUpdate={handleLogin} />
              : <Navigate to="/login" />
          }
        />

        {/* Studentske rute */}
        <Route
          path="/student/courses"
          element={user ? <StudentCourses /> : <Navigate to="/login" />}
        />
        <Route
          path="/student/notifications"
          element={user ? <StudentNotifications /> : <Navigate to="/login" />}
        />
        <Route
          path="/student/history"
          element={user ? <StudentHistory /> : <Navigate to="/login" />}
        />
        <Route
          path="/student/exams"
          element={user ? <StudentExams /> : <Navigate to="/login" />}
        />

        {/* Bilo šta drugo → početna */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
