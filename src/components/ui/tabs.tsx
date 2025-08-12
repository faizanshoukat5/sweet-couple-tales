import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/lib/utils"

const Tabs = TabsPrimitive.Root

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => {
  // Add role and aria-label for accessibility
  return (
    <TabsPrimitive.List
      ref={ref}
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
        className
      )}
      role="tablist"
      aria-label={props['aria-label'] || 'Tabs'}
      onKeyDown={e => {
        // Arrow key navigation for horizontal tablists
        const isHorizontal = true; // Only horizontal supported in this UI
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
        const triggers = Array.from((e.currentTarget as HTMLElement).querySelectorAll('[role="tab"]')) as HTMLElement[];
        const current = document.activeElement;
        const idx = triggers.indexOf(current as HTMLElement);
        if (idx === -1) return;
        let nextIdx = idx;
        if (e.key === 'ArrowLeft') nextIdx = (idx - 1 + triggers.length) % triggers.length;
        if (e.key === 'ArrowRight') nextIdx = (idx + 1) % triggers.length;
        if (e.key === 'Home') nextIdx = 0;
        if (e.key === 'End') nextIdx = triggers.length - 1;
        triggers[nextIdx]?.focus();
        e.preventDefault();
      }}
      {...props}
    />
  );
});
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-rose-500 focus-visible:border-rose-500 focus-visible:z-10 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
      className
    )}
    tabIndex={0}
    role="tab"
    aria-selected={props['data-state'] === 'active' ? 'true' : 'false'}
    {...props}
  />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
