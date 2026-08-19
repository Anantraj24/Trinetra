import React from 'react';

export function JourneyMap({ className = '' }: { className?: string }) {
  // A stylized SVG map for the TRINETRA Journey Safety Contract prototype.
  // Origin (A) -> Destination (B)
  // Shows a hazard area in the middle, and some safe checkpoints, along with a 'Shadow Corridor' (safe radius).

  return (
    <div className={`w-full bg-[#FAFAFA] rounded-3xl overflow-hidden border border-sand shadow-inner relative ${className}`}>
      <svg 
        viewBox="0 0 800 400" 
        className="w-full h-full text-sand-light" 
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background Grid Pattern for a 'technical' map feel */}
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" strokeOpacity="0.5"/>
          </pattern>
          <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#4A90E2" />
            <stop offset="100%" stopColor="#2E5B8F" />
          </linearGradient>
          <radialGradient id="hazardGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#F5A623" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#F5A623" stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* Hazard Zone */}
        <circle cx="500" cy="150" r="100" fill="url(#hazardGradient)" />
        <circle cx="500" cy="150" r="40" fill="#F5A623" fillOpacity="0.2" stroke="#F5A623" strokeWidth="1" strokeDasharray="4 4" />
        <text x="500" y="155" textAnchor="middle" fill="#D48B1A" fontSize="12" fontWeight="bold" letterSpacing="1">HAZARD ZONE</text>

        {/* Shadow Corridor (Safe Radius) */}
        <path 
          d="M 150 250 Q 300 350, 450 250 T 650 150" 
          fill="none" 
          stroke="#4A90E2" 
          strokeWidth="60" 
          strokeOpacity="0.1" 
          strokeLinecap="round"
        />
        <path 
          d="M 150 250 Q 300 350, 450 250 T 650 150" 
          fill="none" 
          stroke="#4A90E2" 
          strokeWidth="60" 
          strokeOpacity="0.2" 
          strokeLinecap="round"
          strokeDasharray="10 10"
        />

        {/* Primary Route */}
        <path 
          d="M 150 250 Q 300 350, 450 250 T 650 150" 
          fill="none" 
          stroke="url(#routeGradient)" 
          strokeWidth="4" 
          strokeLinecap="round"
        />

        {/* Checkpoints */}
        <g transform="translate(300, 290)">
          <circle cx="0" cy="0" r="12" fill="#FAFAFA" stroke="#10B981" strokeWidth="3" />
          <circle cx="0" cy="0" r="4" fill="#10B981" />
          <text x="0" y="25" textAnchor="middle" fill="#8B857A" fontSize="12" fontWeight="bold">CP-1</text>
        </g>
        
        <g transform="translate(480, 230)">
          <circle cx="0" cy="0" r="12" fill="#FAFAFA" stroke="#10B981" strokeWidth="3" />
          <circle cx="0" cy="0" r="4" fill="#10B981" />
          <text x="0" y="25" textAnchor="middle" fill="#8B857A" fontSize="12" fontWeight="bold">CP-2</text>
        </g>

        {/* Origin (A) */}
        <g transform="translate(150, 250)">
          <circle cx="0" cy="0" r="18" fill="#4A90E2" />
          <circle cx="0" cy="0" r="26" fill="none" stroke="#4A90E2" strokeWidth="2" strokeOpacity="0.3" />
          <text x="0" y="5" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">A</text>
          <text x="0" y="-35" textAnchor="middle" fill="#4A2B23" fontSize="14" fontWeight="bold">Origin</text>
        </g>

        {/* Destination (B) */}
        <g transform="translate(650, 150)">
          <circle cx="0" cy="0" r="18" fill="#2E5B8F" />
          <circle cx="0" cy="0" r="26" fill="none" stroke="#2E5B8F" strokeWidth="2" strokeOpacity="0.3" />
          <text x="0" y="5" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">B</text>
          <text x="0" y="-35" textAnchor="middle" fill="#4A2B23" fontSize="14" fontWeight="bold">Destination</text>
        </g>

      </svg>
      
      {/* Overlay Legend */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md px-4 py-3 rounded-2xl border border-sand-light shadow-sm flex items-center gap-4 text-xs font-bold text-taupe-dark">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#4A90E2]" />
          <span>Route</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#10B981]" />
          <span>Checkpoint</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#F5A623]" />
          <span>Hazard</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-3 bg-[#4A90E2]/20 border border-[#4A90E2]/50 rounded-sm border-dashed" />
          <span>Shadow Corridor</span>
        </div>
      </div>
    </div>
  );
}
