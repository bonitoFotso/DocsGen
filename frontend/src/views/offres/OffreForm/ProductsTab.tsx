import React, { useState } from 'react';
import { Search, Filter, X, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CategoryBase, OffreEdit, ProductBase } from '@/interfaces';
import ProductSelection from './ProductSelection';

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
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [displayCategory, setDisplayCategory] = useState<number>(0); // 0 means all categories

  const handleCategoryToggle = (categoryId: number) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSearchTerm('');
    setDisplayCategory(0);
  };

  const filteredProducts = products
    .filter(product => 
      (selectedCategories.length === 0 || (product.categoryId && selectedCategories.includes(product.categoryId))) &&
      (searchTerm === '' || product.name.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (displayCategory === 0 || (product.categoryId === displayCategory))
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
      produits: prev.produits.includes(productId)
        ? prev.produits.filter(id => id !== productId)
        : [...prev.produits, productId]
    }));
  };

  const hasActiveFilters = selectedCategories.length > 0 || searchTerm !== '' || displayCategory !== 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex gap-4">
          <div className="flex-1 relative group">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher un produit..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 
                focus:border-purple-500 focus:ring-4 focus:ring-purple-100 
                transition-all duration-200 pl-11 pr-10
                placeholder:text-gray-400"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5 
              transition-colors group-focus-within:text-purple-500" />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full
                  hover:bg-gray-100 transition-colors"
              >
                <X className="h-4 w-4 text-gray-400" />
              </button>
            )}
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`
              flex items-center gap-2 px-4 py-3 rounded-xl border transition-all duration-200
              ${isFilterOpen 
                ? 'border-purple-500 bg-purple-50 text-purple-700'
                : 'border-gray-200 bg-white hover:border-gray-300'
              }
            `}
          >
            <Filter className="h-4 w-4" />
            <span className="text-sm font-medium">Filtres</span>
            {selectedCategories.length > 0 && (
              <span className="flex items-center justify-center w-5 h-5 text-xs font-medium 
                bg-purple-100 text-purple-700 rounded-full">
                {selectedCategories.length}
              </span>
            )}
          </motion.button>
        </div>

        <div className="relative">
          <select
            value={displayCategory}
            onChange={(e) => setDisplayCategory(Number(e.target.value))}
            className="w-full appearance-none px-4 py-3 pr-10 rounded-xl border border-gray-200 
              focus:border-purple-500 focus:ring-4 focus:ring-purple-100 
              transition-all duration-200 text-sm font-medium
              bg-white text-gray-700 cursor-pointer"
          >
            <option value={0}>Afficher toutes les catégories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                Afficher uniquement : {category.name}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        </div>

        <AnimatePresence>
          {isFilterOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-medium text-gray-700">Catégories</h3>
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="text-sm text-purple-600 hover:text-purple-700 
                        font-medium transition-colors"
                    >
                      Réinitialiser
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {categories.map((category) => (
                    <motion.button
                      key={category.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleCategoryToggle(category.id)}
                      className={`
                        p-2 rounded-lg text-sm font-medium text-left transition-all duration-200
                        ${selectedCategories.includes(category.id)
                          ? 'bg-purple-500 text-white shadow-sm shadow-purple-200'
                          : 'bg-white text-gray-700 hover:bg-purple-50 hover:text-purple-700'
                        }
                      `}
                    >
                      {category.name}
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="space-y-6">
        <ProductSelection
          groupedProducts={groupedProducts}
          categories={categories}
          formData={formData}
          handleProductToggle={handleProductToggle}
        />

        {filteredProducts.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="inline-flex items-center justify-center w-12 h-12 
              rounded-full bg-gray-100 mb-4">
              <Search className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-gray-600 font-medium">
              Aucun produit ne correspond à votre recherche
            </p>
            <p className="text-gray-400 text-sm mt-1">
              Essayez de modifier vos critères de recherche
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="mt-4 text-sm text-purple-600 hover:text-purple-700 
                  font-medium transition-colors"
              >
                Réinitialiser les filtres
              </button>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};