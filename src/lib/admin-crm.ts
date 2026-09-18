import type {
  ClientNote,
  ClientProfile,
  ContactAttempt,
  EmailSignup,
  ExchangeCase,
  SavedListPin,
  StaffMember,
} from "@/lib/crm";
import type { Order } from "@/lib/order";
import type { OrderClientLink } from "@/lib/store";

export type CrmData = {
  clients: ClientProfile[];
  orderClientLinks: OrderClientLink[];
  orders: Order[];
  contactAttempts: ContactAttempt[];
  exchanges: ExchangeCase[];
  clientNotes: ClientNote[];
  savedListPins: SavedListPin[];
  emailSignups: EmailSignup[];
  staff: StaffMember[];
  generatedAt: string;
};

export function adminHeaders(): HeadersInit {
  if (typeof window === "undefined") return {};
  const secret = sessionStorage.getItem("veltrano:admin-secret") ?? "";
  return secret ? { "x-admin-secret": secret } : {};
}

export async function fetchCrm() {
  const res = await fetch("/api/admin/crm", {
    headers: adminHeaders(),
    cache: "no-store",
  });
  const json = (await res.json()) as CrmData & { error?: string };
  if (!res.ok) throw new Error(json.error || "Chargement CRM impossible.");
  return json;
}

export const sourceLabels = {
  site_web: "site web",
  popup_email: "popup e-mail",
  whatsapp: "whatsapp",
  instagram: "instagram",
  telephone: "téléphone",
  manuel: "manuel",
} as const;

export const contactStatusLabels = {
  a_contacter: "à contacter",
  pas_de_reponse: "pas de réponse",
  rappel_planifie: "rappel planifié",
  contacte: "contacté",
} as const;

export const listLabels = {
  clients_fideles: "Clients fidèles",
  achats_baggy: "Achats baggy",
  achats_straight: "Achats straight",
  en_attente_echange: "En attente d’échange",
} as const;
