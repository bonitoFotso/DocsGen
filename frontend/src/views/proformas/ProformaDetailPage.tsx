// src/pages/ProformaDetailPage.tsx
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, Info, RefreshCw } from 'lucide-react';
import { useProformaPage } from '@/hooks/useProformaPage';

import ProformaHeader from '@/components/proforma/ProformaHeader';
import ProformaDetailTab from '@/components/proforma/ProformaDetailTab';
import ProformaClientTab from '@/components/proforma/ProformaClientTab';
import ProformaDocumentTab from '@/components/proforma/ProformaDocumentTab';
import StatusChangeDialog from '@/components/proforma/StatusChangeDialog';
import DeleteConfirmDialog from '@/components/proforma/DeleteConfirmDialog';

const ProformaDetailPage: React.FC = () => {
  const {
    id,
    proforma,
    isLoading,
    error,
    isEditing,
    setIsEditing,
    editedData,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    isStatusDialogOpen,
    setIsStatusDialogOpen,
    selectedStatus,
    setSelectedStatus,
    handleBackToList,
    handleInputChange,
    handleSaveChanges,
    handleCancelEdit,
    handleDelete,
    handleStatusChange,
    handleDownloadFile,
    handleFileChange,
    handleFileUpload,
    handleExportPdf,
    handleValidate,
    fetchProforma,
    isExporting,
    isUploading,
    selectedFile,
    navigate
  } = useProformaPage();

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* En-tête avec bouton retour et actions */}
      <ProformaHeader
        proforma={proforma}
        isLoading={isLoading}
        isEditing={isEditing}
        setIsEditing={setIsEditing}
        handleBackToList={handleBackToList}
        handleExportPdf={handleExportPdf}
        handleCancelEdit={handleCancelEdit}
        handleSaveChanges={handleSaveChanges}
        isSaving={isEditing}
        setIsDeleteDialogOpen={setIsDeleteDialogOpen}
        setIsStatusDialogOpen={setIsStatusDialogOpen}
        handleValidate={handleValidate}
        isExporting={isExporting}
        fetchProforma={() => fetchProforma(parseInt(id!))}
      />
      
      {error ? (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : isLoading ? (
        <Card>
          <CardContent className="py-10 text-center">
            <RefreshCw className="h-8 w-8 mx-auto mb-4 animate-spin text-muted-foreground" />
            <p>Chargement des détails de la proforma...</p>
          </CardContent>
        </Card>
      ) : !proforma ? (
        <Card>
          <CardContent className="py-10 text-center">
            <Info className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
            <p>Proforma introuvable</p>
            <Button 
              variant="outline" 
              onClick={handleBackToList}
              className="mt-4"
            >
              Retour à la liste
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="details" className="space-y-6">
          <TabsList>
            <TabsTrigger value="details">Détails</TabsTrigger>
            <TabsTrigger value="client">Client & Offre</TabsTrigger>
            <TabsTrigger value="document">Document</TabsTrigger>
          </TabsList>
          
          {/* Onglet Détails */}
          <TabsContent value="details">
            <ProformaDetailTab
              proforma={proforma}
              isEditing={isEditing}
              editedData={editedData}
              handleInputChange={handleInputChange}
            />
          </TabsContent>
          
          {/* Onglet Client & Offre */}
          <TabsContent value="client">
            <ProformaClientTab
              proforma={proforma}
              fetchProforma={() => fetchProforma(parseInt(id!))}
              navigate={navigate}
            />
          </TabsContent>
          
          {/* Onglet Document */}
          <TabsContent value="document">
            <ProformaDocumentTab
              proforma={proforma}
              handleDownloadFile={handleDownloadFile}
              handleFileChange={handleFileChange}
              handleFileUpload={handleFileUpload}
              handleExportPdf={handleExportPdf}
              selectedFile={selectedFile}
              isUploading={isUploading}
            />
          </TabsContent>
        </Tabs>
      )}
      
      {/* Dialogs */}
      <StatusChangeDialog
        isOpen={isStatusDialogOpen}
        onOpenChange={setIsStatusDialogOpen}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        onConfirm={handleStatusChange}
      />
      
      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default ProformaDetailPage;