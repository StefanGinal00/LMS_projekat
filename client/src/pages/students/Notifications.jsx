import React, { useEffect, useState } from 'react';

export default function StudentNotifications() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      const res = await fetch('http://localhost:5000/api/student/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) return console.error('Fetch error', res.status);

      setNotifications(await res.json());
    };

    fetchNotifications();
  }, []);

  return (
    <div>
      <h1>Obaveštenja</h1>
      <ul>
        {notifications.map(note => (
          <li key={note.id} style={{ marginBottom: '1rem' }}>
            <h3>{note.title}</h3>
            {note.Course && (
              <p><em>Predmet:</em> {note.Course.name}</p>
            )}
            <p>{note.content}</p>
            <small>
              {note.date
                ? new Date(note.date).toLocaleDateString()
                : ''}
            </small>
          </li>
        ))}
      </ul>
    </div>
  );
}
