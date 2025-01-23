import { CategoryBase } from '@/interfaces';


interface CategoryButtonProps {
  category: CategoryBase;
  isSelected: boolean;
  onToggle: (name: string) => void;
}

const CategoryButton = ({ 
  category, 
  isSelected, 
  onToggle 
}: CategoryButtonProps) => {
  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        onToggle(category.name);
      }}
      className={`
        px-4 
        py-2 
        rounded-lg 
        text-sm 
        font-medium 
        transition-all 
        duration-200
        ${isSelected
          ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }
      `}
    >
      {category.name}
    </button>
  );
};

export default CategoryButton;