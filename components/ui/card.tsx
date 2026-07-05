import * as React from 'react';
import { cn } from '@/lib/utils';

export function Card({ className: class_name, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-border bg-card/80 text-card-foreground shadow-card backdrop-blur',
        class_name
      )}
      {...props}
    />
  );
}

export function CardHeader({ className: class_name, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('space-y-2 p-5', class_name)} {...props} />;
}

export function CardTitle({ className: class_name, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn('text-lg font-semibold tracking-tight', class_name)} {...props} />;
}

export function CardDescription({
  className: class_name,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-sm leading-6 text-muted-foreground', class_name)} {...props} />;
}

export function CardContent({ className: class_name, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-5 pt-0', class_name)} {...props} />;
}
