import React from 'react';

interface Tab {
  id: string;
  label: string;
  count?: number;
}

interface TabNavigationProps {
  tabs: readonly Tab[];
  activeTab: string;
  onChange: (tabId: any) => void;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({
  tabs,
  activeTab,
  onChange,
}) => (
  <div className="flex gap-1 mt-8 border-b border-gray-100">
    {tabs.map((tab) => (
      <button
        key={tab.id}
        onClick={() => onChange(tab.id)}
        className={`px-6 py-3 text-sm font-medium transition-all duration-200 relative ${
          activeTab === tab.id
            ? 'text-purple-600'
            : 'text-gray-500 hover:text-gray-900'
        }`}
      >
        <span className="flex items-center gap-2">
          {tab.label}
          {typeof tab.count !== 'undefined' && (
            <span className={`px-2 py-0.5 rounded-full text-xs ${
              activeTab === tab.id
                ? 'bg-purple-100 text-purple-700'
                : 'bg-gray-100 text-gray-600'
            }`}>
              {tab.count}
            </span>
          )}
        </span>
        {activeTab === tab.id && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600 rounded-full" />
        )}
      </button>
    ))}
  </div>
);