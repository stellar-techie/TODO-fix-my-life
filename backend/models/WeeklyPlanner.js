import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  priority: {
    type: String,
    enum: ['normal', 'high', 'low'],
    default: 'normal',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const dayPlannerSchema = new mongoose.Schema({
  date: {
    type: String, // YYYY-MM-DD
    required: true,
  },
  dayName: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    required: true,
  },
  tasks: [taskSchema],
  goal: {
    type: String,
    default: '',
    trim: true,
  },
  reminder: {
    type: String,
    default: '',
    trim: true,
  },
  notes: {
    type: String,
    default: '',
    trim: true,
  },
});

const weeklyPlannerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    weekStartDate: {
      type: String, // YYYY-MM-DD of Monday
      required: true,
    },
    days: [dayPlannerSchema],
    selfCare: [
      {
        title: { type: String, trim: true },
        completed: { type: Boolean, default: false },
      },
    ],
    stickyNote: {
      type: String,
      default: 'Small steps every day big changes always ♡',
    },
  },
  {
    timestamps: true,
  }
);

// Ensure a user only has one document per week
weeklyPlannerSchema.index({ user: 1, weekStartDate: 1 }, { unique: true });

const WeeklyPlanner = mongoose.model('WeeklyPlanner', weeklyPlannerSchema);

export default WeeklyPlanner;
