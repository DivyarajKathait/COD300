// client/src/MeetingModal.js
import React, { useState, useEffect } from 'react';

export default function MeetingModal({ info, onClose, onSubmit }) {
  const { type, selectInfo, event } = info;
  const isNew = type === 'new';

  // Form state
  const [step, setStep]       = useState(isNew ? 'create' : 'choose');
  const [action, setAction]   = useState('reschedule'); // default choice
  const [title, setTitle]     = useState('');
  const [start, setStart]     = useState('');
  const [end, setEnd]         = useState('');
  const [note, setNote]       = useState('');
  const [notesList, setNotes] = useState([]);

  // Initialize on open
  useEffect(() => {
    if (isNew) {
      const s = selectInfo.start.toISOString().slice(0,16);
      const e = (selectInfo.end||selectInfo.start).toISOString().slice(0,16);
      setTitle('');
      setStart(s);
      setEnd(e);
      setNote('');
      setStep('create');
    } else {
      setTitle(event.title);
      setStart(event.start.toISOString().slice(0,16));
      setEnd(event.end.toISOString().slice(0,16));
      setNotes(event.extendedProps.notes);
      setStep('choose');
      setAction('reschedule');
      setNote('');
    }
  }, [info]);

  const handleChoose = choice => {
    setAction(choice);
    setStep('execute');
  };

  const submit = e => {
    e.preventDefault();
    // Build payload for App.js
    onSubmit({
      title,
      start,
      end,
      cancel:   action === 'cancel',
      complete: action === 'complete',
      note:     note.trim()
    });
  };

  return (
    <div className="modal-backdrop">
      <form className="modal" onSubmit={submit}>
        {/* Step 1: choosing action */}
        {step === 'choose' && (
          <>
            <h3>What would you like to do?</h3>
            <button type="button" onClick={() => handleChoose('reschedule')}>
              Reschedule
            </button>
            <button type="button" onClick={() => handleChoose('complete')}>
              Mark as Completed
            </button>
            <button type="button" onClick={() => handleChoose('cancel')}>
              Cancel Meeting
            </button>
            <button type="button" onClick={onClose} style={{ marginTop: '1rem' }}>
              Close
            </button>
          </>
        )}

        {/* Step 2: execution */}
        {step === 'execute' && (
          <>
            <h3>
              {isNew
                ? 'Add New Meeting'
                : action === 'reschedule'
                ? 'Reschedule Meeting'
                : action === 'complete'
                ? 'Complete Meeting'
                : 'Cancel Meeting'}
            </h3>

            {/* Reschedule: allow editing title/time */}
            {(isNew || action === 'reschedule') && (
              <>
                <label>
                  Title
                  <input
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    required
                  />
                </label>
                <label>
                  Start
                  <input
                    type="datetime-local"
                    value={start}
                    onChange={e => setStart(e.target.value)}
                    required
                  />
                </label>
                <label>
                  End
                  <input
                    type="datetime-local"
                    value={end}
                    onChange={e => setEnd(e.target.value)}
                    required
                  />
                </label>
              </>
            )}

            {/* Show existing notes and allow new note on edit */}
            {!isNew && notesList.length > 0 && (
              <div>
                <h4>Existing Notes</h4>
                {notesList.map((n,i) => (
                  <div key={i}>
                    <small>
                      {new Date(n.createdAt).toLocaleString()}:
                    </small>{' '}
                    {n.text}
                  </div>
                ))}
              </div>
            )}

            {/* For both complete & cancel & reschedule, allow adding a note */}
            {!isNew && (
              <label>
                Add Note
                <textarea
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  rows={3}
                />
              </label>
            )}

            <div style={{ marginTop: '1rem' }}>
              <button type="submit">Save</button>
              <button type="button" onClick={onClose}>Cancel</button>
            </div>
          </>
        )}

        {/* Step 0: create new meeting */}
        {step === 'create' && isNew && (
          <>
            <h3>Add New Meeting</h3>
            <label>
              Title
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
              />
            </label>
            <label>
              Start
              <input
                type="datetime-local"
                value={start}
                onChange={e => setStart(e.target.value)}
                required
              />
            </label>
            <label>
              End
              <input
                type="datetime-local"
                value={end}
                onChange={e => setEnd(e.target.value)}
                required
              />
            </label>
            <div style={{ marginTop: '1rem' }}>
              <button type="submit">Create</button>
              <button type="button" onClick={onClose}>Cancel</button>
            </div>
          </>
        )}
      </form>
    </div>
  );
}