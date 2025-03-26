import React, { useCallback, useEffect, useState } from "react";
import { useServices } from "@/AppHooks";
import {
  RapportBase,
  RapportDetail,
  RapportEdit,
  AffaireBase,
  ProductBase,
  DocumentStatus,
} from "@/interfaces";
import {
  PlusCircle,
  Pencil,
  Trash2,
  X,
  AlertCircle,
  Loader2,
  FileText,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Send,
  XCircle,
  Package,
} from "lucide-react";

const getStatusLabel = (status: DocumentStatus): string => {
  const statusLabels: Record<DocumentStatus, string> = {
    BROUILLON: "Brouillon",
    ENVOYE: "Envoyé",
    VALIDE: "Validé",
    REFUSE: "Refusé",
    EN_COURS: "En cours",
    TERMINEE: "Terminée",
    ANNULEE: "Annulée",
  };
  return statusLabels[status] || status;
};

const getStatusIcon = (status: DocumentStatus) => {
  switch (status) {
    case "BROUILLON":
      return <Clock className="h-3 w-3 mr-1" />;
    case "ENVOYE":
      return <Send className="h-3 w-3 mr-1" />;
    case "VALIDE":
      return <CheckCircle2 className="h-3 w-3 mr-1" />;
    case "REFUSE":
      return <XCircle className="h-3 w-3 mr-1" />;
    case "EN_COURS":
      return <Clock className="h-3 w-3 mr-1" />;
    case "TERMINEE":
      return <CheckCircle2 className="h-3 w-3 mr-1" />;
    case "ANNULEE":
      return <X className="h-3 w-3 mr-1" />;
    default:
      return null;
  }
};

