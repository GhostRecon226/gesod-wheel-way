import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FunctionsHttpError } from "@supabase/supabase-js";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { ChevronRight } from "lucide-react";
import { Loader } from "@/components/Spinner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

type CreateMode = "password" | "invite";
type AppRole = "customer" | "admin";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: AppRole;
  created_at: string;
  vehicle_count?: number;
}

interface Vehicle {
  id: string;
  make: string | null;
  model: string | null;
  year: number | null;
  vin: string | null;
  status: string | null;
}

// Same exact-hex badge pattern used by InvoiceStatusBadge/LoadStatusBadge.
const RoleBadge = ({ role }: { role: AppRole }) => (
  <span
    className="inline-block whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold text-white"
    style={{ backgroundColor: role === "admin" ? "#C47B2B" : "#94A3B8" }}
  >
    {role === "admin" ? "Admin" : "Customer"}
  </span>
);

const AdminCustomers = () => {
  const { user, userRole } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [viewVehicles, setViewVehicles] = useState<{ customer: Customer; vehicles: Vehicle[] } | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [createMode, setCreateMode] = useState<CreateMode>("password");
  const [submitting, setSubmitting] = useState(false);
  const [newCredentials, setNewCredentials] = useState<{
    email: string;
    mode: CreateMode;
    temporaryPassword: string | null;
  } | null>(null);

  const [roleTarget, setRoleTarget] = useState<Customer | null>(null);
  const [newRole, setNewRole] = useState<AppRole>("customer");
  const [changingRole, setChangingRole] = useState(false);

  const fetchCustomers = async () => {
    // Both customer and admin accounts are listed here (not just role="customer")
    // so a role change is reflected in place instead of the row vanishing.
    const { data } = await supabase.from("users").select("*").order("created_at", { ascending: false });
    if (data) {
      const withCounts = await Promise.all(
        data.map(async (c) => {
          const { count } = await supabase.from("vehicles").select("id", { count: "exact", head: true }).eq("customer_id", c.id);
          return { ...c, vehicle_count: count ?? 0 };
        })
      );
      setCustomers(withCounts);
    }
    setLoading(false);
  };

  useEffect(() => { fetchCustomers(); }, []);

  const openEdit = (c: Customer) => {
    setEditing(c);
    setForm({ name: c.name, email: c.email, phone: c.phone ?? "" });
    setShowForm(true);
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", email: "", phone: "" });
    setCreateMode("password");
    setShowForm(true);
  };

  const openVehicles = async (c: Customer) => {
    const { data } = await supabase.from("vehicles").select("id, make, model, year, vin, status").eq("customer_id", c.id);
    setViewVehicles({ customer: c, vehicles: data ?? [] });
  };

  const openRoleChange = (c: Customer) => {
    if (user && c.id === user.id) {
      toast({ title: "Error", description: "You cannot change your own role", variant: "destructive" });
      return;
    }
    setNewRole(c.role);
    setRoleTarget(c);
  };

  const closeRoleChange = () => {
    setRoleTarget(null);
    setChangingRole(false);
  };

  const handleRoleChange = async () => {
    if (!roleTarget || !user) return;
    if (roleTarget.id === user.id) {
      toast({ title: "Error", description: "You cannot change your own role", variant: "destructive" });
      return;
    }
    setChangingRole(true);

    const { error: deleteError } = await supabase.from("user_roles").delete().eq("user_id", roleTarget.id);
    if (deleteError) {
      toast({ title: "Error", description: deleteError.message, variant: "destructive" });
      setChangingRole(false);
      return;
    }

    const { error: insertError } = await supabase.from("user_roles").insert({ user_id: roleTarget.id, role: newRole });
    if (insertError) {
      toast({ title: "Error", description: insertError.message, variant: "destructive" });
      setChangingRole(false);
      return;
    }

    const { error: userError } = await supabase.from("users").update({ role: newRole }).eq("id", roleTarget.id);
    if (userError) {
      toast({ title: "Error", description: userError.message, variant: "destructive" });
      setChangingRole(false);
      return;
    }

    toast({ title: "Role updated successfully" });
    setChangingRole(false);
    setRoleTarget(null);

    if (viewVehicles && viewVehicles.customer.id === roleTarget.id) {
      setViewVehicles((prev) => (prev ? { ...prev, customer: { ...prev.customer, role: newRole } } : prev));
    }
    fetchCustomers();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    if (editing) {
      const { error } = await supabase.from("users").update({ name: form.name, email: form.email, phone: form.phone || null }).eq("id", editing.id);
      if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
      else { toast({ title: "Customer updated" }); setShowForm(false); fetchCustomers(); }
    } else {
      const { data, error } = await supabase.functions.invoke("admin-create-customer", {
        body: { name: form.name, email: form.email, phone: form.phone || undefined, mode: createMode },
      });
      if (error) {
        let message = error.message;
        if (error instanceof FunctionsHttpError) {
          const payload = await error.context.json().catch(() => null);
          if (payload?.error) message = payload.error;
        }
        toast({ title: "Error", description: message, variant: "destructive" });
      } else {
        toast({
          title: "Customer created",
          description: createMode === "invite" ? "An invite email was sent to them." : "A login account was created for them.",
        });
        setNewCredentials({ email: data.email, mode: data.mode, temporaryPassword: data.temporaryPassword });
        setShowForm(false);
        fetchCustomers();
      }
    }
    setSubmitting(false);
  };

  if (loading) return <Loader />;

  if (viewVehicles) {
    return (
      <div>
        <button onClick={() => setViewVehicles(null)} className="mb-4 text-sm text-gold hover:underline">← Back to customers</button>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-lg font-bold text-silver">{viewVehicles.customer.name}'s Vehicles</h2>
            <RoleBadge role={viewVehicles.customer.role} />
          </div>
          {userRole === "admin" && (
            <Button variant="copper-outline" size="sm" onClick={() => openRoleChange(viewVehicles.customer)}>
              Change Role
            </Button>
          )}
        </div>
        {viewVehicles.vehicles.length === 0 ? (
          <p className="text-muted-foreground">No vehicles linked.</p>
        ) : (
          <div className="space-y-2">
            {viewVehicles.vehicles.map((v) => (
              <div key={v.id} className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
                <div>
                  <p className="font-semibold text-silver">{v.year} {v.make} {v.model}</p>
                  <p className="text-sm text-muted-foreground">VIN: {v.vin ?? "N/A"}</p>
                </div>
                <span className="badge-copper">{v.status ?? "Pending"}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-silver">Customers</h2>
        <Button variant="copper" onClick={openCreate}>Add Customer</Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 rounded-xl border border-border bg-card p-6 space-y-4">
          <h3 className="font-bold text-silver">{editing ? "Edit Customer" : "New Customer"}</h3>
          <Input placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="auth-input" required />
          <Input placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="auth-input" required />
          <Input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="auth-input" />

          {!editing && (
            <div>
              <p className="mb-2 text-sm text-muted-foreground">How should they get access?</p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={createMode === "password" ? "copper" : "copper-outline"}
                  size="sm"
                  onClick={() => setCreateMode("password")}
                >
                  Set temporary password
                </Button>
                <Button
                  type="button"
                  variant={createMode === "invite" ? "copper" : "copper-outline"}
                  size="sm"
                  onClick={() => setCreateMode("invite")}
                >
                  Send invite email
                </Button>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button variant="copper" type="submit" disabled={submitting}>{editing ? "Update" : "Create"}</Button>
            <Button variant="copper-outline" type="button" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </form>
      )}

      <Dialog open={!!newCredentials} onOpenChange={(open) => !open && setNewCredentials(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Customer account created</DialogTitle>
            <DialogDescription>
              {newCredentials?.mode === "invite"
                ? <>An invite email was sent to <span className="text-silver">{newCredentials.email}</span>. They can set their own password from the link inside it.</>
                : <>Share this temporary password with <span className="text-silver">{newCredentials?.email}</span> so they can log in. It will not be shown again.</>}
            </DialogDescription>
          </DialogHeader>
          {newCredentials?.mode !== "invite" && newCredentials?.temporaryPassword && (
            <p className="rounded-md bg-surface-2 px-3 py-2 font-mono text-sm text-gold">
              {newCredentials.temporaryPassword}
            </p>
          )}
          <Button variant="copper" onClick={() => setNewCredentials(null)}>Done</Button>
        </DialogContent>
      </Dialog>

      <Dialog open={!!roleTarget} onOpenChange={(open) => !open && closeRoleChange()}>
        <DialogContent className="border-border bg-card sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-silver">Change User Role</DialogTitle>
          </DialogHeader>
          {roleTarget && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Current role: <RoleBadge role={roleTarget.role} />
              </p>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">New role</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as AppRole)}
                  className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-foreground"
                >
                  <option value="customer">Customer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <p className="rounded-lg border border-gold/30 bg-gold/10 p-3 text-xs text-foreground">
                Admins have full access to all platform data and settings.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="copper"
                  disabled={changingRole || newRole === roleTarget.role}
                  onClick={handleRoleChange}
                >
                  {changingRole ? "Saving…" : "Confirm"}
                </Button>
                <Button variant="secondary" type="button" disabled={changingRole} onClick={closeRoleChange}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-card text-left text-muted-foreground">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Vehicles</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c, i) => (
              <tr key={c.id} className={i % 2 === 0 ? "bg-card" : "bg-surface-2"}>
                <td className="px-4 py-3 text-silver">{c.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.email}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.phone ?? "-"}</td>
                <td className="px-4 py-3"><RoleBadge role={c.role} /></td>
                <td className="px-4 py-3">
                  <button onClick={() => openVehicles(c)} className="text-gold hover:underline">{c.vehicle_count}</button>
                </td>
                <td className="px-4 py-3">
                  <Button variant="copper-outline" size="sm" onClick={() => openEdit(c)}>Edit</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminCustomers;
