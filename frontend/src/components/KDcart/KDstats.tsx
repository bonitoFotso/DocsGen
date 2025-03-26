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
  ArrowUpIcon,
  ArrowDownIcon,
  InfoIcon,
  ActivityIcon,
  BarChartIcon,
  DollarSignIcon,
  FileTextIcon,
} from "lucide-react";
import { useKDStats } from "./useKDStats";
import { Offer, StatsConfig } from "./types";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

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

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {visibleCards.map((cardConfig) => {
          const value = cardValues[cardConfig.id];

          return (
            <Card
              key={cardConfig.id}
              className={`overflow-hidden transition-all hover:shadow-md ${
                cardConfig.colorClass || ""
              }`}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {cardConfig.title}
                </CardTitle>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className={`rounded-full p-1 ${
                          cardConfig.colorClass
                            ? "text-white"
                            : "text-muted-foreground"
                        }`}
                      >
                        {cardConfig.icon || defaultIcons[cardConfig.type] || (
                          <InfoIcon className="h-4 w-4" />
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        {cardConfig.tooltipText ||
                          `Statistiques pour ${cardConfig.title}`}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatValue(
                    value,
                    cardConfig.type,
                    cardConfig.prefix,
                    cardConfig.suffix
                  )}
                </div>

                {cardConfig.trend && (
                  <p className="text-xs text-muted-foreground mt-1 flex items-center">
                    {cardConfig.trend.type === "up" ? (
                      <ArrowUpIcon className="h-3 w-3 mr-1 text-green-500" />
                    ) : (
                      <ArrowDownIcon className="h-3 w-3 mr-1 text-red-500" />
                    )}
                    <span
                      className={
                        cardConfig.trend.type === "up"
                          ? "text-green-500"
                          : "text-red-500"
                      }
                    >
                      {cardConfig.trend.value}%
                    </span>
                    <span className="ml-1"> {cardConfig.trend.period}</span>
                  </p>
                )}
              </CardContent>

              {cardConfig.type === "distribution" &&
                typeof value === "object" && (
                  <CardFooter className="px-2 pt-0 pb-2">
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(value)
                        .sort((a, b) => (b[1] as number) - (a[1] as number))
                        .slice(0, 3)
                        .map(([key, count]) => (
                          <Badge
                            key={key}
                            variant="outline"
                            className="text-xs"
                          >
                            {key.length > 10
                              ? `${key.substring(0, 10)}...`
                              : key}
                            : {String(count)}
                          </Badge>
                        ))}
                    </div>
                  </CardFooter>
                )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
