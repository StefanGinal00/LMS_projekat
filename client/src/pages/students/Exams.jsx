import { useEffect, useState } from 'react';

export default function StudentExams() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');

  useEffect(() => {
    const fetchCourses = async () => {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/student/courses', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setCourses(data);
    };
    
    fetchCourses();
  }, []);

  const handleExamRegistration = async () => {
    if (!selectedCourse) return;
    
    const token = localStorage.getItem('token');
    const response = await fetch(`http://localhost:5000/api/student/exams/${selectedCourse}`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      alert('Uspešno prijavljen ispit!');
    }
  };

  return (
    <div>
      <h1>Prijava ispita</h1>
      <select 
        value={selectedCourse} 
        onChange={(e) => setSelectedCourse(e.target.value)}
      >
        <option value="">Izaberi predmet</option>
        {courses.map(course => (
          <option key={course._id} value={course.course._id}>
            {course.course.name}
          </option>
        ))}
      </select>
      <button onClick={handleExamRegistration}>Prijavi ispit</button>
    </div>
  );
}