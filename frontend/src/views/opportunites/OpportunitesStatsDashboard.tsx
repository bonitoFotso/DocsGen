import { StatutStat, Totaux } from '@/types/opportunite.types';
import React from 'react';


export interface OpportunitesStatsProps {
  data: {
    par_statut: StatutStat[];
    totaux: Totaux;
  };
}

// interface ChartDataItem {
//   statut: string;
//   montant: number;
//   montant_estime: number;
// }

const formatMontant = (montant: number): string => {
  if (montant >= 1000000) {
    return `${(montant / 1000000).toFixed(1)} MFCFA`;
  } else if (montant >= 1000) {
    return `${(montant / 1000).toFixed(1)} KFCFA`;
  }
  return `${montant} €`;
};

// Définir des couleurs pour les différents statuts
const getStatusColor = (statut: string): string => {
  const colors: Record<string, string> = {
    'PROSPECT': 'indigo',
    'QUALIFICATION': 'blue',
    'PROPOSITION': 'cyan',
    'NEGOCIATION': 'amber',
    'GAGNE': 'emerald',
    'PERDU': 'rose'
  };
  
  return colors[statut] || 'gray';
};

const StatusBadge: React.FC<{ statut: string }> = ({ statut }) => {
  const color = getStatusColor(statut);
  const colorClasses: Record<string, string> = {
    'indigo': 'bg-indigo-100 text-indigo-800',
    'blue': 'bg-blue-100 text-blue-800',
    'cyan': 'bg-cyan-100 text-cyan-800',
    'amber': 'bg-amber-100 text-amber-800',
    'emerald': 'bg-emerald-100 text-emerald-800',
    'rose': 'bg-rose-100 text-rose-800',
    'gray': 'bg-gray-100 text-gray-800'
  };
  
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClasses[color]}`}>
      {statut}
    </span>
  );
};

const StatCard: React.FC<{ 
  title: string; 
  value: string | number; 
  subValue?: string | number;
  subLabel?: string;
  icon?: React.ReactNode;
  color: string;
}> = ({ title, value, subValue, subLabel, icon, color }) => {
  const colorClasses: Record<string, { bg: string, text: string, border: string }> = {
    'blue': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    'green': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
    'red': { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
    'amber': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
    'purple': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
    'indigo': { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  };
  
  const { bg, text, border } = colorClasses[color] || colorClasses['blue'];
  
  return (
    <div className={`rounded-xl shadow-sm border ${border} ${bg} p-4 flex flex-col transition-all duration-200 hover:shadow-md`}>
      <div className="flex justify-between items-start mb-2">
        <h3 className={`text-sm font-medium ${text}`}>{title}</h3>
        {icon}
      </div>
      <div className="flex-1">
        <p className={`text-2xl font-bold ${text}`}>{value}</p>
        {subValue !== undefined && (
          <div className="mt-1 flex items-center">
            <span className="text-sm text-gray-500">{subLabel}: </span>
            <span className="ml-1 text-sm font-medium">{subValue}</span>
          </div>
        )}
      </div>
    </div>
  );
};

const OpportunitesStatsDashboard: React.FC<OpportunitesStatsProps> = ({ data }) => {
  const { par_statut, totaux } = data;
  
  // Préparer les données pour le graphique
  // const chartData: ChartDataItem[] = par_statut.map(item => ({
  //   statut: item.statut,
  //   montant: item.montant_total,
  //   montant_estime: item.montant_estime_total,
  // }));

  // Calculer le taux de conversion (opportunités gagnées / total)
  const conversionRate = totaux.total_opportunities > 0 
    ? ((totaux.opportunites_gagnees / totaux.total_opportunities) * 100).toFixed(1) 
    : '0';

  return (
    <div className="p-6  mx-auto">
      
      {/* KPIs - Première ligne */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <StatCard 
          title="Total Opportunités" 
          value={totaux.total_opportunities}
          subValue={totaux.opportunites_en_cours}
          subLabel="En cours"
          color="blue"
        />
        <StatCard 
          title="Opportunités Gagnées" 
          value={totaux.opportunites_gagnees}
          subValue={`${conversionRate}%`}
          subLabel="Taux de conversion"
          color="purple"
        />
        <StatCard 
          title="Opportunités Perdues" 
          value={totaux.opportunites_perdues}
          color="red"
        />
        
        {par_statut.map((item, index) => (
          <div key={index} className="rounded-xl shadow-sm border border-gray-200 bg-white p-4 hover:shadow-md transition-shadow duration-200">
            <div className="flex justify-between items-start mb-3">
              <StatusBadge statut={item.statut} />
              <span className="text-sm font-medium text-gray-500">{item.count} opportunité{item.count > 1 ? 's' : ''}</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-3">
              <div>
                <p className="text-xs text-gray-500 mb-1">Montant actuel</p>
                <p className="text-lg font-bold text-gray-800">{formatMontant(item.montant_total)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Montant estimé</p>
                <p className="text-lg font-bold text-gray-800">{formatMontant(item.montant_estime_total)}</p>
              </div>
            </div>
            
            {/* Indicateur visuel du rapport entre montant actuel et estimé */}
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ 
                    width: `${Math.min(
                      100, 
                      item.montant_estime_total > 0 
                        ? (item.montant_total / item.montant_estime_total) * 100 
                        : 0
                    )}%` 
                  }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {item.montant_estime_total > 0 
                  ? `${((item.montant_total / item.montant_estime_total) * 100).toFixed(1)}% du potentiel réalisé` 
                  : 'Aucun montant estimé'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OpportunitesStatsDashboard;