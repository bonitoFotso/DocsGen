import { DollarSignIcon, BarChart2Icon } from "lucide-react";
import { Offer, StatsConfig } from "./components/KDcart/types";
import { KDStats } from "./components/KDcart/KDstats";

export function KDStatsExample() {
  const data: Offer[] = []; // Your data from API

  const statsConfig: StatsConfig = {
    cards: [
      {
        id: "total-amount",
        title: "Montant Total",
        type: "amount",
        icon: <DollarSignIcon className="h-4 w-4" />,
        prefix: "XAF ",
        tooltipText: "Montant total de toutes les offres",
        colorClass: "bg-blue-500 text-white",
        trend: {
          type: "up",
          value: 12.5,
          period: "mois dernier",
        },
      },
      {
        id: "won-amount",
        title: "Montant Gagné",
        type: "amount",
        icon: <DollarSignIcon className="h-4 w-4" />,
        prefix: "XAF ",
        filter: (item) => item.statut === "GAGNE",
        tooltipText: "Montant total des offres gagnées",
        colorClass: "bg-green-500 text-white",
      },
      {
        id: "success-rate",
        title: "Taux de Réussite",
        type: "percentage",
        icon: <BarChart2Icon className="h-4 w-4" />,
        suffix: "%",
        calculation: (data) => {
          const won = data.filter((item) => item.statut === "GAGNE").length;
          return data.length > 0 ? (won / data.length) * 100 : 0;
        },
        tooltipText: "Pourcentage des offres gagnées",
        colorClass: "bg-purple-500 text-white",
      },
      // {
      //   id: "client-distribution",
      //   title: "Clients",
      //   type: "distribution",
      //   calculation: (data) => {
      //     return data.reduce((acc, item) => {
      //       const client = item.client.nom;
      //       acc[client] = (acc[client] || 0) + 1;
      //       return acc;
      //     }, {} as Record<string, number>);
      //   },
      //   icon: <UsersIcon className="h-4 w-4" />,
      //   tooltipText: "Distribution des offres par client",
      //   colorClass: "bg-orange-500 text-white",
      // },
      // {
      //   id: "entity-distribution",
      //   title: "Entités",
      //   type: "distribution",
      //   calculation: (data) => {
      //     return data.reduce((acc, item) => {
      //       const entity = item.entity.name;
      //       acc[entity] = (acc[entity] || 0) + 1;
      //       return acc;
      //     }, {} as Record<string, number>);
      //   },
      //   icon: <TrendingUpIcon className="h-4 w-4" />,
      //   tooltipText: "Distribution des offres par entité",
      //   colorClass: "bg-indigo-500 text-white",
      // },
      // {
      //   id: "product-distribution",
      //   title: "Produits",
      //   type: "distribution",
      //   calculation: (data) => {
      //     const productCounts: Record<string, number> = {};

      //     data.forEach((item) => {
      //       item.produits.forEach((product) => {
      //         productCounts[product.name] =
      //           (productCounts[product.name] || 0) + 1;
      //       });
      //     });

      //     return productCounts;
      //   },
      //   icon: <CheckCircleIcon className="h-4 w-4" />,
      //   tooltipText: "Distribution des produits dans les offres",
      //   colorClass: "bg-pink-500 text-white",
      // },
    ],
    colorScheme: {
      primary: "white",
      secondary: "purple",
      accent: "indigo",
      success: "green",
      warning: "orange",
      danger: "red",
    },
  };

  return <KDStats data={data} config={statsConfig} />;
}
