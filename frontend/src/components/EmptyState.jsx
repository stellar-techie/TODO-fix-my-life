import React from 'react';
import { FlowerBasketDoodle, SparklesDoodle } from './Doodles';

const EmptyState = ({
  title = "Your pages are waiting for their first story ♡",
  description = "Take a breath, grab a warm drink, and write down your thoughts or tasks.",
  actionText = "Write something new",
  onAction,
  icon,
}) => {
  return (
    <div className="relative my-8 p-10 max-w-lg mx-auto bg-[#FFFEFA] border-2 border-dashed border-[#E2CE98] rounded-3xl text-center shadow-sm">
      <div className="flex justify-center mb-4 relative">
        {icon || <FlowerBasketDoodle className="w-24 h-24" />}
        <div className="absolute -top-1 -right-2">
          <SparklesDoodle className="w-5 h-5 text-amber-400" />
        </div>
      </div>
      <h3 className="font-hand text-2xl md:text-3xl text-[#5D4037] font-semibold mb-2">
        {title}
      </h3>
      <p className="text-[#8C7E7A] text-sm md:text-base mb-6 font-medium max-w-sm mx-auto">
        {description}
      </p>
      {onAction && actionText && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#FFE5D9] hover:bg-[#FFCAD4] text-[#5D4037] font-semibold text-sm transition-all duration-200 transform hover:-translate-y-0.5 shadow-sm active:translate-y-0 border border-[#F4ACB7]/50"
        >
          <span>{actionText}</span>
          <span>✦</span>
        </button>
      )}
    </div>
  );
};

export default EmptyState;
