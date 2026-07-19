import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { formatINR } from "@/lib/format";
import { Plus, Edit2, Trash2, CheckCircle, XCircle, Star, X } from "lucide-react";

export const Route = createFileRoute("/admin/inventory")({
  component: AdminInventoryPage,
});

function AdminInventoryPage() {
  const cars = useQuery(api.cars.list, { sort: "newest" });
  const [editingCar, setEditingCar] = useState<any | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const toggleFeatured = useMutation(api.cars.toggleFeatured);
  const updateStatus = useMutation(api.cars.updateStatus);
  const removeCar = useMutation(api.cars.remove);

  if (cars === undefined) return <div className="p-8 text-muted-foreground animate-pulse">Loading inventory...</div>;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl">Inventory</h1>
          <p className="mt-2 text-sm text-muted-foreground">Manage your showroom floor.</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 rounded-lg bg-champagne px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-primary-foreground transition-all hover:bg-champagne/90"
        >
          <Plus className="h-4 w-4" />
          Add Car
        </button>
      </div>

      <div className="mt-8 overflow-x-auto rounded-xl border border-border/20 bg-card/20">
        <table className="w-full text-left text-sm whitespace-nowrap min-w-[800px]">
          <thead className="border-b border-border/20 bg-card/40 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            <tr>
              <th className="px-6 py-4">Vehicle</th>
              <th className="px-6 py-4">Price</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-center">Featured</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/10">
            {cars.map((car) => (
              <tr key={car._id} className="transition-colors hover:bg-card/30">
                <td className="px-6 py-4">
                  <div className="font-medium text-foreground">
                    {car.year} {car.make} {car.model}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {car.variant} · {car.km.toLocaleString()} km
                  </div>
                </td>
                <td className="px-6 py-4 tabular font-medium">
                  {formatINR(car.price_inr)}
                </td>
                <td className="px-6 py-4">
                  <select
                    value={car.status}
                    onChange={(e) => updateStatus({ id: car._id, status: e.target.value })}
                    className={`rounded-md px-2 py-1 text-xs font-medium uppercase tracking-widest ${
                      car.status === "available"
                        ? "bg-emerald-deep/20 text-emerald-deep border border-emerald-deep/30"
                        : "bg-destructive/10 text-destructive border border-destructive/20"
                    }`}
                  >
                    <option value="available">Available</option>
                    <option value="sold">Sold</option>
                    <option value="reserved">Reserved</option>
                  </select>
                </td>
                <td className="px-6 py-4 text-center">
                  <button
                    onClick={() => toggleFeatured({ id: car._id, featured: !car.featured })}
                    className={`transition-colors ${car.featured ? "text-champagne" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    <Star className={`h-5 w-5 mx-auto ${car.featured ? "fill-champagne" : ""}`} />
                  </button>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setEditingCar(car)}
                      className="p-2 text-muted-foreground hover:text-champagne transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Remove ${car.make} ${car.model}?`)) {
                          removeCar({ id: car._id });
                        }
                      }}
                      className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {cars.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                  No cars in inventory.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {(isAdding || editingCar) && (
        <CarFormModal
          car={editingCar}
          onClose={() => {
            setIsAdding(false);
            setEditingCar(null);
          }}
        />
      )}
    </div>
  );
}

function CarFormModal({ car, onClose }: { car: any; onClose: () => void }) {
  const isEditing = !!car;
  const createCar = useMutation(api.cars.create);
  const updateCar = useMutation(api.cars.update);

  const [form, setForm] = useState({
    make: car?.make || "",
    model: car?.model || "",
    variant: car?.variant || "",
    year: car?.year || new Date().getFullYear(),
    price_inr: car?.price_inr || 0,
    price_negotiable: car?.price_negotiable ?? true,
    km: car?.km || 0,
    fuel_type: car?.fuel_type || "Petrol",
    transmission: car?.transmission || "Automatic",
    body_type: car?.body_type || "Sedan",
    color: car?.color || "",
    owners: car?.owners || 1,
    reg_state: car?.reg_state || "KA",
    description: car?.description || "",
    features: car?.features?.join(", ") || "",
    images: car?.images?.map((i: any) => i.url).join("\n") || "",
  });

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    const payload = {
      ...form,
      year: Number(form.year),
      price_inr: Number(form.price_inr),
      km: Number(form.km),
      owners: Number(form.owners),
      features: form.features.split(",").map((f: string) => f.trim()).filter(Boolean),
      images: form.images.split("\n").map((url: string) => url.trim()).filter(Boolean),
    };

    try {
      if (isEditing) {
        await updateCar({ id: car._id, ...payload });
      } else {
        await createCar(payload);
      }
      onClose();
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-border/30 bg-card shadow-2xl p-6 md:p-8">
        <div className="flex items-center justify-between border-b border-border/20 pb-4">
          <h2 className="font-display text-2xl">{isEditing ? "Edit Car" : "Add Car"}</h2>
          <button onClick={onClose} className="p-2 text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="Make" value={form.make} onChange={(v: string) => setForm({ ...form, make: v })} required />
            <Field label="Model" value={form.model} onChange={(v: string) => setForm({ ...form, model: v })} required />
            <Field label="Variant" value={form.variant} onChange={(v: string) => setForm({ ...form, variant: v })} />
            
            <Field label="Year" type="number" value={form.year} onChange={(v: string) => setForm({ ...form, year: Number(v) })} required />
            <Field label="Price (₹)" type="number" value={form.price_inr} onChange={(v: string) => setForm({ ...form, price_inr: Number(v) })} required />
            <Field label="Kilometers" type="number" value={form.km} onChange={(v: string) => setForm({ ...form, km: Number(v) })} required />
            
            <SelectField label="Fuel Type" value={form.fuel_type} onChange={(v: string) => setForm({ ...form, fuel_type: v })} options={["Petrol", "Diesel", "Hybrid", "Electric"]} />
            <SelectField label="Transmission" value={form.transmission} onChange={(v: string) => setForm({ ...form, transmission: v })} options={["Automatic", "Manual"]} />
            <SelectField label="Body Type" value={form.body_type} onChange={(v: string) => setForm({ ...form, body_type: v })} options={["Sedan", "SUV", "Coupe", "Convertible", "Hatchback"]} />
            
            <Field label="Color" value={form.color} onChange={(v: string) => setForm({ ...form, color: v })} required />
            <Field label="Owners" type="number" value={form.owners} onChange={(v: string) => setForm({ ...form, owners: Number(v) })} required />
            <Field label="Reg State" value={form.reg_state} onChange={(v: string) => setForm({ ...form, reg_state: v })} />
          </div>

          <label className="flex items-center gap-2 text-sm text-foreground">
            <input 
              type="checkbox" 
              checked={form.price_negotiable} 
              onChange={(e) => setForm({ ...form, price_negotiable: e.target.checked })}
              className="rounded border-border bg-card text-champagne focus:ring-champagne"
            />
            Price is negotiable
          </label>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Description</label>
            <textarea
              rows={4}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="mt-2 w-full rounded-xl border border-border/30 bg-background px-4 py-3 text-sm focus:border-champagne focus:outline-none resize-none"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Features (comma separated)</label>
            <textarea
              rows={2}
              value={form.features}
              onChange={(e) => setForm({ ...form, features: e.target.value })}
              className="mt-2 w-full rounded-xl border border-border/30 bg-background px-4 py-3 text-sm focus:border-champagne focus:outline-none resize-none"
              placeholder="Panoramic Sunroof, Meridian Audio, Air Suspension..."
            />
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Image URLs (one per line)</label>
            <textarea
              rows={4}
              value={form.images}
              onChange={(e) => setForm({ ...form, images: e.target.value })}
              className="mt-2 w-full rounded-xl border border-border/30 bg-background px-4 py-3 text-sm focus:border-champagne focus:outline-none resize-none font-mono"
              placeholder="https://images.unsplash.com/photo-..."
            />
            <p className="mt-1 text-xs text-muted-foreground">The first URL will be used as the cover image.</p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border/20">
            <button type="button" onClick={onClose} className="px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground">
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-champagne px-8 py-2.5 text-xs font-bold uppercase tracking-widest text-primary-foreground hover:bg-champagne/90 disabled:opacity-50"
            >
              {submitting ? "Saving..." : "Save Car"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", required }: any) {
  return (
    <div>
      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{label}</label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-border/30 bg-background px-3 py-2 text-sm focus:border-champagne focus:outline-none"
      />
    </div>
  );
}

function SelectField({ label, value, onChange, options }: any) {
  return (
    <div>
      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-border/30 bg-background px-3 py-2 text-sm focus:border-champagne focus:outline-none"
      >
        {options.map((o: string) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}
