import React, { useState, useEffect } from 'react';
import { X, Loader2, ChevronDown, Info, Check, Search, Filter } from 'lucide-react';
import { CategoryBase, ClientBase, EntityBase, OffreDetail, OffreEdit, ProductBase, SiteBase } from '@/interfaces';

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
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
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

  const statusColors = {
    BROUILLON: 'bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-50',
    ENVOYE: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
    VALIDE: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100',
    REFUSE: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100',
    EN_COURS: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100',
    TERMINEE: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100',
    ANNULEE: 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-50',
  };

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

  const filteredSites = formData.client
    ? sites.filter(site => site.clientId === formData.client)
    : [];

  const handleProductToggle = (productId: number) => {
    setFormData(prev => ({
      ...prev,
      produit: prev.produit.includes(productId)
        ? prev.produit.filter(id => id !== productId)
        : [...prev.produit, productId]
    }));
  };

  const tabs = [
    { id: 'info', label: 'Informations générales', count: undefined },
    { id: 'products', label: 'Produits', count: formData.produit.length },
    { id: 'sites', label: 'Sites', count: formData.sites?.length },
  ] as const;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl transform transition-all animate-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-8 border-b border-gray-100 sticky top-0 bg-white/80 backdrop-blur-sm z-20">
          <div className="flex justify-between items-center">
            <div className="space-y-1.5">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                {currentOffre ? "Modifier l'offre" : 'Nouvelle offre'}
              </h2>
              <p className="text-gray-500">Remplissez les informations ci-dessous</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-all duration-200 p-2.5 hover:bg-gray-100 rounded-full hover:rotate-90"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-8 border-b border-gray-100">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
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
        </div>

        {/* Content */}
        <form onSubmit={onSubmit} className="flex-1 overflow-y-auto">
          <div className="p-8 space-y-8">
            {activeTab === 'info' && (
              <div className="space-y-8">
                {/* Client et Entité */}
                <div className="grid grid-cols-2 gap-8">
                  <FormField label="Client" required>
                    <div className="group relative">
                      <select
                        value={formData.client}
                        onChange={(e) => {
                          const newClientId = Number(e.target.value);
                          setFormData({
                            ...formData,
                            client: newClientId,
                            sites: []
                          });
                        }}
                        required
                        className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 appearance-none transition-all duration-200 bg-white hover:border-gray-300 hover:bg-gray-50/50"
                      >
                        <option value="">Sélectionnez un client</option>
                        {clients.map((client) => (
                          <option key={client.id} value={client.id}>
                            {client.nom}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-gray-600 transition-colors duration-200 pointer-events-none h-5 w-5" />
                    </div>
                  </FormField>

                  <FormField label="Entité" required>
                    <div className="group relative">
                      <select
                        value={formData.entity}
                        onChange={(e) => setFormData({ ...formData, entity: Number(e.target.value) })}
                        required
                        className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 appearance-none transition-all duration-200 bg-white hover:border-gray-300 hover:bg-gray-50/50"
                      >
                        <option value="">Sélectionnez une entité</option>
                        {entities.map((entity) => (
                          <option key={entity.id} value={entity.id}>
                            {entity.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-gray-600 transition-colors duration-200 pointer-events-none h-5 w-5" />
                    </div>
                  </FormField>
                </div>

                {/* Statut */}
                <FormField label="Statut">
                  <div className="group relative">
                    <select
                      value={formData.statut}
                      onChange={(e) =>
                        setFormData({ ...formData, statut: e.target.value as OffreEdit['statut'] })
                      }
                      className={`w-full px-4 py-3.5 rounded-xl border appearance-none transition-all duration-200 focus:ring-4 focus:ring-purple-100 ${
                        statusColors[formData.statut as keyof typeof statusColors]
                      }`}
                    >
                      <option value="BROUILLON">Brouillon</option>
                      <option value="ENVOYE">Envoyé</option>
                      <option value="VALIDE">Validé</option>
                      <option value="REFUSE">Refusé</option>
                      <option value="EN_COURS">En cours</option>
                      <option value="TERMINEE">Terminée</option>
                      <option value="ANNULEE">Annulée</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-gray-600 transition-colors duration-200 pointer-events-none h-5 w-5" />
                  </div>
                </FormField>
              </div>
            )}

            {activeTab === 'products' && (
              <div className="space-y-6">
                {/* Search and Filter */}
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

                {/* Categories */}
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

                {/* Products Grid */}
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
            )}

            {activeTab === 'sites' && (
              <FormField 
                label="Sites" 
                helpText={formData.client 
                  ? `${filteredSites.length} site(s) disponible(s)` 
                  : "Veuillez d'abord sélectionner un client"}
              >
                <select
                  multiple
                  value={(formData.sites ?? []).map(String)}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      sites: Array.from(e.target.selectedOptions, (option) => Number(option.value)),
                    })
                  }
                  className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 min-h-[400px] transition-all duration-200 hover:border-gray-300 bg-white scrollbar-thin scrollbar-thumb-gray-200 hover:scrollbar-thumb-gray-300 scrollbar-track-transparent"
                >
                  {formData.client ? (
                    filteredSites.length > 0 ? (
                      filteredSites.map((site) => (
                        <option 
                          key={site.id} 
                          value={site.id}
                          className="py-2.5 px-2 hover:bg-purple-50 cursor-pointer transition-colors duration-150"
                        >
                          {site.nom}
                        </option>
                      ))
                    ) : (
                      <option disabled value="" className="py-2.5 px-2 text-gray-500 italic">
                        Aucun site disponible pour ce client
                      </option>
                    )
                  ) : (
                    <option disabled value="" className="py-2.5 px-2 text-gray-500 italic">
                      Veuillez d'abord sélectionner un client
                    </option>
                  )}
                </select>
              </FormField>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="p-8 border-t sticky bottom-0 bg-white/80 backdrop-blur-sm z-20">
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

const FormField: React.FC<{
  label: string;
  children: React.ReactNode;
  helpText?: string;
  required?: boolean;
}> = ({ label, children, helpText, required }) => (
  <div className="space-y-2.5">
    <label className="block text-sm font-semibold text-gray-700 tracking-wide">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    {children}
    {helpText && (
      <p className="text-sm text-gray-500 flex items-center gap-1.5">
        <Info className="w-4 h-4" />
        {helpText}
      </p>
    )}
  </div>
);