import { cn } from "@/lib/utils";

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  centered?: boolean;
  as?: React.ElementType;
}

export function Container({
  className,
  children,
  maxWidth = "full",
  centered = true,
  as: Component = "div",
  ...props
}: ContainerProps) {
  const maxWidthClasses = {
    xs: "max-w-xs",
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    full: "max-w-full",
  };

  return (
    <Component
      className={cn(
        "p-6",
        maxWidthClasses[maxWidth],
        centered && "mx-auto",
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}