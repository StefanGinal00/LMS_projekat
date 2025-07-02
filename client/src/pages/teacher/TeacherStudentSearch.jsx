import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./TeacherStudents.css";

export default function TeacherStudents() {
  const { courseId } = useParams();
  const [students, setStudents] = useState([]);
  const [params, setParams] = useState({
    name: "", surname: "", indexNumber: "", yearOfEnrollment: "", avgFrom: "", avgTo: ""
  });
  const [loading, setLoading] = useState(true);

  // Funkcija za pretragu/filter
  const fetchStudents = async (query = "") => {
    setLoading(true);
    const token = localStorage.getItem("token");
    const res = await fetch(
      `http://localhost:5000/api/teacher/courses/${courseId}/students${query ? "?" + query : ""}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const data = await res.json();
    setStudents(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchStudents();
    // eslint-disable-next-line
  }, [courseId]);

  const handleChange = e => {
    setParams(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSearch = e => {
    e.preventDefault();
    const query = Object.entries(params)
      .filter(([, v]) => v)
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join('&');
    fetchStudents(query);
  };

  if (loading) return <div>Učitavanje...</div>;

  return (
    <div className="teacher-students">
      <h1>Spisak studenata za predmet</h1>
      <form className="student-search-form" onSubmit={handleSearch}>
        <input name="name" placeholder="Ime" value={params.name} onChange={handleChange}/>
        <input name="surname" placeholder="Prezime" value={params.surname} onChange={handleChange}/>
        <input name="indexNumber" placeholder="Broj indeksa" value={params.indexNumber} onChange={handleChange}/>
        <input name="yearOfEnrollment" placeholder="Godina upisa" value={params.yearOfEnrollment} onChange={handleChange}/>
        <input name="avgFrom" placeholder="Prosek od" type="number" step="0.01" value={params.avgFrom} onChange={handleChange}/>
        <input name="avgTo" placeholder="Prosek do" type="number" step="0.01" value={params.avgTo} onChange={handleChange}/>
        <button type="submit">Pretraži</button>
      </form>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Ime</th>
            <th>Prezime</th>
            <th>Email</th>
            <th>Broj indeksa</th>
            <th>Godina upisa</th>
            <th>Status</th>
            <th>Broj pokušaja</th>
            <th>Poslednja ocena</th>
            <th>Prosek</th>
          </tr>
        </thead>
        <tbody>
          {students.map((st, idx) => (
            <tr key={st.id}>
              <td>{idx + 1}</td>
              <td>{st.name}</td>
              <td>{st.surname || "-"}</td>
              <td>{st.email}</td>
              <td>{st.indexNumber || "-"}</td>
              <td>{st.yearOfEnrollment || "-"}</td>
              <td>{st.current ? "Aktivan" : "Neaktivan"}</td>
              <td>{st.numAttempts}</td>
              <td>{typeof st.lastGrade === 'number' ? st.lastGrade : "-"}</td>
              <td>{typeof st.average === 'number' ? st.average.toFixed(2) : "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
