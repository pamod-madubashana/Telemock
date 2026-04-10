import verifiedBadge from "@/assets/verified.png";
import { cn } from "@/lib/utils";

interface ChatTitleProps {
  title: string;
  verified?: boolean;
  className?: string;
  badgeClassName?: string;
}

export function ChatTitle({
  title,
  verified,
  className,
  badgeClassName,
}: ChatTitleProps) {
  return (
    <span className={cn("inline-flex min-w-0 items-center gap-1.5", className)}>
      <span className="truncate">{title}</span>
      {verified && (
        <img
          src={verifiedBadge}
          alt="Verified"
          className={cn("h-4 w-4 shrink-0", badgeClassName)}
        />
      )}
    </span>
  );
}
