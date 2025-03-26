import React, { useState, useEffect, useMemo } from "react";
import {
  Info,
  AlertCircle,
  Check,
  X,
  Loader2,
  MapPin,
  Package,
  Users,
  Building2,
} from "lucide-react";
import { useEntity } from "../../contexts/EntityContext";
import { useClient } from "../../contexts/ClientContext";
import { useCategory } from "../../hooks/useCategory";
import { useProduct } from "../../hooks/useProduct";
import { useSite } from "../../contexts/SiteContext";
import { DocumentStatus, IOffre, IOffreC } from "../../interfaces";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../common/CustomCard";
import { Alert, AlertDescription } from "../../common/CustomAlert";

interface OfferFormProps {
  initialData?: Partial<IOffre>;
  onSubmit: (offre: IOffreC) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

const OfferForm: React.FC<OfferFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isEditing = false,
}) => {
  const { entities } = useEntity();
  const { clients } = useClient();
  const { categories } = useCategory();
  const { products } = useProduct();
  const { sites } = useSite();

  const [formData, setFormData] = useState<Partial<IOffreC>>({
    entity: initialData?.entity?.id,
    reference: initialData?.reference || "",
    client: initialData?.client?.id,
    date_creation: initialData?.date_creation || new Date().toISOString(),
    statut: initialData?.statut || DocumentStatus.BROUILLON,
    doc_type: initialData?.doc_type || "OFF",
    sequence_number: initialData?.sequence_number || 0,
    produit: initialData?.produit?.map((p) => p.id) || [],
    date_modification: new Date().toISOString(),
    date_validation: initialData?.date_validation || null,
    sites: initialData?.sites?.map((s) => s.id) || [],
  });

  const [category, setCategory] = useState<number | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredProducts = useMemo(() => {
    if (!category) return products;
    return products.filter((product) => product.category.id === category);
  }, [products, category]);

  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({
        ...prev,
        entity: initialData.entity?.id,
        reference: initialData.reference,
        client: initialData.client?.id,
        date_creation: initialData.date_creation,
        statut: initialData.statut,
        doc_type: initialData.doc_type,
        sequence_number: initialData.sequence_number,
        produit: initialData.produit?.map((p) => p.id) || [],
        date_modification: new Date().toISOString(),
        date_validation: initialData.date_validation,
        sites: initialData.sites?.map((s) => s.id) || [],
      }));
    }
  }, [initialData]);

  const handleSelectChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
    key: keyof IOffreC
  ) => {
    const selectedId = Number(e.target.value);
    if (selectedId) {
      setFormData((prev) => ({ ...prev, [key]: selectedId }));
      setErrors((prev) => ({ ...prev, [key]: "" }));
    }
  };

  const handleCategorySelectChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selectedId = Number(e.target.value);
    setCategory(selectedId || null);
  };

  const handleAddProduct = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = Number(e.target.value);
    if (selectedId && !formData.produit?.includes(selectedId)) {
      setFormData((prev) => ({
        ...prev,
        produit: [...(prev.produit || []), selectedId],
      }));
      setErrors((prev) => ({ ...prev, produit: "" }));
    }
    e.target.value = "";
  };

  const handleRemoveProduct = (productId: number) => {
    setFormData((prev) => ({
      ...prev,
      produit: prev.produit?.filter((id) => id !== productId) || [],
    }));
  };

  const handleSiteSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = Number(e.target.value);
    if (selectedId && !formData.sites?.includes(selectedId)) {
      setFormData((prev) => ({
        ...prev,
        sites: [...(prev.sites || []), selectedId],
      }));
      setErrors((prev) => ({ ...prev, sites: "" }));
    }
    e.target.value = "";
  };

  const handleRemoveSite = (siteId: number) => {
    setFormData((prev) => ({
      ...prev,
      sites: prev.sites?.filter((id) => id !== siteId) || [],
    }));
  };

  const validateFormData = (data: Partial<IOffreC>): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!data.entity) newErrors.entity = "L'entité est requise";
    if (!data.client) newErrors.client = "Le client est requis";
    if (!data.produit?.length)
      newErrors.produit = "Au moins un produit est requis";
    if (!data.sites?.length) newErrors.sites = "Au moins un site est requis";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateFormData(formData)) {
      setIsSubmitting(true);
      try {
        const submissionData = {
          ...formData,
          date_modification: new Date().toISOString(),
        };
        await onSubmit(submissionData as IOffreC);
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 3000);
      } catch (error) {
        console.error("Error:", error);
        setErrors({ submit: "Une erreur est survenue lors de la soumission" });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const getProductName = (productId: number) => {
    return products.find((p) => p.id === productId)?.name || "Produit inconnu";
  };

  const getSiteName = (siteId: number) => {
    return sites.find((s) => s.id === siteId)?.nom || "Site inconnu";
  };

  return (
    <Card className="w-full max-w-[200vw] bg-white shadow-lg">
      <CardContent>
        <form onSubmit={handleSubmit} className="py-6">
          {showSuccessMessage && (
            <Alert className="mb-6 bg-green-50 border-green-200 rounded-lg">
              <Check className="w-5 h-5 text-green-500" />
              <AlertDescription className="text-green-700 font-medium">
                {isEditing
                  ? "Offre mise à jour avec succès !"
                  : "Offre créée avec succès !"}
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Section Informations Principales */}
            <div className="space-y-6 bg-white rounded-lg border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2 pb-2 border-b border-gray-100">
                <Building2 className="w-5 h-5 text-gray-500" />
                Informations Principales
              </h3>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    Entité <Info className="w-4 h-4 text-gray-400" />
                  </label>
                  <select
                    value={formData.entity || ""}
                    onChange={(e) => handleSelectChange(e, "entity")}
                    className={`w-full h-11 px-4 rounded-lg border ${
                      errors.entity
                        ? "border-red-300 bg-red-50"
                        : "border-gray-200"
                    } focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all`}
                  >
                    <option value="">Sélectionnez une entité</option>
                    {entities?.map((ent) => (
                      <option key={ent.id} value={ent.id}>
                        {ent.name}
                      </option>
                    ))}
                  </select>
                  {errors.entity && (
                    <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.entity}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    Client
                  </label>
                  <select
                    value={formData.client || ""}
                    onChange={(e) => handleSelectChange(e, "client")}
                    className={`w-full h-11 px-4 rounded-lg border ${
                      errors.client
                        ? "border-red-300 bg-red-50"
                        : "border-gray-200"
                    } focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all`}
                  >
                    <option value="">Sélectionnez un client</option>
                    {clients?.map((cli) => (
                      <option key={cli.id} value={cli.id}>
                        {cli.nom}
                      </option>
                    ))}
                  </select>
                  {errors.client && (
                    <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.client}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Section Produits */}
            <div className="space-y-6 bg-white rounded-lg border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2 pb-2 border-b border-gray-100">
                <Package className="w-5 h-5 text-gray-500" />
                Sélection des Produits
              </h3>

              <div className="space-y-4">
                <div className="space-y-3">
                  <select
                    value={category || ""}
                    onChange={handleCategorySelectChange}
                    className="w-full h-11 px-4 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all"
                  >
                    <option value="">Toutes les catégories</option>
                    {categories?.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>

                  <select
                    onChange={handleAddProduct}
                    className="w-full h-11 px-4 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all disabled:bg-gray-50 disabled:text-gray-500"
                    disabled={!category}
                  >
                    <option value="">
                      {category
                        ? "Ajouter un produit"
                        : "Veuillez d'abord sélectionner une catégorie"}
                    </option>
                    {filteredProducts.map((prod) => (
                      <option
                        key={prod.id}
                        value={prod.id}
                        disabled={formData.produit?.includes(prod.id)}
                      >
                        {prod.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {formData.produit?.map((productId) => (
                    <div
                      key={productId}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 group hover:border-blue-200 hover:shadow-sm transition-all"
                    >
                      <span className="text-sm text-gray-700">
                        {getProductName(productId)}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveProduct(productId)}
                        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                {errors.produit && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.produit}
                  </p>
                )}
              </div>
            </div>

            {/* Section Sites */}
            <div className="space-y-6 bg-white rounded-lg border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2 pb-2 border-b border-gray-100">
                <MapPin className="w-5 h-5 text-gray-500" />
                Sites d'intervention
              </h3>

              <div className="space-y-4">
                <select
                  onChange={handleSiteSelection}
                  className="w-full h-11 px-4 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all"
                >
                  <option value="">Ajouter un site</option>
                  {sites?.map((site) => (
                    <option
                      key={site.id}
                      value={site.id}
                      disabled={formData.sites?.includes(site.id)}
                    >
                      {site.nom}
                    </option>
                  ))}
                </select>

                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {formData.sites?.map((siteId) => (
                    <div
                      key={siteId}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 group hover:border-blue-200 hover:shadow-sm transition-all"
                    >
                      <span className="text-sm text-gray-700">
                        {getSiteName(siteId)}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSite(siteId)}
                        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                {errors.sites && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.sites}
                  </p>
                )}
              </div>
            </div>
          </div>
        </form>
      </CardContent>

      <CardFooter className="flex justify-end py-4 px-6 border-t border-gray-100 bg-gray-50">
        <button
          type="submit"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="px-6 py-2.5 text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-all focus:ring-2 focus:ring-blue-200 disabled:bg-blue-300 flex items-center gap-2 font-medium"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {initialData ? "Mise à jour..." : "Création..."}
            </>
          ) : initialData ? (
            "Mettre à jour"
          ) : (
            "Créer l'offre"
          )}
        </button>
      </CardFooter>
    </Card>
  );
};
export default OfferForm;
