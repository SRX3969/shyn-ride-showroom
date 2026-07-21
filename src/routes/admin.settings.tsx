import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Settings, Shield, User, Key, UserPlus, Trash2, Loader2, Check, Plus, Edit, X } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getSessionToken } from "@/lib/auth";

export const Route = createFileRoute("/admin/settings")({
  component: AdminSettingsPage,
});

const createUserSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(8),
  role: z.enum(["owner", "manager", "staff"]),
});
type CreateUserFormValues = z.infer<typeof createUserSchema>;

const passwordSchema = z.object({
  password: z.string().min(8),
  confirm: z.string().min(8),
}).refine(data => data.password === data.confirm, {
  message: "Passwords don't match",
  path: ["confirm"],
});
type PasswordFormValues = z.infer<typeof passwordSchema>;

const settingsSchema = z.object({
  emiDownPaymentPct: z.coerce.number().min(0).max(100),
  emiAnnualRatePct: z.coerce.number().min(0),
  emiTenureMonths: z.coerce.number().min(1),
  address: z.string().optional(),
  phone: z.string().optional(),
  workingHours: z.string().optional(),
});
type SettingsFormValues = z.infer<typeof settingsSchema>;

function AdminSettingsPage() {
  const token = getSessionToken() || "";

  const admins = useQuery(api.admin.listAdmins, { token });
  const deleteAdmin = useMutation(api.admin.deleteAdmin);
  const changePassword = useAction(api.admin.changePassword);
  const createAdminAction = useAction(api.admin.bootstrapAdmin); 

  const globalSettings = useQuery(api.settings.get);
  const updateSettings = useMutation(api.settings.update);

  const faqs = useQuery(api.faqs.list);
  const addFaq = useMutation(api.faqs.add);
  const updateFaq = useMutation(api.faqs.update);
  const removeFaq = useMutation(api.faqs.remove);
  const seedFaqs = useMutation(api.faqs.seedInitialFaqs);

  const [activeTab, setActiveTab] = useState("users");
  const [changingPasswordId, setChangingPasswordId] = useState<string | null>(null);

  const [faqModal, setFaqModal] = useState<{ isOpen: boolean; faq?: any }>({ isOpen: false });

  // Users Form
  const { register: regUser, handleSubmit: submitUser, reset: resetUser, formState: { errors: userErrors, isSubmitting: isSubmittingUser } } = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema)
  });

  const { register: regPass, handleSubmit: submitPass, reset: resetPass, formState: { errors: passErrors, isSubmitting: isSubmittingPass } } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema)
  });

  // Settings Form
  const { register: regSettings, handleSubmit: submitSettings, reset: resetSettings, formState: { errors: settingsErrors, isSubmitting: isSubmittingSettings } } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema)
  });

  useEffect(() => {
    if (globalSettings) {
      resetSettings({
        emiDownPaymentPct: globalSettings.emiDownPaymentPct,
        emiAnnualRatePct: globalSettings.emiAnnualRatePct,
        emiTenureMonths: globalSettings.emiTenureMonths,
        address: globalSettings.address || "",
        phone: globalSettings.phone || "",
        workingHours: globalSettings.workingHours || "",
      });
    }
  }, [globalSettings, resetSettings]);

  // Faq Form
  const [faqForm, setFaqForm] = useState({ question: "", answer: "", order: 1 });

  const handleCreateUser = async (data: CreateUserFormValues) => {
    try {
      await createAdminAction({
        username: data.username,
        password: data.password,
      });
      toast.success("User created successfully");
      resetUser();
    } catch (err: any) {
      toast.error(err.message || "Failed to create user");
    }
  };

  const handleChangePassword = async (data: PasswordFormValues) => {
    if (!changingPasswordId) return;
    try {
      await changePassword({
        token,
        id: changingPasswordId as any,
        new_password: data.password,
      });
      toast.success("Password updated successfully");
      setChangingPasswordId(null);
      resetPass();
    } catch (err: any) {
      toast.error("Failed to update password");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this admin user?")) return;
    try {
      await deleteAdmin({ token, id: id as any });
      toast.success("User deleted");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete user");
    }
  };

  const handleSaveSettings = async (data: SettingsFormValues) => {
    try {
      await updateSettings({ token, ...data });
      toast.success("Settings saved successfully");
    } catch (err: any) {
      toast.error("Failed to save settings");
    }
  };

  const handleSaveFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (faqModal.faq) {
        await updateFaq({ token, id: faqModal.faq._id, ...faqForm });
        toast.success("FAQ updated");
      } else {
        await addFaq({ token, ...faqForm });
        toast.success("FAQ added");
      }
      setFaqModal({ isOpen: false });
    } catch (err: any) {
      toast.error("Failed to save FAQ");
    }
  };

  const handleDeleteFaq = async (id: string) => {
    if (!confirm("Delete this FAQ?")) return;
    try {
      await removeFaq({ token, id: id as any });
      toast.success("FAQ deleted");
    } catch(err) {
      toast.error("Failed to delete FAQ");
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Settings</h1>
        <p className="mt-1 text-sm text-text-secondary">Manage admin accounts, showroom preferences, and site content.</p>
      </div>

      <div className="flex border-b border-border overflow-x-auto">
        {["users", "preferences", "faqs"].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 text-sm font-medium capitalize border-b-2 whitespace-nowrap transition-colors ${
              activeTab === tab ? "border-gold-ui text-gold-ui" : "border-transparent text-text-secondary hover:text-text-primary"
            }`}
          >
            {tab.replace("-", " ")}
          </button>
        ))}
      </div>

      {activeTab === "users" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
              <Shield className="h-5 w-5 text-gold-ui" />
              Admin Accounts
            </h2>
            
            {admins === undefined ? (
              <div className="h-32 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-gold-ui" />
              </div>
            ) : (
              <div className="space-y-3">
                {admins.map((admin) => (
                  <div key={admin._id} className="bg-surface border border-border rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-gold-ui/10 flex items-center justify-center text-gold-ui">
                        <User className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-text-primary">{admin.username}</p>
                        <p className="text-xs text-text-tertiary capitalize">{admin.role}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {changingPasswordId === admin._id ? (
                        <button onClick={() => setChangingPasswordId(null)} className="px-3 py-1.5 text-xs font-medium text-text-secondary hover:text-text-primary bg-background border border-border rounded-lg">Cancel</button>
                      ) : (
                        <button onClick={() => setChangingPasswordId(admin._id)} className="p-2 text-text-tertiary hover:text-gold-ui hover:bg-gold-ui/10 rounded-lg transition-colors" title="Change Password">
                          <Key className="h-4 w-4" />
                        </button>
                      )}
                      
                      <button 
                        onClick={() => handleDelete(admin._id)}
                        className="p-2 text-text-tertiary hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors" 
                        title="Delete User"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {changingPasswordId && (
              <form onSubmit={submitPass(handleChangePassword)} className="bg-background border border-border rounded-xl p-6 mt-4">
                <h3 className="font-medium text-text-primary mb-4 flex items-center gap-2">
                  <Key className="w-4 h-4 text-gold-ui" /> Update Password
                </h3>
                <div className="space-y-4">
                  <div>
                    <input type="password" {...regPass("password")} placeholder="New Password" className="w-full bg-surface border border-border rounded-lg px-4 py-2 text-sm text-text-primary" />
                    {passErrors.password && <p className="text-xs text-red-500 mt-1">{passErrors.password.message}</p>}
                  </div>
                  <div>
                    <input type="password" {...regPass("confirm")} placeholder="Confirm Password" className="w-full bg-surface border border-border rounded-lg px-4 py-2 text-sm text-text-primary" />
                    {passErrors.confirm && <p className="text-xs text-red-500 mt-1">{passErrors.confirm.message}</p>}
                  </div>
                  <button type="submit" disabled={isSubmittingPass} className="w-full bg-gold-ui hover:bg-gold-ui/90 text-white font-bold text-sm py-2 rounded-lg flex justify-center items-center gap-2">
                    {isSubmittingPass && <Loader2 className="w-4 h-4 animate-spin" />}
                    Save Password
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="bg-surface border border-border rounded-2xl p-6 h-fit">
            <h2 className="text-lg font-bold text-text-primary flex items-center gap-2 mb-6">
              <UserPlus className="h-5 w-5 text-gold-ui" />
              Add User
            </h2>
            
            <form onSubmit={submitUser(handleCreateUser)} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-text-secondary">Username</label>
                <input {...regUser("username")} className="w-full mt-1 bg-background border border-border rounded-lg px-4 py-2 text-sm text-text-primary focus:border-gold-ui" />
                {userErrors.username && <p className="text-xs text-red-500 mt-1">{userErrors.username.message}</p>}
              </div>
              
              <div>
                <label className="text-xs font-medium text-text-secondary">Password</label>
                <input type="password" {...regUser("password")} className="w-full mt-1 bg-background border border-border rounded-lg px-4 py-2 text-sm text-text-primary focus:border-gold-ui" />
                {userErrors.password && <p className="text-xs text-red-500 mt-1">{userErrors.password.message}</p>}
              </div>
              
              <div>
                <label className="text-xs font-medium text-text-secondary">Role</label>
                <select {...regUser("role")} className="w-full mt-1 bg-background border border-border rounded-lg px-4 py-2 text-sm text-text-primary focus:border-gold-ui">
                  <option value="owner">Owner</option>
                  <option value="manager">Manager</option>
                  <option value="staff">Staff</option>
                </select>
              </div>
              
              <button type="submit" disabled={isSubmittingUser} className="w-full mt-2 bg-background border border-border hover:bg-gold-ui/10 hover:border-gold-ui hover:text-gold-ui text-text-primary font-bold text-sm py-2.5 rounded-lg flex justify-center items-center gap-2 transition-all">
                {isSubmittingUser ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                Create User
              </button>
            </form>
          </div>
        </div>
      )}

      {activeTab === "preferences" && (
        <form onSubmit={submitSettings(handleSaveSettings)} className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-surface border border-border rounded-2xl p-6 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-text-primary mb-1">Showroom Details</h2>
              <p className="text-sm text-text-secondary">Visible in the footer and contact pages.</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-text-primary">Contact Phone</label>
              <input {...regSettings("phone")} className="w-full mt-1 bg-background border border-border rounded-lg px-4 py-2 text-sm text-text-primary focus:border-gold-ui" />
            </div>
            
            <div>
              <label className="text-sm font-medium text-text-primary">Working Hours</label>
              <input {...regSettings("workingHours")} className="w-full mt-1 bg-background border border-border rounded-lg px-4 py-2 text-sm text-text-primary focus:border-gold-ui" placeholder="e.g. Mon - Sun: 10:00 AM - 7:00 PM" />
            </div>

            <div>
              <label className="text-sm font-medium text-text-primary">Showroom Address</label>
              <textarea {...regSettings("address")} rows={3} className="w-full mt-1 bg-background border border-border rounded-lg px-4 py-2 text-sm text-text-primary resize-none focus:border-gold-ui" />
            </div>
          </div>

          <div className="bg-surface border border-border rounded-2xl p-6 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-text-primary mb-1">EMI Calculator Defaults</h2>
              <p className="text-sm text-text-secondary">Assumptions used to calculate indicative EMIs on car listings.</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-text-primary">Down Payment (%)</label>
              <input type="number" {...regSettings("emiDownPaymentPct")} className="w-full mt-1 bg-background border border-border rounded-lg px-4 py-2 text-sm text-text-primary focus:border-gold-ui" />
              {settingsErrors.emiDownPaymentPct && <p className="text-xs text-red-500 mt-1">{settingsErrors.emiDownPaymentPct.message}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-text-primary">Annual Interest Rate (%)</label>
              <input type="number" step="0.1" {...regSettings("emiAnnualRatePct")} className="w-full mt-1 bg-background border border-border rounded-lg px-4 py-2 text-sm text-text-primary focus:border-gold-ui" />
              {settingsErrors.emiAnnualRatePct && <p className="text-xs text-red-500 mt-1">{settingsErrors.emiAnnualRatePct.message}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-text-primary">Tenure (Months)</label>
              <input type="number" {...regSettings("emiTenureMonths")} className="w-full mt-1 bg-background border border-border rounded-lg px-4 py-2 text-sm text-text-primary focus:border-gold-ui" />
              {settingsErrors.emiTenureMonths && <p className="text-xs text-red-500 mt-1">{settingsErrors.emiTenureMonths.message}</p>}
            </div>

            <div className="pt-4 border-t border-border">
              <button type="submit" disabled={isSubmittingSettings} className="w-full bg-gold-ui hover:bg-gold-ui/90 text-white font-bold text-sm py-2.5 rounded-lg transition-all flex justify-center items-center gap-2">
                {isSubmittingSettings && <Loader2 className="w-4 h-4 animate-spin" />}
                Save Preferences
              </button>
            </div>
          </div>
        </form>
      )}

      {activeTab === "faqs" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-text-primary">Frequently Asked Questions</h2>
              <p className="text-sm text-text-secondary">Manage the FAQs displayed on the public website.</p>
            </div>
            <div className="flex gap-3">
              {faqs?.length === 0 && (
                <button 
                  onClick={async () => {
                    toast.promise(seedFaqs({ token }), {
                      loading: "Seeding...",
                      success: "Seed data added",
                      error: "Failed to seed"
                    });
                  }}
                  className="bg-background border border-border hover:text-gold-ui hover:border-gold-ui text-text-primary px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Load Seed Data
                </button>
              )}
              <button 
                onClick={() => {
                  setFaqForm({ question: "", answer: "", order: (faqs?.length || 0) + 1 });
                  setFaqModal({ isOpen: true });
                }}
                className="bg-gold-ui hover:bg-gold-ui/90 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" /> Add FAQ
              </button>
            </div>
          </div>

          {faqs === undefined ? (
            <div className="h-32 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-gold-ui" />
            </div>
          ) : (
            <div className="bg-surface border border-border rounded-2xl overflow-hidden">
              <div className="divide-y divide-border">
                {faqs.map((faq) => (
                  <div key={faq._id} className="p-4 flex items-start justify-between gap-4 hover:bg-background/50 transition-colors">
                    <div>
                      <h4 className="font-medium text-text-primary text-sm flex items-center gap-2">
                        <span className="text-text-tertiary text-xs">#{faq.order}</span>
                        {faq.question}
                      </h4>
                      <p className="text-sm text-text-secondary mt-1 whitespace-pre-wrap">{faq.answer}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button 
                        onClick={() => {
                          setFaqForm({ question: faq.question, answer: faq.answer, order: faq.order });
                          setFaqModal({ isOpen: true, faq });
                        }}
                        className="p-1.5 text-text-tertiary hover:text-gold-ui hover:bg-gold-ui/10 rounded transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteFaq(faq._id)}
                        className="p-1.5 text-text-tertiary hover:text-red-500 hover:bg-red-500/10 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {faqs.length === 0 && (
                  <div className="p-8 text-center text-text-secondary text-sm">
                    No FAQs added yet.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {faqModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <form onSubmit={handleSaveFaq} className="w-full max-w-lg bg-surface border border-border rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold text-text-primary">{faqModal.faq ? "Edit FAQ" : "Add FAQ"}</h3>
              <button type="button" onClick={() => setFaqModal({ isOpen: false })} className="text-text-secondary hover:text-text-primary">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div>
              <label className="text-sm font-medium text-text-secondary">Order</label>
              <input type="number" required value={faqForm.order} onChange={e => setFaqForm({...faqForm, order: parseInt(e.target.value) || 1})} className="w-full mt-1 bg-background border border-border rounded-lg px-4 py-2 text-sm text-text-primary focus:border-gold-ui" />
            </div>
            
            <div>
              <label className="text-sm font-medium text-text-secondary">Question</label>
              <input type="text" required value={faqForm.question} onChange={e => setFaqForm({...faqForm, question: e.target.value})} className="w-full mt-1 bg-background border border-border rounded-lg px-4 py-2 text-sm text-text-primary focus:border-gold-ui" />
            </div>
            
            <div>
              <label className="text-sm font-medium text-text-secondary">Answer</label>
              <textarea rows={4} required value={faqForm.answer} onChange={e => setFaqForm({...faqForm, answer: e.target.value})} className="w-full mt-1 bg-background border border-border rounded-lg px-4 py-2 text-sm text-text-primary focus:border-gold-ui resize-none" />
            </div>
            
            <div className="pt-2 flex justify-end gap-3">
              <button type="button" onClick={() => setFaqModal({ isOpen: false })} className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary">Cancel</button>
              <button type="submit" className="bg-gold-ui hover:bg-gold-ui/90 text-white px-6 py-2 rounded-lg text-sm font-bold">
                Save
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
