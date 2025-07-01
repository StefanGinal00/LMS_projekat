import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

export default function Syllabus() {
  const { courseId } = useParams();
  const [syllabus, setSyllabus] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:5000/api/courses/${courseId}/syllabus`)
      .then(res => res.json())
      .then(data => setSyllabus(data));
  }, [courseId]);

  if (!syllabus) return <div>Loading...</div>;

  return (
    <div>
      <h1>Silabus za {syllabus.courseName}</h1>
      <div dangerouslySetInnerHTML={{ __html: syllabus.content }} />
    </div>
  );
}