// components/client/index.ts
export { default as ClientHeader } from "./ClientHeader";
export { default as ClientStats } from "./ClientStats";
export { default as ClientTabs } from "./ClientTabs";
export { default as ClientDeleteDialog } from "./ClientDeleteDialog";

// Utilitaires et composants réutilisables
export {
  InfoItem,
  StatCard,
  CardInfo,
  ContactCard,
  SiteCard,
  getStatusColor,
  getInitials,
  getAvatarColor,
} from "./ClientComponents";

// Onglets
export { default as OpportunitiesTab } from "./tabs/OpportunitiesTab";
export { default as ContactsTab } from "./tabs/ContactsTab";
export { default as OffresTab } from "./tabs/OffresTab";
export { default as AffairesTab } from "./tabs/AffairesTab";
export { default as FacturesTab } from "./tabs/FacturesTab";
export { default as SitesTab } from "./tabs/SitesTab";
export { default as RapportsTab } from "./tabs/RapportsTab";
