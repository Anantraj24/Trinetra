'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NavItem } from './DesktopSidebar';

interface BottomDockProps {
  items: NavItem[];
}

export function BottomDock({ items }: BottomDockProps) {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 p-6 flex justify-center pointer-events-none lg:hidden z-50">
      <div className="bg-white/90 backdrop-blur-lg rounded-full px-6 py-4 shadow-[0_8px_32px_rgba(0,0,0,0.08)] border border-sand-light flex gap-8 pointer-events-auto">
        {items.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          if (item.onClick) {
            return (
              <button 
                key={item.label}
                onClick={item.onClick}
                className="text-taupe-dark hover:text-taupe transition-colors"
                title={item.label}
              >
                <Icon size={24} />
              </button>
            );
          }

          return (
            <Link 
              key={item.label} 
              href={item.href} 
              className={`transition-colors ${isActive ? 'text-taupe-dark' : 'text-taupe hover:text-taupe-dark'}`}
              title={item.label}
            >
              <Icon size={24} />
            </Link>
          );
        })}
      </div>
    </div>
  );
}