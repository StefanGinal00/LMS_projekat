// src/pages/teacher/TeacherTerms.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import './TeacherTerms.css';

export default function TeacherTerms() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [courseName, setCourseName] = useState('');
  const [terms, setTerms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [sessionNumber, setSessionNumber] = useState('');
  const [topic, setTopic] = useState('');
  const [date, setDate] = useState('');
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/login');

    // učitavanje imena predmeta
    fetch(`http://localhost:5000/api/public/courses/${courseId}`)
      .then(res => res.json())
      .then(data => setCourseName(data.name))
      .catch(() => setCourseName(''));    

    // učitavanje termina
    fetch(`http://localhost:5000/api/teacher/courses/${courseId}/terms`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.ok ? res.json() : Promise.reject(res.status))
      .then(setTerms)
      .catch(() => setError('Ne mogu da učitam termine'))
      .finally(() => setLoading(false));
  }, [courseId, navigate]);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    const token = localStorage.getItem('token');
    const url = editingId
      ? `http://localhost:5000/api/teacher/terms/${editingId}`
      : `http://localhost:5000/api/teacher/courses/${courseId}/terms`;
    const method = editingId ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ sessionNumber, topic, date })
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.message);
      return;
    }
    // osveži listu termina
    const refreshed = await fetch(`http://localhost:5000/api/teacher/courses/${courseId}/terms`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setTerms(await refreshed.json());
    setSessionNumber('');
    setTopic('');
    setDate('');
    setEditingId(null);
  };

  const handleEdit = (t) => {
    setEditingId(t.id);
    setSessionNumber(t.sessionNumber);
    setTopic(t.topic);
    setDate(t.date.slice(0, 10));
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Da li ste sigurni da želite da obrišete ovaj termin?')) return;
    const token = localStorage.getItem('token');
    const res = await fetch(`http://localhost:5000/api/teacher/terms/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) setTerms(prev => prev.filter(t => t.id !== id));
    else {
      const err = await res.json();
      setError(err.message);
    }
  };

  return (
    <div className="teacher-terms-page">
      <header className="terms-header">
        <h1>Raspored termina: <span className="course-name">{courseName}</span></h1>
        <Link to="/teacher/courses" className="back-button">← Nazad na kurseve</Link>
      </header>

      {error && <div className="error-message">{error}</div>}
      {loading ? (
        <div className="loading">Učitavanje termina...</div>
      ) : (
        <ul className="terms-list">
          {terms.map(t => (
            <li key={t.id} className="term-item">
              <div className="term-info">
                <strong>Termin {t.sessionNumber}:</strong> {t.topic}
                <span className="term-date">({new Date(t.date).toLocaleDateString()})</span>
              </div>
              <div className="term-actions">
                <button className="btn-edit" onClick={() => handleEdit(t)}>Izmeni</button>
                <button className="btn-delete" onClick={() => handleDelete(t.id)}>Obriši</button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <form className="add-term-form" onSubmit={submit}>
        <h2>{editingId ? 'Izmeni termin' : 'Dodaj novi termin'}</h2>
        <div className="form-row">
          <label>Broj termina:</label>
          <input
            type="number"
            value={sessionNumber}
            onChange={e => setSessionNumber(e.target.value)}
            required
          />
        </div>
        <div className="form-row">
          <label>Tema:</label>
          <input
            type="text"
            value={topic}
            onChange={e => setTopic(e.target.value)}
            required
          />
        </div>
        <div className="form-row">
          <label>Datum:</label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            required
          />
        </div>
        <div className="form-row form-row-button">
          <button type="submit" className="btn-submit">
            {editingId ? 'Sačuvaj izmenu' : 'Dodaj termin'}
          </button>
        </div>
      </form>
    </div>
  );
}
