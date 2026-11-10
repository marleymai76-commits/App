import React from 'react';
import { motion, HTMLMotionProps } from 'motion/react';
import { cn } from '../lib/utils';
import { ArrowRight, ChevronRight, X, Menu } from 'lucide-react';

// ==========================================
// 1. SISTENFOX DESIGN SYSTEM (DSX-1)
// ==========================================

export const THEME = {
  colors: {
    background: 'bg-black',
    accent: 'text-cyan-400',
    accentBg: 'bg-cyan-400',
    border: 'border-zinc-800',
    textPrimary: 'text-white',
    textSecondary: 'text-zinc-400',
    textMuted: 'text-zinc-600',
  },
  gradients: {
    premium: 'bg-gradient-to-br from-zinc-900 via-cyan-950/40 to-zinc-900',
    glow: 'bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.05),transparent_60%)]',
    radialTopRight: 'bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.08),transparent_50%)]',
    radialBottom: 'bg-[radial-gradient(circle_at_bottom,rgba(34,211,238,0.04),transparent_70%)]',
    accentGradient: 'bg-gradient-to-r from-cyan-400 to-cyan-200',
  },
  typography: {
    fontSans: 'font-sans',
    heading1: 'text-5xl md:text-7xl font-extrabold tracking-tight text-white leading-none',
    heading2: 'text-4xl md:text-6xl font-extrabold tracking-tight text-white',
    heading3: 'text-2xl md:text-3xl font-bold tracking-tight text-white',
    bodyLarge: 'text-xl text-zinc-300 font-light leading-relaxed',
    bodyMedium: 'text-zinc-400 text-sm leading-relaxed font-light',
  },
  spacing: {
    sectionPadding: 'py-28',
    containerPadding: 'px-6',
    borderRadius: 'rounded-3xl',
  },
  shadows: {
    deep: 'shadow-2xl',
    accentGlow: 'shadow-[0_20px_50px_rgba(34,211,238,0.15)]',
    subtleGlow: 'shadow-lg shadow-cyan-400/5',
  }
};

// --- Component: FoxSignature ---
interface FoxSignatureProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const FoxSignature: React.FC<FoxSignatureProps> = ({ className, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-base rounded-xl',
    md: 'w-10 h-10 text-lg rounded-2xl',
    lg: 'w-14 h-14 text-2xl rounded-2xl',
    xl: 'w-16 h-16 text-3xl rounded-3xl',
  };

  return (
    <div 
      className={cn(
        "bg-cyan-400 text-black flex items-center justify-center font-semibold select-none shadow-lg shadow-cyan-400/10",
        sizeClasses[size],
        className
      )}
    >
      🦊
    </div>
  );
};

// --- Component: Button ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'neon' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  animate?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'right',
  animate = true,
  className,
  ...props
}) => {
  const baseStyle = "inline-flex items-center justify-center font-semibold tracking-wide transition-all duration-300 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-white text-black hover:bg-cyan-400 hover:scale-105 active:scale-95 shadow-lg shadow-cyan-400/5",
    secondary: "bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-850 hover:text-white hover:border-zinc-700 hover:scale-[1.02]",
    neon: "bg-cyan-400 text-black shadow-lg shadow-cyan-400/20 hover:bg-cyan-300 hover:scale-105 active:scale-95",
    ghost: "bg-transparent text-zinc-400 hover:bg-zinc-900 hover:text-white",
    danger: "bg-red-950/40 border border-red-500/30 text-red-400 hover:bg-red-950/60 hover:text-red-300"
  };

  const sizes = {
    sm: "px-4 py-2 text-xs rounded-2xl gap-1.5",
    md: "px-6 py-3 text-sm rounded-2xl gap-2",
    lg: "px-10 py-5 text-base rounded-3xl gap-3",
  };

  const Component = animate ? motion.button : 'button';
  const animationProps = animate ? {
    whileHover: { scale: 1.02 },
    whileTap: { scale: 0.98 },
  } : {};

  return (
    // @ts-ignore
    <Component
      className={cn(baseStyle, variants[variant], sizes[size], className)}
      {...animationProps}
      {...props}
    >
      {icon && iconPosition === 'left' && <span className="shrink-0">{icon}</span>}
      {children}
      {icon && iconPosition === 'right' && <span className="shrink-0">{icon}</span>}
    </Component>
  );
};

// --- Component: Card ---
interface CardProps extends HTMLMotionProps<'div'> {
  glow?: boolean;
  hoverEffect?: boolean;
  gradient?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  glow = false,
  hoverEffect = true,
  gradient = true,
  className,
  ...props
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={hoverEffect ? { y: -4, scale: 1.01 } : undefined}
      transition={{ duration: 0.3 }}
      className={cn(
        "rounded-3xl p-8 border border-zinc-850/80 shadow-2xl relative overflow-hidden",
        gradient ? THEME.gradients.premium : "bg-zinc-950",
        glow && "shadow-[0_20px_50px_rgba(34,211,238,0.06)] border-cyan-400/20",
        hoverEffect && "hover:border-cyan-400/30 transition-all duration-300",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// --- Component: Input ---
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  icon,
  error,
  className,
  id,
  ...props
}) => {
  return (
    <div className="space-y-2 w-full">
      {label && (
        <label htmlFor={id} className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1 block">
          {label}
        </label>
      )}
      <div className="relative group">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-cyan-400 transition-colors">
            {icon}
          </div>
        )}
        <input
          id={id}
          className={cn(
            "w-full bg-zinc-950 border border-zinc-850 rounded-2xl py-4 focus:border-cyan-400 outline-none transition-all text-white font-light text-sm shadow-inner",
            icon ? "pl-12 pr-4" : "px-5",
            error ? "border-red-500/50 focus:border-red-500" : "border-zinc-850",
            className
          )}
          {...props}
        />
      </div>
      {error && (
        <p className="text-xs text-red-400 font-medium ml-1 mt-1">{error}</p>
      )}
    </div>
  );
};

