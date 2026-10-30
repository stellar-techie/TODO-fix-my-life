import WeeklyPlanner from '../models/WeeklyPlanner.js';

export const formatDateOnly = (d) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const parseDateOnly = (str) => {
  if (!str) return new Date();
  if (typeof str !== 'string') return new Date(str);
  const parts = str.split('T')[0].split('-').map(Number);
  if (parts.length < 3 || isNaN(parts[0])) return new Date();
  return new Date(parts[0], parts[1] - 1, parts[2], 12, 0, 0);
};

// Helper: Given a Date or YYYY-MM-DD string, calculate Monday of that week in YYYY-MM-DD
export const getMondayOfWeek = (dateInput) => {
  const d = dateInput ? parseDateOnly(dateInput) : new Date();
  if (isNaN(d.getTime())) {
    throw new Error('Invalid date format');
  }

  // Day of week: 0 is Sunday, 1 is Monday, ... 6 is Saturday
  const day = d.getDay();
  // We want Monday (1). If Sunday (0), distance is -6 days; otherwise 1 - day
  const diff = day === 0 ? -6 : 1 - day;

  const monday = new Date(d);
  monday.setDate(d.getDate() + diff);
  return formatDateOnly(monday);
};

// Helper: Generate default 7 days for a given week start (Monday)
export const generateDaysForWeek = (mondayStr) => {
  const dayNames = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];

  const monday = parseDateOnly(mondayStr);

  return dayNames.map((name, index) => {
    const currentDay = new Date(monday);
    currentDay.setDate(monday.getDate() + index);
    return {
      date: formatDateOnly(currentDay),
      dayName: name,
      tasks: [],
      goal: '',
      reminder: '',
      notes: '',
    };
  });
};


const defaultSelfCare = [
  { title: 'Drink plenty of water 💧', completed: false },
  { title: 'Take a gentle walk outside 🌿', completed: false },
  { title: 'Read 15 minutes of a favorite book 📖', completed: false },
  { title: 'Screen-free restful sleep 🌙', completed: false },
];

