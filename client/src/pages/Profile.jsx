// src/pages/Profile.jsx
import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Profile.css';

export default function Profile({ onLogout }) {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetch('http://localhost:5000/api/auth/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setUser(data))
      .catch(() => {
        localStorage.removeItem('token');
        navigate('/login');
      });
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (onLogout) onLogout();
    navigate('/login');
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="profile-container">
      <div className="profile-info">
        <h1>Moj Profil</h1>
        <p><strong>Ime:</strong> {user.name}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Uloga:</strong> {user.role}</p>
      </div>
      <div className="profile-actions">
        <Link to="/profile/edit">
          <button className="edit-btn">Izmeni profil</button>
        </Link>
        <button onClick={handleLogout} className="logout-btn">Odjavi se</button>
      </div>
    </div>
  );
}
