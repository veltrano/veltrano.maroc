import { mutateStore } from "../src/lib/store";
import type { ClientProfile, EmailSignup } from "../src/lib/crm";
import type { Order } from "../src/lib/order";

const now = new Date();
const stamp = (daysAgo = 0) =>
  new Date(now.getTime() - daysAgo * 86400000).toISOString();

function order(
  id: string,
  name: string,
  phone: string,
  slug: string,
  size: string,
  daysAgo: number,
  status: Order["shipmentStatus"] = "unfulfilled"
): Order {
  return {
    id,
    createdAt: stamp(daysAgo),
    name,
    phone,
    city: "Casablanca",
    address: "Adresse de démonstration",
    notes: "",
    lines: [{ id: `${id}-1`, slug, pack: "single", size, quantity: 1 }],
    subtotalMad: 250,
    discountMad: 0,
    totalMad: 250,
    rewardCoupon: `VT50-${id.slice(-6)}`,
    whatsapp: { status: "queued" },
    locale: "fr",
    source: "manuel",
    confirmationStatus: "confirmed",
    shipmentStatus: status,
    paymentStatus: status === "delivered" ? "collected" : "pending",
    updatedAt: stamp(daysAgo),
  };
}

await mutateStore((data) => {
  const clients: ClientProfile[] = [
    {
      id: "CL-DEMO-REPEAT",
      name: "Client Fidèle Demo",
      phone: "0600000001",
      phoneNormalized: "0600000001",
      email: "fidele.demo@example.com",
      emailNormalized: "fidele.demo@example.com",
      city: "Casablanca",
      preferredLanguage: "fr",
      source: "manuel",
      notes: "Acheteur baggy et straight.",
      assignedStaffId: "owner-zakaria",
      contactStatus: "contacte",
      marketingEmail: true,
      marketingWhatsApp: false,
      createdAt: stamp(40),
      updatedAt: stamp(),
    },
    {
      id: "CL-DEMO-NOANSWER",
      name: "Rappel Demo",
      phone: "0600000002",
      phoneNormalized: "0600000002",
      city: "Rabat",
      preferredLanguage: "fr",
      source: "telephone",
      notes: "Flux pas de réponse.",
      assignedStaffId: "owner-zakaria",
      nextCallbackAt: new Date(now.getTime() + 3600000).toISOString(),
      contactStatus: "pas_de_reponse",
      marketingEmail: false,
      marketingWhatsApp: false,
      createdAt: stamp(5),
      updatedAt: stamp(),
    },
    {
      id: "CL-DEMO-PHONEONLY",
      name: "Client Téléphone Demo",
      phone: "0600000003",
      phoneNormalized: "0600000003",
      city: "Marrakech",
      preferredLanguage: "ar",
      source: "whatsapp",
      notes: "Profil valide sans e-mail.",
      contactStatus: "a_contacter",
      marketingEmail: false,
      marketingWhatsApp: true,
      createdAt: stamp(3),
      updatedAt: stamp(),
    },
    {
      id: "CL-DEMO-LEAD",
      name: "lead.demo",
      email: "lead.demo@example.com",
      emailNormalized: "lead.demo@example.com",
      preferredLanguage: "fr",
      source: "popup_email",
      notes: "Lead sans commande.",
      contactStatus: "a_contacter",
      marketingEmail: true,
      marketingWhatsApp: false,
      createdAt: stamp(2),
      updatedAt: stamp(),
    },
  ];
  clients.forEach((client) => {
    if (!data.clients.some((item) => item.id === client.id)) {
      data.clients.push(client);
    }
  });

  const orders = [
    order(
      "VT-DEMO-BAGGY",
      "Client Fidèle Demo",
      "0600000001",
      "baggy-jean-noir",
      "34",
      30,
      "delivered"
    ),
    order(
      "VT-DEMO-STRAIGHT",
      "Client Fidèle Demo",
      "0600000001",
      "straight-fit-jean-stone",
      "34",
      10
    ),
    order(
      "VT-DEMO-COUPON",
      "Client Téléphone Demo",
      "0600000003",
      "baggy-jean-stone",
      "36",
      1
    ),
  ];
  orders[2].appliedCoupon = "VELTRANO-DEMO10";
  orders[2].discountMad = 25;
  orders[2].totalMad = 225;
  orders.forEach((item) => {
    if (!data.orders.some((existing) => existing.id === item.id)) {
      data.orders.push(item);
    }
  });
  [
    ["VT-DEMO-BAGGY", "CL-DEMO-REPEAT"],
    ["VT-DEMO-STRAIGHT", "CL-DEMO-REPEAT"],
    ["VT-DEMO-COUPON", "CL-DEMO-PHONEONLY"],
  ].forEach(([orderId, clientId]) => {
    if (!data.orderClientLinks.some((link) => link.orderId === orderId)) {
      data.orderClientLinks.push({ orderId, clientId, linkedAt: stamp() });
    }
  });
  if (!data.contactAttempts.some((item) => item.id === "CA-DEMO-NOANSWER")) {
    data.contactAttempts.push({
      id: "CA-DEMO-NOANSWER",
      clientId: "CL-DEMO-NOANSWER",
      outcome: "pas_de_reponse",
      notes: "Appel sans réponse, rappel prévu.",
      nextCallbackAt: new Date(now.getTime() + 3600000).toISOString(),
      staffId: "owner-zakaria",
      createdAt: stamp(),
    });
  }
  if (!data.exchanges.some((item) => item.id === "EX-DEMO")) {
    data.exchanges.push({
      id: "EX-DEMO",
      clientId: "CL-DEMO-REPEAT",
      orderId: "VT-DEMO-BAGGY",
      status: "requested",
      description: "Échange taille 34 vers 36 en attente.",
      requestedAt: stamp(1),
    });
  }
  const signups: EmailSignup[] = [
    {
      id: "ES-DEMO-OLD",
      email: "lead.demo@example.com",
      emailNormalized: "lead.demo@example.com",
      language: "fr",
      marketingConsent: true,
      couponCode: "VELTRANO-OLDDEM",
      couponStatus: "expired",
      emailStatus: "failed",
      emailError: "Échec simulé pour tester le réessai.",
      clientId: "CL-DEMO-LEAD",
      expiresAt: stamp(-10),
      createdAt: stamp(3),
      updatedAt: stamp(2),
    },
    {
      id: "ES-DEMO-NEW",
      email: "lead.demo@example.com",
      emailNormalized: "lead.demo@example.com",
      language: "fr",
      marketingConsent: true,
      couponCode: "VELTRANO-DEMO10",
      couponStatus: "used",
      emailStatus: "sent",
      clientId: "CL-DEMO-LEAD",
      linkedOrderId: "VT-DEMO-COUPON",
      expiresAt: stamp(-58),
      createdAt: stamp(2),
      updatedAt: stamp(1),
    },
  ];
  signups.forEach((signup) => {
    if (!data.emailSignups.some((item) => item.id === signup.id)) {
      data.emailSignups.push(signup);
    }
  });
});

console.log("Données CRM de démonstration ajoutées sans écraser les données existantes.");
