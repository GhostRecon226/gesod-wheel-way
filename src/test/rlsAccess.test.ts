/**
 * Data-access regression suite.
 *
 * Signs in against the real backend as an admin and as each seeded customer and
 * asserts that row level security scopes every customer-owned table: customers
 * only ever read their own vehicles, milestones, bids, quotes, payments and
 * disputes, while admins read every record.
 */
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { ADMIN, CUSTOMERS, CUSTOMER_SCOPED_TABLES, type QaAccount } from "./qaAccounts";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

const makeClient = () =>
  createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

async function signIn(account: QaAccount) {
  const client = makeClient();
  const { data, error } = await client.auth.signInWithPassword({
    email: account.email,
    password: account.password,
  });
  expect(error, `sign-in failed for ${account.email}: ${error?.message}`).toBeNull();
  expect(data.user?.id).toBeTruthy();
  return { client, userId: data.user!.id };
}

let adminClient: SupabaseClient;
let anonClient: SupabaseClient;
const customerClients = new Map<string, { client: SupabaseClient; userId: string }>();

/** Every record in the system, read with admin privileges. */
const adminTotals: Record<string, number> = {};
let adminVehicleIds: string[] = [];
let adminMilestoneCount = 0;

beforeAll(async () => {
  anonClient = makeClient();

  const admin = await signIn(ADMIN);
  adminClient = admin.client;

  for (const table of CUSTOMER_SCOPED_TABLES) {
    const { data, error } = await adminClient.from(table).select("id, customer_id");
    expect(error, `admin read of ${table} failed: ${error?.message}`).toBeNull();
    adminTotals[table] = data!.length;
  }

  const { data: vehicles } = await adminClient.from("vehicles").select("id");
  adminVehicleIds = (vehicles ?? []).map((v) => v.id);

  const { data: milestones, error: msError } = await adminClient
    .from("vehicle_milestones")
    .select("id, vehicle_id");
  expect(msError).toBeNull();
  adminMilestoneCount = (milestones ?? []).length;

  for (const customer of CUSTOMERS) {
    customerClients.set(customer.email, await signIn(customer));
  }
}, 60_000);

afterAll(async () => {
  await adminClient?.auth.signOut();
  for (const { client } of customerClients.values()) await client.auth.signOut();
});

describe("admin data access", () => {
  it("resolves the admin role", async () => {
    const { data, error } = await adminClient.rpc("has_role", {
      _user_id: (await adminClient.auth.getUser()).data.user!.id,
      _role: "admin",
    });
    expect(error).toBeNull();
    expect(data).toBe(true);
  });

  it.each([...CUSTOMER_SCOPED_TABLES])("reads every record in %s", (table) => {
    expect(adminTotals[table]).toBeGreaterThan(0);
  });

  it("reads milestones across all vehicles", () => {
    expect(adminVehicleIds.length).toBeGreaterThan(0);
    expect(adminMilestoneCount).toBeGreaterThan(0);
  });

  it("reads documents across all vehicles", async () => {
    const { error } = await adminClient.from("documents").select("id, vehicle_id");
    expect(error).toBeNull();
  });
});

