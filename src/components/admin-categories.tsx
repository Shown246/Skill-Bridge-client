"use client";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiFetch, errorMessage } from "@/lib/api";
import type { Category, Success } from "@/lib/types";
import { Badge, Button, ErrorState, Field, Input, Textarea } from "./ui";

type Draft = { id?: string; name: string; slug: string; description: string };
const blank: Draft = { name: "", slug: "", description: "" };

export function AdminCategories() {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["categories"],
    queryFn: () =>
      apiFetch<Success<Category[]>>("/api/v1/admin/categories", { auth: true })
        .catch(() => apiFetch<Success<Category[]>>("/api/v1/categories"))
        .then((r) => r.data),
  });

  const [draft, setDraft] = useState<Draft>(blank);

  const save = useMutation({
    mutationFn: () =>
      apiFetch<Success<Category>>(
        draft.id ? `/api/v1/admin/categories/${draft.id}` : "/api/v1/admin/categories",
        {
          auth: true,
          method: draft.id ? "PATCH" : "POST",
          body: JSON.stringify({
            name: draft.name.trim(),
            slug: draft.slug.trim() || undefined,
            description: draft.description.trim() || null,
          }),
        }
      ),
    onSuccess: (res) => {
      toast.success(draft.id ? "Category updated." : "Category created.");
      setDraft(blank);
      if (res?.data) {
        qc.setQueryData<Category[]>(["categories"], (old) => {
          if (!old) return [res.data];
          const exists = old.some((c) => c.id === res.data.id);
          return exists ? old.map((c) => (c.id === res.data.id ? res.data : c)) : [...old, res.data];
        });
      }
      qc.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  const toggleStatus = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      apiFetch<Success<Category>>(`/api/v1/admin/categories/${id}/status`, {
        auth: true,
        method: "PATCH",
        body: JSON.stringify({ isActive }),
      }),
    onSuccess: (res, vars) => {
      toast.success(vars.isActive ? "Category reactivated." : "Category deactivated.");
      if (res?.data) {
        qc.setQueryData<Category[]>(["categories"], (old) =>
          old ? old.map((c) => (c.id === res.data.id ? res.data : c)) : [res.data]
        );
      }
      qc.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  return (
    <section>
      <header className="page-head">
        <span className="eyebrow">Administration</span>
        <h1>Categories</h1>
        <p className="muted">Manage marketplace subjects. Deactivated categories are hidden publicly but can be reactivated anytime.</p>
      </header>
      <div className="split">
        <div>
          {q.isPending ? (
            <p>Loading categories…</p>
          ) : q.isError ? (
            <ErrorState error={q.error} retry={() => q.refetch()} />
          ) : (
            <div className="data-list">
              {q.data.map((c) => (
                <div className="card" key={c.id}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem" }}>
                    <div>
                      <h3>{c.name}</h3>
                      <p className="muted">/{c.slug}</p>
                    </div>
                    <Badge tone={c.isActive !== false ? "good" : "bad"}>
                      {c.isActive !== false ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <p>{c.description || "No description provided."}</p>
                  <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "0.5rem" }}>
                    <Button
                      className="button-secondary"
                      onClick={() =>
                        setDraft({
                          id: c.id,
                          name: c.name,
                          slug: c.slug,
                          description: c.description || "",
                        })
                      }
                    >
                      Edit
                    </Button>
                    {c.isActive !== false ? (
                      <Button
                        className="button-danger"
                        disabled={toggleStatus.isPending}
                        onClick={() => {
                          if (confirm(`Deactivate ${c.name}? Existing relationships remain, but it will disappear from the public marketplace.`)) {
                            toggleStatus.mutate({ id: c.id, isActive: false });
                          }
                        }}
                      >
                        Deactivate
                      </Button>
                    ) : (
                      <Button
                        className="button-secondary"
                        disabled={toggleStatus.isPending}
                        onClick={() => toggleStatus.mutate({ id: c.id, isActive: true })}
                      >
                        Reactivate
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="card form-grid" style={{ height: "fit-content" }}>
          <h2>{draft.id ? "Edit category" : "Create category"}</h2>
          <Field label="Name">
            <Input
              required
              minLength={2}
              maxLength={80}
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            />
          </Field>
          <Field label="Slug" hint="Lowercase letters, numbers, and hyphens. Leave empty to generate.">
            <Input
              pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
              value={draft.slug}
              onChange={(e) => setDraft({ ...draft, slug: e.target.value })}
            />
          </Field>
          <Field label="Description">
            <Textarea
              maxLength={1000}
              value={draft.description}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
            />
          </Field>
          <Button
            disabled={draft.name.trim().length < 2 || save.isPending}
            onClick={() => save.mutate()}
          >
            {save.isPending ? "Saving…" : "Save category"}
          </Button>
          {draft.id && (
            <Button className="button-secondary" onClick={() => setDraft(blank)}>
              Cancel edit
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
