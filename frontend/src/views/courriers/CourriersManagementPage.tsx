import { useState } from "react";
import {
  Search,
  RefreshCw,
  Plus,
  Filter,
  MailOpen,
  Clock,
  FileCheck,
  AlertTriangle,
  ArrowUpRight,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { fr } from "date-fns/locale";
import { useCourriers } from "@/hooks/useCourriers";
import CourrierCard from "./CourrierCard";
import DatePicker from "@/components/ui/DatePicker";
import { useNavigate } from "react-router-dom";
import { CourrierFilter, DOC_TYPES } from "@/types/courrier";

const CourriersManagementPage = () => {
  const [filters, setFilters] = useState<CourrierFilter>({});
  const [activeTab, setActiveTab] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();

  // Utiliser les hooks personnalisés
  const {
    courriers = [],
    isLoading,
    updateFilters,
    resetFilters,
    refetch,
  } = useCourriers(filters);

  // Statistiques des courriers
  const stats = {
    total: courriers.length,
    inbound: courriers.filter((c) => c.direction === "IN").length,
    outbound: courriers.filter((c) => c.direction === "OUT").length,
    urgent: courriers.filter((c) => c.est_urgent === true).length,
    overdue: courriers.filter((c) => c.is_overdue === true).length,
  };

  // Fonction pour filtrer les courriers selon l'onglet actif
  const getFilteredCourriers = () => {
    if (!Array.isArray(courriers)) return [];

    switch (activeTab) {
      case "inbound":
        return courriers.filter((c) => c.direction === "IN");
      case "outbound":
        return courriers.filter((c) => c.direction === "OUT");
      case "urgent":
        return courriers.filter((c) => c.est_urgent === true);
      case "overdue":
        return courriers.filter((c) => c.is_overdue === true);
      case "pending":
        return courriers.filter(
          (c) => c.statut === "RECEIVED" || c.statut === "SENT"
        );
      case "processed":
        return courriers.filter((c) => c.statut === "PROCESSED");
      default:
        return courriers;
    }
  };

  // Obtenir les courriers filtrés selon l'onglet actif
  const filteredCourriers = getFilteredCourriers();

  const handleFilter = (key: string, value: string) => {
    if (value === "dd" || value === "") {
      const newFilters = { ...filters };
      delete newFilters[key as keyof CourrierFilter];
      setFilters(newFilters);
      updateFilters(newFilters);
    } else {
      const newFilters = { ...filters, [key]: value };
      setFilters(newFilters);
      updateFilters(newFilters);
    }
  };

  const handleDateFilter = (key: string, date: Date | null) => {
    if (date) {
      const newFilters = { ...filters, [key]: date.toISOString() };
      setFilters(newFilters);
      updateFilters(newFilters);
    } else {
      const newFilters = { ...filters };
      delete newFilters[key as keyof CourrierFilter];
      setFilters(newFilters);
      updateFilters(newFilters);
    }
  };

  const handleRefresh = () => {
    refetch();
  };

  const handleReset = () => {
    resetFilters();
    setFilters({});
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  // Fonction pour obtenir l'icône selon l'onglet
  const getTabIcon = (tab: string) => {
    switch (tab) {
      case "inbound":
        return <MailOpen className="h-4 w-4 mr-1" />;
      case "outbound":
        return <ArrowUpRight className="h-4 w-4 mr-1" />;
      case "urgent":
        return <AlertTriangle className="h-4 w-4 mr-1" />;
      case "overdue":
        return <Clock className="h-4 w-4 mr-1" />;
      case "processed":
        return <FileCheck className="h-4 w-4 mr-1" />;
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="full" className="py-6">
      <div className="flex flex-col space-y-6">
        {/* En-tête avec bouton d'ajout */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Gestion des Courriers
            </h1>
            <p className="text-muted-foreground mt-1">
              Consultez, filtrez et gérez tous vos courriers
            </p>
          </div>
          <Button
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-all duration-200 transform hover:translate-y-[-2px]"
            onClick={() => navigate("/courriers/create")}
          >
            <Plus className="h-5 w-5 mr-2" />
            Nouveau courrier
          </Button>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="bg-white/50 backdrop-blur">
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <p className="text-sm font-medium text-muted-foreground">Total</p>
              <p className="text-3xl font-bold">{stats.total}</p>
            </CardContent>
          </Card>
          <Card className="bg-green-50/50 backdrop-blur">
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <p className="text-sm font-medium text-green-700">Entrants</p>
              <p className="text-3xl font-bold text-green-700">
                {stats.inbound}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-purple-50/50 backdrop-blur">
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <p className="text-sm font-medium text-purple-700">Sortants</p>
              <p className="text-3xl font-bold text-purple-700">
                {stats.outbound}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-orange-50/50 backdrop-blur">
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <p className="text-sm font-medium text-orange-700">Urgents</p>
              <p className="text-3xl font-bold text-orange-700">
                {stats.urgent}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-red-50/50 backdrop-blur">
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <p className="text-sm font-medium text-red-700">En retard</p>
              <p className="text-3xl font-bold text-red-700">{stats.overdue}</p>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-md border-slate-200">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle>Liste des Courriers</CardTitle>
              <div className="flex items-center gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={handleRefresh}
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Actualiser</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleFilters}
                  className="flex items-center gap-1"
                >
                  <Filter className="h-4 w-4" />
                  Filtres
                  {showFilters ? (
                    <ChevronDown className="h-3 w-3 ml-1" />
                  ) : (
                    <ChevronRight className="h-3 w-3 ml-1" />
                  )}
                </Button>
              </div>
            </div>

            <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none z-10" />
              <input
                type="text"
                placeholder="Rechercher par numéro, objet ou expéditeur..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                value={filters.search || ""}
                onChange={(e) => handleFilter("search", e.target.value)}
              />
            </div>

            {showFilters && (
              <>
                <Separator className="my-3" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mt-3">
                  <Select
                    value={filters.doc_type || ""}
                    onValueChange={(value) => handleFilter("doc_type", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Type de document" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dd">Tous les types</SelectItem>
                      {Object.entries(DOC_TYPES).map(([key, value]) => (
                        <SelectItem key={key} value={key}>
                          {value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={filters.statut || ""}
                    onValueChange={(value) => handleFilter("statut", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dd">Tous les statuts</SelectItem>
                      <SelectItem value="DRAFT">Brouillon</SelectItem>
                      <SelectItem value="SENT">Envoyé</SelectItem>
                      <SelectItem value="RECEIVED">Reçu</SelectItem>
                      <SelectItem value="PROCESSED">Traité</SelectItem>
                      <SelectItem value="ARCHIVED">Archivé</SelectItem>
                      <SelectItem value="CANCELLED">Annulé</SelectItem>
                    </SelectContent>
                  </Select>

                  <DatePicker
                    selected={
                      filters.date_envoi ? new Date(filters.date_envoi) : null
                    }
                    onSelect={(date: Date | null) =>
                      handleDateFilter("date_envoi", date)
                    }
                    placeholderText="Date d'envoi"
                    locale={fr}
                    className="w-full"
                  />

                  <DatePicker
                    selected={
                      filters.date_reception
                        ? new Date(filters.date_reception)
                        : null
                    }
                    onSelect={(date: Date | null) =>
                      handleDateFilter("date_reception", date)
                    }
                    placeholderText="Date de réception"
                    locale={fr}
                    className="w-full"
                  />
                </div>

                <div className="flex justify-end mt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleReset}
                    className="mr-2"
                  >
                    Réinitialiser
                  </Button>
                  <Button onClick={() => setShowFilters(false)}>
                    Appliquer
                  </Button>
                </div>

                {Object.keys(filters).length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {Object.entries(filters).map(([key, value]) => (
                      <Badge
                        key={key}
                        variant="outline"
                        className="px-2 py-1 rounded-md bg-slate-100 flex items-center gap-1"
                        onClick={() => {
                          const newFilters = { ...filters };
                          delete newFilters[key as keyof CourrierFilter];
                          setFilters(newFilters);
                          updateFilters(newFilters);
                        }}
                      >
                        <span>
                          {key.replace("_", " ")}:{" "}
                          {String(value).substring(0, 15)}
                        </span>
                        <button className="ml-1 h-4 w-4 rounded-full bg-slate-200 flex items-center justify-center hover:bg-slate-300">
                          <span className="text-xs">×</span>
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </>
            )}
          </CardHeader>

          <Separator />

          <CardContent className="p-0">
            <Tabs
              defaultValue="all"
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <div className="px-6 pt-4">
                <TabsList className="w-full grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-1">
                  <TabsTrigger
                    value="all"
                    className="flex items-center justify-center"
                  >
                    Tous
                    <Badge
                      variant="outline"
                      className="ml-2 bg-slate-100 text-slate-700"
                    >
                      {courriers.length}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger
                    value="inbound"
                    className="flex items-center justify-center"
                  >
                    {getTabIcon("inbound")}
                    Entrants
                    <Badge
                      variant="outline"
                      className="ml-2 bg-slate-100 text-slate-700"
                    >
                      {stats.inbound}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger
                    value="outbound"
                    className="flex items-center justify-center"
                  >
                    {getTabIcon("outbound")}
                    Sortants
                    <Badge
                      variant="outline"
                      className="ml-2 bg-slate-100 text-slate-700"
                    >
                      {stats.outbound}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger
                    value="urgent"
                    className="flex items-center justify-center"
                  >
                    {getTabIcon("urgent")}
                    Urgents
                    <Badge
                      variant="outline"
                      className="ml-2 bg-slate-100 text-slate-700"
                    >
                      {stats.urgent}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger
                    value="overdue"
                    className="flex items-center justify-center"
                  >
                    {getTabIcon("overdue")}
                    En retard
                    <Badge
                      variant="outline"
                      className="ml-2 bg-slate-100 text-slate-700"
                    >
                      {stats.overdue}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger
                    value="pending"
                    className="flex items-center justify-center"
                  >
                    En attente
                  </TabsTrigger>
                  <TabsTrigger
                    value="processed"
                    className="flex items-center justify-center"
                  >
                    {getTabIcon("processed")}
                    Traités
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value={activeTab} className="p-4 md:p-6">
                <ScrollArea className="h-[700px] pr-4">
                  <div className="space-y-4">
                    {isLoading ? (
                      <div className="space-y-4">
                        {[1, 2, 3, 4].map((n) => (
                          <Skeleton
                            key={n}
                            className="h-32 w-full rounded-md"
                          />
                        ))}
                      </div>
                    ) : !Array.isArray(courriers) ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="rounded-full bg-red-100 p-3 text-red-600 mb-4">
                          <AlertTriangle className="h-6 w-6" />
                        </div>
                        <p className="text-lg font-medium">
                          Erreur de chargement des données
                        </p>
                        <p className="text-muted-foreground max-w-md mt-2">
                          Le format des données reçues est incorrect. Veuillez
                          réessayer ou contacter le support.
                        </p>
                        <Button
                          onClick={refetch}
                          className="mt-6"
                          variant="default"
                        >
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Réessayer
                        </Button>
                      </div>
                    ) : filteredCourriers.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="rounded-full bg-slate-100 p-3 text-slate-500 mb-4">
                          <MailOpen className="h-6 w-6" />
                        </div>
                        <p className="text-lg font-medium">
                          Aucun courrier trouvé
                        </p>
                        <p className="text-muted-foreground max-w-md mt-2">
                          Modifiez vos critères de recherche ou ajoutez un
                          nouveau courrier pour commencer.
                        </p>
                        <div className="flex gap-3 mt-6">
                          <Button variant="outline" onClick={handleReset}>
                            Réinitialiser les filtres
                          </Button>
                          <Button
                            variant="default"
                            onClick={() => navigate("/courriers/create")}
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Nouveau courrier
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {filteredCourriers.map((courrier) => (
                          <CourrierCard
                            key={courrier.id}
                            courrier={courrier}
                            onClick={() =>
                              navigate(`/courriers/${courrier.id}`)
                            }
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </Container>
  );
};

export default CourriersManagementPage;
