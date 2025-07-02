import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import './TeacherEditSyllabus.css';

export default function TeacherEditSyllabus() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  // stanja
  const [courseName, setCourseName] = useState('');
  const [syllabus, setSyllabus]     = useState('');
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/login');

    // 1) učitamo postojeći silabus
    fetch(`http://localhost:5000/api/courses/${courseId}/syllabus`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error(`Server returned ${res.status}`);
        return res.json();
      })
      .then(data => {
        setCourseName(data.courseName);
        setSyllabus(data.content);
      })
      .catch(err => {
        console.error('Greška pri učitavanju silabusa:', err);
        setError('Ne mogu da učitam silabus');
      })
      .finally(() => setLoading(false));
  }, [courseId, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(
        `http://localhost:5000/api/teacher/courses/${courseId}/syllabus`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ syllabus })
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Greška pri čuvanju');
      // uspešno → vraćamo se na listu
      navigate('/teacher/courses');
    } catch (err) {
      console.error('Greška pri izmeni silabusa:', err);
      setError(err.message);
    }
  };

  if (loading) return <div>Učitavanje silabusa…</div>;

  return (
    <div className="edit-syllabus-page">
      <h1>Izmena silabusa: {courseName}</h1>
      {error && <div className="error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <label htmlFor="syllabus">
          Silabus:
          <textarea
            id="syllabus"
            value={syllabus}
            onChange={e => setSyllabus(e.target.value)}
            rows={10}
          />
        </label>
        <div className="buttons">
          <button type="submit">Sačuvaj</button>
          <Link to="/teacher/courses">
            <button type="button">Odustani</button>
          </Link>
        </div>
      </form>
    </div>
  );
}
