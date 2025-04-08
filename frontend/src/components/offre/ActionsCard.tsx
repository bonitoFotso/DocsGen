// components/offre/ActionsCard.tsx
import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, Mail, Send } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { DatePicker } from '@/components/ui/date-picker';
import { fr } from 'date-fns/locale';
import { format } from 'date-fns';
import { Label } from '../ui/label';

// Types pour les statuts d'offre pour éviter les erreurs de chaîne
export type OffreStatus = 'BROUILLON' | 'ENVOYE' | 'GAGNE' | 'PERDU';

interface StatusConfig {
  color: string;
  icon: React.ReactNode;
}

interface ActionConfig {
  type: 'won' | 'lost' | 'send' | 'reminder';
  label: string;
  icon: React.ReactNode;
  buttonVariant: 'default' | 'outline';
  buttonClass: string;
  dialogTitle: string;
  dialogDescription: string;
  dialogActionClass: string;
  showCondition: (status: OffreStatus, needsReminder: boolean) => boolean;
  onAction: () => void;
}

interface ActionsCardProps {
  statut: OffreStatus;
  necessite_relance: boolean;
  onMarkWon: (date_validation: string) => Promise<{success: boolean; current_status?: OffreStatus}>;
  onMarkLost: (date_cloture: string) => Promise<{success: boolean; current_status?: OffreStatus}>;
  onSendReminder: () => Promise<{success: boolean}>;
  onSendOffer: (date_envoi: string) => Promise<{success: boolean; current_status?: OffreStatus}>;
  isLoading?: boolean;
  onStatusChange?: (newStatus: OffreStatus) => void;
}

