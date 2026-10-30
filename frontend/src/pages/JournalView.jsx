import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { journalAPI } from '../services/api';
import {
  SunflowerDoodle,
  TulipDoodle,
  SmileyStarDoodle,
  RibbonBowDoodle,
  SparklesDoodle,
} from '../components/Doodles';
import LoadingSpinner from '../components/LoadingSpinner';
import ConfirmationModal from '../components/ConfirmationModal';
import { ArrowLeft, Edit3, Trash2, Calendar, Tag, Smile, Sun, Cloud, CloudRain, Wind, Moon } from 'lucide-react';

const JournalView = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  useEffect(() => {
    const fetchEntry = async () => {
      try {
        const res = await journalAPI.getEntryById(id);
        if (res.data.success && res.data.entry) {
          setEntry(res.data.entry);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Could not find this journal page.');
      } finally {
        setLoading(false);
      }
    };
    fetchEntry();
  }, [id]);

  const handleDelete = async () => {
    try {
      await journalAPI.deleteEntry(id);
      navigate('/journal');
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Opening your memory page... 📖" />;
  }

  if (error || !entry) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <div className="p-8 bg-[#FFFEFA] border-2 border-dashed border-[#E2CE98] rounded-3xl shadow-cozy">
          <p className="font-hand text-2xl text-[#5D4037] mb-4">
            {error || 'This memory page seems to have fluttered away.'}
          </p>
          <Link
            to="/journal"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#FFE5D9] text-[#5D4037] font-bold text-sm"
          >
            ← Return to Journal
          </Link>
        </div>
      </div>
    );
  }

  const dateFormatted = new Date(entry.entryDate).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const renderSticker = (type) => {
    switch (type) {
      case 'sunflower':
        return <SunflowerDoodle className="w-12 h-12" />;
      case 'tulip':
        return <TulipDoodle className="w-12 h-12" />;
      case 'star':
        return <SmileyStarDoodle className="w-10 h-10" />;
      case 'ribbon':
        return <RibbonBowDoodle className="w-14 h-10" />;
      default:
        return <SunflowerDoodle className="w-12 h-12" />;
    }
  };

  const paperClass =
    entry.paperStyle === 'lined'
      ? 'bg-lined-paper'
      : entry.paperStyle === 'dots'
      ? 'bg-dots-paper'
      : 'bg-grid-paper';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Top Action Bar */}
      <div className="flex items-center justify-between mb-6">
        <Link
          to="/journal"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#8C7E7A] hover:text-[#5D4037] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Journal</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/journal/${entry._id}/edit`)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#FAF6EE] hover:bg-[#F2ECE1] border border-[#E8DEC8] text-xs font-bold text-[#5D4037] transition-all shadow-sm"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Entry</span>
          </button>
          <button
            onClick={() => setDeleteModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#FFF0F0] hover:bg-[#FFE5E5] border border-[#FFCDD2] text-xs font-bold text-[#D32F2F] transition-all shadow-sm"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Main Journal Page Card with Sunflower Scrapbook Corners (from Reference 3) */}
      <div className={`relative border-2 border-dashed border-[#E2CE98] rounded-3xl p-8 sm:p-12 shadow-cozy-lg overflow-hidden ${paperClass}`}>
        
        {/* Washi tape on top center */}
        <div className="washi-tape-top" />

        {/* Sunflower corners inspired directly by Reference 3 */}
        <div className="absolute top-2 left-2 opacity-80 pointer-events-none hidden sm:block">
          <SunflowerDoodle className="w-16 h-16" />
        </div>
        <div className="absolute top-2 right-2 opacity-80 pointer-events-none hidden sm:block">
          <RibbonBowDoodle className="w-16 h-12" />
        </div>
        <div className="absolute bottom-2 right-2 opacity-80 pointer-events-none hidden sm:block">
          <SunflowerDoodle className="w-20 h-20" />
        </div>

        {/* Content Header */}
        <div className="relative z-10 sm:px-8">
          
          {/* Metadata pill row */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-4 border-b border-[#E8DEC8]">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#B05B3B]" />
              <span className="font-hand text-lg font-bold text-[#8C7E7A]">
                {dateFormatted}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#FFE5D9] text-[#5D4037] border border-[#F4ACB7]/60 capitalize">
                Mood: {entry.mood}
              </span>
              <div className="scale-110">{renderSticker(entry.sticker)}</div>
            </div>
          </div>

          {/* Entry Title */}
          <h1 className="font-hand text-4xl sm:text-5xl font-bold text-[#5D4037] mb-6 leading-tight">
            {entry.title}
          </h1>

          {/* Entry Body */}
          <div className="text-base sm:text-lg text-[#4A3E3D] leading-relaxed whitespace-pre-wrap font-normal mb-8 min-h-[250px]">
            {entry.content}
          </div>

          {/* Tags Footer */}
          {entry.tags && entry.tags.length > 0 && (
            <div className="pt-6 border-t border-[#E8DEC8] flex items-center gap-2 flex-wrap">
              <Tag className="w-3.5 h-3.5 text-[#8C7E7A]" />
              {entry.tags.map((t, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-full text-xs font-semibold bg-[#E2ECE9] text-[#4C7441] border border-[#99B898]"
                >
                  #{t}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        title="Delete this journal entry? ♡"
        message={`Are you sure you want to permanently delete "${entry.title}"?`}
        confirmText="Yes, delete it"
        cancelText="Cancel"
        onConfirm={handleDelete}
        onCancel={() => setDeleteModalOpen(false)}
      />
    </div>
  );
};

export default JournalView;
