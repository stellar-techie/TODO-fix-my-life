import React from 'react';

// Sunflower from Reference 3
export const SunflowerDoodle = ({ className = "w-16 h-16", size = 64 }) => (
  <svg
    viewBox="0 0 100 100"
    className={className}
    width={size}
    height={size}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Leaves */}
    <path
      d="M20 70 C10 60 5 45 15 35 C25 45 30 60 20 70 Z"
      fill="#5E8B48"
      stroke="#3E612B"
      strokeWidth="1.5"
    />
    <path
      d="M80 70 C90 60 95 45 85 35 C75 45 70 60 80 70 Z"
      fill="#5E8B48"
      stroke="#3E612B"
      strokeWidth="1.5"
    />
    {/* Petals */}
    {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
      <path
        key={deg}
        d="M50 20 C45 28 45 40 50 45 C55 40 55 28 50 20 Z"
        fill="#F5B72E"
        stroke="#D98A13"
        strokeWidth="1.5"
        transform={`rotate(${deg} 50 50)`}
      />
    ))}
    {/* Inner Petals */}
    {[15, 45, 75, 105, 135, 165, 195, 225, 255, 285, 315, 345].map((deg) => (
      <path
        key={`inner-${deg}`}
        d="M50 26 C47 32 47 40 50 43 C53 40 53 32 50 26 Z"
        fill="#FFC93C"
        stroke="#E69500"
        strokeWidth="1.2"
        transform={`rotate(${deg} 50 50)`}
      />
    ))}
    {/* Center Core */}
    <circle cx="50" cy="50" r="14" fill="#5A3825" stroke="#3D2314" strokeWidth="2" />
    <circle cx="50" cy="50" r="11" fill="#75482F" stroke="#482613" strokeWidth="1" strokeDasharray="2 2" />
    <circle cx="50" cy="50" r="7" fill="#422513" />
  </svg>
);

// Flower Basket from Reference 2 (with "keep going ♡" tag)
export const FlowerBasketDoodle = ({ className = "w-20 h-20" }) => (
  <svg viewBox="0 0 120 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Flowers emerging */}
    <circle cx="45" cy="40" r="9" fill="#FFB7B2" stroke="#E57373" strokeWidth="1.5" />
    <circle cx="45" cy="40" r="4" fill="#FFE082" />
    <circle cx="70" cy="35" r="10" fill="#FFCC80" stroke="#FB8C00" strokeWidth="1.5" />
    <circle cx="70" cy="35" r="4.5" fill="#FFF" />
    <circle cx="58" cy="22" r="8" fill="#F8BBD0" stroke="#EC407A" strokeWidth="1.5" />
    <circle cx="58" cy="22" r="3.5" fill="#FFE082" />
    {/* Green leaves */}
    <path d="M30 45 C25 35 35 25 45 35 Z" fill="#81C784" stroke="#4CAF50" strokeWidth="1" />
    <path d="M85 40 C95 30 85 20 75 32 Z" fill="#81C784" stroke="#4CAF50" strokeWidth="1" />
    {/* Woven Basket */}
    <path
      d="M32 50 L88 50 L82 86 C81 92 75 96 69 96 L51 96 C45 96 39 92 38 86 L32 50 Z"
      fill="#D7A87A"
      stroke="#A26B3E"
      strokeWidth="2.5"
    />
    {/* Weave texture */}
    <line x1="36" y1="62" x2="84" y2="62" stroke="#B88656" strokeWidth="2" strokeDasharray="4 3" />
    <line x1="39" y1="74" x2="81" y2="74" stroke="#B88656" strokeWidth="2" strokeDasharray="4 3" />
    <line x1="42" y1="85" x2="78" y2="85" stroke="#B88656" strokeWidth="2" strokeDasharray="4 3" />
    {/* "keep going ♡" tag */}
    <rect x="42" y="60" width="36" height="22" rx="3" fill="#FFFDF8" stroke="#8C6D4F" strokeWidth="1.2" transform="rotate(-4 60 71)" />
    <text x="60" y="70" textAnchor="middle" fontSize="6.5" fontFamily="Patrick Hand, cursive" fill="#5D4037" transform="rotate(-4 60 71)">keep</text>
    <text x="60" y="78" textAnchor="middle" fontSize="6.5" fontFamily="Patrick Hand, cursive" fill="#5D4037" transform="rotate(-4 60 71)">going ♡</text>
  </svg>
);

