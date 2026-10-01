import { useState } from 'react';

export const WeeklyLessonPlan = () => {
  const [startDate, setStartDate] = useState<string>('Oct 4');
  const [teacher, setTeacher] = useState<string>('fff');
  const [subject, setSubject] = useState<string>('ppp');

  return (
    <div>
      <h1>Weekly Lesson Plan</h1>
      <div className="controls">
        <button className="active">1</button>
        <button className="inactive">2</button>
        <button className="home">home</button>
      </div>
      <div className="date-range">
        <h3>Sunday, Oct 4 – Thursday, Oct 8</h3>
      </div>
      <div className="form-group">
        <label>Week</label>
        <input type="text" value="41" readOnly />
      </div>
      <div className="form-group">
        <label>Start Date</label>
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
      </div>
      <div className="form-group">
        <label>Teacher</label>
        <input type="text" value={teacher} onChange={(e) => setTeacher(e.target.value)} />
      </div>
      <div className="form-group">
        <label>Subject</label>
        <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} />
      </div>
    </div>
  );
};