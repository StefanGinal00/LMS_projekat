// src/pages/teacher/TeacherTerms.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import './TeacherTerms.css';

/**
 * TeacherTerms
 * Stranica za prikaz i CRUD termina za dati kurs
 */
export default function TeacherTerms() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [terms, setTerms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // stanja za novi termin
  const [sessionNumber, setSessionNumber] = useState('');
  const [topic, setTopic] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/login');

    // dobavi postojece termine
    fetch(`http://localhost:5000/api/teacher/courses/${courseId}/terms`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error(`Server returned ${res.status}`);
        return res.json();
      })
      .then(data => setTerms(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [courseId, navigate]);

  const handleAdd = async (e) => {
    e.preventDefault();
    setError('');
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(
        `http://localhost:5000/api/teacher/courses/${courseId}/terms`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ sessionNumber: Number(sessionNumber), topic })
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Greška pri kreiranju');
      // dodaj u lokalno stanje
      setTerms(prev => [...prev, data]);
      setSessionNumber('');
      setTopic('');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Da li ste sigurni da želite da obrišete ovaj termin?')) return;
    const token = localStorage.getItem('token');
    const res = await fetch(
      `http://localhost:5000/api/teacher/terms/${id}`,
      { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } }
    );
    if (res.ok) {
      setTerms(prev => prev.filter(t => t.id !== id));
    } else {
      const err = await res.json();
      setError(err.message);
    }
  };

  const handleEdit = (id) => {
    navigate(`/teacher/term/${id}/edit`);
  };

  if (loading) return <div>Učitavanje termina…</div>;

  return (
    <div className="teacher-terms-page">
      <h1>Raspored termina za kurs {courseId}</h1>
      {error && <div className="error">{error}</div>}

      <ul className="terms-list">
        {terms.map(term => (
          <li key={term.id} className="term-item">
            <div>
              <strong>Termin {term.sessionNumber}:</strong> {term.topic}
            </div>
            <div className="term-actions">
              <button onClick={() => handleEdit(term.id)}>Izmeni</button>
              <button onClick={() => handleDelete(term.id)}>Obriši</button>
            </div>
          </li>
        ))}
      </ul>

      <form className="add-term-form" onSubmit={handleAdd}>
        <h2>Dodaj novi termin</h2>
        <label>
          Broj termina:
          <input
            type="number"
            value={sessionNumber}
            onChange={e => setSessionNumber(e.target.value)}
            required
          />
        </label>
        <label>
          Tema:
          <input
            type="text"
            value={topic}
            onChange={e => setTopic(e.target.value)}
            required
          />
        </label>
        <button type="submit">Dodaj</button>
      </form>

      <Link to="/teacher/courses">
        <button>← Nazad na kurseve</button>
      </Link>
    </div>
  );
}