// @desc    Get or create weekly planner for a given date
// @route   GET /api/planner/week/:date?
// @access  Private
export const getWeeklyPlanner = async (req, res, next) => {
  try {
    const dateParam = req.params.date || req.query.date || new Date().toISOString().split('T')[0];
    const weekStartDate = getMondayOfWeek(dateParam);

    let planner = await WeeklyPlanner.findOne({
      user: req.user._id,
      weekStartDate,
    });

    if (!planner) {
      // Create new week structure
      planner = await WeeklyPlanner.create({
        user: req.user._id,
        weekStartDate,
        days: generateDaysForWeek(weekStartDate),
        selfCare: defaultSelfCare,
        stickyNote: 'Small steps every day big changes always ♡',
      });
    }

    res.json({
      success: true,
      planner,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get detailed daily planner for a specific date (e.g. 2026-10-11)
// @route   GET /api/planner/day/:date
// @access  Private
export const getDailyPlanner = async (req, res, next) => {
  try {
    const dateParam = req.params.date;
    if (!dateParam) {
      return res.status(400).json({ success: false, message: 'Date parameter required' });
    }

    const weekStartDate = getMondayOfWeek(dateParam);

    let planner = await WeeklyPlanner.findOne({
      user: req.user._id,
      weekStartDate,
    });

    if (!planner) {
      planner = await WeeklyPlanner.create({
        user: req.user._id,
        weekStartDate,
        days: generateDaysForWeek(weekStartDate),
        selfCare: defaultSelfCare,
      });
    }

    // Find the specific day
    const day = planner.days.find((d) => d.date === dateParam);

    if (!day) {
      return res.status(404).json({
        success: false,
        message: 'Day not found within the selected week',
      });
    }

    res.json({
      success: true,
      weekStartDate: planner.weekStartDate,
      day,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update an entire day's planner (tasks, goal, reminder, notes)
// @route   PUT /api/planner/day/:date
// @access  Private
export const updateDailyPlanner = async (req, res, next) => {
  try {
    const dateParam = req.params.date;
    const { tasks, goal, reminder, notes } = req.body;

    const weekStartDate = getMondayOfWeek(dateParam);

    let planner = await WeeklyPlanner.findOne({
      user: req.user._id,
      weekStartDate,
    });

    if (!planner) {
      planner = await WeeklyPlanner.create({
        user: req.user._id,
        weekStartDate,
        days: generateDaysForWeek(weekStartDate),
        selfCare: defaultSelfCare,
      });
    }

    const day = planner.days.find((d) => d.date === dateParam);

    if (!day) {
      return res.status(404).json({
        success: false,
        message: 'Day not found in week',
      });
    }

    if (tasks !== undefined) day.tasks = tasks;
    if (goal !== undefined) day.goal = goal;
    if (reminder !== undefined) day.reminder = reminder;
    if (notes !== undefined) day.notes = notes;

    await planner.save();

    res.json({
      success: true,
      day,
      weekStartDate: planner.weekStartDate,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a task to a specific day
// @route   POST /api/planner/day/:date/task
// @access  Private
export const addTaskToDay = async (req, res, next) => {
  try {
    const dateParam = req.params.date;
    const { title, priority } = req.body;

    if (!title || title.trim() === '') {
      return res.status(400).json({ success: false, message: 'Task title is required' });
    }

    const weekStartDate = getMondayOfWeek(dateParam);

    let planner = await WeeklyPlanner.findOne({
      user: req.user._id,
      weekStartDate,
    });

    if (!planner) {
      planner = await WeeklyPlanner.create({
        user: req.user._id,
        weekStartDate,
        days: generateDaysForWeek(weekStartDate),
        selfCare: defaultSelfCare,
      });
    }

    const day = planner.days.find((d) => d.date === dateParam);

    if (!day) {
      return res.status(404).json({ success: false, message: 'Day not found' });
    }

    day.tasks.push({
      title: title.trim(),
      completed: false,
      priority: priority || 'normal',
    });

    await planner.save();

    res.status(201).json({
      success: true,
      day,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle completion of a task
// @route   PATCH /api/planner/day/:date/task/:taskId/toggle
// @access  Private
export const toggleTask = async (req, res, next) => {
  try {
    const { date: dateParam, taskId } = req.params;
    const weekStartDate = getMondayOfWeek(dateParam);

    const planner = await WeeklyPlanner.findOne({
      user: req.user._id,
      weekStartDate,
    });

    if (!planner) {
      return res.status(404).json({ success: false, message: 'Planner not found' });
    }

    const day = planner.days.find((d) => d.date === dateParam);
    if (!day) {
      return res.status(404).json({ success: false, message: 'Day not found' });
    }

    const task = day.tasks.id(taskId);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    task.completed = !task.completed;
    await planner.save();

    res.json({
      success: true,
      task,
      day,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a task from a specific day
// @route   DELETE /api/planner/day/:date/task/:taskId
// @access  Private
export const deleteTask = async (req, res, next) => {
  try {
    const { date: dateParam, taskId } = req.params;
    const weekStartDate = getMondayOfWeek(dateParam);

    const planner = await WeeklyPlanner.findOne({
      user: req.user._id,
      weekStartDate,
    });

    if (!planner) {
      return res.status(404).json({ success: false, message: 'Planner not found' });
    }

    const day = planner.days.find((d) => d.date === dateParam);
    if (!day) {
      return res.status(404).json({ success: false, message: 'Day not found' });
    }

    day.tasks.pull(taskId);
    await planner.save();

    res.json({
      success: true,
      day,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update self-care items and sticky note for a week
// @route   PUT /api/planner/week/:date/self-care
// @access  Private
export const updateSelfCare = async (req, res, next) => {
  try {
    const dateParam = req.params.date;
    const { selfCare, stickyNote } = req.body;
    const weekStartDate = getMondayOfWeek(dateParam);

    let planner = await WeeklyPlanner.findOne({
      user: req.user._id,
      weekStartDate,
    });

    if (!planner) {
      planner = await WeeklyPlanner.create({
        user: req.user._id,
        weekStartDate,
        days: generateDaysForWeek(weekStartDate),
        selfCare: selfCare || defaultSelfCare,
        stickyNote: stickyNote || 'Small steps every day big changes always ♡',
      });
    } else {
      if (selfCare !== undefined) planner.selfCare = selfCare;
      if (stickyNote !== undefined) planner.stickyNote = stickyNote;
      await planner.save();
    }

    res.json({
      success: true,
      planner,
    });
  } catch (error) {
    next(error);
  }
};
