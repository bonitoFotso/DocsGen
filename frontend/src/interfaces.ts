// Base interfaces
interface BaseModel {
  id: number;
  created_at?: string;
  updated_at?: string;
}

// Entity Interfaces
interface EntityBase extends BaseModel {
  code: string;
  name: string;
}

interface EntityDetail extends EntityBase {
  categories: CategoryBase[];
}

interface EntityEdit {
  code?: string;
  name?: string;
}

// Client Interfaces
interface ClientBase extends BaseModel {
  nom: string;
  email?: string;
  telephone?: string;
}

interface ClientDetail extends ClientBase {
  type: "Enterprise" | "Individual";
  adresse?: string;
  sites: SiteBase[];
  formations: FormationBase[];
}

interface ClientEdit {
  nom?: string;
  email?: string;
  telephone?: string;
  adresse?: string;
}

// Site Interfaces
interface SiteBase extends BaseModel {
  nom: string;
  localisation: string;
  client_nom: string;
  clientId: number;
}

interface SiteDetail extends SiteBase {
  description?: string;
  client: ClientBase;
}

interface SiteEdit {
  nom?: string;
  client?: number;
  localisation?: string;
  description?: string;
}

// Category Interfaces
interface CategoryBase extends BaseModel {
  code: string;
  name: string;
}

interface CategoryDetail extends CategoryBase {
  entity: EntityBase;
  produits: ProductBase[];
}

interface CategoryEdit {
  code: string;
  name: string;
  entity: number;
}

// Product Interfaces
interface ProductBase extends BaseModel {
  code: string;
  name: string;
  category_name: string;
  categoryId?: number;

}

interface ProductDetail extends ProductBase {
  category: CategoryBase;
  rapports: RapportBase[];
}

interface ProductEdit {
  code?: string;
  name?: string;
  category?: number;
}

// Document status type
type DocumentStatus = 'BROUILLON' | 'ENVOYE' | 'VALIDE' | 'REFUSE' | 'EN_COURS' | 'TERMINEE' | 'ANNULEE';

// Base Document Interface
interface DocumentBase extends BaseModel {
  reference: string;
  date_creation: string;
  statut: DocumentStatus;
  doc_type: string;
  sequence_number: number;
  fichier?:string;
}

// Offre Interfaces
interface OffreBase extends DocumentBase {
  client_nom: string;
  date_modification: string;
  date_validation?: string;
}

interface Produit {
  id: number;
  name: string;
  code: string;
  prix: number;
}

interface Contact {
  id: number;
  nom: string;
  email?: string;
  telephone?: string;
  fonction?: string;
}

interface Client {
  id: number;
  nom: string;
  c_num: string;
}

interface Entity {
  id: number;
  nom: string;
  code: string;
}



interface OffreDetail {
  id: number;
  reference: string;
  statut: 'BROUILLON' | 'ENVOYE' | 'GAGNE' | 'PERDU';
  date_creation: string;
  date_modification: string;
  date_validation?: string;
  montant: number;
  client: Client;
  contact?: Contact;
  entity: Entity;
  produits: Produit[];
  relance?: string;
  necessite_relance: boolean;
  sequence_number: number;
  proforma?: ProformaBase;
  affaire?: AffaireBase;
}

interface OffreEdit {
  client: number;
  entity: number;
  produit_principal?: number;
  produits: number[];
  contact: number;
  statut: 'BROUILLON' | 'ENVOYE' | 'GAGNE' | 'PERDU';
  doc_type: string;
}
interface OffreEditStatus {
  statut: DocumentStatus;
}

// Proforma Interfaces
interface ProformaBase extends DocumentBase {
  offre: OffreBase;
}

interface ProformaDetail extends ProformaBase {
  date_modification: string;
  client_nom: string;
  client: ClientBase;
  entity: EntityBase;
  affaire: AffaireBase;
}

interface ProformaEdit {
  offre: number;
  client: number;
  entity: number;
  statut: DocumentStatus;
  doc_type: string;
  sequence_number: number;
}

