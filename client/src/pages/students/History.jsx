import { useEffect, useState } from 'react';

export default function StudentHistory() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/student/history', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setHistory(data);
    };
    
    fetchHistory();
  }, []);

  const calculateStats = () => {
    const passedCourses = history.filter(c => c.passed).length;
    const totalECTS = passedCourses * 6; // Pretpostavka: svaki predmet nosi 6 ECTS
    const averageGrade = history.reduce((sum, c) => sum + parseInt(c.lastGrade || 0), 0) / history.length;
    
    return { passedCourses, totalECTS, averageGrade: averageGrade.toFixed(2) };
  };

  const stats = calculateStats();

  return (
    <div>
      <h1>Istorija studiranja</h1>
      <div className="stats">
        <p>Položeni predmeti: {stats.passedCourses}</p>
        <p>Ukupno ECTS: {stats.totalECTS}</p>
        <p>Prosečna ocena: {stats.averageGrade}</p>
      </div>
      <ul>
        {history.map((item, index) => (
          <li key={index}>
            <h3>{item.course}</h3>
            <p>Broj pokušaja: {item.attempts}</p>
            <p>Poslednja ocena: {item.lastGrade || 'N/A'}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}