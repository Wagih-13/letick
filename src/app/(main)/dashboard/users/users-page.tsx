"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, RefreshCcw, Users as UsersIcon, CheckCircle2, PauseCircle, Calendar, MailCheck, Image as ImageIcon, LogIn } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { useDataTableInstance } from "@/hooks/use-data-table-instance";

import { getUserColumns, type UserRow } from "./columns";

type RoleOption = { id: string; name: string; slug: string };

const DEFAULT_LIMIT = 10;

export default function UsersPage() {
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState<RoleOption[]>([]);

  // Table data
  const [items, setItems] = useState<UserRow[]>([]);
  const [total, setTotal] = useState(0);
  const [metrics, setMetrics] = useState<any | null>(null);

  // Query state
  const [q, setQ] = useState("");
  const [role, setRole] = useState<string | undefined>(undefined);
  const [isActive, setIsActive] = useState<string>("all"); // all | active | inactive
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_LIMIT);

  // Dialog state
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<UserRow | null>(null);
  const [form, setForm] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    isActive: true,
    roles: [] as string[],
  });

  // Reset password dialog state and handler
  const [resetOpen, setResetOpen] = useState(false);
  const [resetTarget, setResetTarget] = useState<UserRow | null>(null);
  const [sendingReset, setSendingReset] = useState(false);
  const [resetMode, setResetMode] = useState<"email" | "set">("email");
  const [newPwd, setNewPwd] = useState("");
  const [newPwdConfirm, setNewPwdConfirm] = useState("");

  async function handleSendReset() {
    if (!resetTarget) return;
    try {
      setSendingReset(true);
      let res: Response;
      if (resetMode === "email") {
        res = await fetch(`/api/v1/users/${resetTarget.id}/reset-password`, { method: "POST" });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data?.success) throw new Error(data?.error?.message || "Failed to send reset email");
        toast.success(`Reset email sent to ${resetTarget.email}`);
      } else {
        if (!newPwd || newPwd.length < 6) throw new Error("Password must be at least 6 characters");
        if (newPwd !== newPwdConfirm) throw new Error("Passwords do not match");
        res = await fetch(`/api/v1/users/${resetTarget.id}/set-password`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password: newPwd }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data?.success) throw new Error(data?.error?.message || "Failed to update password");
        toast.success("Password updated successfully");
      }
      setResetOpen(false);
      setResetTarget(null);
      setResetMode("email");
      setNewPwd("");
      setNewPwdConfirm("");
    } catch (e: any) {
      toast.error(e?.message || "Failed to send reset email");
    } finally {
      setSendingReset(false);
    }
  }

  const columns = useMemo(
    () =>
      getUserColumns({
        onEdit: (row) => {
          setEditing(row);
          setForm({
            email: row.email,
            password: "",
            firstName: row.firstName || "",
            lastName: row.lastName || "",
            isActive: row.isActive,
            roles: (row.roles || []).map((r) => r.slug),
          });
          setOpen(true);
        },
        onReset: (row) => {
          setResetTarget(row);
          setResetOpen(true);
        },
        onDelete: async (row) => {
          const yes = confirm(`Delete user ${row.email}?`);
          if (!yes) return;
          try {
            const res = await fetch(`/api/v1/users/${row.id}`, { method: "DELETE" });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.error?.message || "Failed to delete");
            toast.success("User deleted");
            void fetchUsers();
          } catch (e: any) {
            toast.error(e.message || "Delete failed");
          }
        },
      }),
    [roles],
  );

  const table = useDataTableInstance({
    data: items,
    columns,
    manualPagination: true,
    defaultPageIndex: pageIndex,
    defaultPageSize: pageSize,
    pageCount: Math.max(1, Math.ceil(total / Math.max(1, pageSize))),
    getRowId: (row) => row.id,
    onPaginationChange: ({ pageIndex: pi, pageSize: ps }) => {
      setPageIndex(pi);
      setPageSize(ps);
    },
  });

  // Table pagination state is synced via onPaginationChange above

  useEffect(() => {
    void fetchRoles();
  }, []);

  useEffect(() => {
    void fetchUsers();
    void fetchMetrics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, role, isActive, pageIndex, pageSize]);

  async function fetchMetrics() {
    try {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (role) params.set("role", role);
      if (isActive !== "all") params.set("isActive", String(isActive === "active"));
      const res = await fetch(`/api/v1/users/metrics?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || "Failed to load metrics");
      setMetrics(data.data || null);
    } catch {}
  }

  async function fetchRoles() {
    try {
      const res = await fetch("/api/v1/users/roles");
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || "Failed to load roles");
      setRoles(data.data || []);
    } catch (e: any) {
      toast.error(e.message || "Failed to load roles");
    }
  }

  async function fetchUsers() {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (role) params.set("role", role);
      if (isActive !== "all") params.set("isActive", String(isActive === "active"));
      params.set("page", String(pageIndex + 1));
      params.set("limit", String(pageSize));
      params.set("sort", "createdAt.desc");
      const res = await fetch(`/api/v1/users?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || "Failed to load users");
      setItems((data.data?.items || []).map((u: any) => ({ ...u, createdAt: u.createdAt })));
      setTotal(data.data?.total || 0);
    } catch (e: any) {
      toast.error(e.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setEditing(null);
    setForm({ email: "", password: "", firstName: "", lastName: "", isActive: true, roles: [] });
  }

  async function onSubmit() {
    try {
      const payload: any = {
        email: form.email,
        firstName: form.firstName,
        lastName: form.lastName,
        isActive: form.isActive,
        roles: form.roles,
      };
      if (!editing) payload.password = form.password;
      const res = await fetch(editing ? `/api/v1/users/${editing.id}` : "/api/v1/users", {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || "Save failed");
      toast.success(editing ? "User updated" : "User created");
      setOpen(false);
      resetForm();
      void fetchUsers();
    } catch (e: any) {
      toast.error(e.message || "Save failed");
    }
  }

  return (
    <div className="@container/main flex flex-col gap-4 md:gap-6">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-6">
        <div className="rounded-lg border p-4 col-span-1">
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">Total users</div>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-semibold">{metrics?.totalUsers ?? total}</div>
        </div>
        <div className="rounded-lg border p-4 col-span-1">
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">Active</div>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-semibold">{Number(metrics?.activeUsers ?? 0)}</div>
        </div>
        <div className="rounded-lg border p-4 col-span-1">
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">Inactive</div>
            <PauseCircle className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-semibold">{Number(metrics?.inactiveUsers ?? 0)}</div>
        </div>
        <div className="rounded-lg border p-4 col-span-1">
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">New (30d)</div>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-semibold">{Number(metrics?.newUsers30d ?? 0)}</div>
        </div>
        <div className="rounded-lg border p-4 col-span-1">
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">Email verified</div>
            <MailCheck className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-semibold">{Number(metrics?.emailVerified ?? 0)}</div>
        </div>
        <div className="rounded-lg border p-4 col-span-1">
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">With avatar</div>
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-semibold">{Number(metrics?.withAvatar ?? 0)}</div>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-1">
        <div className="rounded-lg border p-4 col-span-1">
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">Logged in (30d)</div>
            <LogIn className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-semibold">{Number(metrics?.lastLogin30d ?? 0)}</div>
        </div>
      </div>
      {/* Toolbar */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="q">Search</Label>
            <Input id="q" placeholder="Search name or email" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Role</Label>
            <Select value={role ?? "all"} onValueChange={(v) => setRole(v === "all" ? undefined : v)}>
              <SelectTrigger>
                <SelectValue placeholder="All roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {roles.map((r) => (
                  <SelectItem key={r.slug} value={r.slug}>
                    {r.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Status</Label>
            <Select value={isActive} onValueChange={(v) => setIsActive(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => void fetchUsers()} disabled={loading}>
            <RefreshCcw className="mr-1 h-4 w-4" /> Refresh
          </Button>
          <Dialog open={open} onOpenChange={(o) => (o ? setOpen(true) : (setOpen(false), resetForm()))}>
            <DialogTrigger asChild>
              <Button onClick={() => setOpen(true)}>
                <Plus className="mr-1 h-4 w-4" /> Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[520px]">
              <DialogHeader>
                <DialogTitle>{editing ? "Edit User" : "Create User"}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-3 py-2">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
                      placeholder="user@example.com"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label>Password{editing ? " (leave blank to keep)" : ""}</Label>
                    <Input
                      type="password"
                      value={form.password}
                      onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
                      placeholder={editing ? "••••••••" : "Strong password"}
                      disabled={!!editing}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <Label>First Name</Label>
                    <Input value={form.firstName} onChange={(e) => setForm((s) => ({ ...s, firstName: e.target.value }))} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label>Last Name</Label>
                    <Input value={form.lastName} onChange={(e) => setForm((s) => ({ ...s, lastName: e.target.value }))} />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="isActive"
                    checked={form.isActive}
                    onCheckedChange={(v) => setForm((s) => ({ ...s, isActive: Boolean(v) }))}
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Roles</Label>
                  <div className="flex flex-wrap gap-3">
                    {roles.map((r) => {
                      const checked = form.roles.includes(r.slug);
                      return (
                        <label key={r.slug} className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
                          <Checkbox
                            checked={checked}
                            onCheckedChange={(v) =>
                              setForm((s) => ({
                                ...s,
                                roles: v ? [...s.roles, r.slug] : s.roles.filter((x) => x !== r.slug),
                              }))
                            }
                          />
                          <span className="capitalize">{r.name}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => (setOpen(false), resetForm())}>
                  Cancel
                </Button>
                <Button onClick={() => void onSubmit()} disabled={loading}>
                  {editing ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border">
        <DataTable table={table as any} columns={columns as any} />
      </div>
      <DataTablePagination table={table as any} total={total} pageIndex={pageIndex} pageSize={pageSize} />

      {/* Reset Password Dialog */}
      <Dialog
        open={resetOpen}
        onOpenChange={(o) =>
          o
            ? setResetOpen(true)
            : (setResetOpen(false), setResetTarget(null), setResetMode("email"), setNewPwd(""), setNewPwdConfirm(""))
        }
      >
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2 text-sm">
            <div>
              <Label>Mode</Label>
              <div className="mt-1">
                <Select value={resetMode} onValueChange={(v) => setResetMode(v as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Send email to user</SelectItem>
                    <SelectItem value="set">Set a new password now</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {resetMode === "email" ? (
              <div className="space-y-2">
                <p>Send a password reset email to:</p>
                <p className="font-medium">{resetTarget?.email}</p>
                <p className="text-muted-foreground">They will receive a link to set a new password. The link expires in 1 hour.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <Label>New Password</Label>
                  <Input type="password" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} placeholder="New password" />
                </div>
                <div>
                  <Label>Confirm Password</Label>
                  <Input type="password" value={newPwdConfirm} onChange={(e) => setNewPwdConfirm(e.target.value)} placeholder="Confirm password" />
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => (setResetOpen(false), setResetTarget(null), setResetMode("email"), setNewPwd(""), setNewPwdConfirm(""))}
            >
              Cancel
            </Button>
            <Button onClick={() => void handleSendReset()} disabled={sendingReset}>
              {sendingReset ? "Processing..." : resetMode === "email" ? "Send Email" : "Update Password"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
