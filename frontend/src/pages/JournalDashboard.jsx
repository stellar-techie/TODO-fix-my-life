import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { journalAPI } from '../services/api';
import {
  SunflowerDoodle,
  TulipDoodle,
  SmileyStarDoodle,
  RibbonBowDoodle,
  SparklesDoodle,
  FlowerBasketDoodle,
} from '../components/Doodles';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import ConfirmationModal from '../components/ConfirmationModal';
import { Search, Plus, Calendar, Tag, Heart, Sparkles, Filter, Trash2, Edit3, BookOpen } from 'lucide-react';

const MOODS = [
  { id: 'all', label: 'All Moods', emoji: '✨' },
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

const JournalDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedMood, setSelectedMood] = useState('all');
  const [selectedTag, setSelectedTag] = useState('all');
  const [availableTags, setAvailableTags] = useState([]);
  const [stats, setStats] = useState({ total: 0, moodCounts: {} });

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState(null);

  // Time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const currentDateFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const fetchEntries = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (selectedMood !== 'all') params.mood = selectedMood;
      if (selectedTag !== 'all') params.tag = selectedTag;

      const [entriesRes, tagsRes, statsRes] = await Promise.all([
        journalAPI.getEntries(params),
        journalAPI.getTags(),
        journalAPI.getStats(),
      ]);

      if (entriesRes.data.success) {
        setEntries(entriesRes.data.entries);
      }
      if (tagsRes.data.success) {
        setAvailableTags(tagsRes.data.tags);
      }
      if (statsRes.data.success) {
        setStats(statsRes.data);
      }
    } catch (err) {
      console.error('Error fetching journal entries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, [selectedMood, selectedTag]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchEntries();
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  const handleDeletePrompt = (e, entry) => {
    e.stopPropagation();
    setEntryToDelete(entry);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!entryToDelete) return;
    try {
      await journalAPI.deleteEntry(entryToDelete._id);
      setEntries(entries.filter((item) => item._id !== entryToDelete._id));
      setDeleteModalOpen(false);
      setEntryToDelete(null);
    } catch (err) {
      console.error('Failed to delete entry:', err);
    }
  };

  const renderSticker = (type) => {
    switch (type) {
      case 'sunflower':
        return <SunflowerDoodle className="w-8 h-8" />;
      case 'tulip':
        return <TulipDoodle className="w-8 h-8" />;
      case 'star':
        return <SmileyStarDoodle className="w-7 h-7" />;
      case 'ribbon':
        return <RibbonBowDoodle className="w-9 h-7" />;
      default:
        return <SunflowerDoodle className="w-8 h-8" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Top Banner / Greeting inspired by Reference 1 & 3 */}
      <div className="relative mb-8 bg-[#FFFEFA] border-2 border-dashed border-[#E2CE98] rounded-3xl p-6 md:p-8 shadow-cozy overflow-hidden">
        <div className="washi-tape-top" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">🌸</span>
              <span className="font-hand text-lg text-[#B05B3B] font-semibold tracking-wide">
                {currentDateFormatted}
              </span>
            </div>
            <h1 className="font-hand text-4xl sm:text-5xl font-bold text-[#5D4037]">
              {getGreeting()}, {user?.name?.split(' ')[0] || 'Friend'} <span className="text-[#E57373]">♡</span>
            </h1>
            <p className="text-[#8C7E7A] text-sm md:text-base font-medium mt-1">
              How is your heart feeling today? Capture your precious memories and reflections.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/journal/new"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#FFE5D9] hover:bg-[#FFCAD4] text-[#5D4037] font-bold text-sm transition-all duration-200 transform hover:-translate-y-0.5 shadow-sm border border-[#F4ACB7]/80"
            >
              <Plus className="w-4 h-4 text-[#B05B3B]" />
              <span>Write Something ♡</span>
            </Link>
          </div>
        </div>

        {/* Quick Stats Ticker */}
        <div className="mt-6 pt-5 border-t border-[#FAF6EE] flex flex-wrap items-center gap-4 text-xs font-semibold text-[#8C7E7A]">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-[#FAF6EE] rounded-full">
            <BookOpen className="w-3.5 h-3.5 text-[#B05B3B]" />
            <span>{stats.total || 0} Total Entries Written</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-[#FAF6EE] rounded-full">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Cozy Scrapbook Active</span>
          </div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="space-y-4 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#A89895] absolute left-4 top-3.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search your memories by words, title, or thoughts..."
              className="w-full pl-11 pr-4 py-2.5 rounded-full bg-[#FFFEFA] border border-[#E8DEC8] focus:border-[#D4A373] focus:outline-none text-sm text-[#4A3E3D] shadow-sm transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-4 top-3 text-xs text-[#A89895] hover:text-[#5D4037]"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Mood Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <span className="text-xs font-bold text-[#8C7E7A] uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Mood:
          </span>
          {MOODS.map((mood) => {
            const isSelected = selectedMood === mood.id;
            return (
              <button
                key={mood.id}
                onClick={() => setSelectedMood(mood.id)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 border ${
                  isSelected
                    ? 'bg-[#FFE5D9] text-[#5D4037] border-[#F4ACB7] shadow-sm scale-105'
                    : 'bg-[#FFFEFA] text-[#7B6D6D] border-[#E8DEC8] hover:bg-[#FAF6EE]'
                }`}
              >
                <span>{mood.emoji}</span>
                <span>{mood.label}</span>
              </button>
            );
          })}
        </div>

        {/* Dynamic Tags Filter (if tags exist) */}
        {availableTags.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <span className="text-xs font-bold text-[#8C7E7A] uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
              <Tag className="w-3 h-3" /> Tags:
            </span>
            <button
              onClick={() => setSelectedTag('all')}
              className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                selectedTag === 'all'
                  ? 'bg-[#E2ECE9] text-[#4C7441] border-[#99B898]'
                  : 'bg-[#FFFEFA] text-[#7B6D6D] border-[#E8DEC8]'
              }`}
            >
              All Tags
            </button>
            {availableTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-3 py-1 rounded-full text-xs font-semibold border capitalize ${
                  selectedTag === tag
                    ? 'bg-[#E2ECE9] text-[#4C7441] border-[#99B898] shadow-sm'
                    : 'bg-[#FFFEFA] text-[#7B6D6D] border-[#E8DEC8] hover:bg-[#FAF6EE]'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Content Area */}
      {loading ? (
        <LoadingSpinner text="Gathering your journal entries... 🌸" />
      ) : entries.length === 0 ? (
        <EmptyState
          title={search || selectedMood !== 'all' || selectedTag !== 'all' ? "No matching entries found ♡" : "Your pages are waiting for their first story ♡"}
          description={
            search || selectedMood !== 'all'
              ? "Try adjusting your search terms or filters to find what you're looking for."
              : "Capture your thoughts, celebrate your wins, and create your digital memory book."
          }
          actionText="Write your first entry"
          onAction={() => navigate('/journal/new')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {entries.map((entry) => {
            const dateStr = new Date(entry.entryDate).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });

            const paperClass =
              entry.paperStyle === 'lined'
                ? 'bg-lined-paper'
                : entry.paperStyle === 'dots'
                ? 'bg-dots-paper'
                : 'bg-grid-paper';

            return (
              <div
                key={entry._id}
                onClick={() => navigate(`/journal/${entry._id}`)}
                className={`relative group cursor-pointer border-2 border-dashed border-[#E2CE98] rounded-3xl p-6 shadow-cozy hover:shadow-cozy-lg transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-between overflow-hidden ${paperClass}`}
              >
                {/* Washi tape on top center */}
                <div className="washi-tape-top" />

                <div>
                  {/* Top Bar with Sticker and Date */}
                  <div className="flex items-center justify-between mb-3 pt-1">
                    <span className="font-hand text-sm font-bold text-[#8C7E7A] flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-[#B05B3B]" />
                      {dateStr}
                    </span>
                    <div className="group-hover:rotate-12 transition-transform duration-300">
                      {renderSticker(entry.sticker)}
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="font-hand text-2xl font-bold text-[#5D4037] mb-2 line-clamp-2 leading-tight">
                    {entry.title}
                  </h3>

                  {/* Content Preview */}
                  <p className="text-sm text-[#6D5D5A] line-clamp-3 leading-relaxed mb-4 font-normal">
                    {entry.content}
                  </p>
                </div>

                <div>
                  {/* Tags and Mood Pill */}
                  <div className="flex flex-wrap items-center gap-1.5 mb-4">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FFF3B0] text-[#78350F] border border-[#FDE68A]">
                      {entry.mood}
                    </span>
                    {entry.tags?.slice(0, 2).map((t, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#FAF6EE] text-[#8C7E7A] border border-[#E8DEC8]"
                      >
                        #{t}
                      </span>
                    ))}
                    {entry.tags?.length > 2 && (
                      <span className="text-[10px] text-[#A89895]">
                        +{entry.tags.length - 2}
                      </span>
                    )}
                  </div>

                  {/* Card Actions Footer */}
                  <div className="pt-3 border-t border-[#E8DEC8]/60 flex items-center justify-between text-xs text-[#8C7E7A]">
                    <span className="font-hand text-sm text-[#A26B3E] font-medium group-hover:underline">
                      Read story →
                    </span>
                    
                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/journal/${entry._id}/edit`);
                        }}
                        className="p-1.5 rounded-full hover:bg-[#FAF6EE] text-[#6D5D5A] hover:text-[#5D4037] transition-colors"
                        title="Edit Entry"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleDeletePrompt(e, entry)}
                        className="p-1.5 rounded-full hover:bg-[#FFF0F0] text-[#E57373] transition-colors"
                        title="Delete Entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        title="Let this memory go? ♡"
        message={`Are you sure you want to delete "${entryToDelete?.title}"? This cannot be recovered.`}
        confirmText="Yes, delete it"
        cancelText="Keep it"
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteModalOpen(false);
          setEntryToDelete(null);
        }}
      />
    </div>
  );
};

export default JournalDashboard;
