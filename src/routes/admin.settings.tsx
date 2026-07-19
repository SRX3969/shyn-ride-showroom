import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Settings, Shield, User, Key, UserPlus, Trash2, Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { formatDistanceToNow } from "date-fns";

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

function AdminSettingsPage() {
  const admins = useQuery(api.admin.listAdmins);
  const deleteAdmin = useMutation(api.admin.deleteAdmin);
  const changePassword = useAction(api.admin.changePassword);
  
  // We don't have a specific `createAdmin` action for normal operations in `admin.ts` yet,
  // but we have `bootstrapAdmin` and `createAdminUser` mutation.
  // Wait, `createAdminUser` expects a password_hash, which is a mutation. We need an action to hash and create.
  // We can just add an action for creating an admin securely, or use `bootstrapAdmin` as a generic one.
  const createAdminAction = useAction(api.admin.bootstrapAdmin); 
  
  const [activeTab, setActiveTab] = useState("users");
  const [changingPasswordId, setChangingPasswordId] = useState<string | null>(null);

  const { register: regUser, handleSubmit: submitUser, reset: resetUser, formState: { errors: userErrors, isSubmitting: isSubmittingUser } } = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema)
  });

  const { register: regPass, handleSubmit: submitPass, reset: resetPass, formState: { errors: passErrors, isSubmitting: isSubmittingPass } } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema)
  });

  const handleCreateUser = async (data: CreateUserFormValues) => {
    try {
      // Reusing bootstrapAdmin which creates an admin (if we modify it slightly, or we can just call it)
      // Actually bootstrapAdmin checks if it exists, hashes, and calls createAdminUser. Perfect.
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
      await deleteAdmin({ id: id as any });
      toast.success("User deleted");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete user");
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Settings</h1>
        <p className="mt-1 text-sm text-text-secondary">Manage admin accounts and showroom preferences.</p>
      </div>

      <div className="flex border-b border-border">
        {["users", "preferences"].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 text-sm font-medium capitalize border-b-2 transition-colors ${
              activeTab === tab ? "border-gold-ui text-gold-ui" : "border-transparent text-text-secondary hover:text-text-primary"
            }`}
          >
            {tab.replace("-", " ")}
          </button>
        ))}
      </div>

      {activeTab === "users" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Admin List */}
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

          {/* Add New User */}
          <div className="bg-surface border border-border rounded-2xl p-6 h-fit">
            <h2 className="text-lg font-bold text-text-primary flex items-center gap-2 mb-6">
              <UserPlus className="h-5 w-5 text-gold-ui" />
              Add User
            </h2>
            
            <form onSubmit={submitUser(handleCreateUser)} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-text-secondary">Username</label>
                <input {...regUser("username")} className="w-full mt-1 bg-background border border-border rounded-lg px-4 py-2 text-sm text-text-primary focus:border-gold-ui focus:outline-none" />
                {userErrors.username && <p className="text-xs text-red-500 mt-1">{userErrors.username.message}</p>}
              </div>
              
              <div>
                <label className="text-xs font-medium text-text-secondary">Password</label>
                <input type="password" {...regUser("password")} className="w-full mt-1 bg-background border border-border rounded-lg px-4 py-2 text-sm text-text-primary focus:border-gold-ui focus:outline-none" />
                {userErrors.password && <p className="text-xs text-red-500 mt-1">{userErrors.password.message}</p>}
              </div>
              
              <div>
                <label className="text-xs font-medium text-text-secondary">Role</label>
                <select {...regUser("role")} className="w-full mt-1 bg-background border border-border rounded-lg px-4 py-2 text-sm text-text-primary focus:border-gold-ui focus:outline-none">
                  <option value="owner">Owner</option>
                  <option value="manager">Manager</option>
                  <option value="staff">Staff</option>
                </select>
                {userErrors.role && <p className="text-xs text-red-500 mt-1">{userErrors.role.message}</p>}
              </div>
              
              <button type="submit" disabled={isSubmittingUser} className="w-full mt-2 bg-background border border-border hover:bg-gold-ui/10 hover:border-gold-ui hover:text-gold-ui text-text-primary font-bold text-sm py-2.5 rounded-lg transition-all flex justify-center items-center gap-2">
                {isSubmittingUser ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                Create User
              </button>
            </form>
          </div>

        </div>
      )}

      {activeTab === "preferences" && (
        <div className="bg-surface border border-border rounded-2xl p-6">
          <h2 className="text-lg font-bold text-text-primary mb-2">Showroom Preferences</h2>
          <p className="text-sm text-text-secondary mb-6">Global settings for the website.</p>
          
          <div className="max-w-md space-y-6">
            <div>
              <label className="text-sm font-medium text-text-primary">Contact Email</label>
              <input type="email" defaultValue="hello@shynride.com" className="w-full mt-1 bg-background border border-border rounded-lg px-4 py-2 text-sm text-text-primary" />
            </div>
            <div>
              <label className="text-sm font-medium text-text-primary">Contact Phone</label>
              <input type="text" defaultValue="+91 98765 43210" className="w-full mt-1 bg-background border border-border rounded-lg px-4 py-2 text-sm text-text-primary" />
            </div>
            <div>
              <label className="text-sm font-medium text-text-primary">Showroom Address</label>
              <textarea rows={3} defaultValue="123 Luxury Avenue&#10;Mumbai, Maharashtra 400001" className="w-full mt-1 bg-background border border-border rounded-lg px-4 py-2 text-sm text-text-primary resize-none" />
            </div>
            <button className="bg-gold-ui hover:bg-gold-ui/90 text-white font-bold text-sm px-6 py-2.5 rounded-lg transition-all">
              Save Preferences
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
