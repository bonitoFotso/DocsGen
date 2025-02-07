import React, { useState } from 'react';
import { Search, Filter, Check } from 'lucide-react';
import { CategoryBase, OffreEdit, ProductBase } from '@/interfaces';

interface ProductsTabProps {
  formData: OffreEdit;
  setFormData: React.Dispatch<React.SetStateAction<OffreEdit>>;
  products: ProductBase[];
  categories: CategoryBase[];
}

export const ProductsTab: React.FC<ProductsTabProps> = ({
  formData,
  setFormData,
  products,
  categories,
}) => {
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = products
    .filter(product => 
      (selectedCategories.length === 0 || (product.categoryId && selectedCategories.includes(product.categoryId))) &&
      (searchTerm === '' || product.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

  const groupedProducts = filteredProducts.reduce((acc, product) => {
    const categoryId = product.categoryId || 0;
    if (!acc[categoryId]) {
      acc[categoryId] = [];
    }
    acc[categoryId].push(product);
    return acc;
  }, {} as Record<number, ProductBase[]>);

  const handleProductToggle = (productId: number) => {
    setFormData(prev => ({
      ...prev,
      produit: prev.produit.includes(productId)
        ? prev.produit.filter(id => id !== productId)
        : [...prev.produit, productId]
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher un produit..."
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-200 pl-11"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl border border-gray-200">
          <Filter className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filtrer par catégorie</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={(e) => {
              e.preventDefault();
              setSelectedCategories(prev =>
                prev.includes(category.id)
                  ? prev.filter(id => id !== category.id)
                  : [...prev, category.id]
              );
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              selectedCategories.includes(category.id)
                ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {Object.entries(groupedProducts).map(([categoryId, products]) => {
          const category = categories.find(c => c.id === Number(categoryId));
          return (
            <div key={categoryId} className="space-y-3">
              {category && (
                <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                  {category.name}
                </h3>
              )}
              <div className="grid grid-cols-2 gap-3">
                {products.map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => handleProductToggle(product.id)}
                    className={`flex items-center gap-3 p-4 rounded-xl border transition-all duration-200 text-left hover:shadow-lg ${
                      formData.produit.includes(product.id)
                        ? 'border-purple-500 bg-purple-50/50 text-purple-700 shadow-purple-100'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all duration-200 ${
                      formData.produit.includes(product.id)
                        ? 'bg-purple-500 border-purple-500'
                        : 'border-gray-300'
                    }`}>
                      {formData.produit.includes(product.id) && (
                        <Check className="w-3.5 h-3.5 text-white" />
                      )}
                    </div>
                    <span className="flex-1 text-sm font-medium">
                      {product.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-4">
              <Search className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">Aucun produit ne correspond à votre recherche</p>
            <p className="text-gray-400 text-sm mt-1">Essayez de modifier vos critères de recherche</p>
          </div>
        )}
      </div>
    </div>
  );
};