// Pencil Mug with Heart from Reference 2
export const PencilMugDoodle = ({ className = "w-16 h-20" }) => (
  <svg viewBox="0 0 100 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Pencils and pens sticking out */}
    <path d="M42 45 L42 12 L47 5 L52 12 L52 45 Z" fill="#F8B195" stroke="#C06C84" strokeWidth="1.5" />
    <polygon points="42,12 47,5 52,12" fill="#FFEAA7" />
    <polygon points="45,8 47,5 49,8" fill="#333" />
    <path d="M56 45 L58 18 L64 12 L68 18 L66 45 Z" fill="#74B9FF" stroke="#0984E3" strokeWidth="1.5" />
    <polygon points="58,18 64,12 68,18" fill="#DFE6E9" />
    {/* Mug Body */}
    <rect x="30" y="45" width="46" height="52" rx="7" fill="#8FA686" stroke="#5E7557" strokeWidth="2.5" />
    {/* Handle */}
    <path d="M76 56 C88 56 88 80 76 80" fill="none" stroke="#5E7557" strokeWidth="3" strokeLinecap="round" />
    {/* Heart on Mug */}
    <path
      d="M53 71 C53 66 48 64 48 68 C48 72 53 77 53 77 C53 77 58 72 58 68 C58 64 53 66 53 71 Z"
      fill="#FFFFFF"
      opacity="0.9"
    />
  </svg>
);

// Smiling Star Sticker from Reference 2
export const SmileyStarDoodle = ({ className = "w-10 h-10" }) => (
  <svg viewBox="0 0 80 80" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M40 8 L48 28 L70 30 L53 45 L58 67 L40 55 L22 67 L27 45 L10 30 L32 28 Z"
      fill="#FFEAA7"
      stroke="#FDCB6E"
      strokeWidth="2.5"
      strokeLinejoin="round"
    />
    {/* Eyes */}
    <circle cx="33" cy="40" r="2.2" fill="#5A4A42" />
    <circle cx="47" cy="40" r="2.2" fill="#5A4A42" />
    {/* Cheeks */}
    <circle cx="28" cy="44" r="2.5" fill="#FFB7B2" opacity="0.8" />
    <circle cx="52" cy="44" r="2.5" fill="#FFB7B2" opacity="0.8" />
    {/* Smile */}
    <path d="M36 45 Q40 49 44 45" stroke="#5A4A42" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

// Smiling Pink Tulip from Reference 1
export const TulipDoodle = ({ className = "w-12 h-12" }) => (
  <svg viewBox="0 0 80 80" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Stem and leaf */}
    <path d="M40 45 Q38 65 37 75" stroke="#7BA870" strokeWidth="3" strokeLinecap="round" />
    <path d="M38 60 Q25 55 24 68 Q33 70 38 63" fill="#88B87D" stroke="#68965E" strokeWidth="1.5" />
    <path d="M38 55 Q50 50 52 62 Q45 65 38 58" fill="#88B87D" stroke="#68965E" strokeWidth="1.5" />
    {/* Tulip petals */}
    <path
      d="M40 18 C30 20 23 30 25 42 C26 50 35 52 40 52 C45 52 54 50 55 42 C57 30 50 20 40 18 Z"
      fill="#FFAAA6"
      stroke="#FF8B8B"
      strokeWidth="2"
    />
    {/* Middle overlap */}
    <path d="M32 20 Q40 35 48 20" stroke="#FF8B8B" strokeWidth="2" fill="none" />
    {/* Smiling face */}
    <circle cx="34" cy="38" r="1.6" fill="#5A4A42" />
    <circle cx="46" cy="38" r="1.6" fill="#5A4A42" />
    <ellipse cx="30" cy="42" rx="2" ry="1.2" fill="#FF7B7B" opacity="0.6" />
    <ellipse cx="50" cy="42" rx="2" ry="1.2" fill="#FF7B7B" opacity="0.6" />
    <path d="M37 42 Q40 45 43 42" stroke="#5A4A42" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

// Orange Bell Flower from Reference 1
export const BellFlowerDoodle = ({ className = "w-12 h-12" }) => (
  <svg viewBox="0 0 80 80" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Arching stem */}
    <path d="M20 70 Q45 35 60 55" stroke="#7BA870" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    {/* Hanging bells */}
    <path
      d="M50 52 C46 54 44 60 48 65 C52 68 56 68 60 65 C64 60 62 54 58 52 Z"
      fill="#FF9A76"
      stroke="#E87A54"
      strokeWidth="1.5"
    />
    <path
      d="M36 50 C32 52 30 58 34 63 C38 66 42 66 46 63 C50 58 48 52 44 50 Z"
      fill="#FFB285"
      stroke="#E87A54"
      strokeWidth="1.5"
    />
    {/* Tiny leaves */}
    <path d="M22 65 Q15 60 18 52 Q24 58 22 65" fill="#88B87D" stroke="#68965E" strokeWidth="1.2" />
  </svg>
);

