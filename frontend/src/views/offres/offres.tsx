import { ErrorAlert } from "@/components/ui/ErrorAlert";
import { SearchInput } from "@/components/ui/SearchInput";
import { useOffres } from "@/hooks/useOffres";
import { FileText, PlusCircle } from "lucide-react";
import { OffreTable } from "./offreTable";
import { OffreDetails } from "./OfferDetails";
import { OffreForm } from "./OffreForm";


const OffreManagement = () => {
  const {
    offres,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    selectedOffre,
    setSelectedOffre,
    handleViewDetails,
    handleEdit,
    handleDelete,
    isDeleting,
    isModalOpen,
    setIsModalOpen,
    handleNewOffre,
    handleSubmit,
    formData,
    setFormData,
    currentOffre,
    clients,
    products,
    categories,
    sites,
    entities,
    setError,
  } = useOffres();

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-6 sm:p-8 border-b border-gray-100 bg-gradient-to-r from-purple-50 via-indigo-50 to-purple-50">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 rounded-xl">
                  <FileText className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Gestion des Offres</h1>
                  <p className="text-sm text-gray-500 mt-1">Gérez vos offres commerciales</p>
                </div>
              </div>
              <button
                onClick={handleNewOffre}
                className="w-full sm:w-auto bg-purple-600 text-white px-6 py-3 rounded-xl hover:bg-purple-700 
                         transition-all duration-200 transform hover:scale-105 hover:shadow-lg
                         flex items-center justify-center gap-2 group"
              >
                <PlusCircle className="h-5 w-5 group-hover:rotate-90 transition-transform duration-200" />
                Nouvelle Offre
              </button>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && <ErrorAlert error={error} onDismiss={() => setError(null)} />}

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-6">
            <SearchInput
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mb-6"
            />

            <OffreTable
              offres={offres}
              isLoading={isLoading}
              onViewDetails={handleViewDetails}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isDeleting={isDeleting}
            />
          </div>
        </div>

        {/* Details Slide-over */}
        {selectedOffre && (
          <OffreDetails
            offre={selectedOffre}
            onClose={() => setSelectedOffre(null)}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isDeleting={isDeleting}
          />
        )}

        {/* Edit/Create Modal */}
        {isModalOpen && (
          <OffreForm
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSubmit={handleSubmit}
            formData={formData}
            setFormData={setFormData}
            isLoading={isLoading}
            currentOffre={currentOffre}
            clients={clients}
            products={products}
            sites={sites}
            entities={entities}
            categories={categories}
          />
        )}
      </div>
    </div>
  );
};

export default OffreManagement;