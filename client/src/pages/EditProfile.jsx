import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function EditProfile({ user, onUpdate }) {
  const [name,  setName]  = useState(user?.name);
  const [email, setEmail] = useState(user?.email);
  const [pass,  setPass]  = useState('');
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const res = await fetch('http://localhost:5000/api/auth/me', {
      method: 'PUT',
      headers: { 'Content-Type':'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ name, email, password: pass })
    });
    const data = await res.json();
    if (res.ok) {
      localStorage.setItem('user', JSON.stringify(data));
      if (onUpdate) onUpdate(data);
      navigate('/');
    } else {
      alert(data.message);
    }
  };

  return (
    <div>
      <h1>Izmena profila</h1>
      <form onSubmit={handleSubmit}>
        <input type="text"     value={name}  onChange={e=>setName(e.target.value)} required/>
        <input type="email"    value={email} onChange={e=>setEmail(e.target.value)} required/>
        <input type="password" value={pass}  onChange={e=>setPass(e.target.value)} placeholder="Nova lozinka"/>
        <button type="submit">Sačuvaj</button>
      </form>
    </div>
  );
}
