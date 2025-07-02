// src/pages/teacher/TeacherStudents.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./TeacherStudents.css";

export default function TeacherStudents() {
  const { courseId } = useParams();
  const [students, setStudents] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    name: "",
    surname: "",
    indexNumber: "",
    year: "",
    avgFrom: "",
    avgTo: "",
  });

  useEffect(() => {
    const fetchStudents = async () => {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:5000/api/teacher/courses/${courseId}/students`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      setStudents(data);
      setFiltered(data);
      setLoading(false);
    };
    fetchStudents();
  }, [courseId]);

  // Filtriranje studenata po filter poljima
  useEffect(() => {
    setFiltered(
      students.filter((s) => {
        return (
          (!filter.name || s.name.toLowerCase().includes(filter.name.toLowerCase())) &&
          (!filter.surname || (s.surname && s.surname.toLowerCase().includes(filter.surname.toLowerCase()))) &&
          (!filter.indexNumber || (s.indexNumber && s.indexNumber.includes(filter.indexNumber))) &&
          (!filter.year || s.yearOfEnrollment === Number(filter.year)) &&
          (!filter.avgFrom || (typeof s.average !== "undefined" && s.average >= Number(filter.avgFrom))) &&
          (!filter.avgTo || (typeof s.average !== "undefined" && s.average <= Number(filter.avgTo)))
        );
      })
    );
  }, [students, filter]);

  const handleFilterChange = (e) => {
    setFilter({ ...filter, [e.target.name]: e.target.value });
  };

  if (loading) return <div>Učitavanje...</div>;

  return (
    <div className="teacher-students">
      <h1>Spisak studenata za predmet</h1>
      <div className="filter-form">
        <input name="name" placeholder="Ime" onChange={handleFilterChange} />
        <input name="surname" placeholder="Prezime" onChange={handleFilterChange} />
        <input name="indexNumber" placeholder="Broj indeksa" onChange={handleFilterChange} />
        <input name="year" placeholder="Godina upisa" type="number" onChange={handleFilterChange} />
        <input name="avgFrom" placeholder="Prosek od" type="number" step="0.01" onChange={handleFilterChange} />
        <input name="avgTo" placeholder="Prosek do" type="number" step="0.01" onChange={handleFilterChange} />
      </div>
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
          {filtered.map((st, idx) => (
            <tr key={st.id}>
              <td>{idx + 1}</td>
              <td>{st.name}</td>
              <td>{st.surname ?? "-"}</td>
              <td>{st.email}</td>
              <td>{st.indexNumber ?? "-"}</td>
              <td>{st.yearOfEnrollment ?? "-"}</td>
              <td>{st.current ? "Aktivan" : "Neaktivan"}</td>
              <td>{st.numAttempts ?? 0}</td>
              <td>{typeof st.lastGrade !== "undefined" && st.lastGrade !== null ? st.lastGrade : "-"}</td>
              <td>{typeof st.average !== "undefined" && st.average !== null ? st.average.toFixed(2) : "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