// --- Component: Badge ---
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'cyan' | 'zinc' | 'green' | 'red' | 'yellow';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'zinc',
  className,
}) => {
  const styles = {
    cyan: "bg-cyan-500/10 text-cyan-400 border border-cyan-400/20",
    zinc: "bg-zinc-900 text-zinc-400 border border-zinc-800",
    green: "bg-emerald-500/10 text-emerald-400 border border-emerald-400/20",
    red: "bg-rose-500/10 text-rose-400 border border-rose-400/20",
    yellow: "bg-amber-500/10 text-amber-400 border border-amber-400/20",
  };

  return (
    <span className={cn(
      "inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full select-none tracking-wider uppercase",
      styles[variant],
      className
    )}>
      {children}
    </span>
  );
};

// --- Component: SectionHeader ---
interface SectionHeaderProps {
  subtitle: string;
  title: string | React.ReactNode;
  description: string;
  align?: 'center' | 'left';
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  subtitle,
  title,
  description,
  align = 'center',
  className,
}) => {
  return (
    <div className={cn(
      "mb-20 max-w-4xl", 
      align === 'center' ? 'text-center mx-auto' : 'text-left',
      className
    )}>
      <h2 className="text-cyan-400 text-xs font-bold uppercase tracking-[0.3em] mb-4">
        {subtitle}
      </h2>
      <h3 className={THEME.typography.heading2}>
        {title}
      </h3>
      <p className="mt-4 text-zinc-400 text-lg font-light max-w-2xl leading-relaxed">
        {description}
      </p>
    </div>
  );
};


// ==========================================
// 2. SISTENFOX LAYOUT ENGINE
// ==========================================

// --- Component: PageContainer ---
interface PageContainerProps {
  children: React.ReactNode;
  withGlow?: boolean;
  className?: string;
  id?: string;
}

export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  withGlow = true,
  className,
  id,
}) => {
  return (
    <section 
      id={id} 
      className={cn("py-28 bg-black relative overflow-hidden", className)}
    >
      {withGlow && (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.03),transparent_60%)] pointer-events-none" />
      )}
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {children}
      </div>
    </section>
  );
};

// --- Component: Grid ---
interface GridProps {
  children: React.ReactNode;
  cols?: 1 | 2 | 3 | 4;
  className?: string;
}

export const Grid: React.FC<GridProps> = ({
  children,
  cols = 3,
  className,
}) => {
  const colClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
  };

  return (
    <div className={cn("grid gap-8", colClasses[cols], className)}>
      {children}
    </div>
  );
};

// --- Component: DashboardLayout (Used across all panels) ---
interface DashboardLayoutProps {
  children: React.ReactNode;
  sidebarContent: React.ReactNode;
  headerContent?: React.ReactNode;
  userEmail?: string;
  userRoleLabel?: string;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  sidebarContent,
  headerContent,
  userEmail,
  userRoleLabel,
}) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-black text-zinc-300 font-sans flex flex-col md:flex-row relative">
      {/* Mobile Top bar */}
      <div className="md:hidden flex items-center justify-between px-6 h-16 bg-zinc-950 border-b border-zinc-900 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <FoxSignature size="sm" />
          <span className="text-white font-bold tracking-widest text-sm">SISTENFOX</span>
        </div>
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-zinc-400 hover:text-white"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Overlay (Mobile) */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside className={cn(
        "fixed md:sticky top-0 left-0 h-screen w-72 bg-zinc-950 border-r border-zinc-900 z-50 md:z-30 transition-transform duration-300 md:translate-x-0 flex flex-col",
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        {/* Sidebar Header */}
        <div className="px-8 h-20 border-b border-zinc-900 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <FoxSignature size="sm" />
            <span className="text-white font-bold tracking-widest text-sm">SISTENFOX</span>
          </div>
          <button 
            className="md:hidden text-zinc-500 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Navigation */}
        <div className="flex-grow overflow-y-auto px-4 py-6">
          {sidebarContent}
        </div>

        {/* Sidebar Footer */}
        {(userEmail || userRoleLabel) && (
          <div className="p-6 border-t border-zinc-900 shrink-0 bg-zinc-950/80">
            {userRoleLabel && (
              <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest block mb-1">
                {userRoleLabel}
              </span>
            )}
            {userEmail && (
              <span className="text-xs text-zinc-500 truncate block font-light">
                {userEmail}
              </span>
            )}
          </div>
        )}
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 flex flex-col min-h-screen">
        {/* Dynamic header panel */}
        {headerContent && (
          <header className="px-8 h-20 border-b border-zinc-900 bg-zinc-950/40 backdrop-blur-md hidden md:flex items-center justify-between sticky top-0 z-20">
            {headerContent}
          </header>
        )}
        
        {/* Page Inner Container */}
        <div className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};
