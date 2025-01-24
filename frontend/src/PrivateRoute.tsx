import { ReactNode, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PrivateRouteProps {
  children: ReactNode;
  redirectTo?: string;
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ 
  children, 
  redirectTo = '/login' 
}) => {
  const { isAuth, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isAuth && !loading) {
      // Store the attempted URL for redirect after login
      navigate(redirectTo, {
        replace: true,
        state: { from: location.pathname }
      });
    }
  }, [isAuth, loading, navigate, location, redirectTo]);

  if (loading) {
    return (
      <div className={cn(
        "min-h-[40vh] flex flex-col items-center justify-center",
        "text-gray-600 dark:text-gray-300"
      )}>
        <Loader2 className="h-8 w-8 animate-spin mb-4" />
        <p className="text-sm font-medium">Verifying authentication...</p>
      </div>
    );
  }

  return isAuth ? <>{children}</> : null;
};