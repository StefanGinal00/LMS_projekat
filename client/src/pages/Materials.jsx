import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

export default function Materials() {
  const { courseId } = useParams();
  const [mats, setMats] = useState([]);
  useEffect(() => {
    fetch(`http://localhost:5000/api/courses/${courseId}/materials`)
      .then(r => r.json())
      .then(data => setMats(data.materials || []));
  }, [courseId]);
  return (
    <div>
      <h1>Materijali</h1>
      <ul>
        {mats.map((m, i) => (
          <li key={i}>
            <a href={m.url} target="_blank" rel="noopener">{m.title || m.url}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
