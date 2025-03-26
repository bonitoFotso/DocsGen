/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo } from "react";
import { Offer, StatsConfig } from "./types";

export function useKDStats(data: Offer[], config: StatsConfig) {
  const [activeCards, setActiveCards] = useState<string[]>(
    config.cards.map((card) => card.id)
  );

  const toggleCard = (cardId: string) => {
    if (activeCards.includes(cardId)) {
      setActiveCards(activeCards.filter((id) => id !== cardId));
    } else {
      setActiveCards([...activeCards, cardId]);
    }
  };

  const calculateCardValue = (cardConfig: any, data: Offer[]) => {
    // If custom calculation function is provided
    if (cardConfig.calculation) {
      return cardConfig.calculation(data);
    }

    // Filter data if filter is provided
    const filteredData = cardConfig.filter
      ? data.filter(cardConfig.filter)
      : data;

    switch (cardConfig.type) {
      case "amount":
        return filteredData.reduce(
          (sum, item) => sum + parseFloat(item.montant || "0"),
          0
        );

      case "count":
        return filteredData.length;

      case "percentage":
        if (data.length === 0) return 0;
        return (filteredData.length / data.length) * 100;

      case "distribution":
        return filteredData.reduce((acc, item) => {
          const key = item[cardConfig.dataKey as keyof Offer] as string;

          if (typeof key === "string") {
            acc[key] = (acc[key] || 0) + 1;
          } else if (typeof key === "object" && key !== null) {
            const nestedKey =
              (key as { name?: string; code?: string }).name ||
              (key as { name?: string; code?: string }).code ||
              JSON.stringify(key);
            acc[nestedKey] = (acc[nestedKey] || 0) + 1;
          }

          return acc;
        }, {} as Record<string, number>);

      default:
        return 0;
    }
  };

  const cardValues = useMemo(() => {
    return config.cards.reduce((acc, cardConfig) => {
      acc[cardConfig.id] = calculateCardValue(cardConfig, data);
      return acc;
    }, {} as Record<string, any>);
  }, [data, config.cards]);

  const visibleCards = useMemo(() => {
    return config.cards.filter((card) => activeCards.includes(card.id));
  }, [config.cards, activeCards]);

  return {
    cardValues,
    visibleCards,
    toggleCard,
    activeCards,
  };
}
