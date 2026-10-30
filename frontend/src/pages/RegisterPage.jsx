import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { SunflowerDoodle, SparklesDoodle, RibbonBowDoodle } from '../components/Doodles';
import { Mail, Lock, User, ArrowRight, AlertCircle } from 'lucide-react';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [validationError, setValidationError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, error: serverError, clearError } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (validationError) setValidationError('');
    if (serverError) clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    const { name, email, password, confirmPassword } = formData;

    if (!name.trim()) {
      return setValidationError('Please tell us your name ♡');
    }
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      return setValidationError('Please enter a valid email address');
    }
    if (password.length < 6) {
      return setValidationError('Password must be at least 6 characters long');
    }
    if (password !== confirmPassword) {
      return setValidationError('Passwords do not match. Please check again');
    }

    setIsSubmitting(true);
    const result = await register(name.trim(), email.trim(), password);
    setIsSubmitting(false);

    if (result.success) {
      navigate('/journal');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 relative">
      
      {/* Decorative corner doodles */}
      <div className="absolute top-10 left-10 opacity-40 hidden md:block">
        <SunflowerDoodle className="w-20 h-20" />
      </div>
      <div className="absolute bottom-10 right-10 opacity-40 hidden md:block">
        <RibbonBowDoodle className="w-20 h-16" />
      </div>

      <div className="w-full max-w-md relative">
        {/* Washi tape at top */}
        <div className="washi-tape-top" />

        {/* Notebook Card */}
        <div className="bg-[#FFFEFA] border-2 border-dashed border-[#E2CE98] rounded-3xl p-8 shadow-cozy relative overflow-hidden">
          
          <div className="text-center mb-8">
            <div className="inline-block relative">
              <span className="text-3xl">🌸</span>
              <SparklesDoodle className="w-4 h-4 text-amber-500 absolute -top-1 -right-2" />
            </div>
            <h1 className="font-hand text-3xl font-bold text-[#5D4037] mt-1">
              Create Your Safe Space
            </h1>
            <p className="text-xs text-[#8C7E7A] mt-1 font-medium">
              Join TODO: fix my life to begin your personal diary & planner ♡
            </p>
          </div>

          {/* Validation or Server Error banner */}
          {(validationError || serverError) && (
            <div className="mb-6 p-3.5 bg-[#FFF0F0] border border-[#FFCDD2] rounded-2xl flex items-center gap-2 text-xs text-[#D32F2F] font-semibold animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{validationError || serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-xs font-bold text-[#6D5D5A] uppercase tracking-wider mb-1">
                Your Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#A89895] absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Maya Lin"
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#FAF6EE] border border-[#E8DEC8] focus:border-[#D4A373] focus:bg-[#FFFEFA] focus:outline-none text-sm text-[#4A3E3D] transition-colors"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-[#6D5D5A] uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#A89895] absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="hello@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#FAF6EE] border border-[#E8DEC8] focus:border-[#D4A373] focus:bg-[#FFFEFA] focus:outline-none text-sm text-[#4A3E3D] transition-colors"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-[#6D5D5A] uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#A89895] absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="At least 6 characters"
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#FAF6EE] border border-[#E8DEC8] focus:border-[#D4A373] focus:bg-[#FFFEFA] focus:outline-none text-sm text-[#4A3E3D] transition-colors"
                  required
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-bold text-[#6D5D5A] uppercase tracking-wider mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#A89895] absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Repeat your password"
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#FAF6EE] border border-[#E8DEC8] focus:border-[#D4A373] focus:bg-[#FFFEFA] focus:outline-none text-sm text-[#4A3E3D] transition-colors"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-6 py-3 rounded-full bg-[#FFE5D9] hover:bg-[#FFCAD4] text-[#5D4037] font-bold text-sm transition-all duration-200 shadow-sm border border-[#F4ACB7]/80 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Creating your journal... 🌸</span>
              ) : (
                <>
                  <span>Create My Notebook</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer switch to login */}
          <div className="mt-6 pt-4 border-t border-[#FAF6EE] text-center text-xs text-[#8C7E7A]">
            Already have a notebook?{' '}
            <Link to="/login" className="font-bold text-[#B05B3B] hover:underline">
              Sign In here ♡
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
