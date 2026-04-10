"use client";

import { useTransition, type FormEvent } from "react";
import { toast } from "sonner";
import {
  inviteTeamMember,
  removeTeamMember,
  revokeInvitation,
} from "@/actions/team";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Trash2, UserMinus } from "lucide-react";
import type { CompanyMemberRow } from "@/lib/types";

type MemberRow = CompanyMemberRow & { email: string | null };

type InviteRow = {
  id: string;
  email: string;
  role: string;
  expires_at: string;
  token: string;
};

export function TeamWorkspace({
  canManage,
  ownerEmail,
  ownerId,
  currentUserId,
  members,
  invites,
}: {
  canManage: boolean;
  ownerEmail: string | null;
  ownerId: string;
  currentUserId: string;
  members: MemberRow[];
  invites: InviteRow[];
}) {
  const [pending, start] = useTransition();

  return (
    <div className="space-y-10">
      <Card className="rounded-2xl border-border/50">
        <CardHeader>
          <CardTitle className="text-base">Eigenaar</CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          <p className="font-medium">{ownerEmail ?? ownerId}</p>
          <p className="mt-1 text-2xs text-muted-foreground">Volledige rechten</p>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-border/50">
        <CardHeader>
          <CardTitle className="text-base">Teamleden</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {members.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nog geen extra teamleden — nodig iemand uit.
            </p>
          ) : null}
          {members.map((m) => (
            <div
              key={m.user_id}
              className="flex flex-col gap-2 rounded-xl border border-border/50 bg-muted/20 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-sm font-medium">{m.email ?? m.user_id}</p>
                <p className="text-2xs uppercase tracking-wide text-muted-foreground">
                  {m.role === "admin" ? "Admin" : "Medewerker"}
                </p>
              </div>
              {canManage && m.user_id !== currentUserId ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-xl"
                  disabled={pending}
                  onClick={() => {
                    start(async () => {
                      const r = await removeTeamMember(m.user_id);
                      if (r.error) toast.error(r.error);
                      else toast.success("Teamlid verwijderd");
                    });
                  }}
                >
                  <UserMinus className="mr-2 size-4" />
                  Verwijderen
                </Button>
              ) : null}
            </div>
          ))}
        </CardContent>
      </Card>

      {canManage ? (
        <Card className="rounded-2xl border-border/50">
          <CardHeader>
            <CardTitle className="text-base">Uitnodigen</CardTitle>
            <p className="text-sm text-muted-foreground">
              Stuur een link naar een collega. Zij moeten inloggen met hetzelfde
              e-mailadres.
            </p>
          </CardHeader>
          <CardContent>
            <form
              className="grid gap-4 sm:grid-cols-2"
              onSubmit={(e: FormEvent<HTMLFormElement>) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                start(async () => {
                  const r = await inviteTeamMember({}, fd);
                  if (r.error) {
                    toast.error(r.error);
                    return;
                  }
                  toast.success("Uitnodiging aangemaakt");
                  if (r.inviteUrl) {
                    await navigator.clipboard.writeText(r.inviteUrl);
                    toast.message("Link gekopieerd naar klembord");
                  }
                });
              }}
            >
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="rounded-xl"
                  placeholder="naam@bedrijf.nl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Rol</Label>
                <select
                  id="role"
                  name="role"
                  className="flex h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
                >
                  <option value="medewerker">Medewerker</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex items-end">
                <Button
                  type="submit"
                  disabled={pending}
                  className="rounded-xl"
                >
                  {pending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    "Uitnodiging maken"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}

      {canManage && invites.length > 0 ? (
        <Card className="rounded-2xl border-border/50">
          <CardHeader>
            <CardTitle className="text-base">Openstaande uitnodigingen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {invites.map((i) => (
              <div
                key={i.id}
                className="flex flex-col gap-2 rounded-xl border border-border/40 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm font-medium">{i.email}</p>
                  <p className="text-2xs text-muted-foreground">
                    {i.role} · verloopt{" "}
                    {new Date(i.expires_at).toLocaleDateString("nl-NL")}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="rounded-xl"
                    onClick={() => {
                      const url = `${window.location.origin}/accept-invite?token=${encodeURIComponent(i.token)}`;
                      void navigator.clipboard.writeText(url);
                      toast.success("Link gekopieerd");
                    }}
                  >
                    Link kopiëren
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="rounded-xl text-destructive"
                    onClick={() => {
                      start(async () => {
                        const r = await revokeInvitation(i.id);
                        if (r.error) toast.error(r.error);
                        else toast.success("Uitnodiging ingetrokken");
                      });
                    }}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
