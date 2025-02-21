// TabNavigation.tsx
import { User, Building, MapPin, CheckCircle } from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface Tab {
  id: 'info' | 'entreprise' | 'adresse';
  label: string;
  icon: LucideIcon;
}

interface TabNavigationProps {
  activeTab: Tab['id'];
  onTabChange: (tab: Tab['id']) => void;
  getTabProgress: (tab: Tab['id']) => number;
}

const tabs: Tab[] = [
  { id: 'info', label: 'Informations', icon: User },
  { id: 'entreprise', label: 'Entreprise', icon: Building },
  { id: 'adresse', label: 'Adresse', icon: MapPin },
];

export const TabNavigation = ({ activeTab, onTabChange, getTabProgress }: TabNavigationProps) => {
  return (
    <div className="border-b border-gray-200 bg-gray-50">
      <nav className="flex px-6" aria-label="Tabs">
        {tabs.map(({ id, label, icon: Icon }) => {
          const progress = getTabProgress(id);
          return (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className={`
                relative py-4 px-6 flex items-center space-x-2 border-b-2 font-medium text-sm
                ${activeTab === id
                  ? 'border-indigo-500 text-indigo-600 bg-white'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <div className="flex items-center space-x-2">
                <Icon className="h-5 w-5" />
                <span>{label}</span>
              </div>
              {progress === 100 && (
                <CheckCircle className="h-4 w-4 text-green-500 ml-2" />
              )}
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gray-200">
                <div 
                  className="h-full bg-indigo-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </button>
          );
        })}
      </nav>
    </div>
  );
};