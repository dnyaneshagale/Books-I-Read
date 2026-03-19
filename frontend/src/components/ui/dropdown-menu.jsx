import React from 'react';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';

const DropdownMenu = DropdownMenuPrimitive.Root;
const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;

const mergeClasses = (...parts) => parts.filter(Boolean).join(' ');

const DropdownMenuContent = React.forwardRef(({ className, sideOffset = 8, ...props }, ref) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={mergeClasses(
        'z-[1000] min-w-44 overflow-hidden rounded-2xl border border-gray-200 bg-white p-1.5 text-gray-900 shadow-[0_8px_24px_rgba(0,0,0,0.12),0_2px_6px_rgba(0,0,0,0.08)]',
        'dark:border-white/10 dark:bg-[#1E1B24] dark:text-gray-100 dark:shadow-[0_8px_24px_rgba(0,0,0,0.45),0_2px_6px_rgba(0,0,0,0.25)]',
        'data-[state=open]:animate-[g-fadeIn_0.18s_ease]',
        className
      )}
      {...props}
    />
  </DropdownMenuPrimitive.Portal>
));
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName;

const DropdownMenuItem = React.forwardRef(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Item
    ref={ref}
    className={mergeClasses(
      'relative flex cursor-pointer select-none items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium outline-none',
      'text-[var(--color-text-primary)] dark:text-[var(--color-text-primary)]',
      'focus:bg-[var(--color-bg-tertiary)] dark:focus:bg-[var(--color-bg-secondary-dark)] data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      inset && 'pl-8',
      className
    )}
    {...props}
  />
));
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName;

const DropdownMenuSeparator = React.forwardRef(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Separator
    ref={ref}
    className={mergeClasses('my-1 h-px bg-[var(--color-border)] dark:bg-[var(--color-border-dark)]', className)}
    {...props}
  />
));
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName;

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
};
