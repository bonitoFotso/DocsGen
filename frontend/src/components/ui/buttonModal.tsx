import React from 'react';
import { useModal } from '../../hooks/useModal';
import { Plus } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ButtonModalProps {
  title: string;
  children: React.ReactNode;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  className?: string;
}

const ButtonModal: React.FC<ButtonModalProps> = ({ 
  title, 
  children, 
  variant = 'default',
  size = 'md',
  icon = <Plus className="w-4 h-4" />,
  className 
}) => {
  const { showModal } = useModal();
    
  const handleOpenModal = () => {
    showModal(
      <div className="p-1">
        {children}
      </div>,
      title
    );
  };

  const variants = {
    default: 'bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-200',
    outline: 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 focus:ring-gray-200',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-200'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-2.5 text-lg'
  };

  return (
    <button
      className={cn(
        'rounded-lg font-medium transition-all focus:ring-2 flex items-center gap-2',
        variants[variant],
        sizes[size],
        className
      )}
      onClick={handleOpenModal}
    >
      {icon}
      {title}
    </button>
  );
};

export default ButtonModal;