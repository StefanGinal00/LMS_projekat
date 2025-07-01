import { useEffect, useState } from 'react';

export default function University() {
  const [uni, setUni] = useState(null);
  useEffect(() => {
    fetch('http://localhost:5000/api/university')
      .then(r => r.json())
      .then(setUni);
  }, []);
  if (!uni) return <div>Loading…</div>;
  return (
    <div>
      <h1>{uni.name}</h1>
      <p><strong>Rector:</strong> {uni.rector}</p>
      <p><strong>Location:</strong> {uni.location}</p>
      <p><strong>Contact:</strong> {uni.contact}</p>
      <p>{uni.description}</p>
    </div>
  );
}
