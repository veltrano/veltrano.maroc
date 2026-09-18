import assert from "node:assert/strict";
import test from "node:test";
import {
  applyContactAttempt,
  dedupeClients,
  findDuplicateClients,
  issueWelcomeSignup,
  normalizeEmail,
  normalizePhone,
  redeemWelcomeCoupon,
  type ClientProfile,
} from "../src/lib/crm";
import type { Order } from "../src/lib/order";

const stamp = "2026-09-18T12:00:00.000Z";
const client: ClientProfile = {
  id: "CL-1",
  name: "Amina",
  phone: "06 12-34-56-78",
  phoneNormalized: "0612345678",
  email: "amina@example.com",
  emailNormalized: "amina@example.com",
  preferredLanguage: "fr",
  source: "site_web",
  notes: "",
  contactStatus: "a_contacter",
  marketingEmail: false,
  marketingWhatsApp: false,
  createdAt: stamp,
  updatedAt: stamp,
};
const order: Order = {
  id: "VT-1",
  createdAt: stamp,
  name: "Amina",
  phone: "0612345678",
  city: "Rabat",
  address: "1 rue test",
  notes: "",
  lines: [
    {
      id: "L1",
      slug: "baggy-jean-noir",
      pack: "single",
      size: "34",
      quantity: 1,
    },
  ],
  subtotalMad: 250,
  discountMad: 0,
  totalMad: 250,
  rewardCoupon: "VT50-TEST",
  whatsapp: { status: "queued" },
  confirmationStatus: "new",
  shipmentStatus: "unfulfilled",
  paymentStatus: "pending",
};

test("pas de réponse keeps follow-up open and never changes an order", () => {
  const before = structuredClone(order);
  const updated = applyContactAttempt(
    client,
    "pas_de_reponse",
    "2026-09-19T10:00:00.000Z"
  );
  assert.equal(updated.contactStatus, "pas_de_reponse");
  assert.equal(updated.nextCallbackAt, "2026-09-19T10:00:00.000Z");
  assert.deepEqual(order, before);
});

test("signup record persists when delivery status becomes failed", () => {
  const { signups, signup } = issueWelcomeSignup(
    [],
    client,
    client.email!,
    "fr",
    true,
    new Date(stamp)
  );
  signup.emailStatus = "failed";
  signup.emailError = "provider unavailable";
  assert.equal(signups.length, 1);
  assert.equal(signups[0].couponStatus, "active");
  assert.equal(signups[0].emailStatus, "failed");
});

test("repeated signup reuses one profile and expires the previous coupon", () => {
  const first = issueWelcomeSignup(
    [],
    client,
    "Amina@Example.com",
    "fr",
    true,
    new Date(stamp)
  );
  const second = issueWelcomeSignup(
    first.signups,
    client,
    "amina@example.com",
    "fr",
    true,
    new Date("2026-09-19T12:00:00.000Z")
  );
  assert.equal(second.signup.clientId, client.id);
  assert.equal(
    second.signups.find((item) => item.id === first.signup.id)?.couponStatus,
    "expired"
  );
  assert.notEqual(second.signup.couponCode, first.signup.couponCode);
});

test("filtered client results can be deduplicated by profile id", () => {
  const result = dedupeClients([client, { ...client }, { ...client }]);
  assert.equal(result.length, 1);
  assert.equal(result[0].id, "CL-1");
});

test("lead identity matches first order without creating a split profile", () => {
  const matches = findDuplicateClients(
    [client],
    "06.12.34.56.78",
    "AMINA@EXAMPLE.COM"
  );
  assert.equal(matches.length, 1);
  assert.equal(matches[0].id, client.id);
  assert.equal(normalizePhone(order.phone), client.phoneNormalized);
  assert.equal(normalizeEmail("AMINA@EXAMPLE.COM"), client.emailNormalized);
});

test("welcome coupon is unique and can be redeemed only once", () => {
  const first = issueWelcomeSignup(
    [],
    client,
    client.email!,
    "fr",
    true,
    new Date(stamp)
  );
  const redeemed = redeemWelcomeCoupon(
    first.signups,
    first.signup.couponCode,
    order.id,
    new Date("2026-09-19T12:00:00.000Z")
  );
  assert.ok(redeemed);
  assert.equal(redeemed[0].couponStatus, "used");
  assert.equal(redeemed[0].linkedOrderId, order.id);
  assert.equal(
    redeemWelcomeCoupon(
      redeemed,
      first.signup.couponCode,
      "VT-2",
      new Date("2026-09-20T12:00:00.000Z")
    ),
    null
  );
});
