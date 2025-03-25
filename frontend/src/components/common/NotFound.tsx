// components/common/NotFound.tsx
import React from "react";
import { ChevronLeft, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface NotFoundProps {
  onBack: () => void;
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
}

const NotFound: React.FC<NotFoundProps> = ({
  onBack,
  title = "Élément non trouvé",
  subtitle = "L'élément que vous recherchez n'existe pas ou a été supprimé.",
  icon = <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />,
}) => {
  return (
    <div className="container py-8">
      <Button variant="outline" size="sm" onClick={onBack} className="mb-4">
        <ChevronLeft className="h-4 w-4 mr-2" />
        Retour
      </Button>
      <Card>
        <CardContent className="p-6 text-center">
          {icon}
          <h2 className="text-xl font-semibold mb-2">{title}</h2>
          <p className="text-muted-foreground mb-4">{subtitle}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;
