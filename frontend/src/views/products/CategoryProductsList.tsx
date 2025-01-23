import React, { useState } from 'react';
import { Package, ChevronRight, Tag, Building2, Folder, GraduationCap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ICategory } from '@/interfaces';



interface CategoryProductsListProps {
  category: ICategory;
}

const CategoryProductsList: React.FC<CategoryProductsListProps> = ({ category }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-lg">
      {/* En-tête de la catégorie */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-6 cursor-pointer hover:bg-gray-50/80 transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-blue-50 flex items-center justify-center">
              <Folder className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold text-gray-900">{category.name}</h2>
                <ChevronRight
                  className={cn(
                    "w-5 h-5 text-gray-400 transition-transform duration-300",
                    isExpanded && "rotate-90"
                  )}
                />
              </div>
              <p className="text-sm text-gray-500 flex items-center gap-2">
                <Tag className="w-4 h-4" />
                {category.code}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg border border-blue-100 text-sm font-medium">
              {category.produits.length} produit{category.produits.length > 1 ? 's' : ''}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="p-4 rounded-lg bg-gray-50 border border-gray-100">
            <span className="text-xs font-medium text-gray-500 flex items-center gap-1.5 mb-2">
              <Building2 className="w-3.5 h-3.5" />
              Entité
            </span>
            <p className="text-sm font-medium text-gray-900">{category.entity.name}</p>
            <p className="text-xs text-gray-500 mt-1">Code: {category.entity.code}</p>
          </div>
          <div className="p-4 rounded-lg bg-gray-50 border border-gray-100">
            <span className="text-xs font-medium text-gray-500 flex items-center gap-1.5 mb-2">
              <GraduationCap className="w-3.5 h-3.5" />
              Type
            </span>
            <p className="text-sm font-medium text-gray-900">{category.name}</p>
            <p className="text-xs text-gray-500 mt-1">Code: {category.code}</p>
          </div>
        </div>
      </div>

      {/* Liste des produits */}
      {isExpanded && (
        <div className="border-t border-gray-100">
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                <Package className="w-4 h-4 text-gray-500" />
                Liste des produits
              </h3>
              <span className="text-sm text-gray-500">
                {category.produits.length} produit{category.produits.length > 1 ? 's' : ''}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {category.produits.map((product) => (
                <div
                  key={product.id}
                  className="p-4 rounded-lg border border-gray-200 hover:border-blue-200 hover:shadow-sm transition-all bg-white"
                >
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <Package className="w-4 h-4 text-gray-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {product.name}
                      </h4>
                      <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-1">
                        <Tag className="w-3 h-3" />
                        {product.code}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryProductsList;