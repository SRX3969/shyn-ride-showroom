import React, { useState } from "react";
import { useMutation, useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { z } from "zod";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Upload, Loader2, GripVertical, Trash2 } from "lucide-react";
import { toast } from "sonner";

const carSchema = z.object({
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  variant: z.string().optional(),
  year: z.coerce.number().min(1900).max(new Date().getFullYear() + 1),
  price_inr: z.coerce.number().min(0, "Price must be positive"),
  price_negotiable: z.boolean().default(false),
  km: z.coerce.number().min(0),
  fuel_type: z.string().min(1),
  transmission: z.string().min(1),
  body_type: z.string().min(1),
  color: z.string().min(1),
  owners: z.coerce.number().min(1),
  reg_state: z.string().optional(),
  status: z.enum(["draft", "available", "booked", "sold"]),
  featured: z.boolean().default(false),
  description: z.string().optional(),
  features: z.array(z.string()).default([]),
  
  // Ledger/Admin fields
  purchase_price: z.coerce.number().optional(),
  purchase_date: z.string().optional(),
  purchase_source: z.string().optional(),
  sold_price: z.coerce.number().optional(),
  sold_date: z.string().optional(),
  internal_notes: z.string().optional(),

  images: z.array(z.object({
    storageId: z.string().optional(),
    url: z.string(),
    alt: z.string().optional()
  })).min(1, "At least one image is required")
});

type CarFormValues = z.infer<typeof carSchema>;

const TABS = ["Basic Info", "Pricing & Condition", "Photos", "Description", "Internal"];

