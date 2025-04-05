import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

// Types pour définir la structure des données
export interface StatData {
  id: string;           // Identifiant unique pour la statistique
  title: string;        // Titre de la statistique
  value: string | number; // Valeur principale
  formattedValue?: string; // Valeur formatée (optionnelle, si différente de value)
  icon?: React.ReactNode; // Icône personnalisée (optionnelle)
  iconBgColor?: string;  // Couleur de fond de l'icône (optionnelle)
  iconColor?: string;    // Couleur de l'icône (optionnelle)
  trend?: {
    value: number;       // Valeur de la tendance (peut être négative)
    label?: string;      // Libellé explicatif (ex: "vs période précédente")
    period?: string;     // Période de comparaison (ex: "vs mois dernier")
  };
  footerText?: string;   // Texte de pied de carte (optionnel)
  footerIcon?: React.ReactNode; // Icône du pied de carte (optionnelle)
  onClick?: () => void;  // Fonction de clic (optionnelle)
  className?: string;    // Classes CSS supplémentaires (optionnelles)
}

export interface KTCardStatProps {
  stat: StatData;
  className?: string;
}

// Composant pour afficher une carte de statistique individuelle
export const KTCardStat: React.FC<KTCardStatProps> = ({ stat, className }) => {
  const {
    title,
    value,
    formattedValue,
    icon,
    iconBgColor = 'bg-primary/10',
    iconColor = 'text-primary',
    trend,
    footerText,
    footerIcon,
    onClick
  } = stat;

  // Déterminer si la tendance est positive, négative ou neutre
  const trendDirection = trend ? (trend.value > 0 ? 'up' : trend.value < 0 ? 'down' : 'neutral') : 'neutral';
  
  // Formater la valeur de tendance pour l'affichage (avec signe + si positif)
  const formattedTrend = trend 
    ? (trendDirection === 'up' 
        ? `+${Math.abs(trend.value).toFixed(1)}%` 
        : trendDirection === 'down' 
          ? `-${Math.abs(trend.value).toFixed(1)}%` 
          : '0%')
    : null;

  return (
    <Card 
      className={cn("overflow-hidden transition-all hover:shadow-md", 
        onClick ? "cursor-pointer" : "", 
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {icon && (
          <div className={cn("p-2 rounded-full", iconBgColor)}>
            <div className={iconColor}>{icon}</div>
          </div>
        )}
      </CardHeader>
      <CardContent className="pb-3">
        <div className="text-2xl font-bold">
          {formattedValue || value}
        </div>
        
        {trend && (
          <div className="flex items-center gap-1 mt-1">
            <div className={cn(
              "flex items-center text-xs",
              trendDirection === 'up' ? "text-green-600" : 
              trendDirection === 'down' ? "text-red-600" : 
              "text-muted-foreground"
            )}>
              {trendDirection === 'up' ? <TrendingUp className="w-3 h-3 mr-1" /> : 
               trendDirection === 'down' ? <TrendingDown className="w-3 h-3 mr-1" /> : null}
              <span>{formattedTrend}</span>
            </div>
            {trend.label && (
              <span className="text-xs text-muted-foreground">{trend.label}</span>
            )}
          </div>
        )}
      </CardContent>
      
      {(footerText || footerIcon) && (
        <CardFooter className="pt-0 pb-3">
          <div className="flex items-center text-xs text-muted-foreground">
            {footerIcon && <span className="mr-1">{footerIcon}</span>}
            {footerText}
          </div>
        </CardFooter>
      )}
    </Card>
  );
};

// Types pour la grille de statistiques
export interface KDStatsProps {
  stats: StatData[];
  className?: string;
  columns?: 3 | 4 | 6 | 8;  // Nombre de colonnes à afficher (3, 4 ou 6)
  gap?: 'sm' | 'md' | 'lg';  // Taille de l'espacement entre les cartes
}

// Composant pour afficher une grille de cartes de statistiques
export const KDStats: React.FC<KDStatsProps> = ({ 
  stats, 
  className,
  columns = 4,
  gap = 'md'
}) => {
  // Déterminer la classe de grille en fonction du nombre de colonnes
  const gridClass = {
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    6: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6',
    8: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-8'
  }[columns];

  // Déterminer la classe d'espacement en fonction de la taille du gap
  const gapClass = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6'
  }[gap];

  return (
    <div className={cn('grid', gridClass, gapClass, className)}>
      {stats.map((stat) => (
        <KTCardStat key={stat.id} stat={stat} />
      ))}
    </div>
  );
};

