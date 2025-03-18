// src/components/proforma/ProformaDocumentTab.tsx
import React from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  FileText,
  FilePlus,
  FileDown,
  Upload,
  Eye,
  Printer,
  Mail
} from 'lucide-react';
import { IProformaDetail } from '@/services/proformaService';

interface ProformaDocumentTabProps {
  proforma: IProformaDetail;
  handleDownloadFile: () => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleFileUpload: () => void;
  handleExportPdf: () => void;
  selectedFile: File | null;
  isUploading: boolean;
}

const ProformaDocumentTab: React.FC<ProformaDocumentTabProps> = ({
  proforma,
  handleDownloadFile,
  handleFileChange,
  handleFileUpload,
  handleExportPdf,
  selectedFile,
  isUploading
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Document</CardTitle>
        <CardDescription>Téléchargez ou visualisez le document de la proforma</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {proforma.fichier ? (
          <div className="space-y-4">
            <div className="p-4 border rounded-md flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <FileText className="h-10 w-10 text-blue-500" />
                <div>
                  <p className="font-medium">{proforma.fichier.split('/').pop()}</p>
                  <p className="text-sm text-muted-foreground">Document proforma</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadFile}
                >
                  <FileDown className="h-4 w-4 mr-2" />
                  Télécharger
                </Button>

                {/* Si vous avez un lecteur PDF intégré, vous pouvez ajouter un bouton pour visualiser */}
                <Button size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  Visualiser
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Remplacer le document</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="file-upload"
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.xls,.xlsx"
                />
                <Button
                  onClick={handleFileUpload}
                  disabled={!selectedFile || isUploading}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {isUploading ? 'Envoi...' : 'Envoyer'}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-8 border border-dashed rounded-md text-center">
              <FilePlus className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-medium">Aucun document téléchargé</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Téléchargez un fichier PDF ou document pour cette proforma
              </p>
            </div>

            <div className="space-y-2">
              <Label>Télécharger un document</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="file-upload"
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.xls,.xlsx"
                />
                <Button
                  onClick={handleFileUpload}
                  disabled={!selectedFile || isUploading}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {isUploading ? 'Envoi...' : 'Envoyer'}
                </Button>
              </div>
            </div>
          </div>
        )}

        <Separator />

        <div className="space-y-2">
          <h3 className="font-medium text-lg">Actions de document</h3>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={handleExportPdf}>
              <FileDown className="h-4 w-4 mr-2" />
              Exporter en PDF
            </Button>

            <Button variant="outline">
              <Printer className="h-4 w-4 mr-2" />
              Imprimer
            </Button>

            <Button variant="outline">
              <Mail className="h-4 w-4 mr-2" />
              Envoyer par email
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProformaDocumentTab;