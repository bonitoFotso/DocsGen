import { Check } from 'lucide-react';
import { motion } from 'framer-motion';

interface Product {
  id: number;
  name: string;
}

interface GroupedProductsProps {
  groupedProducts: Record<string, Product[]>;
  categories: { id: number; name: string; }[];
  formData: { produits: number[] };
  handleProductToggle: (id: number) => void;
}

const GroupedProducts = ({ 
  groupedProducts, 
  categories, 
  formData, 
  handleProductToggle 
}: GroupedProductsProps) => {
  return (
    <div className="space-y-8">
      {Object.entries(groupedProducts).map(([categoryId, products]) => {
        const category = categories.find(c => c.id === Number(categoryId));
        
        return (
          <motion.div 
            key={categoryId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-4"
          >
            {category && (
              <div className="flex items-center gap-3">
                <div className="w-1 h-8 rounded-full bg-gradient-to-b from-purple-400 to-purple-600"></div>
                <h3 className="text-base font-semibold text-gray-800">
                  {category.name}
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    ({products.length} {products.length === 1 ? 'item' : 'items'})
                  </span>
                </h3>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((product) => {
                const isSelected = formData.produits.includes(product.id);
                
                return (
                  <motion.button
                    key={product.id}
                    type="button"
                    onClick={() => handleProductToggle(product.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`
                      group flex items-center gap-4 p-4 rounded-xl border 
                      transition-all duration-300 text-left
                      ${isSelected 
                        ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-purple-100/50 text-purple-700 shadow-lg shadow-purple-100'
                        : 'border-gray-200 hover:border-purple-200 hover:bg-purple-50/30 hover:shadow-md'
                      }
                    `}
                  >
                    <div 
                      className={`
                        w-6 h-6 rounded-lg flex items-center justify-center border-2
                        transition-all duration-300 
                        ${isSelected 
                          ? 'bg-purple-500 border-purple-500 shadow-sm shadow-purple-200'
                          : 'border-gray-300 group-hover:border-purple-300'
                        }
                      `}
                    >
                      <Check 
                        className={`
                          w-4 h-4 transition-all duration-300
                          ${isSelected 
                            ? 'text-white scale-100' 
                            : 'scale-0 opacity-0'
                          }
                        `} 
                      />
                    </div>
                    <div className="flex-1">
                      <span className={`
                        text-sm font-medium transition-colors duration-300
                        ${isSelected 
                          ? 'text-purple-700' 
                          : 'text-gray-700 group-hover:text-gray-900'
                        }
                      `}>
                        {product.name}
                      </span>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default GroupedProducts;