export function CarFormModal({ car, onClose, onSaved }: { car: any | null, onClose: () => void, onSaved: () => void }) {
  const [activeTab, setActiveTab] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const generateUploadUrl = useMutation(api.inventory.generateUploadUrl);
  const saveCar = useMutation(api.inventory.saveCar);

  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm<CarFormValues>({
    resolver: zodResolver(carSchema),
    defaultValues: car ? {
      ...car,
      images: car.images || [],
      purchase_date: car.purchase_date ? new Date(car.purchase_date).toISOString().split('T')[0] : "",
      sold_date: car.sold_date ? new Date(car.sold_date).toISOString().split('T')[0] : "",
    } : {
      status: "draft",
      featured: false,
      price_negotiable: false,
      features: [],
      images: []
    }
  });

  const { fields: imageFields, append: appendImage, remove: removeImage, swap: swapImage } = useFieldArray({
    control,
    name: "images"
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const files = Array.from(e.target.files);
    
    setUploadProgress(0.1);
    const step = 0.9 / files.length;

    try {
      for (const file of files) {
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`File ${file.name} is too large (max 5MB)`);
          continue;
        }
        
        const uploadUrl = await generateUploadUrl();
        const res = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file
        });
        
        if (!res.ok) throw new Error(`Failed to upload ${file.name}`);
        
        const { storageId } = await res.json();
        
        // We push a temporary URL for preview, storageId for actual saving
        appendImage({ storageId, url: URL.createObjectURL(file), alt: "" });
        setUploadProgress(p => p + step);
      }
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploadProgress(0);
    }
  };

  const onSubmit = async (data: CarFormValues) => {
    if (data.status === "available" && data.images.length < 6) {
      toast.error("Available cars must have at least 6 photos.");
      setActiveTab(2);
      return;
    }

    setIsSubmitting(true);
    try {
      const slug = car?.slug || `${data.year}-${data.make}-${data.model}-${Date.now()}`.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      
      await saveCar({
        id: car?._id,
        slug,
        ...data,
      });

      toast.success("Car saved successfully!");
      onSaved();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to save car");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-4xl max-h-[90vh] bg-surface border border-border rounded-2xl flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-bold text-text-primary">{car ? "Edit Car" : "Add New Car"}</h2>
          <button onClick={onClose} className="p-2 hover:bg-border/50 rounded-full transition-colors text-text-secondary">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex border-b border-border px-6 overflow-x-auto">
          {TABS.map((tab, i) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(i)}
              className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                activeTab === i ? "border-gold-ui text-gold-ui" : "border-transparent text-text-secondary hover:text-text-primary"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <form id="car-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Basic Info */}
            <div className={activeTab === 0 ? "block" : "hidden"}>
              <datalist id="car-makes">
                {["Maruti Suzuki", "Hyundai", "Tata", "Mahindra", "Kia", "Toyota", "Honda", "MG", "Skoda", "Volkswagen", "Renault", "Nissan", "Jeep", "Audi", "BMW", "Mercedes-Benz", "Volvo", "Land Rover", "Jaguar", "Porsche", "Lexus", "Mini", "Isuzu", "Force Motors"].map(opt => <option key={opt} value={opt} />)}
              </datalist>
              <datalist id="body-types">
                {["Hatchback", "Sedan", "SUV", "MUV", "Coupe", "Convertible", "Wagon", "Pickup", "Minivan"].map(opt => <option key={opt} value={opt} />)}
              </datalist>
              <datalist id="car-colors">
                {["White", "Silver", "Grey", "Black", "Red", "Blue", "Brown", "Green", "Beige", "Yellow", "Orange", "Purple", "Gold"].map(opt => <option key={opt} value={opt} />)}
              </datalist>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-text-secondary">Make *</label>
                  <input list="car-makes" {...register("make")} className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-text-primary" placeholder="e.g. Tata, Hyundai..." autoComplete="off" />
                  {errors.make && <p className="text-xs text-red-500 mt-1">{errors.make.message}</p>}
                </div>
                <div>
                  <label className="text-sm font-medium text-text-secondary">Model *</label>
                  <input {...register("model")} className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-text-primary" />
                  {errors.model && <p className="text-xs text-red-500 mt-1">{errors.model.message}</p>}
                </div>
                <div>
                  <label className="text-sm font-medium text-text-secondary">Variant</label>
                  <input {...register("variant")} className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-text-primary" />
                </div>
                <div>
                  <label className="text-sm font-medium text-text-secondary">Year *</label>
                  <input type="number" {...register("year")} className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-text-primary" />
                  {errors.year && <p className="text-xs text-red-500 mt-1">{errors.year.message}</p>}
                </div>
                <div>
                  <label className="text-sm font-medium text-text-secondary">Body Type *</label>
                  <input list="body-types" {...register("body_type")} className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-text-primary" placeholder="e.g. SUV, Sedan..." autoComplete="off" />
                  {errors.body_type && <p className="text-xs text-red-500 mt-1">{errors.body_type.message}</p>}
                </div>
                <div>
                  <label className="text-sm font-medium text-text-secondary">Color *</label>
                  <input list="car-colors" {...register("color")} className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-text-primary" placeholder="e.g. White, Black..." autoComplete="off" />
                  {errors.color && <p className="text-xs text-red-500 mt-1">{errors.color.message}</p>}
                </div>
              </div>
            </div>

            {/* Pricing & Condition */}
            <div className={activeTab === 1 ? "block" : "hidden"}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-text-secondary">Selling Price (INR) *</label>
                  <input type="number" {...register("price_inr")} className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-text-primary" />
                  {errors.price_inr && <p className="text-xs text-red-500 mt-1">{errors.price_inr.message}</p>}
                </div>
                <div className="flex items-center gap-2 mt-6">
                  <input type="checkbox" id="neg" {...register("price_negotiable")} className="w-4 h-4 rounded border-border" />
                  <label htmlFor="neg" className="text-sm font-medium text-text-primary">Price is Negotiable</label>
                </div>
                <div>
                  <label className="text-sm font-medium text-text-secondary">KM Driven *</label>
                  <input type="number" {...register("km")} className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-text-primary" />
                </div>
                <div>
                  <label className="text-sm font-medium text-text-secondary">Fuel Type *</label>
                  <select {...register("fuel_type")} className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-text-primary">
                    <option value="">Select...</option>
                    <option value="petrol">Petrol</option>
                    <option value="diesel">Diesel</option>
                    <option value="electric">Electric</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-text-secondary">Transmission *</label>
                  <select {...register("transmission")} className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-text-primary">
                    <option value="">Select...</option>
                    <option value="automatic">Automatic</option>
                    <option value="manual">Manual</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-text-secondary">Owners *</label>
                  <input type="number" {...register("owners")} className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-text-primary" />
                </div>
                <div>
                  <label className="text-sm font-medium text-text-secondary">Reg State</label>
                  <input {...register("reg_state")} className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-text-primary" />
                </div>
                <div>
                  <label className="text-sm font-medium text-text-secondary">Status *</label>
                  <select {...register("status")} className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-text-primary">
                    <option value="draft">Draft</option>
                    <option value="available">Available</option>
                    <option value="booked">Booked</option>
                    <option value="sold">Sold</option>
                  </select>
                </div>
                <div className="flex items-center gap-2 mt-6">
                  <input type="checkbox" id="feat" {...register("featured")} className="w-4 h-4 rounded border-border" />
                  <label htmlFor="feat" className="text-sm font-medium text-text-primary">Featured on Homepage</label>
                </div>
              </div>
            </div>

            {/* Photos */}
            <div className={activeTab === 2 ? "block" : "hidden"}>
              <div className="border-2 border-dashed border-border rounded-xl p-8 text-center bg-background/50 relative">
                <input 
                  type="file" 
                  multiple 
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center pointer-events-none">
                  <Upload className="w-8 h-8 text-text-tertiary mb-3" />
                  <p className="text-sm font-medium text-text-primary">Drag & drop photos or click to browse</p>
                  <p className="text-xs text-text-tertiary mt-1">JPEG, PNG, WebP up to 5MB. 6 photos required for 'Available' status.</p>
                </div>
                {uploadProgress > 0 && (
                  <div className="absolute bottom-0 left-0 h-1 bg-gold-ui transition-all" style={{ width: `${uploadProgress * 100}%` }} />
                )}
              </div>

              {errors.images && <p className="text-xs text-red-500 mt-2">{errors.images.message}</p>}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                {imageFields.map((field, index) => (
                  <div key={field.id} className="group relative aspect-[4/3] rounded-lg overflow-hidden border border-border bg-background">
                    <img src={field.url} className="w-full h-full object-cover" alt="Car" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button type="button" onClick={() => index > 0 && swapImage(index, index - 1)} className="p-1.5 bg-white/20 rounded hover:bg-white/40 text-white disabled:opacity-30">
                        &larr;
                      </button>
                      <button type="button" onClick={() => removeImage(index)} className="p-1.5 bg-red-500/80 rounded hover:bg-red-500 text-white">
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button type="button" onClick={() => index < imageFields.length - 1 && swapImage(index, index + 1)} className="p-1.5 bg-white/20 rounded hover:bg-white/40 text-white disabled:opacity-30">
                        &rarr;
                      </button>
                    </div>
                    {index === 0 && (
                      <div className="absolute top-2 left-2 bg-gold-ui text-white text-[10px] font-bold px-2 py-0.5 rounded">COVER</div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className={activeTab === 3 ? "block" : "hidden"}>
              <div>
                <label className="text-sm font-medium text-text-secondary">Description</label>
                <textarea {...register("description")} rows={6} className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-text-primary resize-none" placeholder="Write a detailed description..." />
              </div>
              <div className="mt-4">
                <label className="text-sm font-medium text-text-secondary">Features (Comma separated)</label>
                <textarea 
                  rows={3} 
                  className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-text-primary resize-none" 
                  placeholder="Sunroof, Leather Seats, 360 Camera..."
                  defaultValue={watch("features")?.join(", ")}
                  onChange={(e) => {
                    const vals = e.target.value.split(",").map(v => v.trim()).filter(Boolean);
                    setValue("features", vals, { shouldDirty: true });
                  }}
                />
              </div>
            </div>

            {/* Internal Notes */}
            <div className={activeTab === 4 ? "block" : "hidden"}>
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
                <p className="text-sm text-red-500 font-medium">These fields are strictly for internal ledger calculations and will never be shown to customers.</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-text-secondary">Purchase Price (INR)</label>
                  <input type="number" {...register("purchase_price")} className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-text-primary" />
                </div>
                <div>
                  <label className="text-sm font-medium text-text-secondary">Purchase Date</label>
                  <input type="date" {...register("purchase_date")} className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-text-primary" />
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-text-secondary">Purchase Source / Seller Contact</label>
                  <input {...register("purchase_source")} className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-text-primary" />
                </div>
                <div>
                  <label className="text-sm font-medium text-text-secondary">Sold Price (INR)</label>
                  <input type="number" {...register("sold_price")} className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-text-primary" />
                </div>
                <div>
                  <label className="text-sm font-medium text-text-secondary">Sold Date</label>
                  <input type="date" {...register("sold_date")} className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-text-primary" />
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-text-secondary">Internal Notes</label>
                  <textarea {...register("internal_notes")} rows={3} className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-text-primary resize-none" />
                </div>
              </div>
            </div>

          </form>
        </div>

        <div className="border-t border-border px-6 py-4 flex justify-between items-center bg-background/50 rounded-b-2xl">
          <div className="text-sm text-text-tertiary">
            {Object.keys(errors).length > 0 && <span className="text-red-500">Please fix validation errors to save.</span>}
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="px-5 py-2 text-sm font-medium text-text-secondary hover:text-text-primary">Cancel</button>
            <button 
              type="submit" 
              form="car-form" 
              disabled={isSubmitting}
              className="flex items-center gap-2 bg-gold-ui hover:bg-gold-ui/90 text-white px-6 py-2 rounded-lg text-sm font-bold transition-all disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Save Car
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
