import React from "react";

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "destructive";
  children: React.ReactNode;
}

interface AlertTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
}

interface AlertDescriptionProps
  extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
}

const alertVariants = {
  default: "bg-white border-gray-200 text-gray-900",
  destructive: "bg-red-50 border-red-200 text-red-900",
};

export const Alert = ({
  variant = "default",
  children,
  className = "",
  ...props
}: AlertProps) => {
  return (
    <div
      role="alert"
      className={`
        relative w-full rounded-lg border p-4
        ${alertVariants[variant]} ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

export const AlertTitle = ({
  children,
  className = "",
  ...props
}: AlertTitleProps) => {
  return (
    <h5
      className={`mb-1 font-medium leading-none tracking-tight ${className}`}
      {...props}
    >
      {children}
    </h5>
  );
};

export const AlertDescription = ({
  children,
  className = "",
  ...props
}: AlertDescriptionProps) => {
  return (
    <div className={`text-sm leading-relaxed ${className}`} {...props}>
      {children}
    </div>
  );
};
