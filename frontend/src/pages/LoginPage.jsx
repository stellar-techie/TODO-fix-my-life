import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { SunflowerDoodle, SparklesDoodle } from '../components/Doodles';
import { Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [validationError, setValidationError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, error: serverError, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/journal';

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (validationError) setValidationError('');
    if (serverError) clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    const { email, password } = formData;

    if (!email.trim() || !password) {
      return setValidationError('Please fill in both email and password');
    }

    setIsSubmitting(true);
    const result = await login(email.trim(), password);
    setIsSubmitting(false);

    if (result.success) {
      navigate(from, { replace: true });
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 relative">
      
      {/* Decorative corner doodle */}
      <div className="absolute top-12 right-12 opacity-35 hidden md:block">
        <SunflowerDoodle className="w-24 h-24" />
      </div>

      <div className="w-full max-w-md relative">
        <div className="washi-tape-top" />

        <div className="bg-[#FFFEFA] border-2 border-dashed border-[#E2CE98] rounded-3xl p-8 shadow-cozy relative overflow-hidden">
          
          <div className="text-center mb-8">
            <div className="inline-block relative">
              <span className="text-3xl">🌻</span>
              <SparklesDoodle className="w-4 h-4 text-amber-500 absolute -top-1 -right-2" />
            </div>
            <h1 className="font-hand text-3xl font-bold text-[#5D4037] mt-1">
              Welcome Back ♡
            </h1>
            <p className="text-xs text-[#8C7E7A] mt-1 font-medium">
              Open your diary and pick up where you left off
            </p>
          </div>

          {(validationError || serverError) && (
            <div className="mb-6 p-3.5 bg-[#FFF0F0] border border-[#FFCDD2] rounded-2xl flex items-center gap-2 text-xs text-[#D32F2F] font-semibold animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{validationError || serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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
                  placeholder="Your secret password"
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#FAF6EE] border border-[#E8DEC8] focus:border-[#D4A373] focus:bg-[#FFFEFA] focus:outline-none text-sm text-[#4A3E3D] transition-colors"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-6 py-3 rounded-full bg-[#FFE5D9] hover:bg-[#FFCAD4] text-[#5D4037] font-bold text-sm transition-all duration-200 shadow-sm border border-[#F4ACB7]/80 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Unlocking your diary... 🔑</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-[#FAF6EE] text-center text-xs text-[#8C7E7A]">
            Don't have a notebook yet?{' '}
            <Link to="/register" className="font-bold text-[#B05B3B] hover:underline">
              Create an account ♡
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
