import { Building2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { entities } from './navigation';
import { useEntityContext } from '@/hooks/useEntityContext';

interface EntitySelectorProps {
  expanded: boolean;
  isMobile: boolean;
}

export function EntitySelector({ expanded, isMobile }: EntitySelectorProps) {
  // Utiliser le contexte d'entité
  const { currentEntity, setCurrentEntity } = useEntityContext();

  function handleEntityChange(newEntity: string) {
    setCurrentEntity(newEntity);
    console.log('handleEntityChangesell', newEntity);
  }
  
  // Ne pas afficher quand la barre latérale est réduite et qu'on n'est pas sur mobile
  if (!expanded && !isMobile) {
    return null;
  }
  
  return (
    <div className={cn(
      "px-4 py-2 border-b",
      !expanded && !isMobile && "hidden"
    )}>
      <div className="flex items-center gap-2">
        <Building2 className="h-5 w-5 text-primary" />
        <span className="text-sm font-medium">Entité active:</span>
      </div>
      <Select
        value={currentEntity}
        onValueChange={handleEntityChange}
      >
        <SelectTrigger className="w-full mt-1 h-9">
          <SelectValue placeholder="Sélectionner une entité" />
        </SelectTrigger>
        <SelectContent>
          {entities.map(entity => (
            <SelectItem key={entity} value={entity}>
              {entity}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}