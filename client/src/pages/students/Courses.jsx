import { useEffect, useState } from 'react';

export default function StudentCourses() {
  const [enrollments, setEnrollments] = useState([]);

  useEffect(() => {
    const fetchCourses = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await fetch('http://localhost:5000/api/student/courses', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) return console.error('Fetch error', res.status);
      setEnrollments(await res.json());
    };
    fetchCourses();
  }, []);

  const handleNewAttempt = async (courseId) => {
    const token = localStorage.getItem('token');
    const res = await fetch(
      `http://localhost:5000/api/student/exams/${courseId}`,
      {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );
    if (!res.ok) return alert('Prijava neuspela');
    alert('Uspešno prijavljen novi pokušaj');
    // Osveži listu
    window.location.reload();
  };

  return (
    <div>
      <h1>Moji predmeti</h1>
      <ul>
        {enrollments.map(e => {
          const attempts = e.Attempts || [];
          const last = attempts.length
            ? attempts[attempts.length - 1]
            : null;
          return (
            <li key={e.id}>
              <h3>{e.Course?.name || 'Nepoznat kurs'}</h3>
              <p>Datum upisa: {new Date(e.enrollmentDate).toLocaleDateString()}</p>
              <p>Broj pokušaja: {attempts.length}</p>
              <p>Poslednja ocena: {last ? last.grade : 'N/A'}</p>
              <button
                onClick={() => handleNewAttempt(e.Course.id)}
              >
                Prijavi novi pokušaj
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
