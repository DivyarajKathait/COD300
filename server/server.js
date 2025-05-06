// server/server.js
const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// 1. Schema & TTL index
const meetingSchema = new mongoose.Schema({
  title:       String,
  start:       Date,
  end:         Date,
  status:      { type: String, enum: ['scheduled','cancelled','completed'], default: 'scheduled' },
  notes:       [{ text: String, createdAt: { type: Date, default: Date.now } }],
  cancelledAt: Date
}, { timestamps: true });

// Auto-delete 7 days after cancelledAt
meetingSchema.index(
  { cancelledAt: 1 },
  { expireAfterSeconds: 7 * 24 * 60 * 60 }
);

const Meeting = mongoose.model('Meeting', meetingSchema);

// 2. Connect to local MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB connected'))
.catch(err => console.error('❌ DB connect error:', err));

// 3. Routes

// Get all
app.get('/api/meetings', async (req, res) => {
  const all = await Meeting.find().sort({ start: 1 });
  res.json(all);
});

// Create
app.post('/api/meetings', async (req, res) => {
  const { title, start, end } = req.body;
  const m = await Meeting.create({ title, start, end });
  res.json(m);
});

// Update (reschedule/title)
app.put('/api/meetings/:id', async (req, res) => {
  const { title, start, end } = req.body;
  const m = await Meeting.findByIdAndUpdate(
    req.params.id,
    { title, start, end },
    { new: true }
  );
  res.json(m);
});

// Cancel (soft + mark cancelledAt)
app.post('/api/meetings/:id/cancel', async (req, res) => {
  const m = await Meeting.findByIdAndUpdate(
    req.params.id,
    { status: 'cancelled', cancelledAt: new Date() },
    { new: true }
  );
  res.json(m);
});

// Add a note
app.post('/api/meetings/:id/notes', async (req, res) => {
  const { text } = req.body;
  const m = await Meeting.findByIdAndUpdate(
    req.params.id,
    { $push: { notes: { text } } },
    { new: true }
  );
  res.json(m);
});
// Mark a meeting completed
app.post('/api/meetings/:id/complete', async (req, res) => {
  try {
    const { id } = req.params;
    // 1. Validate the ID format up front
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid meeting ID' });
    }

    // 2. Find the meeting
    const meeting = await Meeting.findById(id);
    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    // 3. Don’t complete a canceled meeting
    if (meeting.status === 'cancelled') {
      return res.status(400).json({ error: 'Cannot complete a canceled meeting' });
    }

    // 4. Mark as completed and save
    meeting.status = 'completed';
    await meeting.save();

    // 5. Return the updated document
    return res.json(meeting);
  } catch (err) {
    console.error('Error in /complete:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});
// 4. Start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log('Server on port ${PORT}'));
