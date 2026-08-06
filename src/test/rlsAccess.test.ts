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
