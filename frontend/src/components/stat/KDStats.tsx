import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  BarChart4,
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  DollarSign,
  FileText,
  Briefcase,
  Hash,
  CheckCircle,
  Clock,
  XCircle,
  Circle,
  BarChart
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Type pour représenter un élément de statistique
export interface StatItem {
  id: string;
  label: string;
  value: number | string;
  change?: number;
  changeText?: string;
  icon?: keyof typeof iconMapping;
  color?: keyof typeof colorMapping;
}

// Type pour les options de configuration
export interface KDStatsConfig {
  items: StatItem[];
  columns?: 2 | 3 | 4 | 5;
  showChanges?: boolean;
  showIcons?: boolean;
  variant?: 'default' | 'bordered' | 'minimal';
  size?: 'default' | 'sm' | 'lg';
}

// Props du composant
interface KDStatsProps {
  data?: unknown[] | null; // Données brutes
  config: KDStatsConfig;
  isLoading?: boolean;
  className?: string;
  title?: string;
  description?: string;
}

// Mapping des icônes
const iconMapping = {
  users: Users,
  chart: BarChart4,
  calendar: Calendar,
  money: DollarSign,
  file: FileText,
  briefcase: Briefcase,
  hash: Hash,
  success: CheckCircle,
  pending: Clock,
  error: XCircle,
  default: Circle,
  barChart: BarChart,
  trendUp: TrendingUp,
  trendDown: TrendingDown
};

// Mapping des couleurs
const colorMapping = {
  primary: "bg-primary/10 text-primary",
  secondary: "bg-secondary/10 text-secondary-foreground",
  blue: "bg-blue-100 text-blue-800",
  green: "bg-green-100 text-green-800",
  red: "bg-red-100 text-red-800",
  yellow: "bg-yellow-100 text-yellow-800",
  purple: "bg-purple-100 text-purple-800",
  gray: "bg-gray-100 text-gray-800",
  indigo: "bg-indigo-100 text-indigo-800",
  amber: "bg-amber-100 text-amber-800",
  teal: "bg-teal-100 text-teal-800",
  pink: "bg-pink-100 text-pink-800"
};

const KDStats: React.FC<KDStatsProps> = ({
  config,
  isLoading = false,
  className,
  title,
  description
}) => {
  // Configurer le nombre de colonnes
  const columns = config.columns || 4;
  const columnClass = {
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 md:grid-cols-4",
    5: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-5",
  }[columns];

  // Configurer la taille des statistiques
  const sizeClass = {
    default: "p-4",
    sm: "p-3",
    lg: "p-5",
  }[config.size || 'default'];

  // Configurer la variante d'affichage
  const variantClass = {
    default: "bg-card border shadow-sm",
    bordered: "border",
    minimal: "",
  }[config.variant || 'default'];

  return (
    <Card className={cn("overflow-hidden", className)}>
      {title && (
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{title}</CardTitle>
              {description && <p className="text-sm text-muted-foreground">{description}</p>}
            </div>
          </div>
        </CardHeader>
      )}
      <CardContent className={cn("p-0", title ? "" : "pt-4")}>
        <div className={cn("grid gap-4", columnClass)}>
          {isLoading
            ? Array(config.items.length || 4).fill(0).map((_, i) => (
                <div key={`skeleton-${i}`} className={cn("rounded-lg", variantClass, sizeClass)}>
                  <Skeleton className="h-4 w-1/3 mb-2" />
                  <Skeleton className="h-8 w-1/2 mt-1" />
                  {config.showChanges && <Skeleton className="h-4 w-1/4 mt-2" />}
                </div>
              ))
            : config.items.map((item) => {
                const IconComponent = iconMapping[item.icon || 'default'];
                const colorClass = item.color ? colorMapping[item.color] : "bg-primary/10 text-primary";
                
                return (
                  <div 
                    key={item.id} 
                    className={cn(
                      "rounded-lg",
                      variantClass,
                      sizeClass
                    )}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-sm font-medium text-muted-foreground">{item.label}</span>
                      {config.showIcons && IconComponent && (
                        <div className={cn("p-1.5 rounded-md", colorClass)}>
                          <IconComponent className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                    
                    <div className="text-2xl font-bold">
                      {item.value}
                    </div>
                    
                    {config.showChanges && item.change !== undefined && (
                      <div className="mt-1 flex items-center text-xs">
                        {item.change > 0 ? (
                          <>
                            <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
                            <span className="text-green-600 font-medium">+{item.change}%</span>
                          </>
                        ) : item.change < 0 ? (
                          <>
                            <TrendingDown className="h-3 w-3 mr-1 text-red-600" />
                            <span className="text-red-600 font-medium">{item.change}%</span>
                          </>
                        ) : (
                          <span className="text-muted-foreground">Stable</span>
                        )}
                        
                        {item.changeText && (
                          <span className="ml-1 text-muted-foreground">{item.changeText}</span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
        </div>
      </CardContent>
    </Card>
  );
};

export default KDStats;