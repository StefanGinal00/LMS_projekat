import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

export default function ProgramDetail() {
  const { id } = useParams();
  const [prog, setProg] = useState(null);
  const [courses, setCourses] = useState([]);
  useEffect(() => {
    fetch(`http://localhost:5000/api/programs/${id}`)
      .then(r => r.json())
      .then(setProg);
    fetch(`http://localhost:5000/api/programs/${id}/courses`)
      .then(r => r.json())
      .then(setCourses);
  }, [id]);
  if (!prog) return <div>Loading…</div>;
  return (
    <div>
      <h1>{prog.name}</h1>
      <p><strong>Director:</strong> {prog.director}</p>
      <p>{prog.description}</p>
      <h2>Predmeti:</h2>
      <ul>
        {courses.map(c => (
          <li key={c.id}>
            <Link to={`/course/${c.id}/syllabus`}>{c.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
