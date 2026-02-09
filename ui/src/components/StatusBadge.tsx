import clsx from "clsx";

type Status = "Healthy" | "Degraded" | "Error" | "Pending" | "Running";

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span className={clsx("status-badge", `status-${status.toLowerCase()}`, className)}>
      <span className="status-dot"></span>
      {status}
    </span>
  );
}

