// client/src/NoteForm.js
import React, { useState } from 'react';

export default function NoteForm({ onClose, onSubmit }) {
  const [text, setText] = useState('');
  const add = e => {
    e.preventDefault();
    onSubmit(text);
  };

  return (
    <div style={backdrop}>
      <form style={box} onSubmit={add}>
        <h2>Add Note</h2>
        <textarea
          value={text}
          onChange={e=>setText(e.target.value)}
          rows="4"
          required
        />
        <div>
          <button type="submit">Add</button>
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