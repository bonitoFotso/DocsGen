import { KDStatsConfig, StatItem } from "./KDStats";

// Type d'analyse à effectuer sur les données
type AnalysisType = 'count' | 'sum' | 'average' | 'min' | 'max' | 'latest' | 'custom';

// Configuration pour chaque statistique
interface StatConfig {
  id: string;
  label: string;
  field?: string;
  analysisType: AnalysisType;
  icon?: string;
  color?: string;
  filter?: (item: unknown) => boolean;
  customAnalysis?: (data: unknown[]) => number | string;
  formatValue?: (value: number | string) => string;
  computeChange?: boolean;
  compareField?: string;
  comparePeriod?: 'day' | 'week' | 'month' | 'year';
}

/**
 * Factory pour générer des configurations de statistiques
 */
export class KDStatsFactory {
  private configs: StatConfig[] = [];
  private columns: 2 | 3 | 4 | 5 = 4;
  private showChanges: boolean = false;
  private showIcons: boolean = true;
  private variant: 'default' | 'bordered' | 'minimal' = 'default';
  private size: 'default' | 'sm' | 'lg' = 'default';
  private title?: string;
  private description?: string;

  /**
   * Ajoute une statistique de comptage
   */
  addCount(
    id: string, 
    label: string, 
    options?: { 
      filter?: (item: unknown) => boolean;
      icon?: string;
      color?: string;
      computeChange?: boolean;
    }
  ): KDStatsFactory {
    this.configs.push({
      id,
      label,
      analysisType: 'count',
      filter: options?.filter,
      icon: options?.icon || 'users',
      color: options?.color || 'blue',
      computeChange: options?.computeChange
    });
    return this;
  }

  /**
   * Ajoute une statistique de somme
   */
  addSum(
    id: string, 
    label: string, 
    field: string,
    options?: { 
      filter?: (item: unknown) => boolean;
      icon?: string;
      color?: string;
      formatValue?: (value: number) => string;
      computeChange?: boolean;
    }
  ): KDStatsFactory {
    this.configs.push({
      id,
      label,
      field,
      analysisType: 'sum',
      filter: options?.filter,
      icon: options?.icon || 'money',
      color: options?.color || 'green',
      formatValue: options?.formatValue as ((value: string | number) => string) | undefined,
      computeChange: options?.computeChange
    });
    return this;
  }

  /**
   * Ajoute une statistique de moyenne
   */
  addAverage(
    id: string, 
    label: string, 
    field: string,
    options?: { 
      filter?: (item: unknown) => boolean;
      icon?: string;
      color?: string;
      formatValue?: (value: number) => string;
      computeChange?: boolean;
    }
  ): KDStatsFactory {
    this.configs.push({
      id,
      label,
      field,
      analysisType: 'average',
      filter: options?.filter,
      icon: options?.icon || 'barChart',
      color: options?.color || 'purple',
      formatValue: options?.formatValue as ((value: string | number) => string) | undefined,
      computeChange: options?.computeChange
    });
    return this;
  }

  /**
   * Ajoute une statistique personnalisée
   */
  addCustom(
    id: string, 
    label: string, 
    customAnalysis: (data: unknown[]) => number | string,
    options?: { 
      icon?: string;
      color?: string;
      formatValue?: (value: number | string) => string;
      computeChange?: boolean;
    }
  ): KDStatsFactory {
    this.configs.push({
      id,
      label,
      analysisType: 'custom',
      customAnalysis,
      icon: options?.icon || 'chart',
      color: options?.color || 'indigo',
      formatValue: options?.formatValue,
      computeChange: options?.computeChange
    });
    return this;
  }

  /**
   * Configure le nombre de colonnes
   */
  setColumns(columns: 2 | 3 | 4 | 5): KDStatsFactory {
    this.columns = columns;
    return this;
  }

  /**
   * Affiche ou masque les indicateurs de changement
   */
  withChanges(show: boolean = true): KDStatsFactory {
    this.showChanges = show;
    return this;
  }

  /**
   * Affiche ou masque les icônes
   */
  withIcons(show: boolean = true): KDStatsFactory {
    this.showIcons = show;
    return this;
  }

  /**
   * Définit la variante d'affichage
   */
  setVariant(variant: 'default' | 'bordered' | 'minimal'): KDStatsFactory {
    this.variant = variant;
    return this;
  }

  /**
   * Définit la taille des statistiques
   */
  setSize(size: 'default' | 'sm' | 'lg'): KDStatsFactory {
    this.size = size;
    return this;
  }

  /**
   * Définit le titre du composant
   */
  setTitle(title: string, description?: string): KDStatsFactory {
    this.title = title;
    this.description = description;
    return this;
  }

  /**
   * Analyse les données et génère la configuration pour KDStats
   */
  buildConfig(data: Record<string, unknown>[]): KDStatsConfig {
    const items: StatItem[] = this.configs.map(config => {
      // Filtrer les données si nécessaire
      const filteredData = config.filter 
        ? data.filter(config.filter)
        : data;
      
      // Calculer la valeur en fonction du type d'analyse
      let value: number | string;
      
      switch (config.analysisType) {
        case 'count':
          value = filteredData.length;
          break;
          
        case 'sum':
          if (!config.field) throw new Error(`Field is required for sum analysis on ${config.id}`);
          value = filteredData.reduce((sum, item) => {
            const fieldValue = Number(item[config.field!]); 
            return sum + (isNaN(fieldValue) ? 0 : fieldValue);
          }, 0);
          break;
          
        case 'average':
          if (!config.field) throw new Error(`Field is required for average analysis on ${config.id}`);
          value = filteredData.length === 0 ? 0 : 
            filteredData.reduce((sum, item) => {
              const fieldValue = Number(item[config.field!]);
              return sum + (isNaN(fieldValue) ? 0 : fieldValue);
            }, 0) / filteredData.length;
          break;
          
        case 'min':
          if (!config.field) throw new Error(`Field is required for min analysis on ${config.id}`);
          value = filteredData.length === 0 ? 0 : 
            Math.min(...filteredData.map(item => Number(item[config.field!])));
          break;
          
        case 'max':
          if (!config.field) throw new Error(`Field is required for max analysis on ${config.id}`);
          value = filteredData.length === 0 ? 0 : 
            Math.max(...filteredData.map(item => Number(item[config.field!])));
          break;
          
        case 'custom':
          if (!config.customAnalysis) throw new Error(`Custom analysis function is required for ${config.id}`);
          value = config.customAnalysis(filteredData);
          break;
          
        default:
          value = 0;
      }
      
      // Formater la valeur si nécessaire
      const formattedValue = config.formatValue ? config.formatValue(value) : value;
      
      // Calculer le changement si nécessaire
      let change: number | undefined;
      let changeText: string | undefined;
      
      if (config.computeChange) {
        // Dans un cas réel, on calculerait le changement par rapport à une période précédente
        // Ici, on génère une valeur aléatoire pour l'exemple
        change = Math.round((Math.random() * 20 - 10) * 10) / 10;
        changeText = `depuis le dernier ${config.comparePeriod || 'mois'}`;
      }
      
      return {
        id: config.id,
        label: config.label,
        value: formattedValue,
        icon: config.icon as string,
        color: config.color as string,
        change,
        changeText
      };
    });
    
    return {
      items,
      columns: this.columns,
      showChanges: this.showChanges,
      showIcons: this.showIcons,
      variant: this.variant,
      size: this.size
    };
  }
  
  /**
   * Récupère le titre et la description
   */
  getTitleInfo() {
    return {
      title: this.title,
      description: this.description
    };
  }
}

