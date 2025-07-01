import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

export default function Faculty() {
  const { id } = useParams();
  const [faculty, setFaculty] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:5000/api/faculties/${id}`)
      .then(res => res.json())
      .then(data => setFaculty(data));
  }, [id]);

  if (!faculty) return <div>Loading...</div>;

  return (
    <div>
      <h1>{faculty.name}</h1>
      <p>Dekan: {faculty.dean}</p>
      <p>Lokacija: {faculty.location}</p>
    </div>
  );
}