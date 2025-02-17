import React, { useState, useEffect } from 'react';
import { X, Info, Loader2 } from 'lucide-react';
import { CategoryBase, ClientBase, EntityBase, OffreDetail, OffreEdit, ProductBase, SiteBase } from '@/interfaces';
import { InfoTab } from './InfoTab';
import { ProductsTab } from './ProductsTab';
import { SitesTab } from './SitesTab';
import { TabNavigation } from './TabNavigation';

interface OffreFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  formData: OffreEdit;
  setFormData: React.Dispatch<React.SetStateAction<OffreEdit>>;
  isLoading: boolean;
  currentOffre: OffreDetail | null;
  clients: ClientBase[];
  categories: CategoryBase[];
  products: ProductBase[];
  sites: SiteBase[];
  entities: EntityBase[];
}

export const OffreForm: React.FC<OffreFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  formData,
  setFormData,
  isLoading,
  currentOffre,
  clients,
  categories,
  products,
  sites,
  entities,
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'products' | 'sites'>('info');

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const tabs = [
    { id: 'info', label: 'Informations générales' },
    { id: 'products', label: 'Produits', count: formData.produits.length },
  ] as const;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-6xl shadow-2xl transform transition-all animate-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 sticky top-0 bg-white/80 backdrop-blur-sm z-20">
          <div className="flex justify-between items-center">
            <div className="space-y-1.5">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                {currentOffre ? "Modifier l'offre" : 'Nouvelle offre'}
              </h2>
              <p className="text-gray-500">Remplissez les informations ci-dessousee</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-all duration-200 p-2.5 hover:bg-gray-100 rounded-full hover:rotate-90"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <TabNavigation
            tabs={tabs}
            activeTab={activeTab}
            onChange={setActiveTab}
          />
        </div>

        {/* Content */}
        <form onSubmit={onSubmit} id="offre-form" className="flex-1 overflow-y-auto">
          <div className="p-8 space-y-8">
            {activeTab === 'info' && (
              <InfoTab
                formData={formData}
                setFormData={setFormData}
                clients={clients}
                entities={entities}
              />
            )}

            {activeTab === 'products' && (
              <ProductsTab
                formData={formData}
                setFormData={setFormData}
                products={products}
                categories={categories}
              />
            )}

            {activeTab === 'sites' && (
              <SitesTab
                formData={formData}
                setFormData={setFormData}
                sites={sites}
              />
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="p-4 border-t sticky bottom-0 bg-white/80 backdrop-blur-sm z-20">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Info className="w-4 h-4" />
              <span>Tous les champs marqués d'un * sont obligatoires</span>
            </div>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={onClose}
                className="px-8 py-3.5 bg-white border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 hover:border-gray-300 active:bg-gray-100 transition-all duration-200 font-medium disabled:opacity-50"
                disabled={isLoading}
              >
                Annuler
              </button>
              <button
                type="submit"
                form="offre-form"
                className="px-8 py-3.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 active:from-purple-800 active:to-purple-900 transition-all duration-200 flex items-center font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30"
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="h-5 w-5 mr-2 animate-spin" />}
                {currentOffre ? 'Modifier' : 'Créer'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};