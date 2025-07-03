import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import './TeacherStudentDetails.css';

export default function TeacherStudentDetails() {
  const { courseId, studentId } = useParams();
  const navigate = useNavigate();

  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Niste prijavljeni.');

        const res = await fetch(
          `http://localhost:5000/api/teacher/courses/${courseId}/students/${studentId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.status === 403) {
          navigate('/teacher/courses');
          return;
        }
        if (!res.ok) throw new Error('Greška pri učitavanju podataka');
        setData(await res.json());
      } catch {
        setError('Ne mogu da učitam podatke o studentu');
      } finally {
        setLoading(false);
      }
    })();
  }, [courseId, studentId, navigate]);

  if (loading) return <p className="sd-loading">Učitavanje…</p>;
  if (error)   return <p className="sd-error">{error}</p>;
  if (!data)   return null;

  const {
    student,
    averageGrade,
    totalEcts,
    enrollments,
    passedExams,
    failedExams,
    misconducts,
    pendingRegistrations,
    thesis
  } = data;

  return (
    <div className="student-details">
      <Link to={`/teacher/courses/${courseId}/students`} className="sd-back">
        ← Nazad na spisak studenata
      </Link>

      <h1>Podaci o studentu</h1>

      <section className="sd-basic">
        <h2>Osnovni podaci</h2>
        <p><strong>Ime i prezime:</strong> {student.firstName} {student.lastName}</p>
        <p><strong>Broj indeksa:</strong> {student.indexNumber}</p>
        <p><strong>Email:</strong> {student.email}</p>
        <p><strong>Godina upisa:</strong> {student.yearOfEnrollment}</p>
      </section>

      <section className="sd-stats">
        <h2>Statistika</h2>
        <p><strong>Prosečna ocena:</strong> {averageGrade ?? 'N/A'}</p>
        <p><strong>Ukupno ECTS:</strong> {totalEcts}</p>
      </section>

      <section className="sd-section">
        <h2>Upisi studenta</h2>
        <table className="sd-table">
          <thead>
            <tr><th>Predmet</th><th>Datum upisa</th></tr>
          </thead>
          <tbody>
            {enrollments.map(e => (
              <tr key={e.id}>
                <td>{e.Course.name}</td>
                <td>{new Date(e.enrollmentDate).toLocaleDateString('sr-RS')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="sd-section">
        <h2>Položeni ispiti</h2>
        <table className="sd-table">
          <thead>
            <tr><th>Predmet</th><th>Datum ispita</th><th>Ocena</th><th>Bodovi</th></tr>
          </thead>
          <tbody>
            {passedExams.map((a,i) => (
              <tr key={i}>
                <td>{a.courseName}</td>
                <td>{new Date(a.date).toLocaleDateString('sr-RS')}</td>
                <td>{a.grade}</td>
                <td>{a.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="sd-section">
        <h2>Neuspešna polaganja</h2>
        <table className="sd-table">
          <thead>
            <tr><th>Predmet</th><th>Datum ispita</th><th>Ocena</th><th>Bodovi</th></tr>
          </thead>
          <tbody>
            {failedExams.map((a,i) => (
              <tr key={i}>
                <td>{a.courseName}</td>
                <td>{new Date(a.date).toLocaleDateString('sr-RS')}</td>
                <td>{a.grade}</td>
                <td>{a.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="sd-section">
        <h2>Prijave prestupa</h2>
        <ul className="sd-list">
          {misconducts.length
            ? misconducts.map((m,i) => (
                <li key={i}>
                  {m.courseName} — {new Date(m.date).toLocaleString('sr-RS')}: {m.description}
                </li>
              ))
            : <li>Nema prijavljenih prestupa</li>
          }
        </ul>
      </section>

      <section className="sd-section">
        <h2>Prijavljeni ispiti</h2>
        <table className="sd-table">
          <thead>
            <tr><th>Predmet</th><th>Datum prijave</th></tr>
          </thead>
          <tbody>
            {pendingRegistrations.map((p,i) => (
              <tr key={i}>
                <td>{p.courseName}</td>
                <td>{new Date(p.date).toLocaleString('sr-RS')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="sd-section">
        <h2>Završni rad</h2>
        {thesis
          ? (
            <p>
              <strong>Naslov:</strong> {thesis.title}<br/>
              <strong>Ocena:</strong> {thesis.grade}
            </p>
          )
          : <p>Student još nema unet završni rad</p>
        }
      </section>
    </div>
  );
}
