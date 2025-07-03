// src/pages/teacher/TeacherGrades.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './TeacherGrades.css';

export default function TeacherGrades() {
  const { courseId } = useParams();
  const [courseName, setCourseName] = useState('');
  const [pending, setPending] = useState([]);
  const [grades, setGrades]   = useState({});
  const [points, setPoints]   = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

    useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem('token');

        // 1) kurs
        const resC = await fetch(
          `http://localhost:5000/api/teacher/courses/${courseId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (resC.ok) {
          const { name } = await resC.json();
          setCourseName(name);
        }

        // 2) neocenjeni ispiti
        const res = await fetch(
          `http://localhost:5000/api/teacher/courses/${courseId}/attempts/pending`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!res.ok) throw new Error('Ne mogu da dohvatim ispitu');
        setPending(await res.json());
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [courseId]);

  const handleGradeChange = (id, value) => {
    setGrades(g => ({ ...g, [id]: value }));
  };
  const handlePointsChange = (id, value) => {
    setPoints(p => ({ ...p, [id]: value }));
  };

  const handleSave = async (attemptId) => {
    const grade  = Number(grades[attemptId]);
    const pts    = Number(points[attemptId]);
    if (!grade || grade < 5 || grade > 10) {
      return alert('Unesi ocenu između 5 i 10');
    }
    if (!pts || pts < 0) {
      return alert('Unesi validne bodove');
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(
        `http://localhost:5000/api/teacher/attempts/${attemptId}/grade`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ grade, points: pts })
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      // remove from list
      setPending(p => p.filter(x => x.attemptId !== attemptId));
      alert('Ocena i bodovi sačuvani');
    } catch (e) {
      alert(`Greška: ${e.message}`);
    }
  };

  if (loading) return <p>Učitavam…</p>;
  if (error)   return <p className="teacher-grades-error">{error}</p>;

    return (
        <div className="teacher-grades-container">
        <h1>Unos ocena za predmet: {courseName || courseId}</h1>

        {pending.length === 0 ? (
            <p>Svi ispiti ocenjeni ili nema neocenjenih u poslednjih 15 dana.</p>
        ) : (
            <table className="teacher-grades-table">
            <thead>
                <tr>
                <th>Student</th>
                <th>Datum ispita</th>
                <th>Ocena</th>
                <th>Bodovi</th>
                <th>Akcija</th>
                </tr>
            </thead>
            <tbody>
                {pending.map(at => (
                <tr key={at.attemptId}>
                    <td>{at.studentName}</td>
                    <td>{new Date(at.examDate).toLocaleDateString('sr-RS', {
                        day: 'numeric', month: 'long', year: 'numeric'
                        })}
                    </td>
                    <td>
                    <input
                        type="number" min="5" max="10"
                        value={grades[at.attemptId] || ''}
                        onChange={e => handleGradeChange(at.attemptId, e.target.value)}
                        className="teacher-grades-input"
                    />
                    </td>
                    <td>
                    <input
                        type="number" min="0"
                        value={points[at.attemptId] || ''}
                        onChange={e => handlePointsChange(at.attemptId, e.target.value)}
                        className="teacher-grades-input"
                    />
                    </td>
                    <td>
                    <button
                        onClick={() => handleSave(at.attemptId)}
                        className="teacher-grades-button"
                    >
                        Sačuvaj
                    </button>
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        )}
    </div>
  );
}
