import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function EditProfile({ user, onUpdate }) {
  const [name, setName]     = useState(user.name);
  const [email, setEmail]   = useState(user.email);
  const [password, setPass] = useState('');
  const [error, setError]   = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:5000/api/auth/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, email, password: password || undefined })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Greška prilikom izmene');
      // ažuriraj lokalno stanje i localStorage
      onUpdate(data);
      localStorage.setItem('user', JSON.stringify(data));
      navigate('/profile');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="edit-profile">
      <h1>Izmena profila</h1>
      {error && <div className="error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <label>
          Ime:
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
        </label>
        <label>
          Email:
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </label>
        <label>
          Nova lozinka:
          <input
            type="password"
            value={password}
            onChange={e => setPass(e.target.value)}
            placeholder="Ostavite prazno ako ne menjate"
          />
        </label>
        <button type="submit">Sačuvaj promene</button>
      </form>
    </div>
  );
}
