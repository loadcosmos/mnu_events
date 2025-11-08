// MNU Events Design System
export const colors = {
  // Primary
  primary: '#d62e1f',
  primaryHover: '#b52419',
  primaryDark: '#8b1810',

  // Dark Theme (Students)
  dark: {
    bg: '#0a0a0a',
    bgCard: '#1a1a1a',
    bgGlass: 'rgba(26, 26, 26, 0.7)',
    text: '#ffffff',
    textSecondary: '#a0a0a0',
    border: 'rgba(255, 255, 255, 0.1)',
  },

  // Light Theme (Organizers)
  light: {
    bg: '#ffffff',
    bgGray: '#f8f9fa',
    text: '#1a1a1a',
    textGray: '#6b7280',
    border: '#e5e7eb',
  },

  // CSI Colors
  csi: {
    creativity: '#f59e0b',
    service: '#3b82f6',
    intelligence: '#10b981',
  },

  // Status
  success: '#10b981',
  error: '#ef4444',
  warning: '#f59e0b',
};

export const spacing = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  '2xl': '3rem',
  '3xl': '4rem',
};

export const borderRadius = {
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  full: '9999px',
};

export const shadows = {
  sm: '0 2px 8px rgba(0, 0, 0, 0.1)',
  md: '0 4px 16px rgba(0, 0, 0, 0.15)',
  lg: '0 8px 32px rgba(0, 0, 0, 0.2)',
  glow: '0 0 20px rgba(214, 46, 31, 0.3)',
  glowStrong: '0 0 40px rgba(214, 46, 31, 0.5)',
};

export const typography = {
  fontFamily: "'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '2rem',
    '4xl': '2.5rem',
    '5xl': '3.5rem',
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },
};

export const transitions = {
  fast: '150ms ease',
  base: '300ms ease',
  slow: '500ms ease',
};
