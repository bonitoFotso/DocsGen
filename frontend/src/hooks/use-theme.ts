// hooks/use-theme.ts
import { useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

export function useTheme() {
  // Initialiser avec le thème sauvegardé ou la préférence système
  const [theme, setTheme] = useState<Theme>(() => {
    // Vérifier si un thème est déjà sauvegardé
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) {
      return savedTheme;
    }
    
    // Sinon, utiliser la préférence système
    return window.matchMedia('(prefers-color-scheme: dark)').matches 
      ? 'dark' 
      : 'light';
  });

  // Mettre à jour le thème dans le DOM et localStorage quand il change
  useEffect(() => {
    // Mettre à jour la classe sur le document
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
    
    // Sauvegarder dans localStorage
    localStorage.setItem('theme', theme);
  }, [theme]);

  // S'abonner aux changements de préférence système
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      // Ne mettre à jour que si l'utilisateur n'a pas explicitement choisi un thème
      if (!localStorage.getItem('theme')) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };
    
    // S'abonner aux changements
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      // Fallback pour Safari < 14
      mediaQuery.addListener(handleChange);
    }
    
    // Nettoyage
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        // Fallback pour Safari < 14
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  // Fonction pour basculer le thème
  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  // Fonction pour définir un thème spécifique
  const setThemeValue = (newTheme: Theme) => {
    setTheme(newTheme);
  };

  return { theme, setTheme: setThemeValue, toggleTheme };
}

export default useTheme;