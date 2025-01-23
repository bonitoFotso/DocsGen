import React, { useState } from 'react';
import { Building2, Plus, X } from 'lucide-react';
import EntityForm from './EntityForm';

interface EntityFormModalProps {
  onSubmit: (data: { code: string; name: string }) => void;
  buttonClassName?: string;
  buttonText?: string;
  buttonIcon?: React.ReactNode;
  buttonVariant?: 'primary' | 'secondary' | 'outline';
}

const EntityFormModal: React.FC<EntityFormModalProps> = ({
  onSubmit,
  buttonClassName = '',
  buttonText = 'Nouvelle entité',
  buttonIcon = <Plus className="w-4 h-4" />,
  buttonVariant = 'primary'
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = (data: { code: string; name: string }) => {
    onSubmit(data);
    setIsOpen(false);
  };

  const buttonStyles = {
    primary: 'bg-blue-500 text-white hover:bg-blue-600',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
    outline: 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${buttonStyles[buttonVariant]} ${buttonClassName}`}
      >
        {buttonIcon}
        {buttonText}
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md">
            {/* En-tête */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Building2 className="w-5 h-5 text-blue-500" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Nouvelle entité
                </h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-500 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Corps */}
            <div className="p-6">
              <EntityForm
                onSubmit={handleSubmit}
                onCancel={() => setIsOpen(false)}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EntityFormModal;