interface ProformaEditStatus {
  status: DocumentStatus;
}
// Affaire status type
type AffaireStatus = 'EN_COURS' | 'TERMINEE' | 'ANNULEE';

// Affaire Interfaces
interface AffaireBase extends DocumentBase {
  date_debut: string;
  date_fin_prevue?: string;
  statut: AffaireStatus;
}

interface AffaireDetail extends AffaireBase {
  client: ClientBase;
  entity: EntityBase;
  offre: OffreDetail;
  rapports: RapportBase[];
  formations: FormationBase[];
  attestations: AttestationFormationBase[];
  facture?: FactureBase;
}

interface AffaireEdit {
  offre: number;
  date_fin_prevue?: string;
  statut: AffaireStatus;
  doc_type: string;
  sequence_number: number;
  entity: number;
  client: number;
}

// Facture Interfaces
type FactureBase = DocumentBase

interface FactureDetail extends FactureBase {
  affaire: AffaireBase;
  client: ClientBase;
}

interface FactureEdit {
  affaire?: number;
  client?: number;
  entity?: number;
  statut?: DocumentStatus;
}

// Rapport Interfaces
interface RapportBase extends DocumentBase {
  affaire: AffaireBase;
  // site: SiteBase;
  produit: ProductBase;
}

interface RapportDetail extends RapportBase {
  formation?: FormationBase;
}

interface RapportEdit {
  affaire: number;
  // site: number;
  produit: number;
  statut: DocumentStatus;
}

// Formation Interfaces
interface FormationBase extends BaseModel {
  titre: string;
  client: ClientBase;
  affaire: AffaireBase;
  rapport: RapportBase;
  date_debut?: string;
  date_fin?: string;
}

interface FormationDetail extends FormationBase {
  description?: string;
  participants: ParticipantBase[];
  attestations: AttestationFormationBase[];
}

interface FormationEdit {
  titre: string;
  client: number;
  affaire: number;
  rapport: number;
  date_debut: string;
  date_fin: string;
  description: string;
}

// Participant Interfaces
interface ParticipantBase extends BaseModel {
  nom: string;
  prenom: string;
  email?: string;
  telephone?: string;
  fonction?: string;
  formation: FormationBase;
}

interface ParticipantDetail extends ParticipantBase {
  attestation?: AttestationFormationBase;
}

interface ParticipantEdit {
  nom?: string;
  prenom?: string;
  email?: string;
  telephone?: string;
  fonction?: string;
  formation?: number;
}

// AttestationFormation Interfaces
interface AttestationFormationBase extends DocumentBase {
  affaire: AffaireBase;
  formation: FormationBase;
  participant: ParticipantBase;
  details_formation: string;
}

type AttestationFormationDetail = AttestationFormationBase

interface AttestationFormationEdit {
  affaire?: number;
  formation?: number;
  participant?: number;
  details_formation?: string;
  statut?: DocumentStatus;
}

// API Response Interfaces
interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

interface ApiResponse<T> {
  data: T;
  message?: string;
  status: 'success' | 'error';
}

export type {
  BaseModel,
  EntityBase, EntityDetail, EntityEdit,
  ClientBase, ClientDetail, ClientEdit,
  SiteBase, SiteDetail, SiteEdit,
  CategoryBase, CategoryDetail, CategoryEdit,
  ProductBase, ProductDetail, ProductEdit,
  OffreBase, OffreDetail, OffreEdit,
  ProformaBase, ProformaDetail, ProformaEdit,
  AffaireBase, AffaireDetail, AffaireEdit,
  FactureBase, FactureDetail, FactureEdit,
  RapportBase, RapportDetail, RapportEdit,
  FormationBase, FormationDetail, FormationEdit,
  ParticipantBase, ParticipantDetail, ParticipantEdit,
  AttestationFormationBase, AttestationFormationDetail, AttestationFormationEdit,
  PaginatedResponse, ApiResponse,
  DocumentStatus, AffaireStatus, OffreEditStatus, ProformaEditStatus
};