import React from 'react';
import { Building2, Code } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Entity {
  id: number;
  code: string;
  name: string;
}

interface EntityDetailsProps {
  entity: Entity;
  expanded?: boolean;
}

const EntityDetails: React.FC<EntityDetailsProps> = ({ entity, expanded = false }) => {
  return (
    <div className={cn(
      "grid gap-6",
      expanded ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-2",
      "p-6"
    )}>
      {/* Informations de base */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-gray-500" />
          Informations de l'entité
        </h4>
        <div className="space-y-3">
          <div className="p-4 rounded-lg bg-gray-50/50 border border-gray-100 hover:bg-gray-50 transition-colors">
            <span className="text-xs font-medium text-gray-500 flex items-center gap-1.5 mb-1">
              <Building2 className="w-3.5 h-3.5" />
              Nom de l'entité
            </span>
            <p className="text-sm font-medium text-gray-900">{entity.name}</p>
          </div>

          <div className="p-4 rounded-lg bg-gray-50/50 border border-gray-100 hover:bg-gray-50 transition-colors">
            <span className="text-xs font-medium text-gray-500 flex items-center gap-1.5 mb-1">
              <Code className="w-3.5 h-3.5" />
              Code de l'entité
            </span>
            <p className="text-sm font-medium text-gray-900">{entity.code}</p>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-gray-500" />
          Statistiques
        </h4>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 rounded-lg bg-gray-50/50 border border-gray-100 hover:bg-gray-50 transition-colors">
            <span className="text-xs font-medium text-gray-500">Clients</span>
            <p className="text-lg font-semibold text-gray-900 mt-1">0</p>
          </div>
          <div className="p-4 rounded-lg bg-gray-50/50 border border-gray-100 hover:bg-gray-50 transition-colors">
            <span className="text-xs font-medium text-gray-500">Sites</span>
            <p className="text-lg font-semibold text-gray-900 mt-1">0</p>
          </div>
          <div className="p-4 rounded-lg bg-gray-50/50 border border-gray-100 hover:bg-gray-50 transition-colors">
            <span className="text-xs font-medium text-gray-500">Offres</span>
            <p className="text-lg font-semibold text-gray-900 mt-1">0</p>
          </div>
          <div className="p-4 rounded-lg bg-gray-50/50 border border-gray-100 hover:bg-gray-50 transition-colors">
            <span className="text-xs font-medium text-gray-500">Affaires</span>
            <p className="text-lg font-semibold text-gray-900 mt-1">0</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EntityDetails;