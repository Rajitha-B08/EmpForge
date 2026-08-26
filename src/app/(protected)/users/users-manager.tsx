"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createUserSchema, type CreateUserInput } from "@/validations/user";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { StatusBadge } from "@/components/ui/status-badge";
import { useToast } from "@/components/ui/toast";
import { formatDate } from "@/lib/utils";

type UserRow = { id: string; name: string; email: string; role: string; createdAt: string };

export function UsersManager({ initialUsers }: { initialUsers: UserRow[] }) {
  const { push } = useToast();
  const [users, setUsers] = useState(initialUsers);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { role: "EMPLOYEE" },
  });

  async function onCreate(data: CreateUserInput) {
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      push(body.error || "Failed to create user", "destructive");
      return;
    }
    const user = await res.json();
    setUsers((prev) => [{ ...user, createdAt: user.createdAt }, ...prev]);
    reset({ role: "EMPLOYEE", name: "", email: "", password: "" });
    push(`Account created for ${user.name}`);
  }

  function startEdit(user: UserRow) {
    setEditingId(user.id);
    setEditName(user.name);
  }

  async function saveEdit(id: string) {
    const res = await fetch(`/api/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName }),
    });
    if (!res.ok) {
      push("Failed to rename user", "destructive");
      return;
    }
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, name: editName } : u)));
    setEditingId(null);
    push("Name updated");
  }

  return (
    <div className="flex flex-col gap-8">
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Add a team member</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onCreate)} className="flex flex-col gap-4">
            <div>
              <Label>Full name</Label>
              <Input {...register("name")} />
              {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" {...register("email")} placeholder="their.name@yourcompany.com" />
              {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <div>
              <Label>Temporary password</Label>
              <Input {...register("password")} placeholder="At least 8 characters" />
              {errors.password && <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>}
            </div>
            <div>
              <Label>Role</Label>
              <Select {...register("role")}>
                <option value="ADMIN">Admin</option>
                <option value="RECRUITER">Recruiter</option>
                <option value="EMPLOYEE">Employee</option>
                <option value="INTERN">Intern</option>
              </Select>
            </div>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create account"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div>
        <h2 className="mb-3 text-lg font-semibold">All accounts ({users.length})</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Created</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id}>
                <TableCell>
                  {editingId === u.id ? (
                    <div className="flex gap-2">
                      <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="h-8" />
                      <Button size="sm" onClick={() => saveEdit(u.id)}>
                        Save
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <span className="font-medium">{u.name}</span>
                  )}
                </TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>
                  <StatusBadge status={u.role} />
                </TableCell>
                <TableCell>{formatDate(u.createdAt)}</TableCell>
                <TableCell>
                  {editingId !== u.id && (
                    <button className="text-xs text-primary hover:underline" onClick={() => startEdit(u)}>
                      Rename
                    </button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
