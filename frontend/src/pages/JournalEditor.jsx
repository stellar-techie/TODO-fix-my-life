import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { journalAPI } from '../services/api';
import confetti from 'canvas-confetti';
import {
  SunflowerDoodle,
  TulipDoodle,
  SmileyStarDoodle,
  RibbonBowDoodle,
  SparklesDoodle,
} from '../components/Doodles';
import LoadingSpinner from '../components/LoadingSpinner';
import { ArrowLeft, Save, Sparkles, Tag, Calendar, Smile, Sun, Cloud, CloudRain, Wind, Moon, X } from 'lucide-react';

const MOOD_OPTIONS = [
  { id: 'happy', label: 'Happy', emoji: '🌸' },
  { id: 'peaceful', label: 'Peaceful', emoji: '🌿' },
  { id: 'productive', label: 'Productive', emoji: '☕' },
  { id: 'reflective', label: 'Reflective', emoji: '🌙' },
  { id: 'cozy', label: 'Cozy', emoji: '🧸' },
  { id: 'loved', label: 'Loved', emoji: '💕' },
  { id: 'grateful', label: 'Grateful', emoji: '🌻' },
  { id: 'tired', label: 'Tired', emoji: '☁️' },
  { id: 'anxious', label: 'Anxious', emoji: '🌧️' },
];

const STICKER_OPTIONS = [
  { id: 'sunflower', label: 'Sunflower', component: <SunflowerDoodle className="w-8 h-8" /> },
  { id: 'tulip', label: 'Tulip', component: <TulipDoodle className="w-8 h-8" /> },
  { id: 'star', label: 'Star', component: <SmileyStarDoodle className="w-8 h-8" /> },
  { id: 'ribbon', label: 'Ribbon', component: <RibbonBowDoodle className="w-8 h-8" /> },
];

const WEATHER_OPTIONS = [
  { id: 'sunny', label: 'Sunny', icon: <Sun className="w-4 h-4 text-amber-500" /> },
  { id: 'cloudy', label: 'Cloudy', icon: <Cloud className="w-4 h-4 text-slate-400" /> },
  { id: 'rainy', label: 'Rainy', icon: <CloudRain className="w-4 h-4 text-blue-400" /> },
  { id: 'breezy', label: 'Breezy', icon: <Wind className="w-4 h-4 text-teal-400" /> },
  { id: 'starlit', label: 'Night', icon: <Moon className="w-4 h-4 text-indigo-400" /> },
];

const JournalEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    mood: 'peaceful',
    sticker: 'sunflower',
    paperStyle: 'grid',
    weather: 'sunny',
    entryDate: new Date().toISOString().split('T')[0],
    tags: [],
    imageUrl: '',
  });

  const [currentTagInput, setCurrentTagInput] = useState('');
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEditing) {
      const fetchEntry = async () => {
        try {
          const res = await journalAPI.getEntryById(id);
          if (res.data.success && res.data.entry) {
            const entry = res.data.entry;
            setFormData({
              title: entry.title || '',
              content: entry.content || '',
              mood: entry.mood || 'peaceful',
              sticker: entry.sticker || 'sunflower',
              paperStyle: entry.paperStyle || 'grid',
              weather: entry.weather || 'sunny',
              entryDate: entry.entryDate ? entry.entryDate.split('T')[0] : new Date().toISOString().split('T')[0],
              tags: entry.tags || [],
              imageUrl: entry.imageUrl || '',
            });
          }
        } catch (err) {
          setError(err.response?.data?.message || 'Failed to load entry');
        } finally {
          setLoading(false);
        }
      };
      fetchEntry();
    }
  }, [id, isEditing]);

  const handleAddTag = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const trimmed = currentTagInput.trim().toLowerCase().replace(/^#/, '');
      if (trimmed && !formData.tags.includes(trimmed)) {
        setFormData({ ...formData, tags: [...formData.tags, trimmed] });
      }
      setCurrentTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((t) => t !== tagToRemove),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      return setError('Please provide a title for your journal entry');
    }
    if (!formData.content.trim()) {
      return setError('Please write something in your diary entry');
    }

    setSaving(true);
    setError('');

    try {
      if (isEditing) {
        await journalAPI.updateEntry(id, formData);
      } else {
        await journalAPI.createEntry(formData);
        // Trigger celebratory confetti on creating an entry
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#FFE5D9', '#FFF3B0', '#E2ECE9', '#F4ACB7', '#F5B72E'],
        });
      }
      navigate('/journal');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save entry. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Retrieving your diary page... 📖" />;
  }

  const paperClass =
    formData.paperStyle === 'lined'
      ? 'bg-lined-paper'
      : formData.paperStyle === 'dots'
      ? 'bg-dots-paper'
      : 'bg-grid-paper';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Top Navigation Row */}
      <div className="flex items-center justify-between mb-6">
        <Link
          to="/journal"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#8C7E7A] hover:text-[#5D4037] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Journal</span>
        </Link>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#FFE5D9] hover:bg-[#FFCAD4] text-[#5D4037] font-bold text-sm transition-all duration-200 transform hover:-translate-y-0.5 shadow-sm border border-[#F4ACB7]/80 disabled:opacity-50"
          >
            <Save className="w-4 h-4 text-[#B05B3B]" />
            <span>{saving ? 'Saving...' : isEditing ? 'Update Entry' : 'Save to Diary ♡'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-[#FFF0F0] border border-[#FFCDD2] rounded-2xl text-xs font-semibold text-[#D32F2F] animate-shake">
          {error}
        </div>
      )}

      {/* Main Journal Notebook Page */}
      <div className={`relative border-2 border-dashed border-[#E2CE98] rounded-3xl p-6 md:p-10 shadow-cozy overflow-hidden ${paperClass}`}>
        
        {/* Washi tape on top center */}
        <div className="washi-tape-top" />

        {/* Top Controls / Customizers */}
        <div className="space-y-4 mb-6 pb-6 border-b border-[#E8DEC8]">
          
          {/* Row 1: Date, Weather, Paper Style */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            
            {/* Date Input */}
            <div className="flex items-center gap-2 bg-[#FAF6EE] px-3.5 py-1.5 rounded-full border border-[#E8DEC8]">
              <Calendar className="w-4 h-4 text-[#B05B3B]" />
              <input
                type="date"
                value={formData.entryDate}
                onChange={(e) => setFormData({ ...formData, entryDate: e.target.value })}
                className="bg-transparent text-xs font-bold text-[#5D4037] focus:outline-none cursor-pointer"
              />
            </div>

            {/* Weather Selector */}
            <div className="flex items-center gap-1.5 bg-[#FAF6EE] px-2 py-1 rounded-full border border-[#E8DEC8]">
              {WEATHER_OPTIONS.map((w) => (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, weather: w.id })}
                  className={`p-1.5 rounded-full transition-all ${
                    formData.weather === w.id
                      ? 'bg-[#FFFEFA] shadow-sm scale-110 border border-[#E8DEC8]'
                      : 'opacity-60 hover:opacity-100'
                  }`}
                  title={w.label}
                >
                  {w.icon}
                </button>
              ))}
            </div>

            {/* Paper Texture Selector */}
            <div className="flex items-center gap-1 bg-[#FAF6EE] p-1 rounded-full border border-[#E8DEC8] text-xs font-semibold text-[#6D5D5A]">
              {['grid', 'lined', 'dots'].map((style) => (
                <button
                  key={style}
                  type="button"
                  onClick={() => setFormData({ ...formData, paperStyle: style })}
                  className={`px-3 py-1 rounded-full capitalize transition-all ${
                    formData.paperStyle === style
                      ? 'bg-[#FFFEFA] text-[#5D4037] shadow-sm font-bold'
                      : 'hover:text-[#4A3E3D]'
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          {/* Row 2: Mood and Sticker Picker */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            
            {/* Mood selector dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#8C7E7A] uppercase tracking-wider flex items-center gap-1">
                <Smile className="w-3.5 h-3.5 text-[#E57373]" /> Mood:
              </span>
              <select
                value={formData.mood}
                onChange={(e) => setFormData({ ...formData, mood: e.target.value })}
                className="px-3 py-1.5 rounded-full bg-[#FAF6EE] border border-[#E8DEC8] text-xs font-bold text-[#5D4037] focus:outline-none focus:border-[#D4A373] cursor-pointer"
              >
                {MOOD_OPTIONS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.emoji} {m.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sticker Picker */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#8C7E7A] uppercase tracking-wider">
                Sticker:
              </span>
              <div className="flex items-center gap-2 bg-[#FAF6EE] px-2.5 py-1 rounded-full border border-[#E8DEC8]">
                {STICKER_OPTIONS.map((stk) => (
                  <button
                    key={stk.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, sticker: stk.id })}
                    className={`p-1 rounded-full transition-transform ${
                      formData.sticker === stk.id ? 'scale-125 drop-shadow' : 'opacity-50 hover:opacity-100'
                    }`}
                    title={stk.label}
                  >
                    {stk.component}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Title Input */}
        <div className="mb-4">
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Give your story a title... 🌸"
            className="w-full bg-transparent font-hand text-3xl sm:text-4xl font-bold text-[#5D4037] placeholder-[#C2B5A5] focus:outline-none border-b border-transparent focus:border-[#E2CE98] pb-1 transition-colors"
          />
        </div>

        {/* Content Textarea */}
        <div className="mb-6">
          <textarea
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            placeholder="Dear Diary, today I felt... Write anything on your mind, memories from today, or thoughts for tomorrow ♡"
            rows={14}
            className="w-full bg-transparent text-[#4A3E3D] text-base leading-relaxed placeholder-[#BDB1A2] focus:outline-none resize-none font-normal"
          />
        </div>

        {/* Tags Section */}
        <div className="pt-4 border-t border-[#E8DEC8]/60 space-y-2">
          <div className="flex items-center gap-2">
            <Tag className="w-3.5 h-3.5 text-[#B05B3B]" />
            <span className="text-xs font-bold text-[#8C7E7A] uppercase tracking-wider">
              Tags (press Enter or comma to add):
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {formData.tags.map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#E2ECE9] text-[#4C7441] border border-[#99B898]"
              >
                #{t}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(t)}
                  className="hover:text-red-500 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            <input
              type="text"
              value={currentTagInput}
              onChange={(e) => setCurrentTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              placeholder="e.g. gratitude, walk, study..."
              className="px-3 py-1 rounded-full text-xs bg-[#FAF6EE] border border-[#E8DEC8] focus:border-[#D4A373] focus:outline-none text-[#5D4037] min-w-[140px]"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default JournalEditor;
