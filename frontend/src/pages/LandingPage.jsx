import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  SunflowerDoodle,
  FlowerBasketDoodle,
  PencilMugDoodle,
  SmileyStarDoodle,
  TulipDoodle,
  BellFlowerDoodle,
  SparklesDoodle,
  RibbonBowDoodle,
  PottedPlantDoodle,
} from '../components/Doodles';
import { BookOpen, Calendar, CheckCircle2, Heart, Sparkles, ArrowRight } from 'lucide-react';

const LandingPage = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="relative overflow-hidden pt-8 pb-20">
      
      {/* Decorative Floating Doodles in Background */}
      <div className="absolute top-10 left-6 opacity-30 pointer-events-none hidden lg:block">
        <SunflowerDoodle className="w-24 h-24" />
      </div>
      <div className="absolute top-28 right-10 opacity-30 pointer-events-none hidden lg:block">
        <PencilMugDoodle className="w-20 h-24" />
      </div>
      <div className="absolute bottom-20 left-12 opacity-30 pointer-events-none hidden lg:block">
        <TulipDoodle className="w-20 h-20" />
      </div>
      <div className="absolute bottom-24 right-16 opacity-30 pointer-events-none hidden lg:block">
        <FlowerBasketDoodle className="w-28 h-28" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto pt-6 pb-12 relative">
          
          {/* Cute Tag Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FFE5D9] border border-[#F4ACB7]/60 text-[#5D4037] text-xs md:text-sm font-bold shadow-sm mb-6 animate-pulse">
            <Sparkles className="w-3.5 h-3.5 text-[#E57373]" />
            <span>Your cozy little corner of the internet</span>
            <span className="text-[#E57373]">♡</span>
          </div>

          {/* Heading */}
          <h1 className="font-hand text-5xl sm:text-6xl md:text-7xl font-bold text-[#5D4037] leading-tight tracking-tight mb-4">
            Write. Plan. Bloom.
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-[#7B6D6D] font-medium leading-relaxed max-w-2xl mx-auto mb-8">
            A beautiful, aesthetic digital journal and physical-style weekly & daily planner. 
            Keep your private memories safe, organize your study goals, and celebrate every small step.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to={isAuthenticated ? "/journal" : "/register"}
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#FFE5D9] hover:bg-[#FFCAD4] text-[#5D4037] font-bold text-base transition-all duration-300 transform hover:-translate-y-1 shadow-md hover:shadow-lg border-2 border-[#F4ACB7]/80 flex items-center justify-center gap-2"
            >
              <span>{isAuthenticated ? "Open My Journal" : "Start Journaling Today"}</span>
              <span className="text-[#E57373]">♡</span>
            </Link>

            <Link
              to={isAuthenticated ? "/planner" : "/login"}
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#FFFEFA] hover:bg-[#FAF6EE] text-[#5D4037] font-semibold text-base transition-all duration-300 border-2 border-[#E8DEC8] hover:border-[#D4A373] shadow-sm flex items-center justify-center gap-2"
            >
              <span>{isAuthenticated ? "View Weekly Planner" : "Sign In to Your Diary"}</span>
              <ArrowRight className="w-4 h-4 text-[#8C7E7A]" />
            </Link>
          </div>
        </div>

        {/* Visual Preview Section (Cards inspired by the 3 reference images) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-6">
          
          {/* Feature 1: Digital Scrapbook Journal (Ref 3) */}
          <div className="relative bg-[#FFFEFA] border-2 border-dashed border-[#E2CE98] rounded-3xl p-6 shadow-cozy hover:shadow-cozy-md transition-all duration-300 flex flex-col justify-between group">
            {/* Washi tape header */}
            <div className="washi-tape-top" />
            
            <div>
              <div className="flex justify-between items-start mb-4 pt-2">
                <div className="p-2.5 bg-[#FFF3B0] rounded-2xl">
                  <BookOpen className="w-6 h-6 text-[#B7791F]" />
                </div>
                <SunflowerDoodle className="w-10 h-10 group-hover:rotate-12 transition-transform" />
              </div>

              <h2 className="font-hand text-2xl font-bold text-[#5D4037] mb-2">
                Private Digital Diary
              </h2>
              <p className="text-sm text-[#8C7E7A] leading-relaxed mb-4">
                Write on aesthetic grid, lined, or dotted paper. Express how your heart feels with mood stickers, washi tape, and cute flower accents.
              </p>

              {/* Sample Mini Preview */}
              <div className="bg-[#FAF6EE] border border-[#E8DEC8] rounded-2xl p-3 text-xs text-[#6D5D5A] font-hand text-base">
                <p className="font-bold text-[#5D4037]">Sunday Afternoon Thoughts 🌸</p>
                <p className="text-xs text-[#8C7E7A] mt-1 font-sans">
                  "Took a slow walk under the warm sun today. The little things truly bring the deepest peace..."
                </p>
              </div>
            </div>

          </div>

          {/* Feature 2: Weekly Planner (Ref 2) */}
          <div className="relative bg-[#FFFEFA] border-2 border-dashed border-[#E2CE98] rounded-3xl p-6 shadow-cozy hover:shadow-cozy-md transition-all duration-300 flex flex-col justify-between group">
            {/* Tape corner */}
            <div className="washi-tape-top" />

            <div>
              <div className="flex justify-between items-start mb-4 pt-2">
                <div className="p-2.5 bg-[#E2ECE9] rounded-2xl">
                  <Calendar className="w-6 h-6 text-[#4C7441]" />
                </div>
                <SmileyStarDoodle className="w-10 h-10 group-hover:scale-110 transition-transform" />
              </div>

              <h2 className="font-hand text-2xl font-bold text-[#5D4037] mb-2">
                Weekly To-Do & Study Planner
              </h2>
              <p className="text-sm text-[#8C7E7A] leading-relaxed mb-4">
                Inspired by cute physical planners. Organize Mon–Sun tasks, manage study goals (DSA, Machine Learning, Projects), and track weekly self-care habits.
              </p>

              {/* Sample Mini Preview */}
              <div className="bg-[#FAF6EE] border border-[#E8DEC8] rounded-2xl p-3 space-y-1.5 text-xs text-[#6D5D5A]">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-[#99B898] bg-[#D8F3DC] flex items-center justify-center text-[8px] text-[#4C7441]">✓</span>
                  <span className="line-through text-[#A09391]">Solve 3 Graph questions</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-[#D8C7B5]"></span>
                  <span>Revise Computer Networks</span>
                </div>
              </div>
            </div>

          </div>

          {/* Feature 3: Detailed Daily Planner (Ref 1) */}
          <div className="relative bg-[#FFFEFA] border-2 border-dashed border-[#E2CE98] rounded-3xl p-6 shadow-cozy hover:shadow-cozy-md transition-all duration-300 flex flex-col justify-between group">
            <div className="washi-tape-top" />

            <div>
              <div className="flex justify-between items-start mb-4 pt-2">
                <div className="p-2.5 bg-[#FFF3B0] rounded-2xl">
                  <CheckCircle2 className="w-6 h-6 text-[#D97706]" />
                </div>
                <TulipDoodle className="w-10 h-10 group-hover:scale-110 transition-transform" />
              </div>

              <h2 className="font-hand text-2xl font-bold text-[#5D4037] mb-2">
                Detailed Daily Planner
              </h2>
              <p className="text-sm text-[#8C7E7A] leading-relaxed mb-4">
                Click any day from the weekly view to open its dedicated page! Complete with Daily To-Do list, "Goal for today", "Reminder" notepad, and "Notes".
              </p>

              {/* Sample Mini Preview */}
              <div className="bg-[#FFF9E6] border border-[#FDE68A] rounded-2xl p-3 text-xs text-[#5D4037]">
                <p className="font-bold text-[11px] uppercase tracking-wider text-[#B45309]">Goal for Today</p>
                <p className="italic text-[#78350F] mt-0.5 font-hand text-base">"Stay gentle with myself and conquer trees."</p>
              </div>
            </div>

          </div>
        </div>

        {/* Motivational Sticky Note Banner */}
        <div className="mt-16 text-center">
          <div className="inline-block relative max-w-lg p-6 bg-[#FEF9C3] border border-[#FDE047] rounded-3xl shadow-md rotate-[-1deg] hover:rotate-0 transition-transform">
            {/* Washi tape at top */}
            <div className="washi-tape-top" />
            <p className="font-hand text-2xl md:text-3xl text-[#78350F] font-bold">
              "Small steps every day big changes always ♡"
            </p>
            <p className="text-xs text-[#92400E] font-semibold mt-2">
              Start your journey today with your own cozy personal notebook.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LandingPage;
