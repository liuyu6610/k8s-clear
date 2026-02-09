import { clsx } from "clsx";

interface PulseDotProps {
  color?: "green" | "red" | "yellow" | "blue";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function PulseDot({ color = "green", size = "md", className }: PulseDotProps) {
  const colorClasses = {
    green: "bg-emerald-500",
    red: "bg-red-500",
    yellow: "bg-yellow-500",
    blue: "bg-blue-500",
  };

  const sizeClasses = {
    sm: "w-2 h-2",
    md: "w-3 h-3",
    lg: "w-4 h-4",
  };

  return (
    <span className={clsx("relative inline-flex", className)}>
      <span
        className={clsx(
          "absolute inline-flex rounded-full opacity-75 animate-ping",
          colorClasses[color],
          sizeClasses[size]
        )}
      />
      <span
        className={clsx(
          "relative inline-flex rounded-full",
          colorClasses[color],
          sizeClasses[size]
        )}
      />
    </span>
  );
}

