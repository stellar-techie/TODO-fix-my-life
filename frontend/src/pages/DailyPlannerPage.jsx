import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { plannerAPI } from '../services/api';
import confetti from 'canvas-confetti';
import {
  TulipDoodle,
  BellFlowerDoodle,
  DaisyDoodle,
  SparklesDoodle,
  SunflowerDoodle,
} from '../components/Doodles';
import LoadingSpinner from '../components/LoadingSpinner';
import { ArrowLeft, Check, Plus, Trash2, Calendar, Sparkles, Save, Clock } from 'lucide-react';

const DAY_ABBR = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const DailyPlannerPage = () => {
  const { date: dateParam } = useParams();
  const navigate = useNavigate();

  // If date not provided in URL, fallback to today
  const activeDate = dateParam || new Date().toISOString().split('T')[0];

  const [dayData, setDayData] = useState(null);
  const [weekStartDate, setWeekStartDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [savingStatus, setSavingStatus] = useState('saved'); // 'saved' | 'saving' | 'dirty'

  // Debounce timers for text inputs
  const saveTimeoutRef = useRef(null);

  const fetchDayData = async (targetDate) => {
    setLoading(true);
    try {
      const res = await plannerAPI.getDailyPlanner(targetDate);
      if (res.data.success && res.data.day) {
        setDayData(res.data.day);
        setWeekStartDate(res.data.weekStartDate);
      }
    } catch (err) {
      console.error('Failed to load daily planner:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDayData(activeDate);
  }, [activeDate]);

  // Handle day changes (clicking on S M T W T F S selector)
  const handleSelectDayOfWeek = (dayIndex) => {
    if (!weekStartDate) return;
    // Monday is index 1.
    // Monday is day 0 of our weekStartDate.
    // Sunday in our days array is index 6.
    // Let's compute date from Monday:
    const monday = new Date(weekStartDate + 'T00:00:00');
    // Day index in JS: 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
    // If user clicked S (Sun, 0), offset from Monday is +6 days.
    // If Mon (1), offset is 0. If Tue (2), offset is 1, etc.
    const offset = dayIndex === 0 ? 6 : dayIndex - 1;
    const targetDateObj = new Date(monday);
    targetDateObj.setDate(monday.getDate() + offset);
    const targetDateStr = targetDateObj.toISOString().split('T')[0];

    navigate(`/planner/${targetDateStr}`);
  };

  // Add Task
  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      const res = await plannerAPI.addTask(activeDate, { title: newTaskTitle.trim() });
      if (res.data.success && res.data.day) {
        setDayData(res.data.day);
        setNewTaskTitle('');
      }
    } catch (err) {
      console.error('Error adding task:', err);
    }
  };

  // Toggle Task Completion
  const handleToggleTask = async (taskId) => {
    try {
      const res = await plannerAPI.toggleTask(activeDate, taskId);
      if (res.data.success && dayData) {
        const updatedTasks = dayData.tasks.map((t) =>
          t._id === taskId ? { ...t, completed: !t.completed } : t
        );
        const justCompleted = updatedTasks.find((t) => t._id === taskId)?.completed;

        if (justCompleted) {
          // Play mini confetti burst
          confetti({
            particleCount: 25,
            spread: 40,
            origin: { y: 0.6 },
            colors: ['#FFE5D9', '#FFF3B0', '#99B898', '#FFCAD4'],
          });
        }

        setDayData({ ...dayData, tasks: updatedTasks });
      }
    } catch (err) {
      console.error('Error toggling task:', err);
    }
  };

  // Delete Task
  const handleDeleteTask = async (taskId) => {
    try {
      const res = await plannerAPI.deleteTask(activeDate, taskId);
      if (res.data.success && res.data.day) {
        setDayData(res.data.day);
      }
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  };

  // Auto-save changes for Goal, Reminder, Notes
  const triggerAutoSave = (updatedFields) => {
    setSavingStatus('saving');
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await plannerAPI.updateDailyPlanner(activeDate, updatedFields);
        setSavingStatus('saved');
      } catch (err) {
        console.error('Failed to save daily notes/goals:', err);
        setSavingStatus('dirty');
      }
    }, 600);
  };

  const handleFieldChange = (field, value) => {
    const updated = { ...dayData, [field]: value };
    setDayData(updated);
    triggerAutoSave({ [field]: value });
  };

  if (loading) {
    return <LoadingSpinner text="Opening your daily planner... ☀️" />;
  }

  // Active day index (0 for Sunday, 1 for Monday, etc.)
  const activeDateObj = new Date(activeDate + 'T00:00:00');
  const activeDayOfWeekIndex = activeDateObj.getDay();

  const formattedDateString = activeDateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Top Bar with Return to Weekly Planner */}
      <div className="flex items-center justify-between mb-6">
        <Link
          to={`/planner?date=${activeDate}`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#8C7E7A] hover:text-[#5D4037] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>← Back to Weekly Planner</span>
        </Link>

        {/* Auto-save status indicator */}
        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#8C7E7A]">
          {savingStatus === 'saving' && (
            <span className="flex items-center gap-1 text-amber-600 animate-pulse">
              <Clock className="w-3.5 h-3.5" /> Saving...
            </span>
          )}
          {savingStatus === 'saved' && (
            <span className="flex items-center gap-1 text-[#4C7441]">
              <Check className="w-3.5 h-3.5 text-[#7BA870]" /> Saved to MongoDB ♡
            </span>
          )}
        </div>
      </div>

      {/* Main Daily Planner Card (Directly Recreating Reference Image 1) */}
      <div className="relative bg-[#FFFDF7] border-2 border-dashed border-[#E2CE98] rounded-[2.5rem] p-6 sm:p-10 shadow-cozy-lg overflow-hidden">
        
        {/* Washi tape at top */}
        <div className="washi-tape-top" />

        {/* Top Header Section matching Reference 1 */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 mb-8 pt-2">
          
          {/* Title: "Daily Planner" with Sparkles */}
          <div className="relative">
            <div className="flex items-center gap-2">
              <h1 className="font-hand text-5xl sm:text-6xl font-bold text-[#5D4037] tracking-wide">
                Daily Planner
              </h1>
              <div className="flex flex-col gap-1 -mt-4">
                <SparklesDoodle className="w-6 h-6 text-[#E9A825]" />
                <SparklesDoodle className="w-4 h-4 text-[#F5B72E] ml-2" />
              </div>
            </div>
            <p className="text-xs text-[#8C7E7A] font-semibold mt-1">
              {dayData?.dayName || 'Day'} • Focus & Joy
            </p>
          </div>

          {/* Right Header: Floral arrangement & Day Selector Pills (S M T W T F S) */}
          <div className="flex flex-col items-start sm:items-end">
            
            {/* Flower doodles at top right */}
            <div className="flex items-center gap-1 mb-2">
              <span className="text-xl">🌷</span>
              <span className="text-lg">💛</span>
              <span className="text-xl">🌸</span>
              <span className="text-lg">🌼</span>
              <span className="text-xl">🌷</span>
            </div>

            {/* Date pill */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-bold text-[#8C7E7A]">Date:</span>
              <span className="px-4 py-1 rounded-full bg-[#FEF3C7] text-xs font-bold text-[#78350F] border border-[#FDE68A]">
                {formattedDateString}
              </span>
            </div>

            {/* S M T W T F S Day of Week Pills (Reference 1) */}
            <div className="flex items-center gap-1.5 bg-[#FAF6EE] p-1 rounded-full border border-[#E8DEC8]">
              {DAY_ABBR.map((abbr, index) => {
                const isActive = activeDayOfWeekIndex === index;
                return (
                  <button
                    key={index}
                    onClick={() => handleSelectDayOfWeek(index)}
                    className={`w-6 h-6 rounded-full text-[11px] font-bold transition-all flex items-center justify-center ${
                      isActive
                        ? 'bg-[#FEF3C7] text-[#78350F] shadow-sm scale-110 border border-[#FDE68A]'
                        : 'text-[#8C7E7A] hover:text-[#5D4037] hover:bg-[#F2ECE1]'
                    }`}
                    title={`Go to ${['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][index]}`}
                  >
                    {abbr}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 2-Column Grid Layout matching Reference 1:
            Left Column: To Do List (butter card with pill slots)
            Right Column: Goal for Today (top) + Reminder (perforated notepad bottom) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* LEFT COLUMN: "To do list" in soft butter yellow card with pill slots */}
          <div className="bg-[#FEF9C3]/80 border-2 border-[#FDE047]/60 rounded-3xl p-6 shadow-sm flex flex-col justify-between relative">
            
            {/* Cute mini flower on side */}
            <div className="absolute -left-2 top-24 pointer-events-none">
              <DaisyDoodle className="w-8 h-8" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-hand text-3xl font-bold text-[#78350F]">
                  To do list
                </h2>
                <span className="text-xs font-bold text-[#A16207]">
                  {dayData?.tasks?.filter((t) => t.completed).length || 0} /{' '}
                  {dayData?.tasks?.length || 0} done
                </span>
              </div>

              {/* Task Add Form */}
              <form onSubmit={handleAddTask} className="mb-4">
                <div className="relative">
                  <input
                    type="text"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="Add a new task..."
                    className="w-full pl-3 pr-10 py-2 rounded-2xl bg-white border border-[#FDE047] text-xs font-medium text-[#4A3E3D] focus:outline-none focus:ring-2 focus:ring-[#FDE047]"
                  />
                  <button
                    type="submit"
                    className="absolute right-1.5 top-1.5 p-1 rounded-xl bg-[#FEF08A] hover:bg-[#FDE047] text-[#78350F] transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>

              {/* Pill Task Items matching Reference 1 */}
              <div className="space-y-2.5">
                {dayData?.tasks?.length === 0 ? (
                  <div className="py-8 text-center text-xs text-[#92400E] italic font-medium">
                    No tasks for this day yet. Add something you'd like to accomplish ♡
                  </div>
                ) : (
                  dayData?.tasks?.map((task) => (
                    <div
                      key={task._id}
                      className="group flex items-center justify-between gap-2 px-3 py-2 rounded-full bg-white border border-[#FEF08A] shadow-xs hover:border-[#FDE047] transition-all"
                    >
                      <div
                        onClick={() => handleToggleTask(task._id)}
                        className="flex items-center gap-2.5 flex-1 cursor-pointer min-w-0"
                      >
                        {/* Circular Checkbox (Reference 1) */}
                        <div
                          className={`w-4 h-4 rounded-full border-2 transition-all flex items-center justify-center shrink-0 ${
                            task.completed
                              ? 'bg-[#99B898] border-[#7BA870] text-white scale-105'
                              : 'border-[#E2CE98] bg-[#FFFDF7] group-hover:border-[#99B898]'
                          }`}
                        >
                          {task.completed && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>

                        {/* Task Title */}
                        <span
                          className={`text-xs font-medium truncate ${
                            task.completed ? 'line-through text-[#A89895]' : 'text-[#5D4037]'
                          }`}
                        >
                          {task.title}
                        </span>
                      </div>

                      {/* Delete task button */}
                      <button
                        onClick={() => handleDeleteTask(task._id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-[#E57373] hover:text-[#D32F2F] transition-opacity"
                        title="Delete task"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#FDE047]/60 text-center">
              <span className="text-[11px] text-[#A16207] italic">
                Synchronized with Weekly Planner 🗓️
              </span>
            </div>
          </div>

          {/* RIGHT COLUMN: Goal for Today (top) + Reminder (bottom) */}
          <div className="flex flex-col gap-6">
            
            {/* "Goal for today" Card (Reference 1) */}
            <div className="relative bg-[#FEF9C3]/80 border-2 border-[#FDE047]/60 rounded-3xl p-6 shadow-sm flex flex-col justify-between min-h-[170px]">
              
              {/* Cute flower sticker at bottom right of Goal card */}
              <div className="absolute right-3 bottom-3 flex items-center gap-1 pointer-events-none">
                <span className="text-sm">🌸</span>
                <span className="text-base">🌼</span>
              </div>

              <div>
                <h2 className="font-hand text-3xl font-bold text-[#78350F] mb-2">
                  Goal for today
                </h2>

                <textarea
                  value={dayData?.goal || ''}
                  onChange={(e) => handleFieldChange('goal', e.target.value)}
                  placeholder="e.g. Finish binary tree revision and solve 5 DSA problems ♡"
                  rows={3}
                  className="w-full bg-white/70 border border-[#FEF08A] rounded-2xl p-3 text-xs leading-relaxed text-[#4A3E3D] placeholder-[#A16207]/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FDE047] resize-none"
                />
              </div>

              <div className="text-[10px] text-[#A16207] font-semibold mt-1">
                Keep it inspiring and realistic ✨
              </div>
            </div>

            {/* "Reminder" Card with Perforated Edge & Yellow Flowers (Reference 1) */}
            <div className="relative bg-[#FEF9C3]/80 border-2 border-[#FDE047]/60 rounded-3xl p-6 shadow-sm flex flex-col justify-between min-h-[190px]">
              
              {/* Yellow flowers doodle at bottom right of Reminder card */}
              <div className="absolute right-3 bottom-3 flex items-center gap-1 pointer-events-none">
                <span className="text-base">🌼</span>
                <span className="text-lg">🌻</span>
              </div>

              <div>
                <h2 className="font-hand text-3xl font-bold text-[#78350F] mb-2">
                  Reminder
                </h2>

                {/* Perforated notepad look */}
                <div className="relative bg-white rounded-2xl border border-[#FEF08A] p-3 shadow-xs">
                  <div className="perforated-top mb-1" />
                  <textarea
                    value={dayData?.reminder || ''}
                    onChange={(e) => handleFieldChange('reminder', e.target.value)}
                    placeholder="e.g. Submit assignment before 5 PM, or call Mom ♡"
                    rows={3}
                    className="w-full bg-transparent text-xs leading-relaxed text-[#4A3E3D] placeholder-[#A16207]/60 focus:outline-none resize-none pt-2"
                  />
                </div>
              </div>

              <div className="text-[10px] text-[#A16207] font-semibold mt-2">
                Important deadlines & thoughtful nudges 📌
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM ROW: "Note" section stretching across with smiling tulip & bellflower (Reference 1) */}
        <div className="mt-6 relative bg-[#FEF9C3]/80 border-2 border-[#FDE047]/60 rounded-3xl p-6 shadow-sm">
          
          {/* Smiling Tulip at bottom-left corner (from Reference 1) */}
          <div className="absolute -bottom-2 -left-2 pointer-events-none">
            <TulipDoodle className="w-14 h-14" />
          </div>

          {/* Bellflower at bottom-right corner (from Reference 1) */}
          <div className="absolute -bottom-2 -right-2 pointer-events-none">
            <BellFlowerDoodle className="w-14 h-14" />
          </div>

          <div className="sm:px-6">
            <h2 className="font-hand text-3xl font-bold text-[#78350F] mb-2">
              Note
            </h2>

            <textarea
              value={dayData?.notes || ''}
              onChange={(e) => handleFieldChange('notes', e.target.value)}
              placeholder="Study notes, key formulas, random thoughts, ideas, or cozy reflections for today..."
              rows={4}
              className="w-full bg-white/70 border border-[#FEF08A] rounded-2xl p-3 text-xs leading-relaxed text-[#4A3E3D] placeholder-[#A16207]/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FDE047] resize-none"
            />
          </div>
        </div>

      </div>
    </div>
  );
};

export default DailyPlannerPage;
