import { cn } from "@/lib/utils";

interface AvatarProps {
  initials: string;
  color: string;
  avatar?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  online?: boolean;
  className?: string;
}

const sizeMap = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-11 h-11 text-sm',
  lg: 'w-16 h-16 text-lg',
  xl: 'h-36 w-36 text-3xl',
};

export function ChatAvatar({ initials, color, avatar, size = 'md', online, className }: AvatarProps) {
  return (
    <div className={cn("relative flex-shrink-0", className)}>
      <div
        className={cn(
          "rounded-full flex items-center justify-center font-semibold text-primary-foreground select-none overflow-hidden",
          sizeMap[size]
        )}
        style={avatar ? undefined : { backgroundColor: color }}
      >
        {avatar ? (
          <img src={avatar} alt="" className="h-full w-full object-cover" />
        ) : (
          initials
        )}
      </div>
      {online && (
        <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-online border-2 border-card" />
      )}
    </div>
  );
}
