"use client";
import React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { formatDateTime, formatMoney } from "@/lib/format";
import type { Booking, BookingStatus, PaginatedSuccess } from "@/lib/types";
import { Badge, EmptyState, ErrorState, LinkButton, Select } from "./ui";

const tone = (status: BookingStatus) =>
  status === "COMPLETED" ? "good" : status === "CANCELLED" ? "bad" : ("warn" as const);

export function BookingList({ role }: { role: "student" | "tutor" }) {
  const [status, setStatus] = React.useState("");
  const result = useQuery({
    queryKey: ["bookings", role, status],
    queryFn: () =>
      apiFetch<PaginatedSuccess<Booking>>(
        `/api/v1/bookings?pageSize=50${status ? `&status=${status}` : ""}`,
        { auth: true }
      ),
  });

  return (
    <section>
      <header className="page-head">
        <span className="eyebrow">Your schedule</span>
        <h1>Bookings</h1>
        <label className="field" style={{ maxWidth: 240 }}>
          <span>Status</span>
          <Select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All bookings</option>
            <option>CONFIRMED</option>
            <option>COMPLETED</option>
            <option>CANCELLED</option>
          </Select>
        </label>
      </header>
      {result.isPending ? (
        <p>Loading bookings…</p>
      ) : result.isError ? (
        <ErrorState error={result.error} retry={() => result.refetch()} />
      ) : !result.data.data.length ? (
        <EmptyState
          title="No bookings found"
          action={
            role === "student" ? (
              <div style={{ marginTop: "1rem" }}>
                <LinkButton href="/tutors">Browse tutors</LinkButton>
              </div>
            ) : undefined
          }
        >
          {role === "student"
            ? "Browse tutors to reserve your first session."
            : "Assigned sessions will appear here."}
        </EmptyState>
      ) : (
        <div className="data-list">
          {result.data.data.map((b) => {
            const tutor = b.tutorProfile || b.tutor;
            return (
              <Link href={`/${role}/bookings/${b.id}`} className="card booking-row" key={b.id}>
                <div>
                  <strong>{role === "student" ? tutor?.user.name || "Tutor" : b.student?.name || "Student"}</strong>
                  <p className="muted">{b.category?.name || "Learning session"}</p>
                </div>
                <span>{formatDateTime(b.startAt)}</span>
                <strong>{formatMoney(b.quotedPrice, b.currencyCode)}</strong>
                <Badge tone={tone(b.status)}>{b.status}</Badge>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
