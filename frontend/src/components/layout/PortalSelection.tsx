import React, { useState, useEffect, useCallback } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Types
interface OptionType {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  logoSrc: string;
  color: string;
  hoverColor: string;
  bgGradient: string;
  borderColor: string;
}

const PortalSelection: React.FC = () => {
  const [selected, setSelected] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [expandedOption, setExpandedOption] = useState<string | null>(null);

  const navigate = useNavigate();
  
  // Utilisez des chemins relatifs pour vos images PNG - assurez-vous que ces fichiers existent dans votre dossier public/images
  const options = React.useMemo<OptionType[]>(() => [
    {
      id: 'kip',
      name: 'KIP',
      description: 'KES INSPECTIONS & PROJECTS',
      longDescription: 'Plateforme de gestion des inspections et projets KES. Suivez et gérez efficacement vos projets et inspections en temps réel.',
      logoSrc: '/images/kip.png', // Remplacez avec le chemin de votre logo
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600',
      bgGradient: 'from-blue-500 to-blue-700',
      borderColor: 'border-blue-500'
    },
    {
      id: 'kec',
      name: 'KEC',
      description: 'KES ENERGY & CARBON',
      longDescription: 'Solution complète pour le suivi et l\'optimisation de votre consommation d\'énergie et de vos émissions carbone.',
      logoSrc: '/images/kec.png', // Remplacez avec le chemin de votre logo
      color: 'bg-purple-500',
      hoverColor: 'hover:bg-purple-600',
      bgGradient: 'from-purple-500 to-purple-700',
      borderColor: 'border-purple-500'
    },
    {
      id: 'kar',
      name: 'KAR',
      description: 'KES Afrik Recycling',
      longDescription: '.',
      logoSrc: '/images/kar.png', // Remplacez avec le chemin de votre logo
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-600',
      bgGradient: 'from-green-500 to-green-700',
      borderColor: 'border-green-500'
    }
  ], []);

  const handleSelect = (id: string) => {
    setIsAnimating(true);
    setSelected(id);
    
    // Animation effect
    setTimeout(() => {
      setIsAnimating(false);
    }, 300);
  };

  const handleContinue = useCallback(() => {
    if (selected) {
      setIsAnimating(true);
      console.log(`Selected option: ${selected}`);
      navigate(`/${selected}`);
      
      // Simulate loading before transition
      setTimeout(() => {
        // onSelection(selected);
      }, 400);
    }
  }, [navigate, selected]);

  const toggleExpandOption = (id: string) => {
    setExpandedOption(expandedOption === id ? null : id);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        if (!selected) {
          setSelected(options[0].id);
        } else {
          const currentIndex = options.findIndex(opt => opt.id === selected);
          const nextIndex = (currentIndex + 1) % options.length;
          setSelected(options[nextIndex].id);
        }
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (!selected) {
          setSelected(options[options.length - 1].id);
        } else {
          const currentIndex = options.findIndex(opt => opt.id === selected);
          const prevIndex = (currentIndex - 1 + options.length) % options.length;
          setSelected(options[prevIndex].id);
        }
      } else if (e.key === 'Enter' && selected) {
        handleContinue();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selected, options, handleContinue]);

  const getOptionColorClass = (option: OptionType): string => {
    if (selected === option.id) {
      return `bg-gradient-to-r ${option.bgGradient}`;
    }
    return 'bg-gray-100 hover:bg-gray-200';
  };

  const getOptionTextColor = (option: OptionType): string => {
    if (selected === option.id) {
      return 'text-white';
    }
    return 'text-gray-700';
  };

  const getButtonColor = (): string => {
    if (!selected) return 'bg-gray-400 cursor-not-allowed';
    const selectedOption = options.find(opt => opt.id === selected);
    return `${selectedOption?.color} ${selectedOption?.hoverColor}`;
  };

  const getButtonText = (): string => {
    if (!selected) return 'Sélectionnez une option';
    return `Continuer vers ${options.find(opt => opt.id === selected)?.name}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200 p-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-300 transform">
        {/* Header avec animation subtile */}
        <div className="relative bg-gradient-to-r from-gray-800 to-gray-900 text-white p-8 overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-4xl font-bold mb-3">Portail KES</h1>
            <p className="text-gray-300 text-lg">Choisissez une plateforme pour continuer</p>
          </div>
          {/* Éléments décoratifs améliorés */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full transform translate-x-1/3 -translate-y-1/3"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full transform -translate-x-1/3 translate-y-1/3"></div>
          <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-white opacity-5 rounded-full transform -translate-y-1/2"></div>
        </div>

        {/* Options avec design amélioré */}
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {options.map((option) => (
              <div
                key={option.id}
                onClick={() => handleSelect(option.id)}
                className={`relative flex flex-col rounded-xl transition-all duration-300 cursor-pointer border-2 overflow-hidden shadow-md hover:shadow-lg ${
                  selected === option.id 
                    ? option.borderColor
                    : 'border-gray-200 hover:border-gray-300'
                } ${isAnimating ? 'scale-95' : 'scale-100'}`}
                role="button"
                tabIndex={0}
                aria-selected={selected === option.id}
                onKeyDown={(e) => e.key === 'Enter' && handleSelect(option.id)}
              >
                {/* Option Header avec logo PNG */}
                <div 
                  className={`p-6 ${getOptionColorClass(option)} ${getOptionTextColor(option)} transition-all duration-300`}
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="w-24 h-24 mb-4 flex items-center justify-center bg-white rounded-full p-2 shadow-md">
                      <img 
                        src={option.logoSrc} 
                        alt={`Logo ${option.name}`} 
                        className="w-20 h-20 object-contain"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/api/placeholder/80/80"; // Image de secours en cas d'erreur
                          console.error(`Impossible de charger l'image: ${option.logoSrc}`);
                        }}
                      />
                    </div>
                    <h3 className="text-2xl font-bold mb-1">{option.name}</h3>
                    <p className={`font-medium ${selected === option.id ? 'text-gray-100' : 'text-gray-600'}`}>
                      {option.description}
                    </p>
                    
                    {selected === option.id && (
                      <div className="mt-3 bg-white bg-opacity-20 rounded-full p-1">
                        <Check size={20} className="text-white" />
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Option Content avec animation d'expansion */}
                <div className="p-5 bg-white flex-grow">
                  <div 
                    className={`overflow-hidden transition-all duration-300 ${
                      expandedOption === option.id ? 'max-h-40' : 'max-h-0'
                    }`}
                  >
                    <p className="text-gray-600">{option.longDescription}</p>
                    <div className="h-4"></div>
                  </div>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleExpandOption(option.id);
                    }}
                    className={`text-sm font-medium focus:outline-none ${
                      selected === option.id ? option.color.replace('bg-', 'text-').replace('-500', '-700') : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {expandedOption === option.id ? 'Voir moins' : 'En savoir plus'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Footer avec bouton continue amélioré */}
          <div className="flex justify-center mt-6">
            <button
              onClick={handleContinue}
              disabled={!selected}
              className={`flex items-center justify-center py-4 px-10 rounded-lg text-white font-medium transition-all duration-300 shadow-lg ${
                getButtonColor()
              } ${isAnimating ? 'scale-95' : 'scale-100'} ${!selected ? '' : 'hover:shadow-xl'}`}
              aria-disabled={!selected}
            >
              <span className="text-lg">{getButtonText()}</span>
              <ArrowRight className="ml-2" size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortalSelection;