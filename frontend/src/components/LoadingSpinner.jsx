import React from 'react';
import { SunflowerDoodle, SparklesDoodle } from './Doodles';

const LoadingSpinner = ({ text = "Gathering your pages... ♡" }) => {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="relative animate-bounce">
        <SunflowerDoodle className="w-16 h-16 animate-spin" style={{ animationDuration: '6s' }} />
        <div className="absolute -top-2 -right-2">
          <SparklesDoodle className="w-5 h-5 text-amber-400 animate-pulse" />
        </div>
      </div>
      <p className="mt-4 text-lg font-hand text-cozy-brown font-medium tracking-wide">
        {text}
      </p>
    </div>
  );
};

export default LoadingSpinner;
