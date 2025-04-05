import { AllKPIs } from '@/config/pro/extractKPIs';
import { useState, ReactNode } from 'react';
import { KDStats } from '../stat/KDStats2';
import { generateKpiDashboardStats } from '@/config/pro/generateCustomKpiStats';

// Types d'affichage disponibles
type DisplayType = 'default' | 'compact' | 'detailed' | 'card';

// Interface générique pour les props du composant
interface KDPageListProps<T> {
  title: string;
  kpi: AllKPIs | null;
  items: T[];
  displayType?: DisplayType;
  // Fonction pour déterminer comment afficher le titre de chaque élément
  getItemTitle: (item: T) => string;
  // Fonction optionnelle pour obtenir une description de l'élément
  getItemDescription?: (item: T) => string | null;
  // Fonction optionnelle pour déterminer les propriétés à afficher en mode détaillé
  getItemDetails?: (item: T) => Array<{ label: string; value: string | number | boolean | null }>;
  // Fonction pour rendre un élément personnalisé
  renderCustomItem?: (item: T, isSelected: boolean) => ReactNode;
  // Function appelée lors de la sélection d'un élément
  onItemSelect?: (item: T, index: number) => void;
}

// Définir le composant comme générique
function KDPageList<T>({ 
  title, 
  kpi,
  items = [] as T[], 
  displayType = 'default',
  renderCustomItem,
  onItemSelect
}: KDPageListProps<T>): JSX.Element {
  const [selectedItem, setSelectedItem] = useState<number | null>(null);

  // Gérer la sélection d'un élément
  const handleItemClick = (item: T, index: number): void => {
    const newSelectedIndex = index === selectedItem ? null : index;
    setSelectedItem(newSelectedIndex);
    
    if (onItemSelect) {
      onItemSelect(item, index);
    }
  };

  const dashboardStats = kpi ? generateKpiDashboardStats(kpi) : null;

  // Fonction pour rendre un élément en fonction du type d'affichage
  const renderItem = (item: T, index: number): ReactNode => {
    const isSelected = selectedItem === index;
    
    // Si une fonction de rendu personnalisée est fournie, l'utiliser
    if (renderCustomItem) {
      return renderCustomItem(item, isSelected);
    }
    
    
  };

  return (
    <div className="mx-auto p-6 bg-white rounded-lg shadow-md">
      <KDStats 
        stats={dashboardStats || []}
        columns={4}
      />
      {/* En-tête avec le titre */}
      <div className="border-b border-gray-200 pb-4 mb-4">
        <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
      </div>

      {/* Liste des éléments */}
      <div className={`grid gap-2 ${displayType === 'compact' ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-1'}`}>
        {items.length > 0 ? (
          items.map((item, index) => (
            <div key={index} onClick={() => handleItemClick(item, index)}>
              {renderItem(item, index)}
            </div>
          ))
        ) : (
          <div className="p-4 text-center text-gray-500 bg-gray-50 rounded-md col-span-full">
            Aucun élément à afficher
          </div>
        )}
      </div>
    </div>
  );
}

export default KDPageList;