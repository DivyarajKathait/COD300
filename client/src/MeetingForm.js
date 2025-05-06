// client/src/MeetingForm.js
import React, { useState, useEffect } from 'react';

export default function MeetingForm({ meeting, onClose, onSubmit }) {
  const [title, setTitle] = useState(meeting?.title || '');
  const [start, setStart] = useState(meeting ? meeting.start.slice(0,16) : '');
  const [end,   setEnd]   = useState(meeting ? meeting.end.slice(0,16)   : '');

  useEffect(() => {
    if (!meeting) {
      const now = new Date().toISOString().slice(0,16);
      setStart(now); setEnd(now);
    }
  }, [meeting]);

  const save = e => {
    e.preventDefault();
    onSubmit({ title, start, end });
  };

  return (
    <div style={backdrop}>
      <form style={box} onSubmit={save}>
        <h2>{meeting ? 'Reschedule' : 'New'} Meeting</h2>
        <label>
          Title:
          <input value={title} onChange={e=>setTitle(e.target.value)} required />
        </label>
        <label>
          Start:
          <input type="datetime-local" value={start} onChange={e=>setStart(e.target.value)} required />
        </label>
        <label>
          End:
          <input type="datetime-local" value={end} onChange={e=>setEnd(e.target.value)} required />
        </label>
        <div>
          <button type="submit">Save</button>
          <button type="button" onClick={onClose}>Cancel</button>
        </div>
      </form>
    </div>
  );
}

const backdrop = {
  position:'fixed', top:0, left:0, right:0, bottom:0,
  background:'rgba(0,0,0,0.3)',
  display:'flex', alignItems:'center', justifyContent:'center'
};
const box = {
  background:'#fff', padding:'1rem', borderRadius:'5px',
  display:'flex', flexDirection:'column', gap:'0.5rem'
};