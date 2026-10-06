"use client";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiFetch, errorMessage } from "@/lib/api";
import { formatDateTime, formatMoney } from "@/lib/format";
import type { Booking, Success } from "@/lib/types";
import { Badge, Button, ErrorState, Field, Textarea } from "./ui";
import { ReviewForm } from "./review-form";

export function BookingDetail({ id, role }: { id: string; role: "student" | "tutor" }) {
  const qc = useQueryClient();
  const [reason, setReason] = useState("");
  const query = useQuery({
    queryKey: ["booking", id],
    queryFn: () => apiFetch<Success<Booking>>(`/api/v1/bookings/${id}`, { auth: true }).then((r) => r.data),
  });

  const action = useMutation({
    mutationFn: (kind: "cancel" | "complete") =>
      apiFetch<Success<Booking>>(`/api/v1/bookings/${id}/${kind}`, {
        auth: true,
        method: "PATCH",
        body: JSON.stringify(kind === "cancel" ? { reason: reason.trim() || undefined } : {}),
      }),
    onSuccess: (res, kind) => {
      toast.success(kind === "cancel" ? "Booking cancelled." : "Session marked complete.");
      if (res?.data) {
        qc.setQueryData(["booking", id], res.data);
      }
      qc.invalidateQueries({ queryKey: ["booking", id] });
      qc.invalidateQueries({ queryKey: ["bookings"] });
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  if (query.isPending) return <p>Loading booking…</p>;
  if (query.isError) return <ErrorState error={query.error} retry={() => query.refetch()} />;

  const b = query.data;
  const tutor = b.tutorProfile || b.tutor;

  return (
    <section>
      <header className="page-head">
        <span className="eyebrow">Booking detail</span>
        <h1>{b.category?.name || "Learning session"}</h1>
        <Badge tone={b.status === "COMPLETED" ? "good" : b.status === "CANCELLED" ? "bad" : "warn"}>
          {b.status}
        </Badge>
      </header>
      <div className="split">
        <div className="card">
          <h2>Session</h2>
          <p><strong>Student:</strong> {b.student?.name || "Student"}</p>
          <p><strong>Tutor:</strong> {tutor?.user.name || "Tutor"}</p>
          <p><strong>Starts:</strong> {formatDateTime(b.startAt)}</p>
          <p><strong>Ends:</strong> {formatDateTime(b.endAt)}</p>
          <p><strong>Duration:</strong> {b.durationMinutes} minutes</p>
          <p><strong>Quoted total:</strong> {formatMoney(b.quotedPrice, b.currencyCode)}</p>
          <p><strong>Note:</strong> {b.note || "None"}</p>
          <small className="muted">No payment is processed by SkillBridge.</small>
        </div>
        <div className="form-grid">
          {b.allowedActions?.includes("CANCEL") && (
            <div className="card form-grid">
              <h2>Cancel session</h2>
              <Field label="Reason (optional)">
                <Textarea maxLength={1000} value={reason} onChange={(e) => setReason(e.target.value)} />
              </Field>
              <Button
                className="button-danger"
                disabled={action.isPending}
                onClick={() => action.mutate("cancel")}
              >
                Confirm cancellation
              </Button>
            </div>
          )}
          {role === "tutor" && b.allowedActions?.includes("COMPLETE") && (
            <div className="card">
              <h2>Session finished?</h2>
              <p>Completion is available only after the scheduled end.</p>
              <Button disabled={action.isPending} onClick={() => action.mutate("complete")}>
                Mark complete
              </Button>
            </div>
          )}
          {b.review && (
            <div className="card">
              <h2>Student review</h2>
              <div className="stars">{"★".repeat(b.review.rating)}</div>
              <p>{b.review.comment}</p>
              <small>This review is immutable.</small>
            </div>
          )}
          {role === "student" && !b.review && b.allowedActions?.includes("REVIEW") && (
            <ReviewForm bookingId={id} onDone={() => query.refetch()} />
          )}
        </div>
      </div>
      {b.statusHistory?.length ? (
        <section className="section">
          <h2>Status history</h2>
          {b.statusHistory.map((h) => (
            <div className="card" key={h.id} style={{ marginBottom: ".6rem" }}>
              <strong>{h.toStatus}</strong> · {formatDateTime(h.createdAt)}
              {h.reason && <p>{h.reason}</p>}
            </div>
          ))}
        </section>
      ) : null}
    </section>
  );
}
