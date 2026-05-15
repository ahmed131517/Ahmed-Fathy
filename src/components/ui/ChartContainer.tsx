import React from 'react';
import { cn } from '@/lib/utils';

export function ChartContainer({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("w-full h-[320px] min-w-0", className)}>
      {children}
    </div>
  );
}
