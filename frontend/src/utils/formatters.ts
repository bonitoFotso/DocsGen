/**
 * Formate un nombre en valeur monétaire (XAF)
 * @param value - Nombre à formater
 * @param options - Options de formatage supplémentaires
 * @returns Chaîne formatée (ex: "500 000 XAF")
 */
export const formatCurrency = (
    value: number | string | null | undefined,
    options: {
      currency?: string;
      showSymbol?: boolean;
      minimumFractionDigits?: number;
      maximumFractionDigits?: number;
    } = {}
  ): string => {
    // Valeurs par défaut
    const {
      currency = 'XAF',
      showSymbol = true,
      minimumFractionDigits = 0,
      maximumFractionDigits = 0
    } = options;
    
    // Gestion des valeurs nulles/undefined
    if (value === null || value === undefined) {
      return 'N/A';
    }
    
    // Conversion en nombre
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    
    // Gestion des valeurs NaN
    if (isNaN(numValue)) {
      return 'N/A';
    }
    
    // Formatage du nombre
    const formatter = new Intl.NumberFormat('fr-FR', {
      style: showSymbol ? 'currency' : 'decimal',
      currency: currency,
      minimumFractionDigits: minimumFractionDigits,
      maximumFractionDigits: maximumFractionDigits
    });
    
    return formatter.format(numValue);
  };
  
  /**
   * Formate un nombre en pourcentage
   * @param value - Nombre à formater (0.75 => 75%)
   * @param options - Options de formatage supplémentaires
   * @returns Chaîne formatée (ex: "75%")
   */
  export const formatPercent = (
    value: number | string | null | undefined,
    options: {
      minimumFractionDigits?: number;
      maximumFractionDigits?: number;
    } = {}
  ): string => {
    // Valeurs par défaut
    const {
      minimumFractionDigits = 0,
      maximumFractionDigits = 1
    } = options;
    
    // Gestion des valeurs nulles/undefined
    if (value === null || value === undefined) {
      return 'N/A';
    }
    
    // Conversion en nombre
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    
    // Gestion des valeurs NaN
    if (isNaN(numValue)) {
      return 'N/A';
    }
    
    // Formatage du pourcentage
    const formatter = new Intl.NumberFormat('fr-FR', {
      style: 'percent',
      minimumFractionDigits: minimumFractionDigits,
      maximumFractionDigits: maximumFractionDigits
    });
    
    return formatter.format(numValue);
  };
  
  /**
   * Formate une date en chaîne de caractères
   * @param dateString - Date à formater (chaîne ISO ou objet Date)
   * @param options - Options de formatage
   * @returns Date formatée (ex: "25/12/2023")
   */
  export const formatDate = (
    dateString: string | Date | null | undefined,
    options: {
      format?: 'short' | 'medium' | 'long';
      showTime?: boolean;
    } = {}
  ): string => {
    // Valeurs par défaut
    const {
      format = 'short',
      showTime = false
    } = options;
    
    // Gestion des valeurs nulles/undefined
    if (!dateString) {
      return 'N/A';
    }
    
    // Conversion en objet Date
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    
    // Vérification de la validité de la date
    if (isNaN(date.getTime())) {
      return 'Date invalide';
    }
    
    // Options de formatage
    const dateOptions: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    };
    
    // Ajout d'options selon le format
    if (format === 'medium' || format === 'long') {
      dateOptions.month = format === 'medium' ? 'short' : 'long';
    }
    
    // Ajout de l'heure si demandé
    if (showTime) {
      dateOptions.hour = '2-digit';
      dateOptions.minute = '2-digit';
    }
    
    return new Intl.DateTimeFormat('fr-FR', dateOptions).format(date);
  };