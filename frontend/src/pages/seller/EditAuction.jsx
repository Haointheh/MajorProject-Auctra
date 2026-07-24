// src/pages/seller/EditAuction.jsx
// Edit an existing auction. Mirrors backend PATCH /auctions/{id}
// (schemas.auction_schemas.AuctionUpdate) exactly — only title, description,
// condition, start_time, and duration_days can be changed. base_price,
// category, and images are fixed at creation and can't be edited here.
// The backend also rejects this call once the auction is no longer
// "scheduled" (status check in update_auction) — this page mirrors that
// guard client-side so sellers aren't led into filling out a form that
// will just 400 on submit.

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageHeader from "../../ui/PageHeader";
import Input from "../../ui/Input";
import Button from "../../ui/Button";
import EmptyState from "../../ui/EmptyState";
import { apiGetAuction, apiUpdateAuction } from "../../api/auctions";

const CONDITIONS = ["excellent", "good", "fair", "poor"];

// "2026-07-15T10:00:00" (or with a timezone offset) -> "2026-07-15T10:00"
// for a <input type="datetime-local"> value.
function toDatetimeLocalValue(isoString) {
  if (!isoString) return "";
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function daysBetween(startIso, endIso) {
  const start = new Date(startIso);
  const end = new Date(endIso);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return "";
  const ms = end.getTime() - start.getTime();
  return Math.max(1, Math.round(ms / (1000 * 60 * 60 * 24)));
}

export default function EditAuction() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [auction, setAuction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    condition: "",
    start_time: "",
    duration_days: "",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    apiGetAuction(id)
      .then((res) => {
        if (cancelled) return;
        const a = res.data;
        setAuction(a);
        setForm({
          title: a.title ?? "",
          description: a.description ?? "",
          condition: a.condition ?? "",
          start_time: toDatetimeLocalValue(a.start_time),
          duration_days: String(daysBetween(a.start_time, a.end_time)),
        });
      })
      .catch(() => {
        if (!cancelled) setNotFound(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  const updateField = (field, value) => setForm((p) => ({ ...p, [field]: value }));

  const validate = () => {
    if (!form.title || !form.description || !form.condition) {
      return "Please fill in all required fields.";
    }
    if (!form.start_time) return "Please select a start time.";
    if (!form.duration_days || Number(form.duration_days) <= 0) {
      return "duration_days must be greater than 0.";
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setSaving(true);

    try {
      await apiUpdateAuction(id, {
        title: form.title,
        description: form.description,
        condition: form.condition,
        // datetime-local value ("2026-07-15T10:00") passed through as-is —
        // same naive-datetime handling CreateAuction relies on.
        start_time: form.start_time,
        duration_days: Number(form.duration_days),
      });
      navigate(`/seller/dashboard/auctions/${id}`);
    } catch (err) {
      setError(err?.response?.data?.detail || "Failed to update auction.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8"><EmptyState title="Loading auction…" /></div>;
  }

  if (notFound || !auction) {
    return (
      <div className="p-8">
        <EmptyState
          title="Auction not found"
          action={
            <Button variant="secondary" size="sm" onClick={() => navigate("/seller/dashboard/auctions")}>
              Back to Listings
            </Button>
          }
        />
      </div>
    );
  }

  if (auction.status !== "scheduled") {
    return (
      <div className="p-8">
        <EmptyState
          title="This auction can no longer be edited."
          subtitle="Only scheduled auctions (before they go live) can be edited."
          action={
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate(`/seller/dashboard/auctions/${id}`)}
            >
              Back to Auction
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow="Seller Hub"
        title="Edit Auction"
        subtitle="Update your listing before it goes live. Price, category, and images can't be changed once created."
      />

      <div className="mx-auto max-w-2xl px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-5 bg-white border border-slate-100 p-6">

          {error && (
            <div className="border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm text-rose-600">
              {error}
            </div>
          )}

          <Input
            id="title"
            label="Title"
            placeholder="e.g. Vintage Hermès Silk Scarf"
            value={form.title}
            onChange={(e) => updateField("title", e.target.value)}
          />

          <Input
            as="textarea"
            id="description"
            label="Description"
            rows={4}
            placeholder="Describe the item, its history, and condition in detail"
            value={form.description}
            onChange={(e) => updateField("description", e.target.value)}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              as="select"
              id="condition"
              label="Condition"
              value={form.condition}
              onChange={(e) => updateField("condition", e.target.value)}
            >
              <option value="">Select condition</option>
              {CONDITIONS.map((c) => (
                <option key={c} value={c} className="capitalize">{c}</option>
              ))}
            </Input>

            <div>
              <label className="block text-sm text-neutral9 font-medium mb-2">
                Category
              </label>
              <p className="border border-neutral4 bg-slate-50 px-3 py-2 sm:px-4 sm:py-3 text-sm text-slate-400 capitalize">
                {auction.category} (fixed)
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm text-neutral9 font-medium mb-2">
              Starting Price
            </label>
            <p className="border border-neutral4 bg-slate-50 px-3 py-2 sm:px-4 sm:py-3 text-sm text-slate-400">
              NPR {Number(auction.base_price).toLocaleString("en-IN")} (fixed)
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              id="start_time"
              label="Start Time"
              type="datetime-local"
              value={form.start_time}
              onChange={(e) => updateField("start_time", e.target.value)}
            />
            <Input
              id="duration_days"
              label="Duration (days)"
              type="number"
              min="1"
              placeholder="7"
              value={form.duration_days}
              onChange={(e) => updateField("duration_days", e.target.value)}
            />
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="primaryBorder"
              size="md"
              className="w-full"
              onClick={() => navigate(`/seller/dashboard/auctions/${id}`)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" variant="secondary" size="md" className="w-full" disabled={saving}>
              {saving ? "Saving…" : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
