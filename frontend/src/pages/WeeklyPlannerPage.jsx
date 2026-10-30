import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { plannerAPI } from '../services/api';
import {
  FlowerBasketDoodle,
  PencilMugDoodle,
  SmileyStarDoodle,
  PottedPlantDoodle,
  AlarmClockDoodle,
  SparklesDoodle,
  TulipDoodle,
} from '../components/Doodles';
import LoadingSpinner from '../components/LoadingSpinner';
import { ChevronLeft, ChevronRight, Plus, Check, ArrowRight, Sparkles } from 'lucide-react';

const DAY_THEMES = {
  Monday: {
    badgeBg: 'bg-[#FFCCBC]',
    badgeBorder: 'border-[#FFAB91]',
    badgeText: 'text-[#BF360C]',
    dotBorder: 'border-[#FFAB91]',
    flowerEmoji: '🌸',
  },
  Tuesday: {
    badgeBg: 'bg-[#C8E6C9]',
    badgeBorder: 'border-[#A5D6A7]',
    badgeText: 'text-[#1B5E20]',
    dotBorder: 'border-[#A5D6A7]',
    flowerEmoji: '🌿',
  },
  Wednesday: {
    badgeBg: 'bg-[#E1BEE7]',
    badgeBorder: 'border-[#CE93D8]',
    badgeText: 'text-[#4A148C]',
    dotBorder: 'border-[#CE93D8]',
    flowerEmoji: '🪻',
  },
  Thursday: {
    badgeBg: 'bg-[#FFF59D]',
    badgeBorder: 'border-[#FFF176]',
    badgeText: 'text-[#F57F17]',
    dotBorder: 'border-[#FFF176]',
    flowerEmoji: '🌼',
  },
  Friday: {
    badgeBg: 'bg-[#F8BBD0]',
    badgeBorder: 'border-[#F48FB1]',
    badgeText: 'text-[#880E4F]',
    dotBorder: 'border-[#F48FB1]',
    flowerEmoji: '♡',
  },
  Saturday: {
    badgeBg: 'bg-[#D7CCC8]',
    badgeBorder: 'border-[#BCAAA4]',
    badgeText: 'text-[#3E2723]',
    dotBorder: 'border-[#BCAAA4]',
    flowerEmoji: '🌱',
  },
  Sunday: {
    badgeBg: 'bg-[#D1C4E9]',
    badgeBorder: 'border-[#B39DDB]',
    badgeText: 'text-[#311B92]',
    dotBorder: 'border-[#B39DDB]',
    flowerEmoji: '🌸',
  },
};

const WeeklyPlannerPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Current active date reference for calculating week
  const dateQuery = searchParams.get('date') || new Date().toISOString().split('T')[0];

  const [planner, setPlanner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newTaskInput, setNewTaskInput] = useState({ date: null, text: '' });
  const [isEditingSticky, setIsEditingSticky] = useState(false);
  const [stickyNoteText, setStickyNoteText] = useState('');

  const fetchPlanner = async (targetDate) => {
    setLoading(true);
    try {
      const res = await plannerAPI.getWeeklyPlanner(targetDate);
      if (res.data.success && res.data.planner) {
        setPlanner(res.data.planner);
        setStickyNoteText(res.data.planner.stickyNote || 'Small steps every day big changes always ♡');
      }
    } catch (err) {
      console.error('Failed to load weekly planner:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlanner(dateQuery);
  }, [dateQuery]);

  // Navigate between weeks
  const changeWeek = (offsetDays) => {
    const current = new Date(dateQuery + 'T00:00:00');
    current.setDate(current.getDate() + offsetDays);
    const newDateStr = current.toISOString().split('T')[0];
    setSearchParams({ date: newDateStr });
  };

  const jumpToToday = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    setSearchParams({ date: todayStr });
  };

  // Toggle task completion directly from weekly view
  const handleToggleTask = async (e, dayDate, taskId) => {
    e.stopPropagation();
    try {
      const res = await plannerAPI.toggleTask(dayDate, taskId);
      if (res.data.success && planner) {
        // Update local state smoothly
        const updatedDays = planner.days.map((d) => {
          if (d.date === dayDate) {
            return {
              ...d,
              tasks: d.tasks.map((t) => (t._id === taskId ? { ...t, completed: !t.completed } : t)),
            };
          }
          return d;
        });
        setPlanner({ ...planner, days: updatedDays });
      }
    } catch (err) {
      console.error('Error toggling task:', err);
    }
  };

  // Add task to a day
  const handleAddTask = async (e, dayDate) => {
    e.preventDefault();
    e.stopPropagation();
    if (!newTaskInput.text.trim()) {
      setNewTaskInput({ date: null, text: '' });
      return;
    }

    try {
      const res = await plannerAPI.addTask(dayDate, { title: newTaskInput.text.trim() });
      if (res.data.success && planner) {
        const updatedDays = planner.days.map((d) => (d.date === dayDate ? res.data.day : d));
        setPlanner({ ...planner, days: updatedDays });
        setNewTaskInput({ date: null, text: '' });
      }
    } catch (err) {
      console.error('Failed to add task:', err);
    }
  };

  // Toggle self-care task
  const handleToggleSelfCare = async (idx) => {
    if (!planner || !planner.selfCare) return;
    const updatedSelfCare = planner.selfCare.map((item, i) =>
      i === idx ? { ...item, completed: !item.completed } : item
    );

    setPlanner({ ...planner, selfCare: updatedSelfCare });

    try {
      await plannerAPI.updateSelfCare(planner.weekStartDate, {
        selfCare: updatedSelfCare,
      });
    } catch (err) {
      console.error('Failed to update self-care:', err);
    }
  };

  // Save sticky note
  const handleSaveStickyNote = async () => {
    setIsEditingSticky(false);
    if (!planner) return;
    try {
      await plannerAPI.updateSelfCare(planner.weekStartDate, {
        stickyNote: stickyNoteText,
      });
      setPlanner({ ...planner, stickyNote: stickyNoteText });
    } catch (err) {
      console.error('Failed to save sticky note:', err);
    }
  };

  // Compute week date range display string (e.g. "October 5 – October 11, 2026")
  const getWeekRangeString = () => {
    if (!planner || !planner.days || planner.days.length === 0) return '';
    const monday = new Date(planner.days[0].date + 'T00:00:00');
    const sunday = new Date(planner.days[6].date + 'T00:00:00');

    const optionsMon = { month: 'short', day: 'numeric' };
    const optionsSun = { month: 'short', day: 'numeric', year: 'numeric' };

    return `${monday.toLocaleDateString('en-US', optionsMon)} – ${sunday.toLocaleDateString('en-US', optionsSun)}`;
  };

  if (loading) {
    return <LoadingSpinner text="Opening your weekly planner... 🗓️" />;
  }

  const days = planner?.days || [];
  const selfCare = planner?.selfCare || [];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Aesthetic Weekly Planner Board (Inspired Directly by Reference Image 2) */}
      <div className="relative bg-[#FFFEFA] border-2 border-dashed border-[#E2CE98] rounded-3xl p-6 md:p-10 shadow-cozy-lg overflow-hidden bg-grid-paper">
        
        {/* Header Section with Cloud Banner and Cute Illustrations */}
        <div className="relative flex flex-col items-center justify-center pt-2 pb-6 border-b border-[#E8DEC8]/80">
          
          {/* Flower Basket on Top Left (from Reference 2) */}
          <div className="absolute left-2 top-0 hidden md:block">
            <FlowerBasketDoodle className="w-24 h-24" />
          </div>

          {/* Mug with pens & star on Top Right (from Reference 2) */}
          <div className="absolute right-2 top-0 hidden md:flex items-end gap-1">
            <PencilMugDoodle className="w-20 h-24" />
            <SmileyStarDoodle className="w-10 h-10 mb-2 animate-bounce" />
          </div>

          {/* Cloud Scalloped Title Banner matching Reference 2 */}
          <div className="relative px-8 py-4 bg-[#FFFEFA] border-2 border-dashed border-[#E2CE98] rounded-[2.5rem] shadow-sm text-center max-w-md mx-auto">
            <h1 className="font-hand text-4xl sm:text-5xl font-bold text-[#5D4037] flex items-center justify-center gap-2">
              Weekly <span className="text-[#E57373]">To-Do List</span>
              <span className="text-[#E57373] text-3xl">♡</span>
            </h1>
          </div>

          {/* Week Navigation Controls */}
          <div className="mt-6 flex items-center justify-center gap-3 flex-wrap">
            <button
              onClick={() => changeWeek(-7)}
              className="p-2 rounded-full bg-[#FAF6EE] hover:bg-[#F2ECE1] border border-[#E8DEC8] text-[#5D4037] transition-all shadow-sm flex items-center gap-1 text-xs font-bold"
              title="Previous Week"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Previous Week</span>
            </button>

            <button
              onClick={jumpToToday}
              className="px-4 py-1.5 rounded-full bg-[#FFE5D9] hover:bg-[#FFCAD4] border border-[#F4ACB7]/60 text-[#5D4037] text-xs font-bold transition-all shadow-sm"
            >
              Today 🌸
            </button>

            <span className="font-hand text-xl font-bold text-[#7B6D6D] px-3">
              {getWeekRangeString()}
            </span>

            <button
              onClick={() => changeWeek(7)}
              className="p-2 rounded-full bg-[#FAF6EE] hover:bg-[#F2ECE1] border border-[#E8DEC8] text-[#5D4037] transition-all shadow-sm flex items-center gap-1 text-xs font-bold"
              title="Next Week"
            >
              <span className="hidden sm:inline">Next Week</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 8-Card Grid Layout Matching Reference 2:
            Top 2 rows: Mon, Tue, Wed, Thu, Fri, Sat
            Bottom row: Sun (wider card) + Self Care Card */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Days 1 to 6 (Monday to Saturday) */}
          {days.slice(0, 6).map((day) => {
            const theme = DAY_THEMES[day.dayName] || DAY_THEMES.Monday;
            const isToday = day.date === new Date().toISOString().split('T')[0];

            return (
              <div
                key={day.date}
                onClick={() => navigate(`/planner/${day.date}`)}
                className={`relative group cursor-pointer bg-[#FFFEFA] border-2 border-dashed ${
                  isToday ? 'border-[#E9A825] ring-2 ring-[#FDE68A]' : 'border-[#E2CE98]'
                } rounded-3xl p-5 shadow-sm hover:shadow-cozy transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-between min-h-[260px]`}
              >
                {/* Card Header Pill Badge (e.g. Mon, Tue, Wed) */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{theme.flowerEmoji}</span>
                      <div
                        className={`px-4 py-1 rounded-full text-xs font-bold border ${theme.badgeBg} ${theme.badgeBorder} ${theme.badgeText} shadow-sm`}
                      >
                        {day.dayName.slice(0, 3)}
                      </div>
                    </div>

                    <span className="text-[11px] font-bold text-[#A89895]">
                      {new Date(day.date + 'T00:00:00').toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>

                  {/* Tasks List Preview with Dotted Lines and Circle Checks */}
                  <div className="space-y-2.5">
                    {day.tasks.length === 0 ? (
                      <p className="text-xs text-[#BDB1A2] italic pt-2">No tasks planned yet ♡</p>
                    ) : (
                      day.tasks.slice(0, 5).map((task) => (
                        <div
                          key={task._id}
                          onClick={(e) => handleToggleTask(e, day.date, task._id)}
                          className="flex items-center gap-2 text-xs group/item cursor-pointer border-b border-dashed border-[#E8DEC8]/60 pb-1"
                        >
                          {/* Circular check mark */}
                          <div
                            className={`w-4 h-4 rounded-full border-2 transition-all flex items-center justify-center shrink-0 ${
                              task.completed
                                ? 'bg-[#99B898] border-[#7BA870] text-white scale-105'
                                : 'border-[#D8C7B5] bg-white hover:border-[#99B898]'
                            }`}
                          >
                            {task.completed && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                          </div>

                          {/* Task Title */}
                          <span
                            className={`truncate flex-1 font-medium transition-colors ${
                              task.completed ? 'line-through text-[#A89895]' : 'text-[#5D4037]'
                            }`}
                          >
                            {task.title}
                          </span>
                        </div>
                      ))
                    )}
                    {day.tasks.length > 5 && (
                      <p className="text-[10px] text-[#A89895] font-semibold">
                        +{day.tasks.length - 5} more tasks
                      </p>
                    )}
                  </div>
                </div>

                {/* Footer with "+ Add Task" button and "Open Day →" */}
                <div className="pt-3 border-t border-[#FAF6EE] mt-4 flex items-center justify-between text-xs">
                  {newTaskInput.date === day.date ? (
                    <form
                      onSubmit={(e) => handleAddTask(e, day.date)}
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1 w-full"
                    >
                      <input
                        type="text"
                        autoFocus
                        value={newTaskInput.text}
                        onChange={(e) =>
                          setNewTaskInput({ date: day.date, text: e.target.value })
                        }
                        placeholder="Add quick task..."
                        className="w-full px-2 py-1 text-xs rounded-lg bg-[#FAF6EE] border border-[#E8DEC8] focus:outline-none"
                      />
                      <button
                        type="submit"
                        className="p-1 rounded-lg bg-[#FFE5D9] text-[#5D4037] font-bold"
                      >
                        ✓
                      </button>
                    </form>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setNewTaskInput({ date: day.date, text: '' });
                        }}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#8C7E7A] hover:text-[#5D4037]"
                      >
                        <Plus className="w-3 h-3 text-[#B05B3B]" />
                        <span>Add</span>
                      </button>

                      <span className="font-hand text-sm font-bold text-[#B05B3B] group-hover:underline flex items-center gap-0.5">
                        Open Day <ArrowRight className="w-3 h-3" />
                      </span>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Row: Sunday (Wide / Detailed) + Self Care Card */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Sunday Card (Days[6]) */}
          {days[6] && (
            <div
              onClick={() => navigate(`/planner/${days[6].date}`)}
              className="lg:col-span-2 relative group cursor-pointer bg-[#FFFEFA] border-2 border-dashed border-[#E2CE98] rounded-3xl p-6 shadow-sm hover:shadow-cozy transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-between min-h-[220px]"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">🌸</span>
                    <div className="px-5 py-1 rounded-full text-xs font-bold border bg-[#D1C4E9] border-[#B39DDB] text-[#311B92] shadow-sm">
                      Sunday
                    </div>
                  </div>

                  <span className="text-xs font-bold text-[#A89895]">
                    {new Date(days[6].date + 'T00:00:00').toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                {/* Sunday Tasks */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5">
                  {days[6].tasks.length === 0 ? (
                    <p className="text-xs text-[#BDB1A2] italic pt-2 sm:col-span-2">
                      No tasks planned for Sunday yet ♡ Click to open the detailed Sunday planner!
                    </p>
                  ) : (
                    days[6].tasks.map((task) => (
                      <div
                        key={task._id}
                        onClick={(e) => handleToggleTask(e, days[6].date, task._id)}
                        className="flex items-center gap-2 text-xs cursor-pointer border-b border-dashed border-[#E8DEC8]/60 pb-1"
                      >
                        <div
                          className={`w-4 h-4 rounded-full border-2 transition-all flex items-center justify-center shrink-0 ${
                            task.completed
                              ? 'bg-[#99B898] border-[#7BA870] text-white scale-105'
                              : 'border-[#D8C7B5] bg-white hover:border-[#99B898]'
                          }`}
                        >
                          {task.completed && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>
                        <span
                          className={`truncate font-medium ${
                            task.completed ? 'line-through text-[#A89895]' : 'text-[#5D4037]'
                          }`}
                        >
                          {task.title}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-[#FAF6EE] mt-4 flex items-center justify-between text-xs">
                <span className="text-[#8C7E7A] text-[11px]">
                  {days[6].tasks.filter((t) => t.completed).length} of {days[6].tasks.length} tasks completed
                </span>
                <span className="font-hand text-base font-bold text-[#B05B3B] group-hover:underline flex items-center gap-1">
                  Open Detailed Sunday Planner →
                </span>
              </div>
            </div>
          )}

          {/* Self Care Card matching Reference 2 */}
          <div className="relative bg-[#FFFEFA] border-2 border-dashed border-[#E2CE98] rounded-3xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="px-4 py-1 rounded-full text-xs font-bold border bg-[#FFCCBC] border-[#FFAB91] text-[#BF360C] shadow-sm">
                  Self Care ♡
                </div>
                <PottedPlantDoodle className="w-10 h-12" />
              </div>

              {/* Self care checklist */}
              <div className="space-y-2.5">
                {selfCare.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleToggleSelfCare(idx)}
                    className="flex items-center gap-2 text-xs cursor-pointer border-b border-dashed border-[#E8DEC8]/60 pb-1"
                  >
                    <div
                      className={`w-4 h-4 rounded-full border-2 transition-all flex items-center justify-center shrink-0 ${
                        item.completed
                          ? 'bg-[#E57373] border-[#D32F2F] text-white scale-105'
                          : 'border-[#D8C7B5] bg-white hover:border-[#E57373]'
                      }`}
                    >
                      {item.completed && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </div>
                    <span
                      className={`font-medium ${
                        item.completed ? 'line-through text-[#A89895]' : 'text-[#5D4037]'
                      }`}
                    >
                      {item.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-[#FAF6EE] mt-4 text-[11px] text-[#8C7E7A] italic text-center">
              "Be kind to your mind & body today."
            </div>
          </div>
        </div>

        {/* Sticky Note & Alarm Clock matching Reference 2 */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <div className="relative max-w-md w-full p-4 bg-[#FEF9C3] border border-[#FDE047] rounded-2xl shadow-sm rotate-[-1deg] hover:rotate-0 transition-transform">
            {/* Green tape on sticky note */}
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-16 h-5 bg-[#C8E6C9]/80 border-l-2 border-r-2 border-dashed border-[#A5D6A7]" />

            {isEditingSticky ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={stickyNoteText}
                  onChange={(e) => setStickyNoteText(e.target.value)}
                  className="w-full bg-transparent font-hand text-lg text-[#78350F] font-bold focus:outline-none border-b border-[#D97706]"
                  autoFocus
                />
                <button
                  onClick={handleSaveStickyNote}
                  className="px-2.5 py-1 rounded bg-[#FDE047] text-xs font-bold text-[#78350F]"
                >
                  Save
                </button>
              </div>
            ) : (
              <div
                onClick={() => setIsEditingSticky(true)}
                className="cursor-pointer text-center group"
                title="Click to customize your weekly quote"
              >
                <p className="font-hand text-xl font-bold text-[#78350F]">
                  "{stickyNoteText}"
                </p>
                <span className="text-[10px] text-[#A16207] opacity-0 group-hover:opacity-100 transition-opacity">
                  ✎ click to edit note
                </span>
              </div>
            )}
          </div>

          <AlarmClockDoodle className="w-12 h-12" />
        </div>

      </div>
    </div>
  );
};

export default WeeklyPlannerPage;
