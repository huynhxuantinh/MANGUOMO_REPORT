import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";

import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-xl text-sm font-semibold transition duration-200 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500",
  {
    variants: {
      variant: {
        default:
          "bg-[linear-gradient(135deg,#0f766e_0%,#0f6b95_100%)] text-white shadow-[0_8px_18px_rgba(15,118,110,0.24)] hover:translate-y-[-1px] hover:shadow-[0_12px_20px_rgba(15,107,149,0.28)]",
        secondary:
          "border border-slate-300 bg-white text-slate-800 shadow-sm hover:bg-slate-50 hover:border-slate-400",
        ghost: "bg-transparent text-slate-700 hover:bg-slate-100",
        outline: "border border-cyan-700 bg-cyan-50 text-cyan-900 hover:bg-cyan-100",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-11 px-6",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({ className, variant, size, asChild = false, ...props }) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}

export { Button };
