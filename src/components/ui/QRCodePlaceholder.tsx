import React from 'react';

interface QRCodePlaceholderProps {
  identifier: string;
}

export function QRCodePlaceholder({ identifier }: QRCodePlaceholderProps) {
  // A deterministic pseudo-random visual pattern based on the string
  const hash = identifier.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-sm border border-sand-light inline-block">
      <div className="grid grid-cols-5 gap-1 mb-4">
        {Array.from({ length: 25 }).map((_, i) => {
          const isFilled = (hash * (i + 1)) % 3 !== 0;
          return (
            <div 
              key={i} 
              className={`w-6 h-6 rounded-sm ${isFilled ? 'bg-taupe-dark' : 'bg-sand-light/30'}`}
              style={{
                // Anchor boxes in corners like a real QR code
                backgroundColor: [0, 4, 20, 24].includes(i) ? '#2c2522' : undefined
              }}
            />
          );
        })}
      </div>
      <p className="font-mono text-sm font-bold text-taupe tracking-widest uppercase">
        TRI-{identifier.substring(0, 6)}
      </p>
    </div>
  );
}
