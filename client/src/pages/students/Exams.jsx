import { useEffect, useState } from 'react';

export default function StudentExams() {
  const [courses, setCourses]               = useState([]);
  const [terms, setTerms]                   = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [nextTerm, setNextTerm]             = useState(null);
  const [pending, setPending]               = useState([]); 
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState('');

  // 1) Dohvati kurseve+attempts i termine
  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Niste prijavljeni.');

        // Kursevi + Attempts
        const resC = await fetch('http://localhost:5000/api/student/courses', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!resC.ok) throw new Error('Greška pri učitavanju kurseva');
        const coursesData = await resC.json();
        setCourses(coursesData);

        // Termini
        const resT = await fetch('http://localhost:5000/api/student/terms', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!resT.ok) throw new Error('Greška pri učitavanju termina');
        const termsData = await resT.json();
        setTerms(termsData);

        // Pending (neocenjene prijave)
        const pend = coursesData.flatMap(c =>
          (c.Attempts || [])
            .filter(a => a.grade == null)
            .map(a => ({
              courseId: c.programId,
              examDate: a.examDate
            }))
        );
        setPending(pend);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // 2) Kad se izabere kurs, pronađi najbliži budući termin
  useEffect(() => {
    if (!selectedCourse) {
      setNextTerm(null);
      return;
    }
    const today = new Date();
    today.setHours(0,0,0,0);

    const future = terms
      .filter(t => t.courseId === Number(selectedCourse))
      .map(t => ({ ...t, dateObj: new Date(t.date) }))
      .filter(t => t.dateObj >= today)
      .sort((a,b) => a.dateObj - b.dateObj);

    setNextTerm(future[0] || null);
  }, [selectedCourse, terms]);

  // 3) Prijava termina
  const handleRegister = async () => {
    if (!nextTerm) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(
        `http://localhost:5000/api/student/terms/${nextTerm.id}/register`,
        { method: 'POST', headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message);
      }
      // Dodaj u pending i ukloni termin iz liste
      setPending(p => [
        ...p,
        { courseId: nextTerm.courseId, examDate: nextTerm.date }
      ]);
      setTerms(t => t.filter(x => x.id !== nextTerm.id));
      setNextTerm(null);
    } catch (e) {
      alert(`Greška: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Učitavam…</p>;
  if (error)   return <p className="error">Greška: {error}</p>;

  // Naziv izabranog kursa
  const courseName = courses.find(c => c.programId === Number(selectedCourse))
    ?.Course.name;

  return (
    <div>
      <h1>Prijava ispita</h1>

      <div style={{ margin: '16px 0' }}>
        <select
          value={selectedCourse}
          onChange={e => setSelectedCourse(e.target.value)}
        >
          <option value="">Izaberi kurs</option>
          {courses.map(c => (
            <option key={c.programId} value={c.programId}>
              {c.Course.name}
            </option>
          ))}
        </select>
      </div>

      {selectedCourse && (
        <>
          <h2>Predmet: {courseName}</h2>

          {nextTerm ? (
            <div style={{ marginBottom: '1rem' }}>
              <p>
                Najbliži termin: <strong>{nextTerm.topic}</strong> —{' '}
                {nextTerm.dateObj.toLocaleDateString('sr-RS', {
                  day:   'numeric',
                  month: 'long',
                  year:  'numeric'
                })}
              </p>
              <button
                onClick={handleRegister}
                disabled={pending.some(
                  p =>
                    p.courseId === Number(selectedCourse) &&
                    p.examDate === nextTerm.date
                )}
              >
                {pending.some(
                  p =>
                    p.courseId === Number(selectedCourse) &&
                    p.examDate === nextTerm.date
                )
                  ? 'Već prijavljen'
                  : 'Prijavi ispit'}
              </button>
            </div>
          ) : (
            <p>Ne postoje budući termini.</p>
          )}
        </>
      )}

      <h2>Prijavljeni ispiti</h2>
      <table border="1" cellPadding="5">
        <thead>
          <tr>
            <th>Predmet</th>
            <th>Tema</th>
            <th>Datum prijave</th>
          </tr>
        </thead>
        <tbody>
          {pending.length === 0 ? (
            <tr>
              <td colSpan="3" style={{ textAlign: 'center' }}>
                Nema prijavljenih ispita
              </td>
            </tr>
          ) : (
            pending.map((p, i) => {
              // pronađi naziv kursa
              const name = courses.find(c => c.programId === p.courseId)
                ?.Course.name || 'Nepoznato';
              // pronađi temu (topic) iz terms
              const term = terms.find(
                t => t.courseId === p.courseId && t.date === p.examDate
              );
              const topic = term?.topic ?? 'Nepoznata tema';
              return (
                <tr key={i}>
                  <td>{name}</td>
                  <td>{topic}</td>
                  <td>{new Date(p.examDate).toLocaleString('sr-RS')}</td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