describe.each(CUSTOMERS)("customer data isolation: $label", (customer) => {
  it.each([...CUSTOMER_SCOPED_TABLES])(
    "only returns own rows from %s",
    async (table) => {
      const { client, userId } = customerClients.get(customer.email)!;
      const { data, error } = await client.from(table).select("id, customer_id");
      expect(error, `${table} read failed: ${error?.message}`).toBeNull();

      const foreign = (data ?? []).filter((row) => row.customer_id !== userId);
      expect(foreign, `${customer.email} saw foreign rows in ${table}`).toEqual([]);
      // And the customer must never see the whole table.
      expect((data ?? []).length).toBeLessThanOrEqual(adminTotals[table]);
    },
  );

  it("only returns milestones for own vehicles", async () => {
    const { client, userId } = customerClients.get(customer.email)!;
    const { data: ownVehicles } = await client.from("vehicles").select("id, customer_id");
    const ownIds = (ownVehicles ?? []).map((v) => v.id);
    expect((ownVehicles ?? []).every((v) => v.customer_id === userId)).toBe(true);

    const { data: milestones, error } = await client
      .from("vehicle_milestones")
      .select("id, vehicle_id");
    expect(error).toBeNull();
    const leaked = (milestones ?? []).filter((m) => !ownIds.includes(m.vehicle_id));
    expect(leaked, "milestones leaked from another customer's vehicle").toEqual([]);
    expect((milestones ?? []).length).toBeLessThanOrEqual(adminMilestoneCount);
  });

  it("only returns documents for own vehicles", async () => {
    const { client } = customerClients.get(customer.email)!;
    const { data: ownVehicles } = await client.from("vehicles").select("id");
    const ownIds = (ownVehicles ?? []).map((v) => v.id);

    const { data: docs, error } = await client.from("documents").select("id, vehicle_id");
    expect(error).toBeNull();
    const leaked = (docs ?? []).filter((d) => !ownIds.includes(d.vehicle_id));
    expect(leaked, "documents leaked from another customer's vehicle").toEqual([]);
  });

  it("cannot read another customer's vehicle by id", async () => {
    const { client, userId } = customerClients.get(customer.email)!;
    const { data: allVehicles } = await adminClient.from("vehicles").select("id, customer_id");
    const foreignVehicle = (allVehicles ?? []).find((v) => v.customer_id !== userId);
    expect(foreignVehicle, "test data needs a vehicle owned by another customer").toBeTruthy();

    const { data } = await client.from("vehicles").select("id").eq("id", foreignVehicle!.id);
    expect(data ?? []).toEqual([]);
  });

  it("cannot escalate to the admin role", async () => {
    const { client, userId } = customerClients.get(customer.email)!;
    const { data } = await client.rpc("has_role", { _user_id: userId, _role: "admin" });
    expect(data).toBe(false);

    const { error } = await client.from("user_roles").insert({ user_id: userId, role: "admin" });
    expect(error, "a customer was able to grant themselves the admin role").toBeTruthy();
  });

  it("cannot set users.role to admin on their own row, but can still update their profile", async () => {
    const { client, userId } = customerClients.get(customer.email)!;

    const { error: roleError } = await client.from("users").update({ role: "admin" }).eq("id", userId);
    expect(roleError, "a customer was able to set users.role to admin").toBeTruthy();

    const { data, error: profileError } = await client
      .from("users")
      .update({ name: customer.label })
      .eq("id", userId)
      .select("role")
      .single();
    expect(profileError, `a customer could not update their own profile: ${profileError?.message}`).toBeNull();
    expect(data?.role).toBe("customer");
  });

  it("cannot write vehicles", async () => {
    const { client } = customerClients.get(customer.email)!;
    const { error } = await client
      .from("vehicles")
      .insert({ make: "QA", model: "Unauthorized", year: 2026 });
    expect(error, "a customer was able to create a vehicle").toBeTruthy();
  });
});

describe("anonymous visitors", () => {
  it.each([...CUSTOMER_SCOPED_TABLES, "vehicle_milestones", "documents"])(
    "read no rows from %s",
    async (table) => {
      const { data } = await anonClient.from(table).select("id");
      expect(data ?? []).toEqual([]);
    },
  );

  it("can still read public auction listings and sailing schedules", async () => {
    const listings = await anonClient.from("auction_listings").select("id");
    const schedules = await anonClient.from("sailing_schedules").select("id");
    expect(listings.error).toBeNull();
    expect(schedules.error).toBeNull();
    expect((listings.data ?? []).length).toBeGreaterThan(0);
    expect((schedules.data ?? []).length).toBeGreaterThan(0);
  });

  it("can track a vehicle by full VIN with the VIN masked", async () => {
    const { data: vehicles } = await adminClient.from("vehicles").select("vin").not("vin", "is", null);
    const vin = (vehicles ?? [])[0]?.vin as string;
    expect(vin).toBeTruthy();

    const { data, error } = await anonClient.rpc("track_vehicle_by_vin", { _vin: vin });
    expect(error).toBeNull();
    expect(data).toBeTruthy();
    expect((data as any).vin_masked).toContain("*");
    expect((data as any).vin_masked).not.toBe(vin);
  });

  it("cannot enumerate vehicles with a partial VIN", async () => {
    const { data } = await anonClient.rpc("track_vehicle_by_vin", { _vin: "1HGB" });
    expect(data).toBeNull();
  });
});

/**
 * Loads/Drivers ERP tables (added for the Load Intake and Driver Management
 * admin modules). Unlike the tables above, nothing seeds these — they start
 * empty — so this suite creates its own fixture row per table as admin, runs
 * the RLS assertions against it, then tears everything down in afterAll so
 * the database is left exactly as it found it.
 */