const ActionsCard: React.FC<ActionsCardProps> = ({
  statut: initialStatut,
  necessite_relance: initialNecessiteRelance,
  onMarkWon,
  onMarkLost,
  onSendReminder,
  onSendOffer,
  isLoading: externalLoading = false,
  onStatusChange
}) => {
  // États locaux pour permettre le rechargement sans props externes
  const [statut, setStatut] = useState<OffreStatus>(initialStatut);
  const [necessite_relance, setNecessiteRelance] = useState<boolean>(initialNecessiteRelance);
  const [loading, setLoading] = useState<{[key: string]: boolean}>({});
  const [activeDialog, setActiveDialog] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  // Synchronisation avec les props externes
  useEffect(() => {
    setStatut(initialStatut);
  }, [initialStatut]);
  
  useEffect(() => {
    setNecessiteRelance(initialNecessiteRelance);
  }, [initialNecessiteRelance]);
  
  // Détermine si une action est en cours de chargement
  const isLoading = externalLoading || Object.values(loading).some(v => v);
  
  // Implémentation des fonctions de traitement si elles ne sont pas fournies
  const handleMarkWon = onMarkWon ;

  const handleMarkLost = onMarkLost;

  const handleSendOffer = onSendOffer ;


  // Configuration des statuts
  const statusConfigs: { [key in OffreStatus]: StatusConfig } = {
    'GAGNE': {
      color: 'text-green-600 border-green-200 bg-green-50',
      icon: <CheckCircle2 className="h-4 w-4 mr-1" />
    },
    'PERDU': {
      color: 'text-red-600 border-red-200 bg-red-50',
      icon: <XCircle className="h-4 w-4 mr-1" />
    },
    'ENVOYE': {
      color: 'text-blue-600 border-blue-200 bg-blue-50',
      icon: <Send className="h-4 w-4 mr-1" />
    },
    'BROUILLON': {
      color: 'text-amber-600 border-amber-200 bg-amber-50',
      icon: null
    }
  };

  // Configuration des actions avec gestion asynchrone et rechargement
  // Configuration des actions avec gestion asynchrone et rechargement
  const getActionConfigs = (): ActionConfig[] => [
    {
      type: 'send',
      label: 'Envoyer l\'offre',
      icon: <Send className="h-4 w-4 mr-2" />,
      buttonVariant: 'default',
      buttonClass: 'w-full',
      dialogTitle: 'Confirmer l\'action',
      dialogDescription: 'Êtes-vous sûr de vouloir envoyer cette offre au client ?',
      dialogActionClass: 'bg-blue-600 hover:bg-blue-700',
      showCondition: (status) => status === 'BROUILLON',
      onAction: async () => {
        if (!handleSendOffer) {
          console.error('Fonction d\'envoi non disponible');
          setActiveDialog(null);
          return;
        }

        try {
          setLoading(prev => ({ ...prev, send: true }));
          const response = await handleSendOffer(format(selectedDate, 'yyyy-MM-dd'));
          
          if (response.success && response.current_status) {
            // Mise à jour locale du statut
            setStatut(response.current_status);
            // Notification au parent
            if (onStatusChange) onStatusChange(response.current_status);
          }
        } catch (error) {
          console.error('Erreur lors de l\'envoi de l\'offre:', error);
        } finally {
          setActiveDialog(null);
          setLoading(prev => ({ ...prev, send: false }));
        }
      }
    },
    {
      type: 'won',
      label: 'Marquer comme gagnée',
      icon: <CheckCircle2 className="h-4 w-4 mr-2" />,
      buttonVariant: 'default',
      buttonClass: 'w-full',
      dialogTitle: 'Confirmer l\'action',
      dialogDescription: 'Êtes-vous sûr de vouloir marquer cette offre comme gagnée ?',
      dialogActionClass: 'bg-green-600 hover:bg-green-700',
      showCondition: (status) => status === 'ENVOYE',
      onAction: async () => {
        try {
          setLoading(prev => ({ ...prev, won: true }));
          const response = await handleMarkWon(format(selectedDate, 'yyyy-MM-dd'));
          
          if (response.success && response.current_status) {
            // Mise à jour locale du statut
            setStatut(response.current_status);
            // Notification au parent
            if (onStatusChange) onStatusChange(response.current_status);
          }
        } catch (error) {
          console.error('Erreur lors du marquage comme gagnée:', error);
        } finally {
          setActiveDialog(null);
          setLoading(prev => ({ ...prev, won: false }));
        }
      }
    },
    {
      type: 'lost',
      label: 'Marquer comme perdue',
      icon: <XCircle className="h-4 w-4 mr-2" />,
      buttonVariant: 'outline',
      buttonClass: 'w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200',
      dialogTitle: 'Confirmer l\'action',
      dialogDescription: 'Êtes-vous sûr de vouloir marquer cette offre comme perdue ?',
      dialogActionClass: 'bg-red-600 hover:bg-red-700',
      showCondition: (status) => status === 'ENVOYE',
      onAction: async () => {
        try {
          setLoading(prev => ({ ...prev, lost: true }));
          const response = await handleMarkLost(format(selectedDate, 'yyyy-MM-dd'));
          
          if (response.success && response.current_status) {
            // Mise à jour locale du statut
            setStatut(response.current_status);
            // Notification au parent
            if (onStatusChange) onStatusChange(response.current_status);
          }
        } catch (error) {
          console.error('Erreur lors du marquage comme perdue:', error);
        } finally {
          setActiveDialog(null);
          setLoading(prev => ({ ...prev, lost: false }));
        }
      }
    },
    {
      type: 'reminder',
      label: 'Envoyer une relance',
      icon: <Mail className="h-4 w-4 mr-2" />,
      buttonVariant: 'outline',
      buttonClass: 'w-full',
      dialogTitle: 'Confirmer l\'action',
      dialogDescription: 'Êtes-vous sûr de vouloir envoyer une relance pour cette offre ?',
      dialogActionClass: '',
      showCondition: (_, needsReminder) => needsReminder,
      onAction: async () => {
        if (!onSendReminder) {
          console.error('Fonction de relance non disponible');
          setActiveDialog(null);
          return;
        }
        
        try {
          setLoading(prev => ({ ...prev, reminder: true }));
          await onSendReminder();
          // Mettre à jour l'état de relance si nécessaire
          setNecessiteRelance(false);
        } catch (error) {
          console.error('Erreur lors de l\'envoi de la relance:', error);
        } finally {
          setActiveDialog(null);
          setLoading(prev => ({ ...prev, reminder: false }));
        }
      }
    }
  ];

  // Obtenir la configuration du statut actuel
  const currentStatusConfig = statusConfigs[statut] || {
    color: 'text-gray-600 border-gray-200 bg-gray-50',
    icon: null
  };
  
  // Obtenir les actions disponibles pour le statut actuel
  const availableActions = getActionConfigs().filter(action => 
    action.showCondition(statut, necessite_relance)
  );
  
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Statut actuel</span>
              <Badge className={currentStatusConfig.color}>
                {currentStatusConfig.icon}
                {statut}
              </Badge>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex-col gap-3">
          {availableActions.map((action) => (
            <Button
              key={action.type}
              variant={action.buttonVariant}
              className={action.buttonClass}
              onClick={() => setActiveDialog(action.type)}
              disabled={isLoading}
            >
              {action.icon}
              {action.label}
              {loading[action.type] && ' ...'}
            </Button>
          ))}
        </CardFooter>
      </Card>
  
      {/* Dialogues de confirmation */}
      {availableActions.map((action) => (
        <AlertDialog 
          key={action.type}
          open={activeDialog === action.type} 
          onOpenChange={(open) => {
            setActiveDialog(open ? action.type : null);
            if (!open) setSelectedDate(new Date());
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{action.dialogTitle}</AlertDialogTitle>
              <AlertDialogDescription>
                {action.dialogDescription}
                
                {/* Ajout du DatePicker pour les actions concernées */}
                {(['send', 'won', 'lost'].includes(action.type)) && (
                  <div className="mt-4">
                    <Label className="block mb-2">Date d'effet :</Label>
                    <DatePicker
                      selected={selectedDate}
                      onSelect={(date: Date | null) => date && setSelectedDate(date)}
                      locale={fr}
                    />
                    <p className="text-muted-foreground text-sm mt-1">
                      {format(selectedDate, "dd MMMM yyyy", { locale: fr })}
                    </p>
                  </div>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isLoading}>Annuler</AlertDialogCancel>
              <AlertDialogAction 
                onClick={action.onAction} 
                className={action.dialogActionClass}
                disabled={isLoading}
              >
                {loading[action.type] ? 'Traitement...' : 'Confirmer'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ))}
    </>
  );
};

export default ActionsCard;