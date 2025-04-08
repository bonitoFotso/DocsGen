import React, { useState, useRef } from 'react';
import { FileText, Download, Upload, File, FilePlus, FileImage, FileSpreadsheet, X, RefreshCw } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface DocumentsCardProps {
  documentUrl: string | null;
  onDocumentUpload?: (file: File) => Promise<string> | void;
}

const DocumentsCard: React.FC<DocumentsCardProps> = ({
  documentUrl,
  onDocumentUpload,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileInfo, setFileInfo] = useState<{
    name: string;
    type: string;
    size: number;
  } | null>(null);
  const [uploadedDocumentUrl, setUploadedDocumentUrl] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadInterface, setShowUploadInterface] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);


  // Get file icon based on file type
  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) {
      return <FileText className="h-5 w-5 text-red-500" />;
    } else if (fileType.includes('image')) {
      return <FileImage className="h-5 w-5 text-blue-500" />;
    } else if (fileType.includes('spreadsheet') || fileType.includes('excel')) {
      return <FileSpreadsheet className="h-5 w-5 text-green-500" />;
    } else {
      return <File className="h-5 w-5 text-gray-500" />;
    }
  };

  // Validate file
  const validateFile = (file: File): boolean => {
    // Example validation - adjust according to your needs
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      'application/pdf', 
      'image/jpeg', 
      'image/png', 
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];
    
    if (file.size > maxSize) {
      setError('Le fichier est trop volumineux (max 10MB)');
      return false;
    }
    
    if (!allowedTypes.includes(file.type)) {
      setError('Type de fichier non autorisé (PDF, JPEG, PNG, Excel)');
      return false;
    }
    
    setError(null);
    return true;
  };

  // Handle file input change
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        setFileInfo({
          name: file.name,
          type: file.type,
          size: file.size
        });
        
        if (onDocumentUpload) {
          try {
            setIsUploading(true);
            setError(null);
            
            // Gestion de l'upload
            const result = onDocumentUpload(file);
            
            // Vérifier si la fonction renvoie une promesse
            if (result instanceof Promise) {
              const uploadedFileUrl = await result;
              if (uploadedFileUrl) {
                setUploadedDocumentUrl(uploadedFileUrl);
              } else {
                // Considérer l'upload comme réussi même sans URL retournée
                // Utiliser le nom du fichier comme indicateur visuel
                setUploadSuccess(true);
              }
            } else {
              // Si aucune promesse n'est retournée, considérer l'upload comme réussi
              setUploadSuccess(true);
            }
            
            // Un délai court pour montrer visuellement le processus d'upload
            setTimeout(() => {
              setIsUploading(false);
              setShowUploadInterface(false);
            }, 500);
          } catch (err) {
            setError("Échec du téléchargement. Veuillez réessayer.");
            console.error("Upload error:", err);
            setIsUploading(false);
          }
        }
      }
    }
  };

  // Handle drag events
  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  // Handle drop event
  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        setFileInfo({
          name: file.name,
          type: file.type,
          size: file.size
        });
        
        if (onDocumentUpload) {
          try {
            setIsUploading(true);
            setError(null);
            
            // Gestion de l'upload
            const result = onDocumentUpload(file);
            
            // Vérifier si la fonction renvoie une promesse
            if (result instanceof Promise) {
              const uploadedFileUrl = await result;
              if (uploadedFileUrl) {
                setUploadedDocumentUrl(uploadedFileUrl);
              } else {
                // Considérer l'upload comme réussi même sans URL retournée
                setUploadSuccess(true);
              }
            } else {
              // Si aucune promesse n'est retournée, considérer l'upload comme réussi
              setUploadSuccess(true);
            }
            
            // Un délai court pour montrer visuellement le processus d'upload
            setTimeout(() => {
              setIsUploading(false);
              setShowUploadInterface(false);
            }, 500);
          } catch (err) {
            setError("Échec du téléchargement. Veuillez réessayer.");
            console.error("Upload error:", err);
            setIsUploading(false);
          }
        }
      }
    }
  };

  // Handle download
  const handleDownload = () => {
    const urlToDownload = uploadedDocumentUrl || documentUrl;
    if (urlToDownload) {
      window.open(urlToDownload, '_blank');
    }
  };

  // Open file selector
  const openFileSelector = () => {
    inputRef.current?.click();
  };

  // Extract filename from URL
  const getFilenameFromUrl = (url: string): string => {
    const parts = url.split('/');
    return parts[parts.length - 1];
  };

  // Get file type from URL
  const getFileTypeFromUrl = (url: string): string => {
    const extension = url.split('.').pop()?.toLowerCase() || '';
    switch (extension) {
      case 'pdf': return 'application/pdf';
      case 'jpg':
      case 'jpeg': return 'image/jpeg';
      case 'png': return 'image/png';
      case 'xlsx': return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      case 'xls': return 'application/vnd.ms-excel';
      default: return 'application/octet-stream';
    }
  };

  // Show upload interface to replace file
  const handleReplaceFile = () => {
    setShowUploadInterface(true);
  };

  // Cancel replace and show the current file
  const cancelReplace = () => {
    setShowUploadInterface(false);
    setError(null);
  };

  // Déterminer si on doit afficher le document ou l'interface d'upload
  const shouldDisplayDocument = !showUploadInterface && (uploadedDocumentUrl || documentUrl || (fileInfo && uploadSuccess));

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Documents</CardTitle>
      </CardHeader>
      <CardContent>
        {isUploading ? (
          <div className="py-8">
            <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
              <div className="h-2 bg-primary rounded-full animate-pulse w-3/4"></div>
            </div>
            <p className="text-sm text-center text-muted-foreground mt-3">Téléchargement en cours...</p>
          </div>
        ) : !shouldDisplayDocument ? (
          <div 
            className={`rounded-md border-2 border-dashed p-6 text-center transition-colors ${
              dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/20'
            }`}
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={inputRef}
              type="file"
              className="hidden"
              onChange={handleFileChange}
              accept=".pdf,.jpg,.jpeg,.png,.xlsx,.xls"
            />
            <Upload className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
            <p className="text-sm font-medium mb-1">Glissez-déposez vos fichiers ici</p>
            <p className="text-xs text-muted-foreground mb-3">ou</p>
            <Button 
              variant="outline" 
              onClick={openFileSelector}
              className="mt-2"
            >
              <FilePlus className="h-4 w-4 mr-2" />
              Parcourir
            </Button>
            {error && (
              <p className="text-sm text-red-500 mt-3">{error}</p>
            )}
            
            {showUploadInterface && (
              <Button 
                variant="ghost" 
                onClick={cancelReplace}
                className="mt-3 text-xs"
              >
                <X className="h-3 w-3 mr-1" />
                Annuler
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/50 group">
              <div className="flex items-center gap-3">
                {uploadedDocumentUrl ? (
                  getFileIcon(getFileTypeFromUrl(uploadedDocumentUrl))
                ) : documentUrl ? (
                  getFileIcon(getFileTypeFromUrl(documentUrl))
                ) : fileInfo ? (
                  getFileIcon(fileInfo.type)
                ) : (
                  <File className="h-5 w-5 text-gray-500" />
                )}
                
                <div>
                  <div className="text-sm font-medium line-clamp-1">
                    {uploadedDocumentUrl ? getFilenameFromUrl(uploadedDocumentUrl) : 
                     documentUrl ? getFilenameFromUrl(documentUrl) : 
                     fileInfo ? fileInfo.name : 'Document'}
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                    {uploadedDocumentUrl && (
                      <span>{getFileTypeFromUrl(uploadedDocumentUrl).split('/')[1]?.toUpperCase()}</span>
                    )}
                    {documentUrl && !uploadedDocumentUrl && (
                      <span>{getFileTypeFromUrl(documentUrl).split('/')[1]?.toUpperCase()}</span>
                    )}
                    {fileInfo && !uploadedDocumentUrl && !documentUrl && (
                      <span>{fileInfo.type.split('/')[1]?.toUpperCase()}</span>
                    )}
                    
                    {(uploadedDocumentUrl || uploadSuccess) && (
                      <>
                        <span>•</span>
                        <span className="text-green-500">Téléchargé avec succès</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <TooltipProvider>
                  {(uploadedDocumentUrl || documentUrl) && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDownload()}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Télécharger</TooltipContent>
                    </Tooltip>
                  )}
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={handleReplaceFile}
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Changer de fichier</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>
        )}
      </CardContent>

      {!shouldDisplayDocument && !isUploading && !showUploadInterface && (
        <CardFooter>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="default" className="w-full">
                <FilePlus className="h-4 w-4 mr-2" />
                Ajouter un document
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={openFileSelector}>
                <Upload className="h-4 w-4 mr-2" />
                Télécharger un fichier
              </DropdownMenuItem>
              <DropdownMenuItem>
                <FileImage className="h-4 w-4 mr-2" />
                Prendre une photo
              </DropdownMenuItem>
              <DropdownMenuItem>
                <FileText className="h-4 w-4 mr-2" />
                Créer un document
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardFooter>
      )}
      
      {shouldDisplayDocument && (
        <CardFooter>
          <Button 
            variant="outline" 
            className="w-full"
            onClick={handleReplaceFile}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Changer de fichier
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default DocumentsCard;