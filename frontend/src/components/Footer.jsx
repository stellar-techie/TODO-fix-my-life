import React from 'react';
import { SunflowerDoodle, TulipDoodle, SparklesDoodle } from './Doodles';

const Footer = () => {
  return (
    <footer className="mt-auto border-t border-[#E8DEC8]/80 bg-[#FAF6EE]/80 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div className="flex items-center gap-2">
          <SunflowerDoodle className="w-6 h-6" />
          <span className="font-hand text-lg font-bold text-[#5D4037]">
            TODO: fix my life
          </span>
          <span className="text-xs text-[#8C7E7A] font-medium">
            — A cozy digital space for your thoughts & days ♡
          </span>
        </div>

        <div className="text-xs text-[#8C7E7A] font-semibold flex items-center gap-1">
          <span>Crafted with gentle care & warmth</span>
          <span className="text-[#E57373]">🌸</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
