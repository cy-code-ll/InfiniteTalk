"use client"

import * as React from "react"
import { Popover, PopoverContent, PopoverTrigger } from "./popover"
import { cn } from "@/lib/utils"

interface TooltipProps {
  children: React.ReactNode
  content: React.ReactNode
  side?: "top" | "right" | "bottom" | "left"
  align?: "start" | "center" | "end"
  className?: string
}

const Tooltip = ({ children, content, side = "top", align = "center", className }: TooltipProps) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent 
        side={side} 
        align={align}
        className={cn(
          "w-auto max-w-xs p-2 text-sm bg-slate-900 text-white border-slate-700",
          className
        )}
      >
        {content}
      </PopoverContent>
    </Popover>
  )
}

const TooltipProvider = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>
}

const TooltipTrigger = ({ children, ...props }: { children: React.ReactNode } & React.HTMLAttributes<HTMLDivElement>) => {
  return <div {...props}>{children}</div>
}

const TooltipContent = ({ children, className, ...props }: { children: React.ReactNode; className?: string } & React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div 
      className={cn(
        "w-auto max-w-xs p-2 text-sm bg-slate-900 text-white border border-slate-700 rounded-md shadow-lg",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
