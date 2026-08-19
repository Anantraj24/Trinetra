'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LucideIcon } from 'lucide-react';

export interface NavItem {
  icon: LucideIcon;
  label: string;
  href: string;
  onClick?: () => void;
}

interface DesktopSidebarProps {
  items: NavItem[];
}

export function DesktopSidebar({ items }: DesktopSidebarProps) {
  const pathname = usePathname();

  return (
    <div className="hidden lg:flex flex-col w-64 h-screen sticky top-0 bg-ivory border-r border-sand-light p-6 z-40 shrink-0">
      <div className="text-2xl font-bold text-taupe-dark mb-12 tracking-tight">TRINETRA</div>
      <nav className="flex flex-col gap-4">
        {items.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          if (item.onClick) {
            return (
              <button 
                key={item.label}
                onClick={item.onClick}
                className="flex items-center gap-3 p-3 rounded-2xl text-taupe hover:bg-sand-light/50 transition-colors w-full text-left"
              >
                <Icon size={20} /> {item.label}
              </button>
            );
          }

          return (
            <Link 
              key={item.label} 
              href={item.href} 
              className={`flex items-center gap-3 p-3 rounded-2xl font-medium transition-colors ${
                isActive 
                  ? 'bg-sand-light text-taupe-dark' 
                  : 'text-taupe hover:bg-sand-light/50'
              }`}
            >
              <Icon size={20} /> {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}