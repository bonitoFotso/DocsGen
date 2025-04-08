import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface NoteDialogProps {
  open: boolean;
  onClose: () => void;
  note: string;
  onSave: (newNote: string) => void;
}

const NoteDialog: React.FC<NoteDialogProps> = ({ open, onClose, note, onSave }) => {
  const [editedNote, setEditedNote] = useState(note);
  
  // Synchronize editedNote when the note changes
  useEffect(() => {
    setEditedNote(note);
  }, [note]);
  
  const handleSave = () => {
    // Avoid saving an empty note
    if (!editedNote.trim()) {
      return;
    }
    onSave(editedNote.trim());
    onClose();
  };
  
  // Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSave();
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifier la note</DialogTitle>
        </DialogHeader>
        <Textarea
          className="mt-4 min-h-[100px]"
          placeholder="Votre note..."
          value={editedNote}
          onChange={(e) => setEditedNote(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={4}
          autoFocus
        />
        <DialogFooter className="gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button
            onClick={handleSave}
            disabled={!editedNote.trim()}
          >
            Enregistrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NoteDialog;