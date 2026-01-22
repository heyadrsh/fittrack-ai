'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Utensils,
  Dumbbell,
  User,
  Droplets,
  TrendingUp,
  Settings,
  Trophy,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Dashboard', icon: Home },
  { href: '/food', label: 'Food', icon: Utensils },
  { href: '/workout', label: 'Workout', icon: Dumbbell },
  { href: '/body', label: 'Body', icon: User },
  { href: '/water', label: 'Water', icon: Droplets },
  { href: '/progress', label: 'Progress', icon: TrendingUp },
  { href: '/achievements', label: 'Achievements', icon: Trophy },
  { href: '/settings', label: 'Settings', icon: Settings },
];

// Mobile bottom nav - show only main items
const mobileNavItems = navItems.slice(0, 5);

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-64 border-r-2 border-black bg-white min-h-screen">
      {/* Logo */}
      <div className="p-6 border-b-2 border-black">
        <Link href="/" className="flex items-center gap-2">
          <Dumbbell className="w-8 h-8" />
          <span className="text-xl font-bold">FITTRACK AI</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 border-2 transition-all',
                    isActive
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-black border-transparent hover:border-black'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t-2 border-black z-50 pb-safe">
      <ul className="flex justify-around items-center h-16">
        {mobileNavItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center w-16 h-full transition-all',
                  isActive ? 'text-black' : 'text-gray-400 hover:text-gray-600'
                )}
              >
                <Icon className={cn('w-6 h-6', isActive && 'fill-current')} />
                <span className="text-xs mt-1">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
