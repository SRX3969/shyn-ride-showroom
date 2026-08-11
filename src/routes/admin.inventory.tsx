import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState, useEffect } from "react";
import { formatINR, formatKm } from "@/lib/utils";
import { Plus, Edit2, Trash2, Search, Filter, MessageSquare, ChevronLeft, ChevronRight, Check, CarFront } from "lucide-react";
import { toast } from "sonner";
import { CarFormModal } from "@/components/admin/car-form";
import { formatDistanceToNow } from "date-fns";
import { getSessionToken } from "@/lib/auth";

export const Route = createFileRoute("/admin/inventory")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      editCarId: search.editCarId as string | undefined,
    };
  },
  component: AdminInventoryPage,
});

function AdminInventoryPage() {
  const searchParams = Route.useSearch();
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [makeFilter, setMakeFilter] = useState<string | undefined>(undefined);
  
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [editingCar, setEditingCar] = useState<any | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const token = getSessionToken() || "";

  const inventory = useQuery(api.inventory.list, { 
    token,
    page, 
    limit, 
    search: search || undefined, 
    status: statusFilter || undefined, 
    make: makeFilter || undefined 
  });
  
  const softDelete = useMutation(api.inventory.softDelete);
  const bulkSoftDelete = useMutation(api.inventory.bulkSoftDelete);
  const updateStatus = useMutation(api.inventory.updateStatus);
  const bulkUpdateStatus = useMutation(api.inventory.bulkUpdateStatus);

  useEffect(() => {
    if (searchParams.editCarId && inventory && !editingCar) {
      const carToEdit = inventory.items.find((c: any) => c._id === searchParams.editCarId);
      if (carToEdit) {
        setEditingCar(carToEdit);
      }
    }
  }, [searchParams.editCarId, inventory]);

  const handleBulkStatus = async (status: string) => {
    if (selectedIds.size === 0) return;
    try {
      await bulkUpdateStatus({ token, ids: Array.from(selectedIds) as any, status });
      toast.success(`Updated ${selectedIds.size} cars to ${status}`);
      setSelectedIds(new Set());
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedIds.size} cars? This action cannot be undone from the UI.`)) return;
    
    try {
      await bulkSoftDelete({ token, ids: Array.from(selectedIds) as any });
      toast.success(`Deleted ${selectedIds.size} cars`);
      setSelectedIds(new Set());
    } catch (err) {
      toast.error("Failed to delete cars");
    }
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const toggleAll = () => {
    if (!inventory) return;
    if (selectedIds.size === inventory.items.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(inventory.items.map((i: any) => i._id)));
    }
  };

  return (
    <div className="p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Inventory</h1>
          <p className="mt-1 text-sm text-text-secondary">Manage showroom vehicles, pricing, and listings.</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 rounded-lg bg-gold-ui px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-gold-ui/90 shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Add Car
        </button>
      </div>

      <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 justify-between bg-surface p-4 rounded-t-2xl border border-border border-b-0">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
            <input 
              type="text"
              placeholder="Search make, model, reg..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-background border border-border rounded-lg pl-9 pr-4 py-2 text-sm text-text-primary focus:outline-none focus:border-gold-ui"
            />
          </div>
          <div className="flex items-center gap-2 bg-background border border-border rounded-lg px-3 py-2">
            <Filter className="h-4 w-4 text-text-tertiary" />
            <select 
              value={statusFilter || ""}
              onChange={(e) => setStatusFilter(e.target.value || undefined)}
              className="bg-transparent text-sm text-text-primary focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="available">Available</option>
              <option value="booked">Booked</option>
              <option value="sold">Sold</option>
            </select>
          </div>
        </div>

        {selectedIds.size > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-text-secondary">{selectedIds.size} selected</span>
            <select 
              onChange={(e) => {
                if (e.target.value === "delete") handleBulkDelete();
                else if (e.target.value) handleBulkStatus(e.target.value);
                e.target.value = "";
              }}
              className="bg-background border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none"
            >
              <option value="">Bulk Actions...</option>
              <option value="available">Mark Available</option>
              <option value="booked">Mark Booked</option>
              <option value="sold">Mark Sold</option>
              <option value="draft">Mark Draft</option>
              <option value="delete">Delete</option>
            </select>
          </div>
        )}
      </div>

      <div className="overflow-x-auto border border-border rounded-b-2xl bg-surface">
        <table className="w-full text-left text-sm whitespace-nowrap min-w-[900px]">
          <thead className="border-b border-border bg-background">
            <tr>
              <th className="px-6 py-4 w-12">
                <input 
                  type="checkbox" 
                  checked={inventory && inventory.items.length > 0 && selectedIds.size === inventory.items.length}
                  onChange={toggleAll}
                  className="rounded border-border"
                />
              </th>
              <th className="px-6 py-4 font-medium text-text-tertiary">Vehicle</th>
              <th className="px-6 py-4 font-medium text-text-tertiary">Price</th>
              <th className="px-6 py-4 font-medium text-text-tertiary">Status</th>
              <th className="px-6 py-4 font-medium text-text-tertiary text-center">Enquiries</th>
              <th className="px-6 py-4 font-medium text-text-tertiary text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {inventory === undefined ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-text-tertiary">
                  <div className="flex justify-center"><div className="h-6 w-6 animate-spin rounded-full border-2 border-gold-ui border-t-transparent" /></div>
                </td>
              </tr>
            ) : inventory.items.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <CarFront className="h-12 w-12 text-border mb-3" />
                    <p className="text-text-primary font-medium">No cars found in inventory</p>
                    <p className="text-sm text-text-tertiary mt-1">Adjust filters or add a new car to get started.</p>
                  </div>
                </td>
              </tr>
            ) : (
              inventory.items.map((car: any) => (
                <tr key={car._id} className="transition-colors hover:bg-border/30 group">
                  <td className="px-6 py-4">
                    <input 
                      type="checkbox" 
                      checked={selectedIds.has(car._id)}
                      onChange={() => toggleSelect(car._id)}
                      className="rounded border-border"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-12 bg-background rounded-lg border border-border overflow-hidden shrink-0">
                        {car.coverImage ? (
                          <img src={car.coverImage.url} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-text-tertiary text-[10px]">No img</div>
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-text-primary">
                          {car.year} {car.make} {car.model}
                        </div>
                        <div className="text-xs text-text-tertiary mt-0.5">
                          {car.variant && `${car.variant} • `}{formatKm(car.km)}
                          <span className="ml-2 text-gold-ui">Listed {car.daysListed}d ago</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-text-primary tabular-nums">
                      {formatINR(car.price_inr)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={car.status}
                      onChange={(e) => updateStatus({ token, id: car._id, status: e.target.value })}
                      className={`rounded-md px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer ${
                        car.status === "available"
                          ? "bg-gold-ui/10 text-gold-ui border border-gold-ui/20"
                          : car.status === "sold"
                          ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                          : car.status === "booked"
                          ? "bg-blue-500/10 text-blue-500 border border-blue-500/20"
                          : "bg-border text-text-secondary border border-border/50"
                      }`}
                    >
                      <option value="draft">Draft</option>
                      <option value="available">Available</option>
                      <option value="booked">Booked</option>
                      <option value="sold">Sold</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full bg-background border border-border text-xs font-medium text-text-secondary">
                      <MessageSquare className="h-3.5 w-3.5" />
                      {car.enquiriesCount}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setEditingCar(car)}
                        className="p-2 text-text-tertiary hover:text-gold-ui hover:bg-gold-ui/10 rounded-md transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Remove ${car.make} ${car.model}? This removes it from the public site.`)) {
                            softDelete({ token, id: car._id });
                          }
                        }}
                        className="p-2 text-text-tertiary hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {inventory && inventory.pages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-text-secondary">
            Showing {(page - 1) * limit + 1} to {Math.min(page * limit, inventory.total)} of {inventory.total} entries
          </p>
          <div className="flex gap-2">
            <button 
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="p-2 border border-border rounded-lg bg-surface text-text-primary disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button 
              disabled={page === inventory.pages}
              onClick={() => setPage(p => p + 1)}
              className="p-2 border border-border rounded-lg bg-surface text-text-primary disabled:opacity-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {(isAdding || editingCar) && (
        <CarFormModal 
          car={editingCar} 
          onClose={() => { setIsAdding(false); setEditingCar(null); }}
          onSaved={() => { setIsAdding(false); setEditingCar(null); }}
        />
      )}
    </div>
  );
}
