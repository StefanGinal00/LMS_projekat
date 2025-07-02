// src/components/navbar/Navbar.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

/**
 * Navbar: prikazuje različite linkove
 * zavisno od toga da li je korisnik ulogovan
 * i koja mu je uloga (student vs professor).
 */
export default function Navbar({ user, onLogout }) {
  const handleLogout = () => {
    // uklanjamo token i user info i ponovo učitamo stranicu
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (onLogout) onLogout();
    window.location.href = '/';
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">LMS Univerzitet</Link>
      </div>

      <div className="navbar-links">
        {/* Zajednički linkovi */}
        <Link to="/">Početna</Link>
        <Link to="/programs">Programi</Link>

        {/* Link za nastavno osoblje */}
        {user?.role === 'professor' && (
          <Link to="/teacher/courses">Predmeti</Link>
        )}

        {/* Linkovi za studente */}
        {user?.role === 'student' && (
          <>
            <Link to="/student/courses">Moji kursevi</Link>
            <Link to="/student/notifications">Obaveštenja</Link>
            <Link to="/student/exams">Prijava ispita</Link>
          </>
        )}

        {/* Profil / logout ili login/register */}
        {user ? (
          <>
            <Link to="/profile">Profil</Link>
            <button onClick={handleLogout} className="logout-btn">
              Odjavi se
            </button>
            <span className="user-greeting">
              Dobrodošli, {user.name}
            </span>
          </>
        ) : (
          <>
            <Link to="/login" className="auth-link">Prijava</Link>
            <Link to="/register" className="auth-link">Registracija</Link>
          </>
        )}
      </div>
    </nav>
  );
}
