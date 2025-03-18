import { ProformaContext } from "@/contexts/ProformaContext";
import { useContext } from "react";

export const useProformas = () => {
    const context = useContext(ProformaContext);
    if (context === undefined) {
      throw new Error('useProformas must be used within a ProformaProvider');
    }
    return context;
  };