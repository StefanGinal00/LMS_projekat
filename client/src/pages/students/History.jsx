import { useEffect, useState } from 'react';

export default function StudentHistory() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await fetch('http://localhost:5000/api/student/history', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) return console.error(res.status);
      setHistory(await res.json());
    };
    fetchHistory();
  }, []);

  // samo položeni (passed = true)
  const passed = history.filter(i => i.passed);

  const totalECTS = passed.reduce((sum, i) => sum + (i.ects || 0), 0);
  const avgGrade  = passed.length
    ? (passed.reduce((sum, i) => sum + (i.lastGrade || 0), 0) / passed.length).toFixed(2)
    : 'N/A';

  return (
    <div>
      <h1>Istorija studiranja</h1>

      <div style={{ marginBottom: '1rem' }}>
        <p><strong>Položeni:</strong> {passed.length}</p>
        <p><strong>Uk. ECTS:</strong> {totalECTS}</p>
        <p><strong>Prosek:</strong> {avgGrade}</p>
      </div>

      <table border="1" cellPadding="5" cellSpacing="0">
        <thead>
          <tr>
            <th>Predmet</th>
            <th>Polaganja</th>
            <th>Bodovi</th>
            <th>Ocena</th>
            <th>ECTS</th>
          </tr>
        </thead>
        <tbody>
          {history.length === 0 ? (
            <tr>
              <td colSpan="5" style={{ textAlign: 'center' }}>
                Još nema istorije
              </td>
            </tr>
          ) : (
            history.map((item, idx) => (
              <tr key={idx}>
                <td>{item.course}</td>
                <td>{item.attempts}</td>
                <td>{item.points}</td>
                <td>{item.lastGrade ?? 'N/A'}</td>
                <td>{item.ects ?? '–'}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
