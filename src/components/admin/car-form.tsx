import React, { useState } from "react";
import { useMutation, useAction, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { z } from "zod";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Upload, Loader2, GripVertical, Trash2, Camera } from "lucide-react";
import { toast } from "sonner";
import { calculateEMI, formatINR } from "@/lib/utils";
import { getSessionToken } from "@/lib/auth";

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
  reg_state: z.string().optional().default("KA"),
  status: z.enum(["draft", "available", "booked", "sold"]),
  featured: z.boolean().default(false),
  description: z.string().optional(),
  features: z.array(z.string()).default([]),
  
  // Ledger/Admin fields
  original_price: z.coerce.number().optional(),
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

const POPULAR_MODELS: Record<string, string[]> = {
  "Tata": ["Harrier", "Nexon", "Safari", "Punch", "Altroz", "Tiago", "Tigor", "Curvv", "Nexon EV"],
  "Hyundai": ["Creta", "Venue", "Verna", "i20", "Tucson", "Alcazar", "Exster", "Aura", "Ioniq 5"],
  "Mercedes-Benz": ["C-Class", "E-Class", "GLC", "GLE", "S-Class", "CLA", "GLA", "GLS", "AMG GT", "EQS"],
  "BMW": ["3 Series", "5 Series", "X1", "X3", "X5", "7 Series", "X7", "M3", "i4", "Z4"],
  "Audi": ["A4", "A6", "Q3", "Q5", "Q7", "A8 L", "Q8", "e-tron", "RS5"],
  "Mahindra": ["Thar", "XUV700", "Scorpio-N", "Scorpio Classic", "XUV300", "Bolero Neo", "XUV400"],
  "Toyota": ["Fortuner", "Innova Crysta", "Innova Hycross", "Glanza", "Urban Cruiser Hyryder", "Camry", "Vellfire"],
  "Kia": ["Seltos", "Sonet", "Carens", "Carnival", "EV6"],
  "Honda": ["City", "Amaze", "Elevate", "Civic", "CR-V"],
  "MG": ["Hector", "Astor", "ZSEV", "Gloster", "Comet EV"],
  "Skoda": ["Slavia", "Kushaq", "Kodiaq", "Octavia", "Superb"],
  "Volkswagen": ["Virtus", "Taigun", "Tiguan", "Polo"],
  "Land Rover": ["Defender", "Range Rover Evoque", "Range Rover Velar", "Discovery Sport", "Range Rover Sport"],
  "Volvo": ["XC60", "XC90", "XC40 Recharge", "S90"],
  "Porsche": ["Cayenne", "Macan", "911 Carrera", "Panamera", "Taycan"],
  "Jaguar": ["F-Pace", "XE", "XF", "F-Type"]
};

const ALL_MODELS = Array.from(new Set(Object.values(POPULAR_MODELS).flat()));

const POPULAR_VARIANTS = [
  "XZA Plus", "XZ+ Dual Tone", "SX (O)", "SX", "ZX", "VX", "200d AMG Line", "220d",
  "320d M Sport", "Technology", "LXI", "VXI", "ZXI+", "AX7 L Turbo", "Z8 L", "V6 Petrol"
];

const RECENT_YEARS = Array.from({ length: 15 }, (_, i) => (new Date().getFullYear() - i).toString());

const INDIAN_STATES = [
  "KA", "MH", "DL", "HR", "TN", "TS", "KL", "GA", "AP", "WB", "GJ", "UP", "PB", "RJ"
];

