"use client";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiFetch, ApiError, errorMessage } from "@/lib/api";
import type { Success, User } from "@/lib/types";
import { Button, ErrorState, Field, Input } from "./ui";

export function ProfileForm() {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["me"],
    queryFn: () => apiFetch<Success<User>>("/api/v1/me", { auth: true }).then((r) => r.data),
  });
  const [v, setV] = useState({ name: "", phone: "", image: "" });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (q.data) {
      setV({
        name: q.data.name,
        phone: q.data.phone || "",
        image: q.data.image || "",
      });
    }
  }, [q.data]);

  const save = useMutation({
    mutationFn: () =>
      apiFetch<Success<User>>("/api/v1/me", {
        auth: true,
        method: "PATCH",
        body: JSON.stringify({
          name: v.name.trim(),
          phone: v.phone.trim() || null,
          image: v.image.trim() || null,
        }),
      }),
    onSuccess: (res) => {
      setFieldErrors({});
      toast.success("Profile updated.");
      if (res?.data) {
        qc.setQueryData(["me"], res.data);
      }
      qc.invalidateQueries({ queryKey: ["me"] });
    },
    onError: (e) => {
      if (e instanceof ApiError && e.fieldErrors) {
        const mapped: Record<string, string> = {};
        for (const [key, msgs] of Object.entries(e.fieldErrors)) {
          if (msgs && msgs[0]) mapped[key] = msgs[0];
        }
        setFieldErrors(mapped);
      }
      toast.error(errorMessage(e));
    },
  });

  if (q.isPending) return <p>Loading profile…</p>;
  if (q.isError) return <ErrorState error={q.error} retry={() => q.refetch()} />;

  return (
    <section>
      <header className="page-head">
        <span className="eyebrow">Account</span>
        <h1>Your profile</h1>
      </header>
      <div className="card form-grid" style={{ maxWidth: 650 }}>
        <Field label="Name" error={fieldErrors.name}>
          <Input
            required
            value={v.name}
            onChange={(e) => {
              setV({ ...v, name: e.target.value });
              setFieldErrors((fe) => ({ ...fe, name: "" }));
            }}
          />
        </Field>
        <Field label="Email">
          <Input disabled value={q.data.email} />
        </Field>
        <Field label="Phone" error={fieldErrors.phone}>
          <Input
            type="tel"
            value={v.phone}
            onChange={(e) => {
              setV({ ...v, phone: e.target.value });
              setFieldErrors((fe) => ({ ...fe, phone: "" }));
            }}
          />
        </Field>
        <Field label="Avatar URL" error={fieldErrors.image}>
          <Input
            type="url"
            value={v.image}
            onChange={(e) => {
              setV({ ...v, image: e.target.value });
              setFieldErrors((fe) => ({ ...fe, image: "" }));
            }}
          />
        </Field>
        <Button disabled={!v.name.trim() || save.isPending} onClick={() => save.mutate()}>
          {save.isPending ? "Saving…" : "Save profile"}
        </Button>
      </div>
    </section>
  );
}
