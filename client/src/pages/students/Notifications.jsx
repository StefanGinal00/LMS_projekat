import { useEffect, useState } from 'react';

export default function StudentNotifications() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/student/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setNotifications(data);
    };
    
    fetchNotifications();
  }, []);

  return (
    <div>
      <h1>Obaveštenja</h1>
      <ul>
        {Array.isArray(notifications) && notifications.map(notification => (
          <li key={notification.id}>
            <h3>{notification.title}</h3>
            <p>{notification.content}</p>
            <small>{notification.date 
              ? new Date(notification.date).toLocaleDateString() 
              : ''}</small>
          </li>
        ))}
      </ul>
    </div>
  );
}