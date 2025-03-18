// src/components/proforma/ProformaHeader.tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
    ArrowLeft,
    MoreHorizontal,
    Edit,
    FileDown,
    Save,
    XCircle,
    CheckCircle2,
    Clock,
    RefreshCw,
    CircleDashed
} from 'lucide-react';
import { IProformaDetail } from '@/services/proformaService';

interface ProformaHeaderProps {
    proforma: IProformaDetail | null;
    isLoading: boolean;
    isEditing: boolean;
    isSaving: boolean;
    isExporting: boolean;
    setIsEditing: (isEditing: boolean) => void;
    handleBackToList: () => void;
    handleExportPdf: () => void;
    handleCancelEdit: () => void;
    handleSaveChanges: () => void;
    setIsDeleteDialogOpen: (isOpen: boolean) => void;
    setIsStatusDialogOpen: (isOpen: boolean) => void;
    handleValidate: () => void;
    fetchProforma: () => void;
}

const ProformaHeader: React.FC<ProformaHeaderProps> = ({
    proforma,
    isLoading,
    isEditing,
    isSaving,
    isExporting,
    setIsEditing,
    handleBackToList,
    handleExportPdf,
    handleCancelEdit,
    handleSaveChanges,
    setIsStatusDialogOpen,
    handleValidate,
    fetchProforma
}) => {
    // Afficher le badge de statut
    const renderStatusBadge = (status: string) => {
        switch (status) {
            case 'BROUILLON':
                return <Badge variant="outline" className="bg-gray-100">
                    <CircleDashed className="mr-1 h-3 w-3" /> Brouillon
                </Badge>;
            case 'EN_COURS':
                return <Badge variant="outline" className="bg-blue-100 text-blue-800">
                    <Clock className="mr-1 h-3 w-3" /> En cours
                </Badge>;
            case 'VALIDE':
                return <Badge variant="outline" className="bg-green-100 text-green-800">
                    <CheckCircle2 className="mr-1 h-3 w-3" /> Validé
                </Badge>;
            case 'REFUSE':
                return <Badge variant="outline" className="bg-red-100 text-red-800">
                    <XCircle className="mr-1 h-3 w-3" /> Refusé
                </Badge>;
            case 'EXPIRE':
                return <Badge variant="outline" className="bg-amber-100 text-amber-800">
                    <Clock className="mr-1 h-3 w-3" /> Expiré
                </Badge>;
            case 'ANNULE':
                return <Badge variant="outline" className="bg-gray-100 text-gray-800">
                    <XCircle className="mr-1 h-3 w-3" /> Annulé
                </Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
                <Button variant="outline" size="icon" onClick={handleBackToList}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-3xl font-bold">
                    {isLoading ? 'Chargement...' : proforma ? `Proforma: ${proforma.reference}` : 'Détail Proforma'}
                </h1>
                {proforma && renderStatusBadge(proforma.statut)}
            </div>

            <div className="flex space-x-2">
                {proforma && !isEditing && (
                    <>
                        <Button
                            variant="outline"
                            onClick={() => setIsEditing(true)}
                            disabled={proforma.statut === 'VALIDE' || proforma.statut === 'REFUSE' || proforma.statut === 'ANNULE'}
                        >
                            <Edit className="mr-2 h-4 w-4" />
                            Modifier
                        </Button>

                        <Button
                            variant="outline"
                            onClick={handleExportPdf}
                            disabled={isExporting}
                        >
                            <FileDown className="mr-2 h-4 w-4" />
                            Exporter PDF
                        </Button>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>

                                {proforma.statut !== 'VALIDE' && (
                                    <DropdownMenuItem onClick={handleValidate}>
                                        <CheckCircle2 className="mr-2 h-4 w-4" />
                                        Valider
                                    </DropdownMenuItem>
                                )}

                                <DropdownMenuItem onClick={() => setIsStatusDialogOpen(true)}>
                                    <Clock className="mr-2 h-4 w-4" />
                                    Changer le statut
                                </DropdownMenuItem>

                                <DropdownMenuSeparator />

                                <DropdownMenuItem onClick={handleExportPdf}>
                                    <FileDown className="mr-2 h-4 w-4" />
                                    Exporter en PDF
                                </DropdownMenuItem>

                                <DropdownMenuItem onClick={fetchProforma}>
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    Actualiser
                                </DropdownMenuItem>

                                <DropdownMenuSeparator />

                            </DropdownMenuContent>
                        </DropdownMenu>
                    </>
                )}

                {isEditing && (
                    <>
                        <Button
                            variant="outline"
                            onClick={handleCancelEdit}
                        >
                            <XCircle className="mr-2 h-4 w-4" />
                            Annuler
                        </Button>

                        <Button
                            onClick={handleSaveChanges}
                            disabled={isSaving}
                        >
                            <Save className="mr-2 h-4 w-4" />
                            Enregistrer
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
};

export default ProformaHeader;