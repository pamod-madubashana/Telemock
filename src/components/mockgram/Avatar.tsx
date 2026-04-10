import { cn } from "@/lib/utils";

interface AvatarProps {
  initials: string;
  color: string;
  size?: 'sm' | 'md' | 'lg';
  online?: boolean;
  className?: string;
}

const sizeMap = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-11 h-11 text-sm',
  lg: 'w-16 h-16 text-lg',
};

export function ChatAvatar({ initials, color, size = 'md', online, className }: AvatarProps) {
  return (
    <div className={cn("relative flex-shrink-0", className)}>
      <div
        className={cn(
          "rounded-full flex items-center justify-center font-semibold text-primary-foreground select-none",
          sizeMap[size]
        )}
        style={{ backgroundColor: color }}
      >
        {initials}
      </div>
      {online && (
        <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-online border-2 border-card" />
      )}
    </div>
  );
}
