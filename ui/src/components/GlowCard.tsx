import { ReactNode } from "react";
import { clsx } from "clsx";

interface GlowCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: "blue" | "green" | "purple" | "orange";
  hover?: boolean;
}

export function GlowCard({
  children,
  className,
  glowColor = "blue",
  hover = true,
}: GlowCardProps) {
  const glowColors = {
    blue: "from-blue-500/20 via-blue-400/10 to-transparent",
    green: "from-emerald-500/20 via-emerald-400/10 to-transparent",
    purple: "from-purple-500/20 via-purple-400/10 to-transparent",
    orange: "from-orange-500/20 via-orange-400/10 to-transparent",
  };

  return (
    <div
      className={clsx(
        "relative group rounded-xl border border-slate-800/50 bg-gradient-to-br from-slate-900/90 via-slate-900/50 to-slate-950/90 backdrop-blur-xl",
        "transition-all duration-500",
        hover && "hover:border-slate-700/50 hover:shadow-2xl hover:shadow-brand-500/10 hover:-translate-y-1",
        className
      )}
    >
      {/* Glow effect */}
      <div
        className={clsx(
          "absolute -inset-0.5 rounded-xl bg-gradient-to-r opacity-0 blur-xl transition-opacity duration-500",
          glowColors[glowColor],
          hover && "group-hover:opacity-100"
        )}
      />

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

