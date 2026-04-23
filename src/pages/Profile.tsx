import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/hooks/useAuth";
import { getProfile, updateProfile } from "@/lib/profileService";
import { Profile as ProfileData } from "@/types/profile";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import {
  User,
  Building2,
  Link2,
  Save,
  ArrowLeft,
  ShieldCheck,
  GraduationCap,
  Mail,
  Globe,
  Bell,
  BellOff,
  Clock,
  BadgeCheck,
  Pencil,
  X,
  CheckCircle2,
  Layers,
  BookOpen,
  CalendarDays,
  AlertCircle,
  ShieldAlert,
} from "lucide-react";

const ROLE_CONFIG: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  admin: {
    label: "Administrator",
    color: "text-red-700",
    bg: "bg-red-50 border-red-200",
  },
  editor: {
    label: "Editor",
    color: "text-primary",
    bg: "bg-primary/5 border-primary/20",
  },
  reviewer: {
    label: "Reviewer",
    color: "text-amber-700",
    bg: "bg-amber-50 border-amber-200",
  },
  author: {
    label: "Author",
    color: "text-stone-700",
    bg: "bg-stone-50 border-stone-200",
  },
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatDate(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [requestingR, setRequestingR] = useState(false);
  const [requestingE, setRequestingE] = useState(false);
  const [requestingA, setRequestingA] = useState(false);
  const [editing, setEditing] = useState(false);

  const [form, setForm] = useState({
    full_name: "",
    affiliation: "",
    bio: "",
    orcid_id: "",
    email_notifications_enabled: true,
    deadline_reminder_days: 3,
  });

  useEffect(() => {
    if (user) fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    try {
      const data = await getProfile(user.id);
      setProfile(data);
      setForm({
        full_name: data.full_name ?? "",
        affiliation: data.affiliation ?? "",
        bio: data.bio ?? "",
        orcid_id: data.orcid_id ?? "",
        email_notifications_enabled: data.email_notifications_enabled ?? true,
        deadline_reminder_days: data.deadline_reminder_days ?? 3,
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to load profile.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user || !profile) return;
    const orcidRegex = /^(\d{4}-\d{4}-\d{4}-\d{3}[\dX])$/;
    if (form.orcid_id && !orcidRegex.test(form.orcid_id)) {
      toast({
        title: "Invalid ORCID",
        description: "Format must be 0000-0000-0000-0000",
        variant: "destructive",
      });
      return;
    }
    setSaving(true);
    try {
      const updated = await updateProfile(user.id, {
        full_name: form.full_name,
        affiliation: form.affiliation,
        bio: form.bio,
        orcid_id: form.orcid_id,
        email_notifications_enabled: form.email_notifications_enabled,
        deadline_reminder_days: form.deadline_reminder_days,
      });
      setProfile(updated);
      setEditing(false);
      toast({
        title: "Profile updated",
        description: "Your changes have been saved.",
      });
    } catch {
      toast({
        title: "Save failed",
        description: "Could not update profile.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (!profile) return;
    setForm({
      full_name: profile.full_name ?? "",
      affiliation: profile.affiliation ?? "",
      bio: profile.bio ?? "",
      orcid_id: profile.orcid_id ?? "",
      email_notifications_enabled: profile.email_notifications_enabled ?? true,
      deadline_reminder_days: profile.deadline_reminder_days ?? 3,
    });
    setEditing(false);
  };

  const requestRole = async (type: "reviewer" | "editor" | "admin") => {
    if (!user) return;
    const setLoading = type === "reviewer" ? setRequestingR : type === "editor" ? setRequestingE : setRequestingA;
    setLoading(true);
    try {
      const updates =
        type === "admin"
          ? { request_admin: true }
          : type === "editor"
          ? { request_editor: true, request_reviewer: true }
          : { request_reviewer: true };
      const updated = await updateProfile(user.id, updates);
      setProfile(updated);
      try {
        const { notifyAdminsOfRoleRequest } =
          await import("@/lib/roleNotificationService");
        await notifyAdminsOfRoleRequest({
          requesterId: user.id,
          requesterName: profile?.full_name ?? "",
          requesterEmail: profile?.email ?? "",
          role: type,
        });
      } catch {
        /* notification failure is non-critical */
      }
      toast({
        title: "Request submitted",
        description: `Your ${type} application has been sent to admins.`,
      });
    } catch {
      toast({
        title: "Error",
        description: "Could not submit request.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) return null;

  const roleConf = ROLE_CONFIG[profile.role] ?? ROLE_CONFIG.author;

  return (
    <div className="min-h-screen bg-stone-50 font-body">
      <Helmet>
        <title>My Account — IJSDS</title>
      </Helmet>

      {/* Page header */}
      <div className="bg-white border-b border-stone-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-900 transition-colors"
          >
            <ArrowLeft size={16} />
            Back
          </button>
          <span className="text-stone-300">/</span>
          <span className="text-sm font-medium text-stone-700">My Account</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* ── Identity card ─────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
          {/* Cover strip */}
          <div className="h-24 bg-gradient-to-r from-primary/90 to-primary/60" />

          <div className="px-6 pb-6 -mt-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            {/* Avatar */}
            <div className="flex items-end gap-4">
              <div className="w-20 h-20 rounded-2xl bg-primary border-4 border-white shadow-md flex items-center justify-center text-white font-headline text-2xl font-bold flex-shrink-0">
                {getInitials(profile.full_name || "U")}
              </div>
              <div className="pb-1">
                <h1 className="font-headline text-2xl font-semibold text-stone-900 leading-tight">
                  {profile.full_name || "—"}
                </h1>
                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${roleConf.bg} ${roleConf.color}`}
                  >
                    <ShieldCheck size={11} />
                    {roleConf.label}
                  </span>
                  {profile.is_admin && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-red-50 border border-red-200 text-red-700">
                      <ShieldCheck size={11} /> Admin
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Edit toggle */}
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-stone-200 text-sm font-medium text-stone-600 hover:bg-stone-50 hover:border-stone-300 transition-all"
              >
                <Pencil size={14} /> Update Account
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleCancelEdit}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-stone-200 text-sm text-stone-500 hover:bg-stone-50 transition-all"
                >
                  <X size={14} /> Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-all disabled:opacity-60"
                >
                  <Save size={14} /> {saving ? "Saving…" : "Save Changes"}
                </button>
              </div>
            )}
          </div>

          {/* Quick info row */}
          <div className="px-6 pb-6 grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-stone-50">
            <div className="flex items-center gap-2 text-sm text-stone-500">
              <Mail size={14} className="text-stone-400 flex-shrink-0" />
              <span className="truncate">{profile.email}</span>
            </div>
            {profile.affiliation && (
              <div className="flex items-center gap-2 text-sm text-stone-500">
                <Building2 size={14} className="text-stone-400 flex-shrink-0" />
                <span className="truncate">{profile.affiliation}</span>
              </div>
            )}
            {profile.orcid_id && (
              <div className="flex items-center gap-2 text-sm text-stone-500">
                <Link2 size={14} className="text-stone-400 flex-shrink-0" />
                <a
                  href={`https://orcid.org/${profile.orcid_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="truncate text-primary hover:underline"
                >
                  {profile.orcid_id}
                </a>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Main form ──────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal information */}
            <section className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
              <h2 className="font-headline text-lg font-semibold text-stone-900 mb-5 flex items-center gap-2">
                <User size={18} className="text-primary" /> Personal Information
              </h2>

              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <Label className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5 block">
                      Full Name
                    </Label>
                    {editing ? (
                      <Input
                        value={form.full_name}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, full_name: e.target.value }))
                        }
                        placeholder="Your full name"
                        className="h-10"
                      />
                    ) : (
                      <p className="text-stone-800 text-sm py-2">
                        {profile.full_name || (
                          <span className="text-stone-400 italic">Not set</span>
                        )}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5 block">
                      Email Address
                    </Label>
                    <div className="flex items-center gap-2 py-2">
                      <p className="text-stone-800 text-sm">{profile.email}</p>
                      <span className="text-xs text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full">
                        verified
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5 block">
                    Institution / Affiliation
                  </Label>
                  {editing ? (
                    <div className="relative">
                      <Building2
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
                      />
                      <Input
                        value={form.affiliation}
                        onChange={(e) =>
                          setForm((p) => ({
                            ...p,
                            affiliation: e.target.value,
                          }))
                        }
                        placeholder="e.g. University of Lagos"
                        className="h-10 pl-9"
                      />
                    </div>
                  ) : (
                    <p className="text-stone-800 text-sm py-2">
                      {profile.affiliation || (
                        <span className="text-stone-400 italic">Not set</span>
                      )}
                    </p>
                  )}
                </div>

                <div>
                  <Label className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5 block">
                    ORCID iD
                  </Label>
                  {editing ? (
                    <div className="relative">
                      <Globe
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
                      />
                      <Input
                        id="orcid-input"
                        value={form.orcid_id}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, orcid_id: e.target.value }))
                        }
                        placeholder="0000-0000-0000-0000"
                        className="h-10 pl-9"
                      />
                    </div>
                  ) : (
                    <p className="text-stone-800 text-sm py-2">
                      {profile.orcid_id ? (
                        <a
                          href={`https://orcid.org/${profile.orcid_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {profile.orcid_id}
                        </a>
                      ) : (
                        <span className="text-stone-400 italic">Not set</span>
                      )}
                    </p>
                  )}
                </div>

                <div>
                  <Label className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5 block">
                    Biography
                  </Label>
                  {editing ? (
                    <Textarea
                      value={form.bio}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, bio: e.target.value }))
                      }
                      placeholder="Brief description of your research interests and background…"
                      rows={4}
                      className="resize-none text-sm"
                    />
                  ) : (
                    <p className="text-stone-700 text-sm py-2 leading-relaxed">
                      {profile.bio || (
                        <span className="text-stone-400 italic">
                          No bio added yet.
                        </span>
                      )}
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* Notification preferences */}
            <section className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
              <h2 className="font-headline text-lg font-semibold text-stone-900 mb-5 flex items-center gap-2">
                <Bell size={18} className="text-primary" /> Notification
                Preferences
              </h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl border border-stone-100 bg-stone-50">
                  <div className="flex items-center gap-3">
                    {form.email_notifications_enabled ? (
                      <Bell size={18} className="text-primary" />
                    ) : (
                      <BellOff size={18} className="text-stone-400" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-stone-800">
                        Email Notifications
                      </p>
                      <p className="text-xs text-stone-500">
                        Receive updates on submissions and reviews
                      </p>
                    </div>
                  </div>
                  {editing ? (
                    <button
                      onClick={() =>
                        setForm((p) => ({
                          ...p,
                          email_notifications_enabled:
                            !p.email_notifications_enabled,
                        }))
                      }
                      className={`relative w-11 h-6 rounded-full transition-colors ${form.email_notifications_enabled ? "bg-primary" : "bg-stone-300"}`}
                    >
                      <span
                        className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${form.email_notifications_enabled ? "left-6" : "left-1"}`}
                      />
                    </button>
                  ) : (
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full ${profile.email_notifications_enabled ? "bg-green-100 text-green-700" : "bg-stone-100 text-stone-500"}`}
                    >
                      {profile.email_notifications_enabled ? "On" : "Off"}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl border border-stone-100 bg-stone-50">
                  <div className="flex items-center gap-3">
                    <Clock size={18} className="text-stone-500" />
                    <div>
                      <p className="text-sm font-medium text-stone-800">
                        Deadline Reminder
                      </p>
                      <p className="text-xs text-stone-500">
                        Days before deadline to send reminder
                      </p>
                    </div>
                  </div>
                  {editing ? (
                    <select
                      value={form.deadline_reminder_days}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          deadline_reminder_days: Number(e.target.value),
                        }))
                      }
                      className="text-sm border border-stone-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      {[1, 2, 3, 5, 7, 14].map((d) => (
                        <option key={d} value={d}>
                          {d} day{d !== 1 ? "s" : ""}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className="text-sm font-medium text-stone-700">
                      {profile.deadline_reminder_days ?? 3} days
                    </span>
                  )}
                </div>
              </div>
            </section>
          </div>

          {/* ── Right sidebar ──────────────────────────────────────── */}
          <div className="space-y-6">
            {/* Account details */}
            <section className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
              <h2 className="font-headline text-base font-semibold text-stone-900 mb-4 flex items-center gap-2">
                <CalendarDays size={16} className="text-primary" /> Account
                Details
              </h2>
              <dl className="space-y-3">
                <div>
                  <dt className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
                    Member since
                  </dt>
                  <dd className="text-sm text-stone-700 mt-0.5">
                    {formatDate(profile.created_at)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
                    Last updated
                  </dt>
                  <dd className="text-sm text-stone-700 mt-0.5">
                    {formatDate(profile.updated_at)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
                    Account role
                  </dt>
                  <dd className="mt-1">
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${roleConf.bg} ${roleConf.color}`}
                    >
                      <ShieldCheck size={11} /> {roleConf.label}
                    </span>
                  </dd>
                </div>
              </dl>
            </section>

            {/* Role & access */}
            <section className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
              <h2 className="font-headline text-base font-semibold text-stone-900 mb-4 flex items-center gap-2">
                <BookOpen size={16} className="text-primary" /> Roles & Access
              </h2>

              <div className="space-y-3">
                {/* Reviewer */}
                <div className="rounded-xl border border-stone-100 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <GraduationCap size={15} className="text-amber-600" />
                      <span className="text-sm font-medium text-stone-800">
                        Peer Reviewer
                      </span>
                    </div>
                    {profile.is_reviewer && (
                      <span className="flex items-center gap-1 text-xs text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                        <CheckCircle2 size={10} /> Active
                      </span>
                    )}
                    {!profile.is_reviewer && profile.request_reviewer && (
                      <span className="flex items-center gap-1 text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                        <AlertCircle size={10} /> Pending
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-stone-500 mb-3 leading-relaxed">
                    Evaluate manuscript submissions for the journal's peer
                    review process.
                  </p>
                  {!profile.is_reviewer && !profile.request_reviewer && (
                    <button
                      disabled={requestingR}
                      onClick={() => requestRole("reviewer")}
                      className="w-full text-xs font-medium py-2 rounded-lg border border-amber-200 text-amber-700 hover:bg-amber-50 transition-colors disabled:opacity-50"
                    >
                      {requestingR ? "Submitting…" : "Request Access"}
                    </button>
                  )}
                </div>

                {/* Editor */}
                <div className="rounded-xl border border-stone-100 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Layers size={15} className="text-primary" />
                      <span className="text-sm font-medium text-stone-800">
                        Editor
                      </span>
                    </div>
                    {profile.is_editor && (
                      <span className="flex items-center gap-1 text-xs text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                        <CheckCircle2 size={10} /> Active
                      </span>
                    )}
                    {!profile.is_editor && profile.request_editor && (
                      <span className="flex items-center gap-1 text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                        <AlertCircle size={10} /> Pending
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-stone-500 mb-3 leading-relaxed">
                    Manage submissions, assign reviewers, and make editorial
                    decisions.
                  </p>
                  {!profile.is_editor && !profile.request_editor && (
                    <button
                      disabled={requestingE}
                      onClick={() => requestRole("editor")}
                      className="w-full text-xs font-medium py-2 rounded-lg border border-primary/20 text-primary hover:bg-primary/5 transition-colors disabled:opacity-50"
                    >
                      {requestingE ? "Submitting…" : "Request Access"}
                    </button>
                  )}
                </div>
                
                {/* Admin */}
                <div className="rounded-xl border border-stone-100 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <ShieldAlert size={15} className="text-red-600" />
                      <span className="text-sm font-medium text-stone-800">
                        Administrator
                      </span>
                    </div>
                    {profile.is_admin && (
                      <span className="flex items-center gap-1 text-xs text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                        <CheckCircle2 size={10} /> Active
                      </span>
                    )}
                    {!profile.is_admin && profile.request_admin && (
                      <span className="flex items-center gap-1 text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                        <AlertCircle size={10} /> Pending
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-stone-500 mb-3 leading-relaxed">
                    Full system access including user management, configuration, and advanced oversight.
                  </p>
                  {!profile.is_admin && !profile.request_admin && (
                    <button
                      disabled={requestingA}
                      onClick={() => requestRole("admin")}
                      className="w-full text-xs font-medium py-2 rounded-lg border border-red-200 text-red-700 hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                      {requestingA ? "Submitting…" : "Request Access"}
                    </button>
                  )}
                </div>
              </div>
            </section>

            {/* ORCID link */}
            {!profile.orcid_id && (
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <BadgeCheck
                    size={18}
                    className="text-blue-500 flex-shrink-0 mt-0.5"
                  />
                  <div>
                    <p className="text-sm font-medium text-blue-800 mb-1">
                      Connect your ORCID iD
                    </p>
                    <p className="text-xs text-blue-600 mb-3 leading-relaxed">
                      Uniquely identify yourself as a researcher and link your
                      publications.
                    </p>
                    <button
                      onClick={() => {
                        setEditing(true);
                        setTimeout(
                          () => document.getElementById("orcid-input")?.focus(),
                          100,
                        );
                      }}
                      className="text-xs font-medium text-blue-700 hover:text-blue-900 underline underline-offset-2"
                    >
                      Add ORCID iD →
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