export function CarFormModal({ car, onClose, onSaved }: { car: any | null, onClose: () => void, onSaved: () => void }) {
  const [activeTab, setActiveTab] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const generateUploadUrl = useMutation(api.inventory.generateUploadUrl);
  const saveCar = useMutation(api.inventory.saveCar);
  const settings = useQuery(api.settings.get);
  const token = getSessionToken() || "";

  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm<CarFormValues>({
    resolver: zodResolver(carSchema) as any,
    defaultValues: car ? {
      ...car,
      images: car.images || [],
      purchase_date: car.purchase_date ? new Date(car.purchase_date).toISOString().split('T')[0] : "",
      sold_date: car.sold_date ? new Date(car.sold_date).toISOString().split('T')[0] : "",
    } : {
      status: "draft",
      featured: false,
      price_negotiable: false,
      reg_state: "KA",
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
        
        const uploadUrl = await generateUploadUrl({ token });
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
        token,
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
  const selectedMake = watch("make");
  const modelOptions = (selectedMake && POPULAR_MODELS[selectedMake]) ? POPULAR_MODELS[selectedMake] : ALL_MODELS;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-4xl max-h-[90vh] bg-surface border border-border rounded-2xl flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-text-primary">{car ? "Edit Car" : "Add New Car"}</h2>
            {!car && (
              <button
                type="button"
                onClick={() => {
                  setValue("make", "Mercedes-Benz", { shouldValidate: true });
                  setValue("model", "C-Class", { shouldValidate: true });
                  setValue("variant", "C 200d AMG Line", { shouldValidate: true });
                  setValue("year", 2022, { shouldValidate: true });
                  setValue("body_type", "Sedan", { shouldValidate: true });
                  setValue("color", "White", { shouldValidate: true });
                  setValue("price_inr", 4250000, { shouldValidate: true });
                  setValue("original_price", 4600000);
                  setValue("km", 24000, { shouldValidate: true });
                  setValue("fuel_type", "diesel", { shouldValidate: true });
                  setValue("transmission", "automatic", { shouldValidate: true });
                  setValue("owners", 1, { shouldValidate: true });
                  setValue("reg_state", "KA");
                  setValue("status", "available");
                  setValue("featured", true);
                  setValue("description", "Pristine condition single-owner Mercedes C-Class 200d. Full service history with authorized Mercedes dealership.");
                  setValue("features", ["Sunroof", "Leather Seats", "360 Camera", "Ambient Lighting", "Burmester Audio"]);
                  setValue("purchase_price", 3800000);
                  setValue("purchase_source", "Direct Owner (Bangalore)");
                  toast.success("Sample car data loaded!");
                }}
                className="text-xs bg-gold-ui/15 text-gold-ui hover:bg-gold-ui/25 px-3 py-1.5 rounded-lg font-medium border border-gold-ui/30 transition-all flex items-center gap-1 cursor-pointer"
              >
                ⚡ Quick Fill Sample Car
              </button>
            )}
          </div>
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
              <datalist id="car-models">
                {modelOptions.map(opt => <option key={opt} value={opt} />)}
              </datalist>
              <datalist id="car-variants">
                {POPULAR_VARIANTS.map(opt => <option key={opt} value={opt} />)}
              </datalist>
              <datalist id="car-years">
                {RECENT_YEARS.map(opt => <option key={opt} value={opt} />)}
              </datalist>
              <datalist id="body-types">
                {["Hatchback", "Sedan", "SUV", "MUV", "Coupe", "Convertible", "Wagon", "Pickup", "Minivan"].map(opt => <option key={opt} value={opt} />)}
              </datalist>
              <datalist id="car-colors">
                {["White", "Silver", "Grey", "Black", "Red", "Blue", "Brown", "Green", "Beige", "Yellow", "Orange", "Purple", "Gold"].map(opt => <option key={opt} value={opt} />)}
              </datalist>
              <datalist id="reg-states">
                {INDIAN_STATES.map(opt => <option key={opt} value={opt} />)}
              </datalist>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-text-secondary">Make *</label>
                  <input list="car-makes" {...register("make")} className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-text-primary placeholder:text-text-tertiary" placeholder="e.g. Tata, Hyundai..." autoComplete="off" />
                  {errors.make && <p className="text-xs text-red-500 mt-1">{errors.make.message}</p>}
                </div>
                <div>
                  <label className="text-sm font-medium text-text-secondary">Model *</label>
                  <input list="car-models" {...register("model")} className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-text-primary placeholder:text-text-tertiary" placeholder="e.g. Harrier, Creta, C-Class..." autoComplete="off" />
                  {errors.model && <p className="text-xs text-red-500 mt-1">{errors.model.message}</p>}
                </div>
                <div>
                  <label className="text-sm font-medium text-text-secondary">Variant</label>
                  <input list="car-variants" {...register("variant")} className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-text-primary placeholder:text-text-tertiary" placeholder="e.g. XZA Plus, SX(O), 200d..." autoComplete="off" />
                </div>
                <div>
                  <label className="text-sm font-medium text-text-secondary">Year *</label>
                  <input type="number" list="car-years" {...register("year")} className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-text-primary placeholder:text-text-tertiary" placeholder="e.g. 2022" autoComplete="off" />
                  {errors.year && <p className="text-xs text-red-500 mt-1">{errors.year.message}</p>}
                </div>
                <div>
                  <label className="text-sm font-medium text-text-secondary">Body Type *</label>
                  <input list="body-types" {...register("body_type")} className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-text-primary placeholder:text-text-tertiary" placeholder="e.g. SUV, Sedan..." autoComplete="off" />
                  {errors.body_type && <p className="text-xs text-red-500 mt-1">{errors.body_type.message}</p>}
                </div>
                <div>
                  <label className="text-sm font-medium text-text-secondary">Color *</label>
                  <input list="car-colors" {...register("color")} className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-text-primary placeholder:text-text-tertiary" placeholder="e.g. White, Black..." autoComplete="off" />
                  {errors.color && <p className="text-xs text-red-500 mt-1">{errors.color.message}</p>}
                </div>
              </div>
            </div>

            {/* Pricing & Condition */}
            <div className={activeTab === 1 ? "block" : "hidden"}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-text-secondary">Selling Price (INR) *</label>
                  <input type="number" {...register("price_inr")} className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-text-primary placeholder:text-text-tertiary" placeholder="e.g. 1850000" />
                  {errors.price_inr && <p className="text-xs text-red-500 mt-1">{errors.price_inr.message}</p>}
                </div>
                <div>
                  <label className="text-sm font-medium text-text-secondary">Original Price (For Limited Offer)</label>
                  <input type="number" {...register("original_price")} className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-text-primary placeholder:text-text-tertiary" placeholder="e.g. 2100000" />
                </div>
                {settings && (
                  <div className="col-span-2 bg-gold-ui/10 border border-gold-ui/20 rounded-lg p-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gold-ui font-medium uppercase tracking-wider mb-1">Live EMI Preview</p>
                      <p className="text-sm text-text-secondary">Based on {settings.emiDownPaymentPct}% down, {settings.emiAnnualRatePct}% interest for {settings.emiTenureMonths} months.</p>
                    </div>
                    <div className="text-xl font-bold text-text-primary">
                      {formatINR(calculateEMI(watch("price_inr") || 0, settings.emiDownPaymentPct, settings.emiAnnualRatePct, settings.emiTenureMonths))}/m*
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <input type="checkbox" id="neg" {...register("price_negotiable")} className="w-4 h-4 rounded border-border" />
                  <label htmlFor="neg" className="text-sm font-medium text-text-primary">Price is Negotiable</label>
                </div>
                <div>
                  <label className="text-sm font-medium text-text-secondary">KM Driven *</label>
                  <input type="number" {...register("km")} className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-text-primary placeholder:text-text-tertiary" placeholder="e.g. 35000" />
                </div>
                <div>
                  <label className="text-sm font-medium text-text-secondary">Fuel Type *</label>
                  <select {...register("fuel_type")} className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-text-primary">
                    <option value="">Select Fuel Type...</option>
                    <option value="petrol">Petrol</option>
                    <option value="diesel">Diesel</option>
                    <option value="electric">Electric</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-text-secondary">Transmission *</label>
                  <select {...register("transmission")} className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-text-primary">
                    <option value="">Select Transmission...</option>
                    <option value="automatic">Automatic</option>
                    <option value="manual">Manual</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-text-secondary">Owners *</label>
                  <input type="number" {...register("owners")} className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-text-primary placeholder:text-text-tertiary" placeholder="e.g. 1" />
                </div>
                <div>
                  <label className="text-sm font-medium text-text-secondary">Reg State</label>
                  <input list="reg-states" {...register("reg_state")} className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-text-primary placeholder:text-text-tertiary" placeholder="e.g. KA, MH, DL..." autoComplete="off" />
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border-2 border-dashed border-border rounded-xl p-6 text-center bg-background/50 relative">
                  <input 
                    type="file" 
                    multiple 
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center pointer-events-none">
                    <Upload className="w-7 h-7 text-text-tertiary mb-2" />
                    <p className="text-sm font-medium text-text-primary">Upload from Files</p>
                    <p className="text-xs text-text-tertiary mt-1">Select JPEG, PNG, WebP</p>
                  </div>
                  {uploadProgress > 0 && (
                    <div className="absolute bottom-0 left-0 h-1 bg-gold-ui transition-all" style={{ width: `${uploadProgress * 100}%` }} />
                  )}
                </div>

                <div className="border-2 border-dashed border-gold-ui/40 rounded-xl p-6 text-center bg-gold-ui/5 relative">
                  <input 
                    type="file" 
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center pointer-events-none">
                    <Camera className="w-7 h-7 text-gold-ui mb-2 animate-pulse" />
                    <p className="text-sm font-medium text-gold-ui">Take Photo with Phone Camera</p>
                    <p className="text-xs text-text-tertiary mt-1">Direct camera upload on mobile</p>
                  </div>
                </div>
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
                <textarea {...register("description")} rows={6} className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-text-primary placeholder:text-text-tertiary resize-none" placeholder="e.g. Single owner, dealer maintained with full service history, pristine condition..." />
              </div>
              <div className="mt-4">
                <label className="text-sm font-medium text-text-secondary">Features (Comma separated)</label>
                <textarea 
                  rows={3} 
                  className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-text-primary placeholder:text-text-tertiary resize-none" 
                  placeholder="e.g. Sunroof, Leather Seats, 360 Camera, Ventilated Seats..."
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
                  <input type="number" {...register("purchase_price")} className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-text-primary placeholder:text-text-tertiary" placeholder="e.g. 1500000" />
                </div>
                <div>
                  <label className="text-sm font-medium text-text-secondary">Purchase Date</label>
                  <input type="date" {...register("purchase_date")} className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-text-primary" />
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-text-secondary">Purchase Source / Seller Contact</label>
                  <input {...register("purchase_source")} className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-text-primary placeholder:text-text-tertiary" placeholder="e.g. Direct Owner (Ramesh - 9876543210) / Trade-in" />
                </div>
                <div>
                  <label className="text-sm font-medium text-text-secondary">Sold Price (INR)</label>
                  <input type="number" {...register("sold_price")} className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-text-primary placeholder:text-text-tertiary" placeholder="e.g. 1800000" />
                </div>
                <div>
                  <label className="text-sm font-medium text-text-secondary">Sold Date</label>
                  <input type="date" {...register("sold_date")} className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-text-primary" />
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-text-secondary">Internal Notes</label>
                  <textarea {...register("internal_notes")} rows={3} className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-text-primary placeholder:text-text-tertiary resize-none" placeholder="e.g. Serviced at dealership on purchase, new front tires installed..." />
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
