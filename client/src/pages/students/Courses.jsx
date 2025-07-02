import { useEffect, useState } from 'react';

export default function StudentCourses() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Niste prijavljeni.');

        const res = await fetch(
          'http://localhost:5000/api/student/courses',
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!res.ok) throw new Error(res.statusText);

        setEnrollments(await res.json());
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <p>Učitavam predmete…</p>;
  if (error)   return <p className="error">Greška: {error}</p>;

  // Prikupljamo sve ocene (ignorisan null)
  const allGrades = enrollments
    .flatMap(e => e.Attempts || [])
    .map(a => a.grade)
    .filter(g => g != null);

  const avgGrade = allGrades.length
    ? (allGrades.reduce((s, g) => s + g, 0) / allGrades.length).toFixed(2)
    : 'N/A';

  // Ukupno ECTS za kurseve sa bar jednom ocenom
  const totalECTS = enrollments
    .filter(e => (e.Attempts || []).some(a => a.grade != null))
    .reduce((sum, e) => sum + (e.Course.ects || 0), 0);

  return (
    <div>
      <h1>Moji predmeti</h1>

      {enrollments.length === 0 ? (
        <p>Nema aktivnih predmeta.</p>
      ) : (
        <table border="1" cellPadding="5" style={{ marginBottom: '1rem' }}>
          <thead>
            <tr>
              <th>Predmet</th>
              <th>Datum upisa</th>
              <th>Broj pokušaja</th>
              <th>Najbolja ocena</th>
              <th>Bodovi</th>
              <th>ECTS</th>
            </tr>
          </thead>
          <tbody>
            {enrollments.map(e => {
              const attempts = e.Attempts || [];
              const grades   = attempts
                .map(a => a.grade)
                .filter(g => g != null);
              const best     = grades.length
                ? Math.max(...grades)
                : 'N/A';
              const last     = attempts[attempts.length - 1] || {};

              return (
                <tr key={e.id}>
                  <td>{e.Course.name}</td>
                  <td>
                    {new Date(e.enrollmentDate).toLocaleDateString()}
                  </td>
                  <td>{attempts.length}</td>
                  <td>{best}</td>
                  <td>{last.points ?? '–'}</td>
                  <td>{e.Course.ects ?? '–'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      <h2>Ukupno</h2>
      <table border="1" cellPadding="5">
        <thead>
          <tr>
            <th>Ukupno ECTS</th>
            <th>Prosečna ocena</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{totalECTS}</td>
            <td>{avgGrade}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
