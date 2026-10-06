"use client";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiFetch, ApiError, errorMessage } from "@/lib/api";
import { formatMoney } from "@/lib/format";
import type { Category, Success, Tutor } from "@/lib/types";
import { Badge, Button, ErrorState, Field, Input, Textarea } from "./ui";

export function TutorProfileForm() {
  const qc = useQueryClient();
  const categories = useQuery({
    queryKey: ["categories"],
    queryFn: () => apiFetch<Success<Category[]>>("/api/v1/categories").then((r) => r.data),
    staleTime: 300000,
  });
  const profile = useQuery({
    queryKey: ["tutor-profile"],
    queryFn: () => apiFetch<Success<Tutor>>("/api/v1/tutor/profile", { auth: true }).then((r) => r.data),
    retry: (n, e) => !(e instanceof ApiError && e.status === 404) && n < 1,
  });

  const [v, setV] = useState({
    headline: "",
    bio: "",
    experienceYears: "0",
    hourlyRate: "",
    categoryIds: [] as string[],
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (profile.data) {
      setV({
        headline: profile.data.headline,
        bio: profile.data.bio,
        experienceYears: String(profile.data.experienceYears),
        hourlyRate: String(profile.data.hourlyRate),
        categoryIds: profile.data.categories.map((c) => c.category.id),
      });
    }
  }, [profile.data]);

  const save = useMutation({
    mutationFn: () =>
      apiFetch<Success<Tutor>>("/api/v1/tutor/profile", {
        auth: true,
        method: "PUT",
        body: JSON.stringify({
          headline: v.headline.trim(),
          bio: v.bio.trim(),
          experienceYears: Number(v.experienceYears),
          hourlyRate: Number(v.hourlyRate),
          categoryIds: v.categoryIds,
        }),
      }),
    onSuccess: (res) => {
      setFieldErrors({});
      toast.success("Teaching profile saved.");
      if (res?.data) {
        qc.setQueryData(["tutor-profile"], res.data);
      }
      qc.invalidateQueries({ queryKey: ["tutor-profile"] });
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

  const valid =
    v.headline.trim().length >= 5 &&
    v.bio.trim().length >= 50 &&
    Number.isInteger(Number(v.experienceYears)) &&
    Number(v.experienceYears) >= 0 &&
    Number(v.hourlyRate) > 0 &&
    v.categoryIds.length > 0;

  if (categories.isPending) return <p>Loading categories…</p>;
  if (categories.isError) return <ErrorState error={categories.error} retry={() => categories.refetch()} />;

  return (
    <section>
      <header className="page-head">
        <span className="eyebrow">Tutor profile</span>
        <h1>How students discover you</h1>
        {profile.data && (
          <>
            <Badge
              tone={
                profile.data.approvalStatus === "APPROVED"
                  ? "good"
                  : profile.data.approvalStatus === "REJECTED"
                  ? "bad"
                  : "warn"
              }
            >
              {profile.data.approvalStatus}
            </Badge>
            {profile.data.rejectionReason && (
              <p className="error">
                <strong>Reviewer feedback:</strong> {profile.data.rejectionReason}
              </p>
            )}
          </>
        )}
      </header>
      <div className="card form-grid" style={{ maxWidth: 800 }}>
        <Field label="Headline" hint={`${v.headline.length}/160`} error={fieldErrors.headline}>
          <Input
            required
            minLength={5}
            maxLength={160}
            value={v.headline}
            onChange={(e) => {
              setV({ ...v, headline: e.target.value });
              setFieldErrors((fe) => ({ ...fe, headline: "" }));
            }}
          />
        </Field>
        <Field label="Biography" hint={`${v.bio.length}/5000 · Minimum 50 characters`} error={fieldErrors.bio}>
          <Textarea
            required
            minLength={50}
            maxLength={5000}
            value={v.bio}
            onChange={(e) => {
              setV({ ...v, bio: e.target.value });
              setFieldErrors((fe) => ({ ...fe, bio: "" }));
            }}
          />
        </Field>
        <div className="split">
          <Field label="Experience (years)" error={fieldErrors.experienceYears}>
            <Input
              type="number"
              min="0"
              max="80"
              step="1"
              value={v.experienceYears}
              onChange={(e) => {
                setV({ ...v, experienceYears: e.target.value });
                setFieldErrors((fe) => ({ ...fe, experienceYears: "" }));
              }}
            />
          </Field>
          <Field label="Hourly rate" error={fieldErrors.hourlyRate}>
            <Input
              type="number"
              min="0.01"
              step="0.01"
              value={v.hourlyRate}
              onChange={(e) => {
                setV({ ...v, hourlyRate: e.target.value });
                setFieldErrors((fe) => ({ ...fe, hourlyRate: "" }));
              }}
            />
          </Field>
        </div>
        <fieldset>
          <legend>
            <strong>Subjects</strong>
          </legend>
          {fieldErrors.categoryIds && <p className="error" role="alert">{fieldErrors.categoryIds}</p>}
          <div className="grid-3">
            {categories.data.map((c) => (
              <label key={c.id}>
                <input
                  type="checkbox"
                  checked={v.categoryIds.includes(c.id)}
                  onChange={(e) => {
                    setFieldErrors((fe) => ({ ...fe, categoryIds: "" }));
                    setV({
                      ...v,
                      categoryIds: e.target.checked
                        ? [...v.categoryIds, c.id]
                        : v.categoryIds.filter((id) => id !== c.id),
                    });
                  }}
                />{" "}
                {c.name}
              </label>
            ))}
          </div>
        </fieldset>
        {v.hourlyRate && Number(v.hourlyRate) > 0 && (
          <p className="muted">Students will see {formatMoney(v.hourlyRate, "USD")} per hour.</p>
        )}
        <Button disabled={!valid || save.isPending} onClick={() => save.mutate()}>
          {save.isPending ? "Saving…" : "Save complete profile"}
        </Button>
        <small className="muted">
          Updates fully replace editable profile fields. An existing approval state is preserved by the backend.
        </small>
      </div>
    </section>
  );
}
