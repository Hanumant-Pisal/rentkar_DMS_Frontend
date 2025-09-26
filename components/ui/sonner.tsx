"use client"
import { Toaster as Sonner } from "sonner"
type ToasterProps = React.ComponentProps<typeof Sonner>
const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="system"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          success: "group toast-success group-[.toaster]:bg-success/10 group-[.toaster]:text-success",
          error: "group toast-error group-[.toaster]:bg-destructive/10 group-[.toaster]:text-destructive",
          warning: "group toast-warning group-[.toaster]:bg-warning/10 group-[.toaster]:text-warning-foreground",
          info: "group toast-info group-[.toaster]:bg-info/10 group-[.toaster]:text-info-foreground",
        },
      }}
      {...props}
    />
  )
}
export { Toaster }
