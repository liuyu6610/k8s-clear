interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function LoadingSpinner({ size = "md", className }: LoadingSpinnerProps) {
  return (
    <div className={`loading-spinner loading-spinner-${size} ${className || ""}`}>
      <div className="spinner-ring"></div>
      <div className="spinner-ring"></div>
      <div className="spinner-ring"></div>
    </div>
  );
}

interface LoadingOverlayProps {
  message?: string;
}

export function LoadingOverlay({ message = "加载中..." }: LoadingOverlayProps) {
  return (
    <div className="loading-overlay">
      <LoadingSpinner size="lg" />
      <div className="loading-message">{message}</div>
    </div>
  );
}

