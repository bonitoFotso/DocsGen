import React, { useState } from 'react';
import { Package, ChevronRight, Tag, Building2, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { IProduct } from '@/interfaces';


interface ProductListProps {
  products: IProduct[];
}

const ProductList: React.FC<ProductListProps> = ({ products }) => {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="space-y-4">
      {products.map((product) => (
        <div
          key={product.id}
          className=" rounded-xl  overflow-hidden transition-all duration-300 hover:shadow-lg group"
        >
          {/* En-tête du produit */}
          <div
            onClick={() => toggleExpand(product.id)}
            className="p-5 cursor-pointer flex items-center justify-between hover:bg-gray-50/80 transition-colors"
          >
            <div className="flex items-center gap-6">
              <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-white transition-colors">
                <Package className="w-5 h-5 text-gray-500" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-900">
                  {product.name}
                </span>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Tag className="w-3.5 h-3.5" />
                  {product.code}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium border",
                "bg-blue-50 text-blue-600 border-blue-100"
              )}>
                {product.category.name}
              </span>
              <ChevronRight
                className={cn(
                  "w-5 h-5 text-gray-400 transition-transform duration-300",
                  expandedId === product.id && "rotate-90"
                )}
              />
            </div>
          </div>

          {/* Détails du produit */}
          {expandedId === product.id && (
            <div className="border-t border-gray-100 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Informations du produit */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <Info className="w-4 h-4 text-gray-500" />
                    Informations du produit
                  </h4>
                  <div className="space-y-3">
                    <div className="p-4 rounded-lg bg-gray-50/50 border border-gray-100 hover:bg-gray-50 transition-colors">
                      <span className="text-xs font-medium text-gray-500 flex items-center gap-1.5 mb-1">
                        <Tag className="w-3.5 h-3.5" />
                        Code produit
                      </span>
                      <p className="text-sm font-medium text-gray-900">{product.code}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-gray-50/50 border border-gray-100 hover:bg-gray-50 transition-colors">
                      <span className="text-xs font-medium text-gray-500 flex items-center gap-1.5 mb-1">
                        <Package className="w-3.5 h-3.5" />
                        Nom du produit
                      </span>
                      <p className="text-sm font-medium text-gray-900">{product.name}</p>
                    </div>
                  </div>
                </div>

                {/* Informations de la catégorie */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-gray-500" />
                    Informations de la catégorie
                  </h4>
                  <div className="space-y-3">
                    <div className="p-4 rounded-lg bg-gray-50/50 border border-gray-100 hover:bg-gray-50 transition-colors">
                      <span className="text-xs font-medium text-gray-500 flex items-center gap-1.5 mb-1">
                        <Tag className="w-3.5 h-3.5" />
                        Code catégorie
                      </span>
                      <p className="text-sm font-medium text-gray-900">{product.category.code}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-gray-50/50 border border-gray-100 hover:bg-gray-50 transition-colors">
                      <span className="text-xs font-medium text-gray-500 flex items-center gap-1.5 mb-1">
                        <Building2 className="w-3.5 h-3.5" />
                        Nom de la catégorie
                      </span>
                      <p className="text-sm font-medium text-gray-900">{product.category.name}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ProductList;