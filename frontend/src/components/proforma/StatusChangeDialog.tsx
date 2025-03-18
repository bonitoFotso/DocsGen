// src/components/proforma/StatusChangeDialog.tsx
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface StatusChangeDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  selectedStatus: string;
  setSelectedStatus: (status: string) => void;
  onConfirm: () => void;
}

const StatusChangeDialog: React.FC<StatusChangeDialogProps> = ({
  isOpen,
  onOpenChange,
  selectedStatus,
  setSelectedStatus,
  onConfirm
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Changer le statut</DialogTitle>
          <DialogDescription>
            Sélectionnez le nouveau statut pour cette proforma.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Select
            value={selectedStatus}
            onValueChange={setSelectedStatus}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionnez un statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="BROUILLON">Brouillon</SelectItem>
              <SelectItem value="EN_COURS">En cours</SelectItem>
              <SelectItem value="VALIDE">Validé</SelectItem>
              <SelectItem value="REFUSE">Refusé</SelectItem>
              <SelectItem value="EXPIRE">Expiré</SelectItem>
              <SelectItem value="ANNULE">Annulé</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button
            onClick={onConfirm}
            disabled={!selectedStatus}
          >
            Confirmer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StatusChangeDialog;