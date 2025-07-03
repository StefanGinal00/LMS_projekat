import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import './TeacherInstruments.css';

export default function TeacherInstruments() {
  const { courseId } = useParams();
  const [items, setItems]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  // Form state, sadrzi description
  const [name, setName]           = useState('');
  const [type, setType]           = useState('project');
  const [description, setDescription] = useState('');  // <-- new
  const [maxScore, setMaxScore]   = useState(100);

  // vraca instruments za pokretanje / courseId change
  useEffect(() => {
    const token = localStorage.getItem('token');
    async function load() {
      try {
        const res = await fetch(
          `http://localhost:5000/api/teacher/courses/${courseId}/instruments`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        if (!res.ok) throw new Error(`Server returned ${res.status}`);
        setItems(await res.json());
      } catch (err) {
        console.error(err);
        setError('Ne mogu da učitam instrumente');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [courseId]);

  // dodavnje novog instrument, sada salje description
  const handleAdd = async (e) => {
    e.preventDefault();
    setError('');
    const token = localStorage.getItem('token');

    try {
      const res = await fetch(
        `http://localhost:5000/api/teacher/courses/${courseId}/instruments`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ name, type, description, maxScore })
        }
      );
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.message || res.status);
      }
      // Reset form
      setName('');
      setType('project');
      setDescription('');// <-- clear textarea
      setMaxScore(100);

      // Reload list
      const json = await fetch(
        `http://localhost:5000/api/teacher/courses/${courseId}/instruments`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setItems(await json.json());
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  // Edit and Delete ostaju isti

  const handleEdit = async (id) => {
    const newName = prompt('Nova oznaka:', '');
    if (newName == null) return;
    const token = localStorage.getItem('token');
    await fetch(`http://localhost:5000/api/teacher/instruments/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ name: newName })
    });
    // reload
    const resp = await fetch(
      `http://localhost:5000/api/teacher/courses/${courseId}/instruments`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    setItems(await resp.json());
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Obrisati instrument?')) return;
    const token = localStorage.getItem('token');
    await fetch(`http://localhost:5000/api/teacher/instruments/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    // reload
    const resp = await fetch(
      `http://localhost:5000/api/teacher/courses/${courseId}/instruments`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    setItems(await resp.json());
  };

  if (loading) return <div>Učitavanje…</div>;

  return (
    <div className="teacher-instruments-page">
      <h1>Instrumenti evaluacije (kurs {courseId})</h1>
      {error && <div className="error">{error}</div>}

      {/* dodavanje nove instrument form */}
      <form className="add-inst-form" onSubmit={handleAdd}>
        <input
          type="text"
          required
          placeholder="Naziv instrumenta"
          value={name}
          onChange={e => setName(e.target.value)}
        />

        <select value={type} onChange={e => setType(e.target.value)}>
          <option value="project">Projektni zadatak</option>
          <option value="test">Test</option>
          <option value="kolokvijum">Kolokvijumski zadatak</option>
        </select>

        {/* Description textarea */}
        <textarea
          placeholder="Opis (opciono)"
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={2}
        />

        <input
          type="number"
          required
          placeholder="Maks. bodova"
          value={maxScore}
          onChange={e => setMaxScore(e.target.value)}
        />

        <button type="submit">Dodaj</button>
      </form>

      {/* Instruments list */}
      <ul className="inst-list">
        {items.map(i => (
          <li key={i.id} className="inst-item">
            <div className="inst-header">
              <strong>{i.name}</strong>
              <span className="inst-type">({i.type}, max {i.maxScore}b)</span>

              <div className="inst-actions">
                <button onClick={() => handleEdit(i.id)}>Izmeni</button>
                <button onClick={() => handleDelete(i.id)}>Obriši</button>
              </div>
            </div>
            {i.description && <p className="inst-desc">{i.description}</p>}
          </li>
        ))}
      </ul>

      <Link to="/teacher/courses">
        <button className="back-btn">Nazad na predmete</button>
      </Link>
    </div>
  );
}
