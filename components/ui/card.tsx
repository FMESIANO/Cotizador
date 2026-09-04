import { HTMLAttributes } from "react";

export function Card({ className = "", children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`bg-white/90 backdrop-blur-xl border border-gray-100 rounded-2xl ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
