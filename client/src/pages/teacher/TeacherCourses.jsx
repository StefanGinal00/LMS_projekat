import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

/**
 * TeacherCourses
 *
 * Prikazuje listu kurseva na kojima je ulogovani nastavnik
 * angažovan. Svaki kurs je prikazan sa linkom za
 * eventualnu izmenu silabusa.
 */
export default function TeacherCourses() {
  // stanje za kurseve i za loading spinner
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1) Uzmi JWT token iz localStorage
    const token = localStorage.getItem('token');
    if (!token) {
      // ako nema token, preusmeri na login
      window.location.href = '/login';
      return;
    }

    // 2) Pozovi backend rutu /api/teacher/courses
    fetch('http://localhost:5000/api/teacher/courses', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) {
          throw new Error(`Server returned ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        // 3) Smesti odgovor u stanje
        setCourses(data);
      })
      .catch(err => {
        console.error('Greška pri dohvatu kurseva za nastavnika:', err);
      })
      .finally(() => {
        // 4) Ugasimo spinner
        setLoading(false);
      });
  }, []);

  if (loading) {
    // dok čekamo odgovor, prikažemo poruku
    return <div>Učitavanje kurseva…</div>;
  }

  return (
    <div className="teacher-courses-page">
      <h1>Predmeti koje predajem</h1>

      {courses.length === 0 ? (
        // ako nema nijednog, prikažemo poruku
        <p>Trenutno niste angažovani ni na jednom kursu.</p>
      ) : (
        <ul className="teacher-course-list">
          {courses.map(course => (
            <li key={course.id} className="teacher-course-item">
              {/* Ime i opis kursa */}
              <h2>{course.name}</h2>
              <p>{course.description}</p>
              {/* Link za editovanje silabusa (sledeći korak) */}
              <Link to={`/teacher/course/${course.id}/edit-syllabus`}>
                Izmeni silabus
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