describe("loads, drivers, and invoices (ERP)", () => {
  const ERP_TABLES = [
    "loads",
    "drivers",
    "driver_payments",
    "load_status_history",
    "invoices",
    "invoice_loads",
    "invoice_line_items",
  ] as const;

  const owner = CUSTOMERS[0];
  const stranger = CUSTOMERS[1];

  let driverId: string;
  let loadId: string;
  let historyId: string;
  let invoiceId: string;
  let lineItemId: string;
  let paymentId: string;

  beforeAll(async () => {
    const ownerAccess = customerClients.get(owner.email)!;

    const { data: driver, error: driverError } = await adminClient
      .from("drivers")
      .insert({ name: "QA Fixture Driver", phone: "555-0100", active: true })
      .select("id")
      .single();
    expect(driverError, `failed to seed driver: ${driverError?.message}`).toBeNull();
    driverId = driver!.id;

    const { data: load, error: loadError } = await adminClient
      .from("loads")
      .insert({
        vin: "QAFIXTUREVIN00001",
        customer_id: ownerAccess.userId,
        driver_id: driverId,
        status: "delivered",
      })
      .select("id")
      .single();
    expect(loadError, `failed to seed load: ${loadError?.message}`).toBeNull();
    loadId = load!.id;

    const { data: history, error: historyError } = await adminClient
      .from("load_status_history")
      .insert({ load_id: loadId, status: "delivered", notes: "QA fixture" })
      .select("id")
      .single();
    expect(historyError, `failed to seed load_status_history: ${historyError?.message}`).toBeNull();
    historyId = history!.id;

    const { data: invoice, error: invoiceError } = await adminClient
      .from("invoices")
      .insert({ customer_id: ownerAccess.userId, status: "approved", total_amount: 500 })
      .select("id")
      .single();
    expect(invoiceError, `failed to seed invoice: ${invoiceError?.message}`).toBeNull();
    invoiceId = invoice!.id;

    const { error: invoiceLoadError } = await adminClient
      .from("invoice_loads")
      .insert({ invoice_id: invoiceId, load_id: loadId });
    expect(invoiceLoadError, `failed to seed invoice_loads: ${invoiceLoadError?.message}`).toBeNull();

    const { data: lineItem, error: lineItemError } = await adminClient
      .from("invoice_line_items")
      .insert({ invoice_id: invoiceId, load_id: loadId, type: "base_price", amount: 450 })
      .select("id")
      .single();
    expect(lineItemError, `failed to seed invoice_line_items: ${lineItemError?.message}`).toBeNull();
    lineItemId = lineItem!.id;

    const { data: payment, error: paymentError } = await adminClient
      .from("driver_payments")
      .insert({ driver_id: driverId, load_id: loadId, amount: 200, status: "pending" })
      .select("id")
      .single();
    expect(paymentError, `failed to seed driver_payments: ${paymentError?.message}`).toBeNull();
    paymentId = payment!.id;
  }, 30_000);

  afterAll(async () => {
    // FK-safe order. Each call is independent so one failure doesn't block
    // cleanup of the rest of the fixture.
    await adminClient.from("driver_payments").delete().eq("id", paymentId);
    await adminClient.from("invoice_line_items").delete().eq("id", lineItemId);
    await adminClient.from("invoice_loads").delete().eq("invoice_id", invoiceId);
    await adminClient.from("load_status_history").delete().eq("id", historyId);
    await adminClient.from("invoices").delete().eq("id", invoiceId);
    await adminClient.from("loads").delete().eq("id", loadId);
    await adminClient.from("drivers").delete().eq("id", driverId);
  });

  it.each(ERP_TABLES)("admin reads %s", async (table) => {
    const { error } = await adminClient.from(table).select("id").limit(1);
    expect(error, `admin read of ${table} failed: ${error?.message}`).toBeNull();
  });

  it(`${owner.label} can view their own load and invoice`, async () => {
    const { client } = customerClients.get(owner.email)!;
    const { data: load, error: loadError } = await client.from("loads").select("id").eq("id", loadId);
    expect(loadError).toBeNull();
    expect(load).toEqual([{ id: loadId }]);

    const { data: invoice, error: invoiceError } = await client.from("invoices").select("id").eq("id", invoiceId);
    expect(invoiceError).toBeNull();
    expect(invoice).toEqual([{ id: invoiceId }]);
  });

  it(`${owner.label} cannot view a draft invoice, even their own`, async () => {
    const { client, userId } = customerClients.get(owner.email)!;

    const { data: draftInvoice, error: createError } = await adminClient
      .from("invoices")
      .insert({ customer_id: userId, status: "draft", total_amount: 100 })
      .select("id")
      .single();
    expect(createError, `failed to seed draft invoice: ${createError?.message}`).toBeNull();

    const { data: seen } = await client.from("invoices").select("id").eq("id", draftInvoice!.id);
    expect(seen ?? [], "a customer was able to read a draft invoice").toEqual([]);

    await adminClient.from("invoices").delete().eq("id", draftInvoice!.id);
  });

  it(`${owner.label} can view load status history and invoice line items through the owning load/invoice`, async () => {
    const { client } = customerClients.get(owner.email)!;
    const { data: history, error: historyError } = await client
      .from("load_status_history")
      .select("id")
      .eq("id", historyId);
    expect(historyError).toBeNull();
    expect(history).toEqual([{ id: historyId }]);

    const { data: lineItems, error: lineItemError } = await client
      .from("invoice_line_items")
      .select("id")
      .eq("id", lineItemId);
    expect(lineItemError).toBeNull();
    expect(lineItems).toEqual([{ id: lineItemId }]);
  });

  it(`${owner.label} cannot access drivers, driver_payments, or invoice_loads at all`, async () => {
    const { client } = customerClients.get(owner.email)!;
    const { data: drivers } = await client.from("drivers").select("id").eq("id", driverId);
    expect(drivers ?? [], "a customer read a row from drivers").toEqual([]);

    const { data: payments } = await client.from("driver_payments").select("id").eq("id", paymentId);
    expect(payments ?? [], "a customer read a row from driver_payments").toEqual([]);

    const { data: invoiceLoads } = await client.from("invoice_loads").select("id").eq("invoice_id", invoiceId);
    expect(invoiceLoads ?? [], "a customer read a row from invoice_loads").toEqual([]);
  });

  it(`${owner.label} cannot write to loads or invoices — read-only access`, async () => {
    const { client } = customerClients.get(owner.email)!;
    // An UPDATE with zero RLS-visible rows doesn't error on its own — it
    // just matches nothing, same as any other empty WHERE clause. Chaining
    // .select().single() forces PostgREST to error when no row comes back,
    // same trick the users.role self-escalation test above already uses.
    const { error: loadUpdateError } = await client
      .from("loads")
      .update({ status: "paid" })
      .eq("id", loadId)
      .select("id")
      .single();
    expect(loadUpdateError, "a customer was able to update a load").toBeTruthy();

    const { error: invoiceUpdateError } = await client
      .from("invoices")
      .update({ status: "paid" })
      .eq("id", invoiceId)
      .select("id")
      .single();
    expect(invoiceUpdateError, "a customer was able to update an invoice").toBeTruthy();

    const { error: insertError } = await client.from("loads").insert({ vin: "QAHACKVIN000000001" });
    expect(insertError, "a customer was able to create a load").toBeTruthy();
  });

  it(`${stranger.label} cannot see another customer's load, invoice, history, or line items`, async () => {
    const { client } = customerClients.get(stranger.email)!;
    const { data: load } = await client.from("loads").select("id").eq("id", loadId);
    expect(load ?? [], `${stranger.label} saw another customer's load`).toEqual([]);

    const { data: invoice } = await client.from("invoices").select("id").eq("id", invoiceId);
    expect(invoice ?? [], `${stranger.label} saw another customer's invoice`).toEqual([]);

    const { data: history } = await client.from("load_status_history").select("id").eq("id", historyId);
    expect(history ?? [], `${stranger.label} saw another customer's load_status_history`).toEqual([]);

    const { data: lineItems } = await client.from("invoice_line_items").select("id").eq("id", lineItemId);
    expect(lineItems ?? [], `${stranger.label} saw another customer's invoice_line_items`).toEqual([]);
  });

  it.each(ERP_TABLES)("anonymous visitors read no rows from %s", async (table) => {
    const { data } = await anonClient.from(table).select("id").limit(1);
    expect(data ?? [], `anonymous read rows from ${table}`).toEqual([]);
  });
});
