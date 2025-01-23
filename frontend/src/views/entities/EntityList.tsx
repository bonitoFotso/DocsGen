import React, { useState, useRef, useEffect } from 'react';
import { 
  Building2,
  ChevronRight,
  MoreVertical,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';
import EntityDetails from './EntityDetails';

interface Entity {
  id: number;
  code: string;
  name: string;
}

interface EntityListProps {
  entities: Entity[];
  onEdit?: (entity: Entity) => void;
  onDelete?: (entity: Entity) => void;
}

const EntityList: React.FC<EntityListProps> = ({ 
  entities,
  onEdit,
  onDelete
}) => {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [showDetailsId, setShowDetailsId] = useState<number | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdownId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="divide-y divide-gray-100">
      {entities.map((entity) => (
        <div
          key={entity.id}
          className="group hover:bg-gray-50/80 transition-colors"
        >
          {/* En-tête de l'entité */}
          <div className="p-5 flex items-center justify-between">
            <div 
              className="flex items-center gap-6 flex-1 cursor-pointer"
              onClick={() => toggleExpand(entity.id)}
            >
              <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-white transition-colors">
                <Building2 className="w-5 h-5 text-gray-500" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold text-gray-900">
                  {entity.name}
                </span>
                <span className="text-sm text-gray-500">
                  Code: {entity.code}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                className="hidden group-hover:flex items-center gap-1 px-2 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                onClick={() => setShowDetailsId(entity.id)}
              >
                <Eye className="w-4 h-4" />
                <span className="hidden lg:inline">Détails</span>
              </button>

              {/* Dropdown personnalisé */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setOpenDropdownId(openDropdownId === entity.id ? null : entity.id)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg transition-all"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {openDropdownId === entity.id && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50">
                    {onEdit && (
                      <button
                        onClick={() => {
                          onEdit(entity);
                          setOpenDropdownId(null);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <Edit className="w-4 h-4" />
                        Modifier
                      </button>
                    )}
                    {onDelete && (
                      <>
                        <hr className="my-1 border-gray-100" />
                        <button
                          onClick={() => {
                            onDelete(entity);
                            setOpenDropdownId(null);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Supprimer
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>

              <ChevronRight
                className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${
                  expandedId === entity.id ? 'rotate-90' : ''
                }`}
              />
            </div>
          </div>

          {/* Détails de l'entité */}
          {expandedId === entity.id && (
            <div className="border-t border-gray-100">
              <EntityDetails entity={entity} />
            </div>
          )}
        </div>
      ))}

      {/* Modal de détails */}
      {showDetailsId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-lg font-semibold text-gray-900">Détails de l'entité</h2>
              <button
                className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                onClick={() => setShowDetailsId(null)}
              >
                Fermer
              </button>
            </div>
            <div className="p-6">
              <EntityDetails 
                entity={entities.find(e => e.id === showDetailsId)!}
                expanded
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EntityList;