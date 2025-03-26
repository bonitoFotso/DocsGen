/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "../ui/card";
import { Badge } from "../ui/badge";
import {
  InfoIcon,
  ActivityIcon,
  BarChartIcon,
  DollarSignIcon,
  FileTextIcon,
  TrendingUpIcon,
  TrendingDownIcon,
} from "lucide-react";
import { useKDStats } from "./useKDStats";
import { Offer, StatsConfig } from "./types";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { useState, useMemo } from "react";
import {  motion } from "framer-motion";

interface KDStatsProps {
  data: Offer[];
  config: StatsConfig;
  className?: string;
}

const defaultIcons = {
  amount: <DollarSignIcon className="h-4 w-4" />,
  count: <FileTextIcon className="h-4 w-4" />,
  percentage: <BarChartIcon className="h-4 w-4" />,
  distribution: <ActivityIcon className="h-4 w-4" />,
};

const formatValue = (value: any, type: string, prefix = "", suffix = "") => {
  if (typeof value === "number") {
    if (type === "amount") {
      return `${prefix}${value.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}${suffix}`;
    } else if (type === "percentage") {
      return `${prefix}${value.toFixed(1)}${suffix || "%"}`;
    } else {
      return `${prefix}${value.toLocaleString()}${suffix}`;
    }
  } else if (typeof value === "object") {
    // For distribution type, return the top value
    const entries = Object.entries(value);
    if (entries.length === 0) return "N/A";

    const [topKey, topValue] = entries.sort(
      (a, b) => (b[1] as number) - (a[1] as number)
    )[0];
    return `${topKey}: ${topValue}`;
  }

  return "N/A";
};

export function KDStats({ data, config, className }: KDStatsProps) {
  const { cardValues, visibleCards } = useKDStats(data, config);
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);
  const [expandedDistribution, setExpandedDistribution] = useState<string | null>(null);

  // Préfiltrer les cartes pour améliorer la performance
  const sortedVisibleCards = useMemo(() => {
    return [...visibleCards].sort((a, b) => {
      // Priorité aux cartes avec tendance
      if (a.trend && !b.trend) return -1;
      if (!a.trend && b.trend) return 1;
      // Ensuite par type
      const typeOrder = { amount: 1, percentage: 2, count: 3, distribution: 4 };
      return (typeOrder[a.type] || 999) - (typeOrder[b.type] || 999);
    });
  }, [visibleCards]);

  // Fonction pour déterminer le nombre de colonnes en fonction de la quantité de cartes
  const gridColumnClass = useMemo(() => {
    const count = visibleCards.length;
    if (count <= 2) return "grid-cols-1 sm:grid-cols-2";
    if (count <= 3) return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3";
    if (count <= 4) return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4";
    return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5";
  }, [visibleCards.length]);

  const handleToggleDistribution = (cardId: string) => {
    setExpandedDistribution(expandedDistribution === cardId ? null : cardId);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className={`grid ${gridColumnClass} gap-4`}>
        {sortedVisibleCards.map((cardConfig) => {
          const value = cardValues[cardConfig.id];
          const isHovered = hoveredCardId === cardConfig.id;
          const isExpanded = expandedDistribution === cardConfig.id;

          return (
            <motion.div
              key={cardConfig.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: sortedVisibleCards.indexOf(cardConfig) * 0.1 }}
              layout
              className="h-full"
            >
              <Card
                className={`overflow-hidden transition-all duration-300 h-full ${
                  isHovered ? "shadow-lg" : "hover:shadow-md"
                } ${cardConfig.colorClass || ""}`}
                onMouseEnter={() => setHoveredCardId(cardConfig.id)}
                onMouseLeave={() => setHoveredCardId(null)}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 h-16">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <span>{cardConfig.title}</span>
                    {cardConfig.trend && (
                      <Badge 
                        variant={cardConfig.trend.type === "up" ? "success" : "destructive"}
                        className="text-xs h-5"
                      >
                        {cardConfig.trend.type === "up" ? (
                          <TrendingUpIcon className="h-3 w-3 mr-1" />
                        ) : (
                          <TrendingDownIcon className="h-3 w-3 mr-1" />
                        )}
                        {cardConfig.trend.value}%
                      </Badge>
                    )}
                  </CardTitle>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          className={`rounded-full p-1 ${
                            cardConfig.colorClass
                              ? "text-white"
                              : "text-muted-foreground"
                          } transition-colors duration-200 hover:bg-muted cursor-help`}
                        >
                          {cardConfig.icon || defaultIcons[cardConfig.type] || (
                            <InfoIcon className="h-4 w-4" />
                          )}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="top" align="center" className="max-w-xs">
                        <p>
                          {cardConfig.tooltipText ||
                            `Statistiques pour ${cardConfig.title}`}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </CardHeader>
                <CardContent className="flex flex-col flex-grow">
                  <div className="text-2xl font-bold transition-all duration-300">
                    {formatValue(
                      value,
                      cardConfig.type,
                      cardConfig.prefix,
                      cardConfig.suffix
                    )}
                  </div>

                  {cardConfig.trend && (
                    <p className="text-xs mt-1 flex items-center">
                      <span
                        className={
                          cardConfig.trend.type === "up"
                            ? "text-green-500"
                            : "text-red-500"
                        }
                      >
                        {cardConfig.trend.period}
                      </span>
                    </p>
                  )}
                </CardContent>

                {cardConfig.type === "distribution" &&
                  typeof value === "object" && (
                    <CardFooter 
                      className="px-2 pt-0 pb-2 min-h-16"
                      onClick={() => handleToggleDistribution(cardConfig.id)}
                    >
                      <div className={`w-full transition-all duration-300 ${isExpanded ? 'cursor-zoom-out' : 'cursor-zoom-in'}`}>
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(value)
                            .sort((a, b) => (b[1] as number) - (a[1] as number))
                            .slice(0, isExpanded ? 10 : 3)
                            .map(([key, count], index) => (
                              <motion.div
                                key={key}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.05 }}
                              >
                                <Badge
                                  variant="outline"
                                  className={`text-xs ${isExpanded ? 'px-2 py-1' : ''}`}
                                >
                                  {key.length > (isExpanded ? 15 : 10)
                                    ? `${key.substring(0, isExpanded ? 15 : 10)}...`
                                    : key}
                                  : {String(count)}
                                </Badge>
                              </motion.div>
                            ))}
                          {Object.keys(value).length > 3 && !isExpanded && (
                            <Badge variant="outline" className="text-xs bg-muted/50">
                              +{Object.keys(value).length - 3} plus
                            </Badge>
                          )}
                        </div>
                        {isExpanded && Object.keys(value).length > 10 && (
                          <div className="text-xs text-center mt-2 text-muted-foreground">
                            Affichage de 10 sur {Object.keys(value).length} éléments
                          </div>
                        )}
                      </div>
                    </CardFooter>
                  )}
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}