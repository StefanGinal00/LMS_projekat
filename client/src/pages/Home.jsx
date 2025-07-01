import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFaculties = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/faculties');
        const data = await response.json();
        setFaculties(data);
      } catch (error) {
        console.error('Error fetching faculties:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFaculties();
  }, []);

  if (loading) return <div>Loading faculties...</div>;

  return (
    <div className="home-container">
      <h1>Dobrodošli na Univerzitet</h1>
      
      <div className="faculties-list">
        <h2>Fakulteti:</h2>
        <ul>
          {faculties.map(faculty => (
            <li key={faculty.id}>
              <h3>{faculty.name}</h3>
              <p>Lokacija: {faculty.location}</p>
              <p>Dekan: {faculty.dean}</p>
              <p>Kontakt: {faculty.contact}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}