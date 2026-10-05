"use client"

import {
  CircleCheck,
  Info,
  LoaderCircle,
  OctagonX,
  TriangleAlert,
} from "lucide-react"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      icons={{
        success: <CircleCheck className="h-4 w-4" />,
        info: <Info className="h-4 w-4" />,
        warning: <TriangleAlert className="h-4 w-4" />,
        error: <OctagonX className="h-4 w-4" />,
        loading: <LoaderCircle className="h-4 w-4 animate-spin" />,
      }}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white group-[.toaster]:text-[#1A1A18] group-[.toaster]:border-[#E8E4DF] group-[.toaster]:shadow-sm group-[.toaster]:font-sans",
          description: "group-[.toast]:text-[#6B6560]",
          actionButton:
            "group-[.toast]:bg-[#C2552A] group-[.toast]:text-white",
          cancelButton:
            "group-[.toast]:bg-[#F4F1EC] group-[.toast]:text-[#6B6560]",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
