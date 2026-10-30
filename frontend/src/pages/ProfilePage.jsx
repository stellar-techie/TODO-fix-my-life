import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { journalAPI, plannerAPI } from '../services/api';
import { SunflowerDoodle, TulipDoodle, SparklesDoodle } from '../components/Doodles';
import { User, Mail, Lock, Save, Award, BookOpen, CheckCircle, Smile } from 'lucide-react';

const AVATARS = ['🌸', '🌻', '🌷', '🌼', '☕', '🧸', '🌿', '🍓', '🌙', '✨'];

const ProfilePage = () => {
  const { user, updateProfile } = useAuth();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    avatar: user?.avatar || '🌸',
    password: '',
    confirmPassword: '',
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [stats, setStats] = useState({ journalCount: 0 });

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || '',
        bio: user.bio || '',
        avatar: user.avatar || '🌸',
      }));
    }

    const loadStats = async () => {
      try {
        const res = await journalAPI.getStats();
        if (res.data.success) {
          setStats({ journalCount: res.data.total });
        }
      } catch (err) {
        console.error('Error loading profile stats:', err);
      }
    };
    loadStats();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });

    if (formData.password && formData.password !== formData.confirmPassword) {
      return setMessage({ text: 'Passwords do not match', type: 'error' });
    }
    if (formData.password && formData.password.length < 6) {
      return setMessage({ text: 'Password must be at least 6 characters', type: 'error' });
    }

    setSaving(true);
    const updateData = {
      name: formData.name,
      bio: formData.bio,
      avatar: formData.avatar,
    };
    if (formData.password) {
      updateData.password = formData.password;
    }

    const res = await updateProfile(updateData);
    setSaving(false);

    if (res.success) {
      setMessage({ text: 'Profile updated successfully ♡', type: 'success' });
      setFormData((prev) => ({ ...prev, password: '', confirmPassword: '' }));
    } else {
      setMessage({ text: res.message || 'Failed to update profile', type: 'error' });
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Header card */}
      <div className="relative bg-[#FFFEFA] border-2 border-dashed border-[#E2CE98] rounded-3xl p-8 shadow-cozy mb-8">
        <div className="washi-tape-top" />

        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-[#FFE5D9] border-2 border-[#F4ACB7] flex items-center justify-center text-4xl shadow-sm">
            {formData.avatar}
          </div>

          <div className="text-center sm:text-left flex-1">
            <h1 className="font-hand text-4xl font-bold text-[#5D4037]">
              {user?.name}
            </h1>
            <p className="text-xs text-[#8C7E7A] font-semibold mt-0.5">{user?.email}</p>
            <p className="text-sm text-[#6D5D5A] mt-2 italic font-medium">"{user?.bio || 'Writing thoughts and blooming day by day ✨'}"</p>
          </div>

          {/* Quick stats badge */}
          <div className="px-5 py-3 bg-[#FAF6EE] border border-[#E8DEC8] rounded-2xl text-center">
            <div className="font-hand text-2xl font-bold text-[#B05B3B]">
              {stats.journalCount}
            </div>
            <div className="text-[11px] font-bold text-[#8C7E7A] uppercase tracking-wider">
              Stories Written
            </div>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <div className="bg-[#FFFEFA] border-2 border-dashed border-[#E2CE98] rounded-3xl p-8 shadow-cozy relative">
        <h2 className="font-hand text-2xl font-bold text-[#5D4037] mb-6 flex items-center gap-2">
          <span>Customize Your Diary Profile</span>
          <SparklesDoodle className="w-4 h-4 text-amber-500" />
        </h2>

        {message.text && (
          <div
            className={`mb-6 p-3.5 rounded-2xl text-xs font-semibold ${
              message.type === 'success'
                ? 'bg-[#E8F5E9] text-[#2E7D32] border border-[#A5D6A7]'
                : 'bg-[#FFEBEE] text-[#C62828] border border-[#FFCDD2]'
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Avatar Picker */}
          <div>
            <label className="block text-xs font-bold text-[#6D5D5A] uppercase tracking-wider mb-2">
              Choose Your Cozy Mascot / Emoji
            </label>
            <div className="flex flex-wrap gap-2">
              {AVATARS.map((av) => (
                <button
                  key={av}
                  type="button"
                  onClick={() => setFormData({ ...formData, avatar: av })}
                  className={`w-10 h-10 rounded-2xl text-xl flex items-center justify-center transition-all ${
                    formData.avatar === av
                      ? 'bg-[#FFE5D9] border-2 border-[#F4ACB7] scale-110 shadow-sm'
                      : 'bg-[#FAF6EE] border border-[#E8DEC8] hover:bg-[#F2ECE1]'
                  }`}
                >
                  {av}
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-xs font-bold text-[#6D5D5A] uppercase tracking-wider mb-1">
              Display Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF6EE] border border-[#E8DEC8] focus:border-[#D4A373] focus:outline-none text-sm text-[#4A3E3D]"
              required
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-xs font-bold text-[#6D5D5A] uppercase tracking-wider mb-1">
              Personal Bio / Diary Motto
            </label>
            <input
              type="text"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="e.g. Taking things one warm cup of tea at a time ☕"
              className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF6EE] border border-[#E8DEC8] focus:border-[#D4A373] focus:outline-none text-sm text-[#4A3E3D]"
              maxLength={160}
            />
          </div>

          {/* Password update (optional) */}
          <div className="pt-4 border-t border-[#FAF6EE]">
            <h3 className="text-xs font-bold text-[#8C7E7A] uppercase tracking-wider mb-3">
              Change Password (leave blank to keep current)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <input
                  type="password"
                  placeholder="New password (min 6 chars)"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-2 rounded-2xl bg-[#FAF6EE] border border-[#E8DEC8] text-xs text-[#4A3E3D] focus:outline-none focus:border-[#D4A373]"
                />
              </div>
              <div>
                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-2 rounded-2xl bg-[#FAF6EE] border border-[#E8DEC8] text-xs text-[#4A3E3D] focus:outline-none focus:border-[#D4A373]"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-[#FFE5D9] hover:bg-[#FFCAD4] text-[#5D4037] font-bold text-sm transition-all duration-200 transform hover:-translate-y-0.5 shadow-sm border border-[#F4ACB7]/80 disabled:opacity-50"
            >
              <Save className="w-4 h-4 text-[#B05B3B]" />
              <span>{saving ? 'Saving changes...' : 'Save Profile Changes ♡'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
