import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { TabsContent } from "@/components/ui/tabs";
import { FileText, Download, Plus, Eye, File, FileImage, FileText as FileTextIcon, FileCode, FileSpreadsheet, FileLock, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from 'sonner';

interface DocumentsTabProps {
  courrier: {
    fichier?: string;
    fichier_taille?: number;
  };
}

const DocumentsTab: React.FC<DocumentsTabProps> = ({ courrier }) => {
  const [previewOpen, setPreviewOpen] = useState<boolean>(false);
  const [currentFile, setCurrentFile] = useState<string | null>(null);

  // Fonction pour déterminer l'icône du fichier en fonction de son type
  const getFileIcon = (fileUrl?: string) => {
    if (!fileUrl) return <FileText className="h-10 w-10 text-slate-400" />;
    
    const extension = fileUrl.split('.').pop()?.toLowerCase() || '';
    
    switch (extension) {
      case 'pdf':
        return <FileTextIcon className="h-10 w-10 text-red-500" />;
      case 'doc':
      case 'docx':
        return <FileTextIcon className="h-10 w-10 text-blue-600" />;
      case 'xls':
      case 'xlsx':
        return <FileSpreadsheet className="h-10 w-10 text-green-600" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'webp':
        return <FileImage className="h-10 w-10 text-purple-500" />;
      case 'txt':
        return <FileTextIcon className="h-10 w-10 text-slate-600" />;
      case 'zip':
      case 'rar':
      case '7z':
        return <FileLock className="h-10 w-10 text-amber-600" />;
      case 'html':
      case 'css':
      case 'js':
        return <FileCode className="h-10 w-10 text-green-500" />;
      default:
        return <File className="h-10 w-10 text-slate-600" />;
    }
  };

  // Fonction pour obtenir le nom du fichier à partir de l'URL
  const getFileName = (fileUrl?: string): string => {
    if (!fileUrl) return "Document";
    const segments = fileUrl.split('/');
    let filename = segments[segments.length - 1];
    // Décodage URL si nécessaire
    try {
      filename = decodeURIComponent(filename);
    } catch (e) {
        console.log(e);
      // Si le décodage échoue, utilisez le nom tel quel
    }
    return filename;
  };

  // Fonction pour formater la taille du fichier
  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return "Taille inconnue";
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  // Fonction pour télécharger le fichier
  const handleDownload = (fileUrl?: string): void => {
    if (!fileUrl) return;
    
    toast("Téléchargement",{
      description: "Le document est en cours de téléchargement",
    });
    
    // Téléchargement du fichier
    window.open(fileUrl, '_blank');
  };

  // Fonction pour prévisualiser le fichier
  const handlePreview = (fileUrl?: string): void => {
    if (!fileUrl) return;
    
    setCurrentFile(fileUrl);
    setPreviewOpen(true);
  };

  // Fonction pour déterminer si le fichier est prévisualisable
  const isPreviewable = (fileUrl?: string): boolean => {
    if (!fileUrl) return false;
    
    const extension = fileUrl.split('.').pop()?.toLowerCase() || '';
    const previewableTypes = ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'webp', 'txt'];
    
    return previewableTypes.includes(extension);
  };

  return (
    <>
      <TabsContent value="documents" className="mt-0">
        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Documents joints</CardTitle>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un document
            </Button>
          </CardHeader>
          <Separator />
          <CardContent className="p-6">
            {courrier.fichier ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="overflow-hidden border border-slate-200 hover:shadow-md transition-shadow">
                  <div className="bg-slate-100 h-32 flex items-center justify-center relative group">
                    {getFileIcon(courrier.fichier)}
                    
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                      {isPreviewable(courrier.fichier) && (
                        <Button 
                          size="sm" 
                          variant="secondary" 
                          className="mr-2"
                          onClick={() => handlePreview(courrier.fichier)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Aperçu
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        variant="secondary"
                        onClick={() => handleDownload(courrier.fichier)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Télécharger
                      </Button>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex flex-col">
                      <h4 className="font-medium text-sm truncate mb-1" title={getFileName(courrier.fichier)}>
                        {getFileName(courrier.fichier)}
                      </h4>
                      <p className="text-xs text-slate-500 mb-3">
                        {courrier.fichier_taille ? 
                          formatFileSize(courrier.fichier_taille) : 
                          formatFileSize(0)}
                      </p>
                      <div className="flex justify-between mt-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="w-full mr-2"
                          onClick={() => handleDownload(courrier.fichier)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Télécharger
                        </Button>
                        {isPreviewable(courrier.fichier) && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="px-3"
                            onClick={() => handlePreview(courrier.fichier)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="bg-slate-100 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-medium mb-2">Aucun document joint</h3>
                <p className="text-slate-500 mb-6 max-w-md mx-auto">
                  Ce courrier ne contient pas encore de documents joints. Vous pouvez ajouter des fichiers pour les associer à ce courrier.
                </p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un document
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* Boîte de dialogue d'aperçu du document */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader className="flex flex-row items-center justify-between">
            <DialogTitle className="text-xl font-semibold">
              Aperçu du document
            </DialogTitle>
            <Button variant="ghost" size="icon" onClick={() => setPreviewOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>
          
          <div className="flex-1 min-h-[500px] overflow-hidden bg-slate-100 rounded-md">
            {currentFile && (
              <div className="w-full h-full">
                {currentFile.toLowerCase().endsWith('.pdf') ? (
                  <iframe 
                    src={`${currentFile}#view=FitH`} 
                    className="w-full h-full"
                    title="Aperçu PDF"
                  />
                ) : currentFile.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                  <div className="w-full h-full flex items-center justify-center p-4">
                    <img 
                      src={currentFile} 
                      alt="Aperçu du document" 
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                ) : currentFile.toLowerCase().endsWith('.txt') ? (
                  <iframe 
                    src={currentFile} 
                    className="w-full h-full"
                    title="Aperçu texte"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center">
                    <FileText className="h-16 w-16 text-slate-400 mb-4" />
                    <p className="text-slate-500">Aperçu non disponible pour ce type de fichier</p>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <DialogFooter className="mt-4">
            <Button 
              variant="outline" 
              onClick={() => setPreviewOpen(false)}
              className="mr-2"
            >
              Fermer
            </Button>
            <Button 
              onClick={() => currentFile && handleDownload(currentFile)}
            >
              <Download className="h-4 w-4 mr-2" />
              Télécharger
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DocumentsTab;