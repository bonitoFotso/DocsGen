// FormComponents.tsx
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Client, Contact, Entity, Product } from './types';

interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({ label, error, required = false, children }) => (
  <div className="space-y-2">
    <Label className={error ? "text-destructive" : ""}>
      {label} {required && <span className="text-destructive">*</span>}
    </Label>
    {children}
    {error && <p className="text-sm text-destructive">{error}</p>}
  </div>
);

interface EntitySelectProps {
  value: string;
  onChange: (value: number) => void;
  entities: Entity[];
  error?: string;
  disabled?: boolean;
}

export const EntitySelect: React.FC<EntitySelectProps> = ({ 
  value, 
  onChange, 
  entities, 
  error, 
  disabled = false 
}) => (
  <FormField label="Entité" error={error} required>
    <Select
      value={value}
      onValueChange={(value) => onChange(parseInt(value))}
      disabled={disabled}
    >
      <SelectTrigger id="entity" className={error ? "border-destructive" : ""}>
        <SelectValue placeholder="Sélectionnez une entité" />
      </SelectTrigger>
      <SelectContent>
        {entities.map((entity) => (
          <SelectItem key={entity.id} value={entity.id.toString()}>
            {entity.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </FormField>
);

interface ClientSelectProps {
  value: string;
  onChange: (value: number) => void;
  clients: Client[];
  error?: string;
  disabled?: boolean;
}

export const ClientSelect: React.FC<ClientSelectProps> = ({ 
  value, 
  onChange, 
  clients, 
  error, 
  disabled = false 
}) => (
  <FormField label="Client" error={error} required>
    <Select
      value={value}
      onValueChange={(value) => onChange(parseInt(value))}
      disabled={disabled}
    >
      <SelectTrigger id="client" className={error ? "border-destructive" : ""}>
        <SelectValue placeholder="Sélectionnez un client" />
      </SelectTrigger>
      <SelectContent>
        {clients.map((client) => (
          <SelectItem key={client.id} value={client.id.toString()}>
            {client.nom} ({client.c_num})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </FormField>
);

interface ContactSelectProps {
  value: string;
  onChange: (value: number) => void;
  contacts: Contact[];
  error?: string;
  disabled?: boolean;
}

export const ContactSelect: React.FC<ContactSelectProps> = ({ 
  value, 
  onChange, 
  contacts, 
  error, 
  disabled = false 
}) => (
  <FormField label="Contact" error={error} required>
    <Select
      value={value}
      onValueChange={(value) => onChange(parseInt(value))}
      disabled={disabled}
    >
      <SelectTrigger id="contact" className={error ? "border-destructive" : ""}>
        <SelectValue placeholder="Sélectionnez un contact" />
      </SelectTrigger>
      <SelectContent>
        {contacts.map((contact) => (
          <SelectItem key={contact.id} value={contact.id.toString()}>
            {contact.prenom} {contact.nom}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </FormField>
);

interface ProductSelectProps {
  value: string;
  onChange: (value: number) => void;
  products: Product[];
  error?: string;
  disabled?: boolean;
}

export const ProductSelect: React.FC<ProductSelectProps> = ({ 
  value, 
  onChange, 
  products, 
  error, 
  disabled = false 
}) => (
  <FormField label="Produit principal" error={error} required>
    <Select
      value={value}
      onValueChange={(value) => onChange(parseInt(value))}
      disabled={disabled}
    >
      <SelectTrigger id="produit_principal" className={error ? "border-destructive" : ""}>
        <SelectValue placeholder="Sélectionnez un produit principal" />
      </SelectTrigger>
      <SelectContent>
        {products.map((product) => (
          <SelectItem key={product.id} value={product.id.toString()}>
            {product.name} ({product.code})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </FormField>
);

interface AmountInputProps {
  value: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  disabled?: boolean;
}

export const AmountInput: React.FC<AmountInputProps> = ({ 
  value, 
  onChange, 
  error, 
  disabled = false 
}) => (
  <FormField label="Montant estimé (€)" error={error} required>
    <Input
      id="montant_estime"
      name="montant_estime"
      type="number"
      min="0"
      step="0.01"
      value={value}
      onChange={onChange}
      className={error ? "border-destructive" : ""}
      disabled={disabled}
    />
  </FormField>
);

interface ProductSelectionProps {
  selectedProducts: number[];
  products: Product[];
  onChange: (productId: number) => void;
  error?: string;
}

export const ProductSelection: React.FC<ProductSelectionProps> = ({ 
  selectedProducts, 
  products, 
  onChange, 
  error 
}) => {
  // État local pour suivre la catégorie sélectionnée
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);
  
  // Grouper les produits par catégorie
  const productsByCategory = products.reduce((acc, product) => {
    const category = product.category_name	 || 'Sans catégorie';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(product);
    return acc;
  }, {} as Record<string, Product[]>);

  // Obtenir la liste des catégories triées alphabétiquement
  const categories = Object.keys(productsByCategory).sort();
  
  // Gérer le changement de catégorie
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(prevCategory => prevCategory === category ? null : category);
  };
  
  // Compter les produits sélectionnés dans chaque catégorie
  const getSelectedCountByCategory = (category: string) => {
    return productsByCategory[category].filter(product => 
      selectedProducts.includes(product.id)
    ).length;
  };

  return (
    <FormField label="Produits associés" error={error} required>
      <div className="border rounded-md p-4">
        {/* Sélection de catégorie */}
        <div className="mb-4">
          <h3 className="font-medium mb-2">Catégories</h3>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const selectedCount = getSelectedCountByCategory(category);
              return (
                <Badge
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => handleCategoryChange(category)}
                >
                  {category} {selectedCount > 0 && `(${selectedCount})`}
                </Badge>
              );
            })}
          </div>
        </div>
        
        {/* Affichage des produits de la catégorie sélectionnée */}
        {selectedCategory && (
          <div className="mt-4">
            <h3 className="font-medium mb-2">Produits - {selectedCategory}</h3>
            <div className="flex flex-wrap gap-2 ml-2">
              {productsByCategory[selectedCategory].map((product) => (
                <Badge
                  key={product.id}
                  variant={selectedProducts.includes(product.id) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => onChange(product.id)}
                >
                  {product.name} ({product.code})
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </FormField>
  );
};

interface TextAreaFieldProps {
  id: string;
  name: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  rows?: number;
  disabled?: boolean;
}

export const TextAreaField: React.FC<TextAreaFieldProps> = ({ 
  id, 
  name, 
  label, 
  value, 
  onChange, 
  rows = 4, 
  disabled = false 
}) => (
  <FormField label={label}>
    <Textarea
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      rows={rows}
      disabled={disabled}
    />
  </FormField>
);