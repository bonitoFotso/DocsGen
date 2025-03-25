import { useState } from "react";
import { FormField } from "./form-field";
import type { IEntity } from "../../interfaces";

interface EntityFormProps {
  onSubmit: (data: Omit<IEntity, "id">) => void;
  initialData?: IEntity;
}

export function EntityForm({ onSubmit, initialData }: EntityFormProps) {
  const [formData, setFormData] = useState({
    code: initialData?.code || "",
    name: initialData?.name || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.code) {
      newErrors.code = "Code is required";
    } else if (!/^[A-Z]{3}$/.test(formData.code)) {
      newErrors.code = "Code must be 3 uppercase letters";
    }

    if (!formData.name) {
      newErrors.name = "Name is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormField label="Code" error={errors.code}>
        <input
          type="text"
          value={formData.code}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, code: e.target.value }))
          }
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          placeholder="ABC"
          maxLength={3}
        />
      </FormField>

      <FormField label="Name" error={errors.name}>
        <input
          type="text"
          value={formData.name}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, name: e.target.value }))
          }
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          placeholder="Entity name"
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
