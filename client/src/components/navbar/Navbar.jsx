import { Link } from 'react-router-dom';
import './Navbar.css';

export default function Navbar({ user }) {
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/'; // Osvežavanje stranice za ažuriranje stanja
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">LMS Univerzitet</Link>
      </div>
      
      <div className="navbar-links">
        <Link to="/">Početna</Link>
        <Link to="/programs">Programi</Link>
        
        {user ? (
          <>
            {user.role === 'student' && (
              <>
                <Link to="/student/courses">Moji kursevi</Link>
                <Link to="/student/notifications">Obaveštenja</Link>
              </>
            )}
            <Link to="/profile">Profil</Link>
            <button onClick={handleLogout} className="logout-btn">Odjavi se</button>
            <span className="user-greeting">Dobrodošli, {user.name}</span>
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