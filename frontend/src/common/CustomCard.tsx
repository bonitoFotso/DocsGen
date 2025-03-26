// Card.tsx
import React from "react";

// Card Component
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Card = ({ children, className = "", ...props }: CardProps) => {
  return (
    <div
      className={`
        rounded-lg border border-gray-200 bg-white shadow-sm
        transition-all hover:shadow-md ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

// CardHeader Component
interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const CardHeader = ({
  children,
  className = "",
  ...props
}: CardHeaderProps) => {
  return (
    <div
      className={`
        flex flex-col space-y-1.5 p-6 
        border-b border-gray-200 ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

// CardTitle Component
interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
}

export const CardTitle = ({
  children,
  className = "",
  ...props
}: CardTitleProps) => {
  return (
    <h3
      className={`
        text-lg font-semibold leading-none tracking-tight
        text-gray-900 ${className}
      `}
      {...props}
    >
      {children}
    </h3>
  );
};

// CardContent Component
interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const CardContent = ({
  children,
  className = "",
  ...props
}: CardContentProps) => {
  return (
    <div className={`p-6 pt-0 ${className}`} {...props}>
      {children}
    </div>
  );
};

// CardFooter Component
interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const CardFooter = ({
  children,
  className = "",
  ...props
}: CardFooterProps) => {
  return (
    <div
      className={`
        flex items-center p-6 pt-0
        border-t border-gray-200 ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

// Example Usage Component
export const Example = () => {
  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
      </CardHeader>

      <CardContent>
        <p className="text-gray-600">
          This is an example card content. You can put any content here.
        </p>
      </CardContent>

      <CardFooter className="gap-2">
        <button className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600">
          Action
        </button>
        <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
          Cancel
        </button>
      </CardFooter>
    </Card>
  );
};