const getStatusBadgeClass = (status: DocumentStatus): string => {
  switch (status) {
    case "BROUILLON":
      return "bg-gray-100 text-gray-800";
    case "ENVOYE":
      return "bg-blue-100 text-blue-800";
    case "VALIDE":
      return "bg-green-100 text-green-800";
    case "REFUSE":
      return "bg-red-100 text-red-800";
    case "EN_COURS":
      return "bg-yellow-100 text-yellow-800";
    case "TERMINEE":
      return "bg-emerald-100 text-emerald-800";
    case "ANNULEE":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const RapportManagement = () => {
  const { rapportService, affaireService, productService } = useServices();
  const [rapports, setRapports] = useState<RapportBase[]>([]);
  const [affaires, setAffaires] = useState<AffaireBase[]>([]);
  // const [sites, setSites] = useState<SiteBase[]>([]);
  const [products, setProducts] = useState<ProductBase[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentRapport, setCurrentRapport] = useState<RapportDetail | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

  const [formData, setFormData] = useState<RapportEdit>({
    affaire: 0,
    // site: 0,
    produit: 0,
    statut: "BROUILLON",
  });

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [rapportsData, affairesData, productsData] = await Promise.all([
        rapportService.getAll(),
        affaireService.getAll(),
        productService.getAll(),
      ]);
      setRapports(rapportsData);
      setAffaires(affairesData);
      // setSites(sitesData);
      setProducts(productsData);
    } catch (err) {
      console.error(err);
      setError("Erreur lors du chargement des données");
    } finally {
      setIsLoading(false);
    }
  }, [rapportService, affaireService, productService]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (currentRapport) {
        await rapportService.update(currentRapport.id, formData);
      } else {
        await rapportService.create(formData);
      }
      setIsModalOpen(false);
      await loadData();
      resetForm();
    } catch (err) {
      console.error(err);
      setError("Erreur lors de la sauvegarde");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async (rapport: RapportBase) => {
    setIsLoading(true);
    try {
      const detailedRapport = await rapportService.getById(rapport.id);
      setCurrentRapport(detailedRapport);
      setFormData({
        affaire: detailedRapport.affaire.id,
        // site: detailedRapport.site.id,
        produit: detailedRapport.produit.id,
        statut: detailedRapport.statut,
      });
      setIsModalOpen(true);
    } catch (err) {
      console.error(err);
      setError("Erreur lors du chargement du rapport");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    setIsDeleting(id);
    try {
      await rapportService.delete(id);
      await loadData();
    } catch (err) {
      console.error(err);
      setError("Erreur lors de la suppression");
    } finally {
      setIsDeleting(null);
    }
  };

  const resetForm = () => {
    setCurrentRapport(null);
    setFormData({
      affaire: 0,
      // site: 0,
      produit: 0,
      statut: "BROUILLON",
    });
    setError(null);
  };

  const handleNewRapport = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const filteredRapports = rapports.filter((rapport) =>
    rapport.reference.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-rose-50 to-pink-50">
        <div className="flex items-center gap-2">
          <FileText className="h-6 w-6 text-rose-600" />
          <h1 className="text-2xl font-bold text-gray-800">
            Gestion des Rapports
          </h1>
        </div>
        <button
          onClick={handleNewRapport}
          className="bg-rose-600 text-white px-4 py-2 rounded-lg hover:bg-rose-700 transition-all duration-200 transform hover:scale-105 flex items-center gap-2 shadow-md"
        >
          <PlusCircle className="h-5 w-5" />
          Nouveau Rapport
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 m-4 animate-fadeIn">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-3" />
            <p className="text-sm">{error}</p>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-400 hover:text-red-500"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      <div className="p-4">
        <div className="mb-4">
          <input
            type="text"
            placeholder="Rechercher par référence..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors duration-200"
          />
        </div>

        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Référence
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Affaire
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Site
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Produit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date Création
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading && !rapports.length ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-rose-500" />
                      <span className="ml-2 text-gray-600">Chargement...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredRapports.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    Aucun rapport trouvé
                  </td>
                </tr>
              ) : (
                filteredRapports.map((rapport) => (
                  <tr
                    key={rapport.id}
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {rapport.reference}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Building2 className="h-4 w-4 mr-2" />
                        <span>{rapport.affaire.reference}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Package className="h-4 w-4 mr-2" />
                        <span>{rapport.produit.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>{formatDate(rapport.date_creation)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(
                          rapport.statut
                        )}`}
                      >
                        {getStatusIcon(rapport.statut)}
                        {getStatusLabel(rapport.statut)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                      <button
                        onClick={() => handleEdit(rapport)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4 transition-colors duration-200 inline-flex items-center"
                        disabled={isLoading}
                      >
                        <Pencil className="h-4 w-4 mr-1" />
                        Modifier
                      </button>
                      <button
                        onClick={() => handleDelete(rapport.id)}
                        className="text-red-600 hover:text-red-900 transition-colors duration-200 inline-flex items-center"
                        disabled={isDeleting === rapport.id}
                      >
                        {isDeleting === rapport.id ? (
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4 mr-1" />
                        )}
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-xl w-full max-w-2xl transform transition-all duration-200 animate-slideIn">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {currentRapport ? "Modifier le rapport" : "Nouveau rapport"}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-500 transition-colors duration-200"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Affaire
                  </label>
                  <select
                    value={formData.affaire}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        affaire: Number(e.target.value),
                      })
                    }
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all duration-200"
                  >
                    <option value="">Sélectionnez une affaire</option>
                    {affaires.map((affaire) => (
                      <option key={affaire.id} value={affaire.id}>
                        {affaire.reference}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Produit
                    </label>
                    <select
                      value={formData.produit}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          produit: Number(e.target.value),
                        })
                      }
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all duration-200"
                    >
                      <option value="">Sélectionnez un produit</option>
                      {products.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Statut
                  </label>
                  <select
                    value={formData.statut}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        statut: e.target.value as DocumentStatus,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all duration-200"
                  >
                    <option value="BROUILLON">Brouillon</option>
                    <option value="ENVOYE">Envoyé</option>
                    <option value="VALIDE">Validé</option>
                    <option value="REFUSE">Refusé</option>
                    <option value="EN_COURS">En cours</option>
                    <option value="TERMINEE">Terminée</option>
                    <option value="ANNULEE">Annulée</option>
                  </select>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all duration-200"
                    disabled={isLoading}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-all duration-200 flex items-center"
                    disabled={isLoading}
                  >
                    {isLoading && (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    )}
                    {currentRapport ? "Modifier" : "Créer"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RapportManagement;
