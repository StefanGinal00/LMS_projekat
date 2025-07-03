import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./TeacherNotifications.css";

export default function TeacherNotifications() {
  const { courseId } = useParams();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState("");

  // form za dodavanje
  const [title, setTitle]     = useState("");
  const [content, setContent] = useState("");

  // edit stanja
  const [editId, setEditId]         = useState(null);
  const [editTitle, setEditTitle]   = useState("");
  const [editContent, setEditContent] = useState("");

  // 1) dohvat svih obaveštenja za dati kurs
  const fetchNotifications = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:5000/api/teacher/courses/${courseId}/notifications`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      setNotifications(data);
    } catch {
        setError("Ne mogu da učitam obaveštenja");
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // eslint-disable-next-line
  }, [courseId]);

  // 2) dodavanje novog
  const handleAdd = async e => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:5000/api/teacher/courses/${courseId}/notifications`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ title, content })
        }
      );
      if (!res.ok) throw new Error();
      setTitle("");
      setContent("");
      await fetchNotifications();
    } catch {
      setError("Dodavanje nije uspelo");
    }
  };

  // 3) brisanje
  const handleDelete = async id => {
    if (!window.confirm("Obrisati obaveštenje?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:5000/api/teacher/notifications/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      if (!res.ok) throw new Error();
      setNotifications(n => n.filter(x => x.id !== id));
    } catch {
      setError("Brisanje nije uspelo");
    }
  };

  // 4) edit: inicijalizuj formu
  const handleEdit = n => {
    setEditId(n.id);
    setEditTitle(n.title);
    setEditContent(n.content);
  };
  const handleCancel = () => {
    setEditId(null);
    setEditTitle("");
    setEditContent("");
  };

  // 5) sačuvaj izmenu
  const handleSave = async e => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:5000/api/teacher/notifications/${editId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ title: editTitle, content: editContent })
        }
      );
      if (!res.ok) throw new Error();
      handleCancel();
      await fetchNotifications();
    } catch {
      setError("Izmena nije uspela");
    }
  };

  return (
    <div className="teacher-notifications">
      <h2>Obaveštenja za kurs</h2>

      {error && <p className="error">{error}</p>}
      {loading ? (
        <p>Učitavanje…</p>
      ) : (
        <>
          <form className="add-notification-form" onSubmit={handleAdd}>
            <input
              type="text"
              placeholder="Naslov obaveštenja"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />
            <textarea
              rows={3}
              placeholder="Tekst obaveštenja"
              value={content}
              onChange={e => setContent(e.target.value)}
              required
            />
            <button type="submit">Dodaj obaveštenje</button>
          </form>

          <ul className="notification-list">
            {notifications.map(n => (
              <li className="notification-item" key={n.id}>
                {editId === n.id ? (
                  <form onSubmit={handleSave}>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={e => setEditTitle(e.target.value)}
                      required
                    />
                    <textarea
                      rows={3}
                      value={editContent}
                      onChange={e => setEditContent(e.target.value)}
                      required
                    />
                    <div className="notification-buttons">
                      <button type="submit">Sačuvaj</button>
                      <button type="button" onClick={handleCancel}>
                        Otkaži
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="notification-title">{n.title}</div>
                    <div className="notification-content">{n.content}</div>
                    <div className="notification-buttons">
                      <button onClick={() => handleEdit(n)}>Izmeni</button>
                      <button onClick={() => handleDelete(n.id)}>
                        Obriši
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
