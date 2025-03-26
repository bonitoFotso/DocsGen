// components/client/ClientStats.tsx
import React from "react";
import { ClientDetails } from "@/types/client";
import { StatCard } from "./ClientComponents";
import {
  BarChart4,
  FileText,
  Briefcase,
  FileSearch,
  Hash,
  Building,
  Users,
} from "lucide-react";

interface ClientStatsProps {
  client: ClientDetails;
  onStatClick: (tabId: string) => void;
}

const ClientStats: React.FC<ClientStatsProps> = ({ client, onStatClick }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-7 gap-4">
      <StatCard
        label="Opportunités"
        value={client.opportunities?.length || 0}
        icon={<BarChart4 className="h-6 w-6" />}
        onClick={() => onStatClick("tab-opportunites")}
      />
      <StatCard
        label="Offres"
        value={client.offres_count || 0}
        icon={<FileText className="h-6 w-6" />}
        onClick={() => onStatClick("tab-offres")}
      />
      <StatCard
        label="Affaires"
        value={client.affaires_count || 0}
        icon={<Briefcase className="h-6 w-6" />}
        onClick={() => onStatClick("tab-affaires")}
      />
      <StatCard
        label="Rapports"
        value={client.rapports?.length || 0}
        icon={<FileSearch className="h-6 w-6" />}
        onClick={() => onStatClick("tab-rapports")}
      />
      <StatCard
        label="Factures"
        value={client.factures_count || 0}
        icon={<Hash className="h-6 w-6" />}
        onClick={() => onStatClick("tab-factures")}
      />
      <StatCard
        label="Sites"
        value={client.sites?.length || 0}
        icon={<Building className="h-6 w-6" />}
        onClick={() => onStatClick("tab-sites")}
      />
      <StatCard
        label="Contacts"
        value={client.contacts_count || 0}
        icon={<Users className="h-6 w-6" />}
        onClick={() => onStatClick("tab-contacts")}
      />
    </div>
  );
};

export default ClientStats;
