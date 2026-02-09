import { LucideIcon } from "lucide-react";
import { clsx } from "clsx";
import { motion } from "framer-motion";

interface StatCardProps {
  label: string;
  value: string | number;
  trend?: string;
  icon?: LucideIcon;
  variant?: "default" | "success" | "warning" | "danger" | "info";
  onClick?: () => void;
}

export function StatCard({
  label,
  value,
  trend,
  icon: Icon,
  variant = "default",
  onClick,
}: StatCardProps) {
  const variantClasses = {
    default: "border-slate-800/50 bg-slate-900/40",
    success: "border-emerald-500/30 bg-emerald-500/5",
    warning: "border-amber-500/30 bg-amber-500/5",
    danger: "border-red-500/30 bg-red-500/5",
    info: "border-blue-500/30 bg-blue-500/5",
  };

  const trendColors = {
    default: "text-slate-300",
    success: "text-emerald-300",
    warning: "text-amber-300",
    danger: "text-red-300",
    info: "text-blue-300",
  };

  const iconColors = {
    default: "text-slate-400",
    success: "text-emerald-400",
    warning: "text-amber-400",
    danger: "text-red-400",
    info: "text-blue-400",
  };

  return (
    <motion.div
      whileHover={onClick ? { scale: 1.02, y: -2 } : {}}
      className={clsx(
        "rounded-xl border p-4 transition-all duration-300 backdrop-blur-sm",
        variantClasses[variant],
        onClick && "cursor-pointer"
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="text-xs font-medium text-slate-400 uppercase tracking-wide">
          {label}
        </div>
        {Icon && (
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            <Icon className={clsx("w-5 h-5", iconColors[variant])} />
          </motion.div>
        )}
      </div>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="text-3xl font-bold text-white mb-2"
      >
        {value}
      </motion.div>
      {trend && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className={clsx("text-xs font-medium flex items-center gap-1", trendColors[variant])}
        >
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
          {trend}
        </motion.div>
      )}
    </motion.div>
  );
}
