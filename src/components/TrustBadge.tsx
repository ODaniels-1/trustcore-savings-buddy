import { cn } from '@/lib/utils';

interface TrustBadgeProps {
  score: number;
  size?: 'sm' | 'lg';
}

const TrustBadge = ({ score, size = 'sm' }: TrustBadgeProps) => {
  const variant = score >= 80 ? 'success' : score >= 60 ? 'warning' : 'destructive';

  return (
    <span
      className={cn(
        'inline-flex items-center font-semibold rounded-full',
        size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-4 py-1.5 text-lg',
        variant === 'success' && 'bg-success/15 text-success',
        variant === 'warning' && 'bg-warning/15 text-warning',
        variant === 'destructive' && 'bg-destructive/15 text-destructive'
      )}
    >
      {score}%
    </span>
  );
};

export default TrustBadge;
