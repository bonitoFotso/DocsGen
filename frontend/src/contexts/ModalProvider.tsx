import { X } from "lucide-react";
import React, { createContext, useState, ReactNode } from "react";

export type ModalContextType = {
  showModal: (content: ReactNode, title?: string) => void;
  closeModal: () => void;
};

export const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [modalContent, setModalContent] = useState<ReactNode | null>(null);
  const [modalTitle, setModalTitle] = useState<string | null>(null);

  const showModal = (content: ReactNode, title?: string) => {
    setModalContent(content);
    setModalTitle(title || null);
  };

  const closeModal = () => {
    setModalContent(null);
    setModalTitle(null);
  };

  return (
    <ModalContext.Provider value={{ showModal, closeModal }}>
      {children}
      {modalContent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Background overlay */}
          <div
            className="fixed inset-0 bg-black/50"
            onClick={closeModal}
          />
          {/* Modal content */}
          <div className="relative z-50 w-full max-w-lg bg-white rounded-lg shadow-lg">
            {/* Modal header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">{modalTitle}</h2>
              <button onClick={closeModal} className="p-1 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            {/* Modal body */}
            <div className="p-4">{modalContent}</div>
          </div>
        </div>
      )}
    </ModalContext.Provider>
  );
};

