import React from 'react';
import Link from 'next/link';
import { VenetianMask } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  tagline?: string;
  asLink?: boolean;
  className?: string;
}

const sizeConfig = {
  sm: {
    box: 'w-7 h-7 rounded-lg',
    icon: 'w-4 h-4',
    text: 'text-xl',
    dot: 'w-1.5 h-1.5',
    gap: 'gap-2',
    tagline: 'text-[10px]',
  },
  md: {
    box: 'w-8 h-8 sm:w-9 sm:h-9 rounded-xl',
    icon: 'w-4 h-4 sm:w-5 sm:h-5',
    text: 'text-2xl sm:text-[26px]',
    dot: 'w-1.5 h-1.5 sm:w-2 sm:h-2',
    gap: 'gap-2.5',
    tagline: 'text-xs',
  },
  lg: {
    box: 'w-11 h-11 rounded-2xl shadow-md shadow-terracotta/20',
    icon: 'w-6 h-6',
    text: 'text-3xl sm:text-4xl',
    dot: 'w-2 h-2',
    gap: 'gap-3',
    tagline: 'text-xs tracking-wider',
  },
  xl: {
    box: 'w-14 h-14 rounded-2xl shadow-lg shadow-terracotta/25',
    icon: 'w-7 h-7',
    text: 'text-4xl sm:text-5xl',
    dot: 'w-2.5 h-2.5',
    gap: 'gap-3.5',
    tagline: 'text-sm tracking-widest',
  },
};

export default function Logo({
  size = 'md',
  showTagline = false,
  tagline = 'Anonymous Q&A',
  asLink = true,
  className = '',
}: LogoProps) {
  const config = sizeConfig[size] || sizeConfig.md;

  const content = (
    <div className={`group inline-flex items-center ${config.gap} select-none ${className}`}>
      {/* Icon Emblem */}
      <div
        className={`relative shrink-0 flex items-center justify-center bg-gradient-to-br from-terracotta via-[#C2552A] to-[#9A3C16] text-white shadow-sm shadow-terracotta/25 border border-terracotta/30 group-hover:scale-105 group-hover:-rotate-2 group-hover:shadow-md group-hover:shadow-terracotta/35 transition-all duration-300 ease-out ${config.box}`}
        aria-hidden="true"
      >
        <VenetianMask
          className={`${config.icon} transition-transform duration-300 ease-out group-hover:scale-110 drop-shadow-sm`}
          strokeWidth={2.2}
        />
        {/* Subtle decorative sheen */}
        <div className="absolute inset-0 rounded-[inherit] bg-gradient-to-t from-transparent via-white/10 to-white/20 pointer-events-none" />
      </div>

      {/* Typography */}
      <div className="flex flex-col justify-center">
        <div className="flex items-baseline leading-none">
          <span
            className={`font-bold tracking-tight text-warm-text group-hover:text-terracotta transition-colors duration-200 ${config.text}`}
            style={{ fontFamily: 'var(--font-heading), Georgia, serif' }}
          >
            Maskd
          </span>
          <span
            className={`inline-block rounded-full bg-terracotta ml-0.5 self-baseline group-hover:scale-125 transition-transform duration-200 ${config.dot}`}
            aria-hidden="true"
          />
        </div>

        {showTagline && (
          <span className={`body-secondary uppercase font-medium mt-1 text-warm-text-secondary/80 ${config.tagline}`}>
            {tagline}
          </span>
        )}
      </div>
    </div>
  );

  if (asLink) {
    return (
      <Link href="/" className="inline-block transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/40 rounded-lg">
        {content}
      </Link>
    );
  }

  return content;
}
