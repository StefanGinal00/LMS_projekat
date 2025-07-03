import React, { useEffect, useState } from 'react';
import { Link }                    from 'react-router-dom';
import './TeacherCourses.css';        // obavezno

/**
 * TeacherCourses
 * Prikazuje listu kurseva na kojima je ulogovani nastavnik angažovan.
 */
export default function TeacherCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      return;
    }

    fetch('http://localhost:5000/api/teacher/courses', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error(`Server returned ${res.status}`);
        return res.json();
      })
      .then(data => setCourses(data))
      .catch(err => console.error('Greška pri dohvatu kurseva:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Učitavanje kurseva…</div>;

  return (
    <div className="teacher-courses-page">
      <h1 className="page-title">Predmeti koje predajem</h1>

      {courses.length === 0 ? (
        <p className="no-courses">Trenutno niste angažovani ni na jednom kursu.</p>
      ) : (
        <ul className="teacher-course-list">
          {courses.map(course => (
            <li key={course.id} className="teacher-course-item">
              <div className="course-header">
                <h2 className="course-name">{course.name}</h2>
              </div>

              <p className="course-desc">{course.description}</p>

              <div className="course-actions">
                <Link
                  to={`/teacher/course/${course.id}/edit-syllabus`}
                  className="btn btn-outline"
                >
                  Izmeni silabus
                </Link>
                <Link
                  to={`/teacher/course/${course.id}/terms`}
                  className="btn btn-outline"
                >
                  Raspored termina
                </Link>
                <Link 
                  to={`/teacher/course/${course.id}/instruments`} 
                  className="btn btn-outline"
                >
                  Instrumenti evaluacije
                </Link>
                <Link 
                  to={`/teacher/course/${course.id}/students`}
                  className="btn btn-outline"
                  >
                    Spisak studenata
                </Link>
                <Link 
                  to={`/teacher/courses/${course.id}/notifications`}
                  className="btn btn-outline"
                >
                  Notifikacije
                </Link>
                <Link 
                  to={`/teacher/courses/${course.id}/grades`}
                  className="btn btn-outline"
                  >
                    Unos ocena
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
