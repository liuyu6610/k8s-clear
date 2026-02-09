import { ReactNode } from "react";
import clsx from "clsx";

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  animated?: boolean;
}

export function Card({ children, className, onClick, animated = true }: CardProps) {
  return (
    <div
      className={clsx("card", className, {
        "card-clickable": onClick,
        "card-animated": animated
      })}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function CardHeader({ title, subtitle, action }: CardHeaderProps) {
  return (
    <div className="card-header">
      <div>
        <div className="card-title">{title}</div>
        {subtitle && <div className="card-subtitle">{subtitle}</div>}
      </div>
      {action && <div className="card-action">{action}</div>}
    </div>
  );
}

interface CardValueProps {
  value: string | number;
  unit?: string;
  trend?: {
    value: number;
    label: string;
  };
  className?: string;
}

export function CardValue({ value, unit, trend, className }: CardValueProps) {
  return (
    <div className={clsx("card-value-wrapper", className)}>
      <div className="card-value">
        {value}
        {unit && <span className="card-value-unit">{unit}</span>}
      </div>
      {trend && (
        <div className={clsx("card-trend", trend.value >= 0 ? "trend-up" : "trend-down")}>
          {trend.value >= 0 ? "↑" : "↓"} {Math.abs(trend.value)}% {trend.label}
        </div>
      )}
    </div>
  );
}

