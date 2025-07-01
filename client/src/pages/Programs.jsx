import { useEffect, useState } from 'react';

export default function Programs() {
  const [programs, setPrograms] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/programs')
      .then(res => res.json())
      .then(data => setPrograms(data));
  }, []);

  return (
    <div>
      <h1>Studijski Programi</h1>
      <ul>
        {programs.map(program => (
          <li key={program._id}>
            <h3>{program.name}</h3>
            <p>Rukovodilac: {program.director}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}