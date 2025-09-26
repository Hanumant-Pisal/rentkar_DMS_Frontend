import { cn } from '@/lib/utils';
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}
export default function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-6 w-6 border-2',
    lg: 'h-12 w-12 border-4',
  };
  return (
    <div className={cn('relative', className)}>
      <div className={cn(
        'absolute inset-0 rounded-full border-t-2 border-b-2 border-gray-200',
        sizeClasses[size]
      )}></div>
      <div className={cn(
        'animate-spin rounded-full border-2 border-primary border-t-transparent',
        sizeClasses[size]
      )}></div>
    </div>
  );
}
