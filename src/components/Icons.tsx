import type { ReactNode } from 'react';

/** The app icon in miniature: catalogue cards threaded on a rod. */
export function LogoMark() {
  return (
    <svg className="logo-mark" viewBox="0 0 32 32" width="28" height="28" aria-hidden="true">
      <rect x="4" y="5" width="24" height="6" rx="1.5" fill="var(--card-bg)" stroke="var(--card-border)" />
      <rect x="4" y="13" width="19" height="6" rx="1.5" fill="var(--card-bg)" stroke="var(--card-border)" />
      <rect x="4" y="21" width="22" height="6" rx="1.5" fill="var(--card-bg)" stroke="var(--card-border)" />
      <path d="M9 2v28" stroke="var(--stamp)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/** One stroke style for every UI icon, so they read as a set. */
function StrokeIcon({ size = 24, children }: { size?: number; children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

/** A catalogue card with a question mark. */
export function HelpIcon() {
  return (
    <StrokeIcon>
      <rect x="3.5" y="4.5" width="17" height="15" rx="2" />
      <path d="M9.6 10a2.4 2.4 0 1 1 3.4 2.2c-.6.3-1 .8-1 1.5v.3" />
      <path d="M12 16.9h.01" strokeWidth="2.4" />
    </StrokeIcon>
  );
}

/** The score distribution: bars off a baseline, like the stats panel. */
export function StatsIcon() {
  return (
    <StrokeIcon>
      <path d="M4 3.5v17" />
      <path d="M4 7h9M4 12h15M4 17h6" strokeWidth="2.6" />
    </StrokeIcon>
  );
}

/** Sliders. */
export function SettingsIcon() {
  return (
    <StrokeIcon>
      <path d="M4 7h4M12 7h8M4 17h10M18 17h2" />
      <circle cx="10" cy="7" r="2.2" />
      <circle cx="16" cy="17" r="2.2" />
    </StrokeIcon>
  );
}

export function ShareIcon() {
  return (
    <StrokeIcon size={22}>
      <path d="M12 3.5v11M7.5 8 12 3.5 16.5 8" />
      <path d="M8 11.5H6.5a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-5a2 2 0 0 0-2-2H16" />
    </StrokeIcon>
  );
}

export function ArrowIcon({ direction }: { direction: 'up' | 'down' }) {
  return (
    <StrokeIcon size={22}>
      <path d={direction === 'up' ? 'm6.5 14.5 5.5-5.5 5.5 5.5' : 'm6.5 9.5 5.5 5.5 5.5-5.5'} strokeWidth="2.2" />
    </StrokeIcon>
  );
}

export function CloseIcon() {
  return (
    <StrokeIcon>
      <path d="M6 6l12 12M18 6 6 18" />
    </StrokeIcon>
  );
}
