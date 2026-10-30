import React from 'react';
import { TulipDoodle } from './Doodles';

const ConfirmationModal = ({
  isOpen,
  title = "Are you sure? ♡",
  message = "This action cannot be undone. Are you sure you want to proceed?",
  confirmText = "Yes, delete",
  cancelText = "Keep it",
  onConfirm,
  onCancel,
  danger = true,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md p-6 bg-[#FFFEFA] border-2 border-dashed border-[#E2CE98] rounded-3xl shadow-xl text-center">
        {/* Cute tape decoration at top */}
        <div className="washi-tape-top" />

        <div className="flex justify-center mb-3">
          <TulipDoodle className="w-14 h-14" />
        </div>

        <h3 className="font-hand text-2xl font-bold text-[#5D4037] mb-2">
          {title}
        </h3>
        <p className="text-[#8C7E7A] text-sm mb-6 font-medium">
          {message}
        </p>

        <div className="flex justify-center gap-3">
          <button
            onClick={onCancel}
            className="px-5 py-2 rounded-full border border-[#D8C7B5] bg-[#FAF6EE] hover:bg-[#F2ECE1] text-[#5D4037] font-semibold text-sm transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-5 py-2 rounded-full font-semibold text-sm transition-transform active:scale-95 text-white ${
              danger
                ? 'bg-[#E57373] hover:bg-[#D32F2F] shadow-sm'
                : 'bg-[#99B898] hover:bg-[#7BA870]'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
