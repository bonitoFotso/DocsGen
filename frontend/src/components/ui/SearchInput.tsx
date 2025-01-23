import React from 'react';
import { Search } from 'lucide-react';

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({ className = '', ...props }) => {
  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
      <input
        type="text"
        placeholder="Rechercher une offre par référence..."
        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl
                 focus:ring-2 focus:ring-purple-500 focus:border-purple-500
                 transition-all duration-200 placeholder:text-gray-400"
        {...props}
      />
    </div>
  );
};