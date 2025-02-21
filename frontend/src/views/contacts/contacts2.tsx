import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Star, Plus } from "lucide-react";
import DataTable from './DataTable';
import ClientTable from './components/ClientTable';
import { useState } from "react";
import ContactModal from "./ContactModal";
import { useServices } from "@/AppHooks";
import { ContactEdit } from "@/itf";
import { Button } from "@/components/ui/button";

const ContactsPage = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { contactService } = useServices();

    const handleCreate = async (formData: ContactEdit) => {
      setIsSubmitting(true);
      try {
        await contactService.create(formData);
        setIsCreateModalOpen(false);
      } catch (error) {
        console.error('Creation error:', error);
      } finally {
        setIsSubmitting(false);
      }
    };

  return (
    <div className="container mx-auto p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des contacts</h1>
        </div>
        <Button 
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nouveau contact
        </Button>
      </div>
      <Tabs defaultValue="tous" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="tous" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            clients
          </TabsTrigger>
          <TabsTrigger value="favoris" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            contacts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tous">
          <ClientTable/>
        </TabsContent>

        <TabsContent value="favoris">
          <DataTable/>
        </TabsContent>

        
      </Tabs>

      {isCreateModalOpen && (
        <ContactModal
          title="Nouveau contact"
          initialData={{ nom: '' }}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreate}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
};

export default ContactsPage;