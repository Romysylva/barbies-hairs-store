import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface LabelProps {
  className?: string;
  children: ReactNode;
  required?: boolean;
}

export default function Label({ className, children, required }: LabelProps) {
  return (
    <div
      className={cn(
        `bhs:text-sm bhs:lg:text-base bhs:h-fit ${className ?? ""}`
      )}
    >
      <label>{children}</label>
      {required && <span className="bhs:text-red-500 ml-1">*</span>}
    </div>
  );
}
