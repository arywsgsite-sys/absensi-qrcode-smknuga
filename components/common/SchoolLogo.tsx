import React from 'react';

interface SchoolLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export const SchoolLogo: React.FC<SchoolLogoProps> = ({
  className = '',
  size = 40,
  showText = false,
}) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Muhammadiyah Emblem Icon with Solar Rays and Islamic Calligraphy Accent */}
      <div
        className="relative flex items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 via-teal-700 to-navy-900 text-white shadow-md shadow-emerald-900/20 ring-2 ring-emerald-400/30 flex-shrink-0"
        style={{ width: size, height: size }}
      >
        <svg
          viewBox="0 0 100 100"
          className="w-4/5 h-4/5 drop-shadow fill-current text-amber-300"
        >
          {/* 12 Radiant Rays of Muhammadiyah Sun */}
          <g transform="translate(50,50)">
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
              <polygon
                key={deg}
                points="0,-46 4,-32 0,-34 -4,-32"
                transform={`rotate(${deg})`}
                className="fill-amber-300"
              />
            ))}
            {/* Center circle */}
            <circle r="30" className="fill-emerald-700 stroke-amber-300" strokeWidth="2.5" />
            <circle r="26" className="fill-emerald-800" />
            
            {/* Syahadatain / Arabic Star Core Stylized */}
            <path
              d="M0,-18 L5,-5 L18,-5 L8,3 L12,16 L0,8 L-12,16 L-8,3 L-18,-5 L-5,-5 Z"
              className="fill-amber-300"
            />
            {/* Center number '3' badge */}
            <circle r="7" className="fill-white" />
            <text
              x="0"
              y="3.5"
              textAnchor="middle"
              className="fill-emerald-900 font-black text-[9px] select-none"
            >
              3
            </text>
          </g>
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col text-left">
          <span className="font-extrabold text-sm sm:text-base leading-tight tracking-tight text-slate-900">
            SMK Muhammadiyah 3
          </span>
          <span className="text-[11px] font-semibold tracking-wider text-emerald-700 uppercase">
            Weleri • Kendal
          </span>
        </div>
      )}
    </div>
  );
};
