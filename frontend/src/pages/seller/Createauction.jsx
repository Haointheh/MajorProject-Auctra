// src/pages/seller/CreateAuction.jsx
// Form fields match POST /auctions exactly: title, description, category,
// condition, base_price, start_time, duration_days, images (1-5).

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../ui/PageHeader";
import Input from "../../ui/Input";
import Button from "../../ui/Button";
import { apiCreateAuction } from "../../api/auctions";
import FileUploadBox from "../../ui/FileUploadBox";

const CATEGORIES = ["art", "fashion", "jewellery", "antiques", "handicrafts"];
const CONDITIONS = ["excellent", "good", "fair", "poor"];

export default function CreateAuction() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    condition: "",
    base_price: "",
    start_time: "",
    duration_days: "",
  });
  const [image, setImage] = useState(null);     //do array for multiple ([])
  // const [previews, setPreviews] = useState([]);

  const updateField = (field, value) => setForm((p) => ({ ...p, [field]: value }));

  // const handleImageChange = (e) => {
  //   const files = Array.from(e.target.files).slice(0, 5);
  //   setImages(files);
  //   setPreviews(files.map((f) => URL.createObjectURL(f)));
  // };

  const validate = () => {
    if (!form.title || !form.description || !form.category || !form.condition) {
      return "Please fill in all required fields.";
    }
    if (!form.base_price || Number(form.base_price) <= 0) {
      return "base_price must be greater than 0.";
    }
    if (!form.start_time) return "Please select a start time.";
    if (!form.duration_days || Number(form.duration_days) <= 0) {
      return "duration_days must be greater than 0.";
    }
    // if (images.length < 1 || images.length > 5) {
    //   return "Please upload between 1 image";
    // }
    if (!image) {
      return "Please upload an image";
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
    setLoading(true);

    try {
      // start_time from <input type="datetime-local"> has no seconds/timezone
      // (e.g. "2026-07-15T10:00") — pass it through as-is, FastAPI/pydantic
      // parses it as a naive datetime same as the rest of the backend expects.
      // await apiCreateAuction(form, images);
      await apiCreateAuction(form, [image]);

      navigate("/seller/dashboard/auctions");
    } catch (err) {
      setError(err?.response?.data?.detail || "Failed to create auction.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Seller Hub"
        title="Create Auction"
        subtitle="List a new item for auction. All fields are required."
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
              id="category"
              label="Category"
              value={form.category}
              onChange={(e) => updateField("category", e.target.value)}
            >
              <option value="">Select category</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c} className="capitalize">{c}</option>
              ))}
            </Input>

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
          </div>

          <Input
            id="base_price"
            label="Starting Price (NPR)"
            type="number"
            min="1"
            placeholder="10000"
            value={form.base_price}
            onChange={(e) => updateField("base_price", e.target.value)}
          />

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

          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-neutral9 mb-1">
              Image
            </label>
            {/* <input
              type="file"
              accept="image/jpeg,image/png"
              multiple
              onChange={handleImageChange}
              className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
            />
            {previews.length > 0 && (
              <div className="flex gap-2 mt-3 flex-wrap">
                {previews.map((src, i) => (
                  <img key={i} src={src} alt={`preview-${i}`} className="w-16 h-16 object-cover border border-slate-200" />
                ))}
              </div>
            )} */}
          <FileUploadBox
              label="auction image"
              value={image}
              onChange={setImage}
              accept="image/jpeg,image/png"
          />

          </div>

          <Button type="submit" variant="secondary" size="md" className="w-full" disabled={loading}>
            {loading ? "Creating…" : "Create Auction"}
          </Button>
        </form>
      </div>
    </div>
  );
}