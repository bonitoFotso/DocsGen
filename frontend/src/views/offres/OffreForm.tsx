import React, { useState } from 'react';
import { X, Loader2, ChevronDown, Info, Check } from 'lucide-react';
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

  const filteredProducts = selectedCategories.length > 0
    ? products.filter(product => 
        product.categoryId && selectedCategories.includes(product.categoryId))
    : products;


  // Grouper les produits par catégorie
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

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl transform transition-all animate-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-hidden">
        <div className="p-8 space-y-8 overflow-y-auto max-h-[calc(90vh-4rem)] scrollbar-thin scrollbar-thumb-gray-200 hover:scrollbar-thumb-gray-300 scrollbar-track-transparent">
          {/* Header */}
          <div className="flex justify-between items-center sticky top-0 bg-white/80 backdrop-blur-sm z-10 pb-4">
            <div className="space-y-1.5">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                {currentOffre ? "Modifier l'offre" : 'Nouvelle offre'}
              </h2>
              <p className="text-gray-500 text-lg">Remplissez les informations ci-dessous</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-all duration-200 p-2.5 hover:bg-gray-100 rounded-full hover:rotate-90 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={onSubmit} className="space-y-8">
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
                    className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 appearance-none transition-all duration-200 bg-white hover:border-gray-300 hover:bg-gray-50/50 text-gray-900"
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
                    className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 appearance-none transition-all duration-200 bg-white hover:border-gray-300 hover:bg-gray-50/50 text-gray-900"
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

            {/* Sections Catégories et Produits */}
            {/* Section Produits améliorée */}
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                
                  key={category.id}
                  onClick={(e) => {
                    e.preventDefault()
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

            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher un produit..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-200 pl-10"
              />
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </div>

            <div className="space-y-4">
              {Object.entries(groupedProducts).map(([categoryId, products]) => {
                const category = categories.find(c => c.id === Number(categoryId));
                return (
                  <div key={categoryId} className="space-y-2">
                    {category && (
                      <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                        {category.name}
                      </h3>
                    )}
                    <div className="grid grid-cols-2 gap-2">
                      {products.map((product) => (
                        <button
                          key={product.id}
                          type="button"
                          onClick={() => handleProductToggle(product.id)}
                          className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 text-left ${
                            formData.produit.includes(product.id)
                              ? 'border-purple-500 bg-purple-50/50 text-purple-700'
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
                <div className="text-center py-8">
                  <p className="text-gray-500">Aucun produit ne correspond à votre recherche</p>
                </div>
              )}
            </div>
          </div>

            {/* Sites */}
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
                className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 min-h-48 transition-all duration-200 hover:border-gray-300 bg-white scrollbar-thin scrollbar-thumb-gray-200 hover:scrollbar-thumb-gray-300 scrollbar-track-transparent text-gray-900"
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

            {/* Boutons */}
            <div className="flex justify-end gap-4 mt-12 border-t pt-8 sticky bottom-0 bg-white/80 backdrop-blur-sm">
              <button
                type="button"
                onClick={onClose}
                className="px-8 py-3.5 bg-white border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 hover:border-gray-300 active:bg-gray-100 transition-all duration-200 font-medium disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                disabled={isLoading}
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-8 py-3.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 active:from-purple-800 active:to-purple-900 transition-all duration-200 flex items-center font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="h-5 w-5 mr-2 animate-spin" />}
                {currentOffre ? 'Modifier' : 'Créer'}
              </button>
            </div>
          </form>
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