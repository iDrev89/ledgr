"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const SidebarContext = React.createContext<{
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  railHovered: boolean
  setRailHovered: React.Dispatch<React.SetStateAction<boolean>>
}>({
  open: true,
  setOpen: () => undefined,
  railHovered: false,
  setRailHovered: () => undefined,
})

interface SidebarProviderProps {
  defaultOpen?: boolean
  children: React.ReactNode
}

const SidebarProvider = ({ defaultOpen = true, children }: SidebarProviderProps) => {
  const [open, setOpen] = React.useState(defaultOpen)
  const [railHovered, setRailHovered] = React.useState(false)

  return (
    <SidebarContext.Provider value={{ open, setOpen, railHovered, setRailHovered }}>{children}</SidebarContext.Provider>
  )
}

const useSidebar = () => {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}

const Sidebar = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const { open, railHovered } = useSidebar()

    return (
      <div
        ref={ref}
        className={cn(
          "group relative flex h-full flex-col overflow-hidden bg-background data-[state=open]:w-80 data-[state=closed]:w-16 data-[rail-hovered=true]:w-80",
          className,
        )}
        data-state={open ? "open" : "closed"}
        data-rail-hovered={railHovered}
        {...props}
      />
    )
  },
)
Sidebar.displayName = "Sidebar"

const SidebarHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return <div ref={ref} className={cn("", className)} {...props} />
  },
)
SidebarHeader.displayName = "SidebarHeader"

const SidebarContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return <div ref={ref} className={cn("overflow-auto", className)} {...props} />
  },
)
SidebarContent.displayName = "SidebarContent"

const SidebarGroup = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return <div ref={ref} className={cn("py-2", className)} {...props} />
  },
)
SidebarGroup.displayName = "SidebarGroup"

const SidebarGroupLabel = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const { open, railHovered } = useSidebar()

    return (
      <div
        ref={ref}
        className={cn(
          "mb-2 px-4 text-xs font-medium text-muted-foreground opacity-0 group-[[data-state=open]]:opacity-100 group-[[data-rail-hovered=true]]:opacity-100",
          className,
        )}
        {...props}
      />
    )
  },
)
SidebarGroupLabel.displayName = "SidebarGroupLabel"

const SidebarGroupContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return <div ref={ref} className={cn("", className)} {...props} />
  },
)
SidebarGroupContent.displayName = "SidebarGroupContent"

const SidebarMenu = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return <div ref={ref} className={cn("", className)} {...props} />
  },
)
SidebarMenu.displayName = "SidebarMenu"

const SidebarMenuItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return <div ref={ref} className={cn("", className)} {...props} />
  },
)
SidebarMenuItem.displayName = "SidebarMenuItem"

const sidebarMenuButtonVariants = cva(
  "group flex h-9 cursor-pointer items-center gap-2 rounded-md px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&[data-active]]:bg-accent [&[data-active]]:text-accent-foreground",
  {
    variants: {
      variant: {
        default: "",
        ghost: "hover:bg-transparent hover:text-accent-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
)

interface SidebarMenuButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof sidebarMenuButtonVariants> {
  asChild?: boolean
  isActive?: boolean
  tooltip?: string
}

const SidebarMenuButton = React.forwardRef<HTMLButtonElement, SidebarMenuButtonProps>(
  ({ className, variant, asChild = false, isActive, tooltip, children, ...props }, ref) => {
    const { open, railHovered } = useSidebar()

    if (asChild) {
      return (
        <Slot
          data-active={isActive ? true : undefined}
          className={cn(sidebarMenuButtonVariants({ variant, className }))}
          {...props}
        >
          {children}
        </Slot>
      )
    }

    return (
      <button
        ref={ref}
        data-active={isActive ? true : undefined}
        className={cn(sidebarMenuButtonVariants({ variant, className }))}
        {...props}
      >
        {children}
        {tooltip && !open && !railHovered && (
          <span className="absolute left-12 z-50 ml-4 min-w-max origin-left scale-0 rounded-md bg-accent p-2 text-xs font-medium text-accent-foreground shadow-md transition-all group-hover:scale-100">
            {tooltip}
          </span>
        )}
      </button>
    )
  },
)
SidebarMenuButton.displayName = "SidebarMenuButton"

const SidebarRail = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const { setRailHovered } = useSidebar()

    return (
      <div
        ref={ref}
        className={cn(
          "absolute right-0 top-0 h-full w-1 cursor-col-resize bg-transparent opacity-0 transition-all group-hover:opacity-100",
          className,
        )}
        onMouseEnter={() => setRailHovered(true)}
        onMouseLeave={() => setRailHovered(false)}
        {...props}
      />
    )
  },
)
SidebarRail.displayName = "SidebarRail"

const SidebarInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      />
    )
  },
)
SidebarInput.displayName = "SidebarInput"

export {
  SidebarProvider,
  useSidebar,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarRail,
  SidebarInput,
}
