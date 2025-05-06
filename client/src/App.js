// src/App.js
import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin  from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import axios from 'axios';
import MeetingModal from './MeetingModal';

export default function App() {
  const [events, setEvents]       = useState([]);
  const [modalInfo, setModalInfo] = useState(null);

  useEffect(() => { fetchMeetings(); }, []);

  async function fetchMeetings() {
    const { data } = await axios.get('/api/meetings');
    setEvents(data.map(m => ({
      id: m._id,
      title: m.title,
      start: m.start,
      end:   m.end,
      extendedProps: { status: m.status, notes: m.notes }
    })));
  }

  // Utility to detect overlap with existing events
  function hasConflict(start, end, excludeId = null) {
    return events.some(ev => {
      if (ev.id === excludeId) return false;
      const a = new Date(ev.start), b = new Date(ev.end);
      return start < b && end > a;
    });
  }

  // Disallow selecting in the past or overlapping
  function selectAllow(selectInfo) {
    const start = selectInfo.start, end = selectInfo.end;
    if (start < new Date()) return false;
    return !hasConflict(start, end);
  }

  // Disallow dragging into past or overlapping
  function eventAllow(dropInfo) {
    const start = dropInfo.event.start, end = dropInfo.event.end;
    const id    = dropInfo.event.id;
    if (start < new Date()) return false;
    return !hasConflict(start, end, id);
  }

  function handleDateSelect(selectInfo) {
    setModalInfo({ type: 'new', selectInfo });
  }

  function handleEventClick(clickInfo) {
    setModalInfo({ type: 'edit', event: clickInfo.event });
  }
  
  async function handleModalSubmit({ title, start, end, cancel, complete, note }) {
    const id = modalInfo.event?.id;
  
    // 1) If cancelling — do it immediately, skip all validations
    if (cancel) {
      await axios.post(`/api/meetings/${id}/cancel`);
      setModalInfo(null);
      fetchMeetings();
      return;
    }
  
    // 2) If marking complete — also skip date/conflict checks
    if (complete) {
      await axios.post(`/api/meetings/${id}/complete`);
      // optionally add a note when completing
      if (note) {
        await axios.post(`/api/meetings/${id}/notes`, { text: note });
      }
      setModalInfo(null);
      fetchMeetings();
      return;
    }
  
    // 3) From here on, only new or reschedule need validation
    const s = new Date(start);
    const e = new Date(end);
  
    // 3a) Disallow scheduling in the past
    if (s < new Date()) {
      return alert('⚠️ Cannot schedule in the past.');
    }
    // 3b) Disallow conflicts
    const excludeId = modalInfo.type === 'edit' ? modalInfo.event.id : null;
    if (hasConflict(s, e, excludeId)) {
      return alert('⚠️ That time conflicts with another meeting.');
    }
  
    // 4) Create or Reschedule
    if (modalInfo.type === 'new') {
      await axios.post('/api/meetings', { title, start, end });
    } else {
      await axios.put(`/api/meetings/${id}`, { title, start, end });
    }
  
    // 5) No notes on new/reschedule
    setModalInfo(null);
    fetchMeetings();
  }

  return (
    <div style={{ padding: '1rem' }}>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        selectable
        editable
        events={events}
        select={handleDateSelect}
        eventClick={handleEventClick}
        selectAllow={selectAllow}
        eventAllow={eventAllow}
        eventClassNames={info =>
          info.event.extendedProps.status === 'cancelled'
            ? ['cancelled-event']
            : info.event.extendedProps.status === 'completed'
            ? ['completed-event']
            : []
        }
      />

      {modalInfo && (
        <MeetingModal
          info={modalInfo}
          onClose={() => setModalInfo(null)}
          onSubmit={handleModalSubmit}
        />
      )}
    </div>
  );
}
