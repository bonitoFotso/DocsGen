import { useState } from "react";
import { FormField } from "./form-field";
import type { IClient } from "../../interfaces";
import { useClient } from "../../contexts/ClientContext";
import { useModal } from "../../hooks/useModal";

interface ClientFormProps {
  initialData?: IClient;
}

export function ClientForm({ initialData }: ClientFormProps) {
  const [formData, setFormData] = useState({
    nom: initialData?.nom || "",
    email: initialData?.email || "",
    telephone: initialData?.telephone || "",
    adresse: initialData?.adresse || "",
  });

  const { addClient, fetchClients } = useClient();
  const { closeModal } = useModal();

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nom) {
      newErrors.nom = "Name is required";
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      addClient(formData);
      fetchClients();
      closeModal();
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormField label="Name" error={errors.nom}>
        <input
          type="text"
          value={formData.nom}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, nom: e.target.value }))
          }
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          placeholder="Client name"
        />
      </FormField>

      <FormField label="Email" error={errors.email}>
        <input
          type="email"
          value={formData.email}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, email: e.target.value }))
          }
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          placeholder="email@example.com"
        />
      </FormField>

      <FormField label="Phone">
        <input
          type="tel"
          value={formData.telephone}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, telephone: e.target.value }))
          }
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          placeholder="+33 1 23 45 67 89"
        />
      </FormField>

      <FormField label="Address">
        <textarea
          value={formData.adresse}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, adresse: e.target.value }))
          }
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          rows={3}
          placeholder="Enter address"
        />
      </FormField>

      <div className="mt-6 flex justify-end space-x-3">
        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Save
        </button>
      </div>
    </form>
  );
}