// Potted Plant for Self-Care from Reference 2
export const PottedPlantDoodle = ({ className = "w-14 h-16" }) => (
  <svg viewBox="0 0 90 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Leaves */}
    <path d="M45 45 Q35 15 25 35 Q40 45 45 45" fill="#7BA870" stroke="#5D8853" strokeWidth="1.5" />
    <path d="M45 45 Q45 8 58 25 Q50 42 45 45" fill="#8EB883" stroke="#5D8853" strokeWidth="1.5" />
    <path d="M45 45 Q65 18 70 38 Q52 48 45 45" fill="#6C9761" stroke="#4C7441" strokeWidth="1.5" />
    <path d="M45 45 Q20 30 18 48 Q35 52 45 45" fill="#8EB883" stroke="#5D8853" strokeWidth="1.5" />
    {/* Pot */}
    <path
      d="M26 48 L64 48 L58 84 C57 88 53 92 48 92 L42 92 C37 92 33 88 32 84 L26 48 Z"
      fill="#F8BBD0"
      stroke="#E08B9B"
      strokeWidth="2"
    />
    {/* White heart on pot */}
    <path
      d="M45 70 C45 66 41 64 41 68 C41 71 45 74 45 74 C45 74 49 71 49 68 C49 64 45 66 45 70 Z"
      fill="#FFFFFF"
      opacity="0.9"
    />
  </svg>
);

// Retro Alarm Clock Sticker from Reference 2
export const AlarmClockDoodle = ({ className = "w-10 h-10" }) => (
  <svg viewBox="0 0 60 60" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Bells */}
    <circle cx="16" cy="18" r="7" fill="#FFAAA6" stroke="#D96B6B" strokeWidth="1.5" />
    <circle cx="44" cy="18" r="7" fill="#FFAAA6" stroke="#D96B6B" strokeWidth="1.5" />
    {/* Legs */}
    <line x1="20" y1="48" x2="14" y2="55" stroke="#5A4A42" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="40" y1="48" x2="46" y2="55" stroke="#5A4A42" strokeWidth="2.5" strokeLinecap="round" />
    {/* Body */}
    <circle cx="30" cy="34" r="18" fill="#FFF8EE" stroke="#E57373" strokeWidth="2.5" />
    {/* Center & Hands */}
    <circle cx="30" cy="34" r="2.5" fill="#5A4A42" />
    <line x1="30" y1="34" x2="30" y2="24" stroke="#5A4A42" strokeWidth="2" strokeLinecap="round" />
    <line x1="30" y1="34" x2="38" y2="34" stroke="#5A4A42" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// Sparkles / Stars from Reference 1
export const SparklesDoodle = ({ className = "w-6 h-6 text-[#E9A825]" }) => (
  <svg viewBox="0 0 50 50" className={className} fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M25 0 Q25 25 0 25 Q25 25 25 50 Q25 25 50 25 Q25 25 25 0 Z" />
  </svg>
);

// Gingham Ribbon Bow from Reference 3
export const RibbonBowDoodle = ({ className = "w-14 h-12" }) => (
  <svg viewBox="0 0 90 70" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Left Loop */}
    <path
      d="M45 35 C30 18 10 18 12 35 C14 48 35 45 45 35 Z"
      fill="#F9D56E"
      stroke="#DCA835"
      strokeWidth="1.8"
    />
    {/* Right Loop */}
    <path
      d="M45 35 C60 18 80 18 78 35 C76 48 55 45 45 35 Z"
      fill="#F9D56E"
      stroke="#DCA835"
      strokeWidth="1.8"
    />
    {/* Tails */}
    <path
      d="M42 38 L30 65 L40 60 L45 40"
      fill="#F5C042"
      stroke="#DCA835"
      strokeWidth="1.5"
    />
    <path
      d="M48 38 L60 65 L50 60 L45 40"
      fill="#F5C042"
      stroke="#DCA835"
      strokeWidth="1.5"
    />
    {/* Center Knot */}
    <circle cx="45" cy="35" r="6" fill="#F0B020" stroke="#C49015" strokeWidth="1.8" />
  </svg>
);

// Daisy from Reference 1 & 2
export const DaisyDoodle = ({ className = "w-10 h-10" }) => (
  <svg viewBox="0 0 60 60" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
      <ellipse
        key={deg}
        cx="30"
        cy="15"
        rx="5.5"
        ry="10"
        fill="#FFFFFF"
        stroke="#E2CE98"
        strokeWidth="1.2"
        transform={`rotate(${deg} 30 30)`}
      />
    ))}
    <circle cx="30" cy="30" r="8" fill="#F5B72E" stroke="#D98A13" strokeWidth="1.5" />
    <circle cx="28" cy="28" r="1.2" fill="#5A4A42" />
    <circle cx="32" cy="28" r="1.2" fill="#5A4A42" />
    <path d="M28 32 Q30 34 32 32" stroke="#5A4A42" strokeWidth="1" strokeLinecap="round" />
  </svg>
);

