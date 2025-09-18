import React from 'react';
import { cn } from './utils';

export function ScrollArea({ className, children, ...props }) {
  return (
    <div
      className={cn('relative overflow-hidden', className)}
      {...props}
    >
      <div className="h-full w-full rounded-[inherit] overflow-auto">
        {children}
      </div>
    </div>
  );
}
