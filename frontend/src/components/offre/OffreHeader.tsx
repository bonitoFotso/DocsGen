// components/offre/OffreHeader.tsx
import React from 'react';
import { 
  ChevronLeft, 
  Edit, 
  Printer, 
  FileDown, 
  MoreHorizontal, 
  Archive, 
  Mail, 
  Trash2 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

interface OffreHeaderProps {
  onBack: () => void;
  onEdit: () => void;
  onPrint?: () => void;
  onDownload?: () => void;
  onArchive?: () => void;
  onSendEmail?: () => void;
  onDelete?: () => void;
}

const OffreHeader: React.FC<OffreHeaderProps> = ({
  onBack,
  onEdit,
  onPrint,
  onDownload,
  onArchive,
  onSendEmail,
  onDelete
}) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        <h1 className="text-2xl font-bold">Détails de l'offre</h1>
      </div>
      
      <div className="flex items-center gap-2">
        <TooltipProvider>
          {onPrint && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={onPrint}>
                  <Printer className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Imprimer</TooltipContent>
            </Tooltip>
          )}
          
          {onDownload && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={onDownload}>
                  <FileDown className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Télécharger PDF</TooltipContent>
            </Tooltip>
          )}
        </TooltipProvider>
        
        <Button variant="outline" size="sm" onClick={onEdit}>
          <Edit className="h-4 w-4 mr-2" />
          Modifier
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {onArchive && (
              <DropdownMenuItem onClick={onArchive}>
                <Archive className="h-4 w-4 mr-2" />
                Archiver
              </DropdownMenuItem>
            )}
            {onSendEmail && (
              <DropdownMenuItem onClick={onSendEmail}>
                <Mail className="h-4 w-4 mr-2" />
                Envoyer par email
              </DropdownMenuItem>
            )}
            {onDelete && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-red-600"
                  onClick={onDelete}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default OffreHeader;