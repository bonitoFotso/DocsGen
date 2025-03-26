import React from "react";

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: BadgeVariant;
  children: React.ReactNode;
}

const variantStyles = {
  default: "bg-blue-500 text-white hover:bg-blue-600",
  secondary: "bg-gray-500 text-white hover:bg-gray-600",
  destructive: "bg-red-500 text-white hover:bg-red-600",
  outline: "border-2 border-gray-300 text-gray-700 hover:border-gray-400",
};

export const Badge = ({
  variant = "default",
  children,
  className = "",
  ...props
}: BadgeProps) => {
  return (
    <div
      className={`
        inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold
        transition-colors ${variantStyles[variant]} ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};
