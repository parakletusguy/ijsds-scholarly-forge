import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/hooks/useAuth";
import { getProfile, updateProfile } from "@/lib/profileService";
import { Profile as ProfileData } from "@/types/profile";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { PageHeader, ContentSection } from "@/components/layout/PageElements";
import {
  User,
  Building2,
  Save,
  GraduationCap,
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

const LABEL = "text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400";
const CARD = "bg-white border border-stone-200";
const CHIP =
  "inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 border";

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
        title: "Couldn't load profile",
        description: "Something went wrong. Please try again.",
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
        title: "Invalid ORCID iD",
        description: "It should look like 0000-0000-0000-0000.",
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
      toast({ title: "Profile updated", description: "Your changes have been saved." });
    } catch {
      toast({
        title: "Couldn't save",
        description: "Something went wrong. Please try again.",
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
    const setBusy =
      type === "reviewer" ? setRequestingR : type === "editor" ? setRequestingE : setRequestingA;
    setBusy(true);
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
        const { notifyAdminsOfRoleRequest } = await import("@/lib/roleNotificationService");
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
        title: "Request sent",
        description: `An admin will review your ${type} request.`,
      });
    } catch {
      toast({
        title: "Couldn't send request",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) return null;

  // Show every role the account actually holds (everyone is an author)
  const roleChips = [
    profile.is_admin && { label: "Admin", cls: "bg-red-50 text-red-700 border-red-200" },
    profile.is_editor && { label: "Editor", cls: "bg-primary/5 text-primary border-primary/20" },
    profile.is_reviewer && { label: "Reviewer", cls: "bg-amber-50 text-amber-700 border-amber-200" },
    { label: "Author", cls: "bg-stone-100 text-stone-600 border-stone-200" },
  ].filter(Boolean) as { label: string; cls: string }[];

  const roles = [
    {
      key: "reviewer" as const,
      title: "Peer Reviewer",
      icon: <GraduationCap size={15} className="text-amber-600" />,
      blurb: "Evaluate manuscripts submitted to the journal.",
      active: profile.is_reviewer,
      pending: profile.request_reviewer,
      busy: requestingR,
      btn: "border-amber-200 text-amber-700 hover:bg-amber-50",
    },
    {
      key: "editor" as const,
      title: "Editor",
      icon: <Layers size={15} className="text-primary" />,
      blurb: "Manage submissions, assign reviewers, and make decisions.",
      active: profile.is_editor,
      pending: profile.request_editor,
      busy: requestingE,
      btn: "border-primary/20 text-primary hover:bg-primary/5",
    },
    {
      key: "admin" as const,
      title: "Administrator",
      icon: <ShieldAlert size={15} className="text-red-600" />,
      blurb: "Full access, including member management and settings.",
      active: profile.is_admin,
      pending: profile.request_admin,
      busy: requestingA,
      btn: "border-red-200 text-red-700 hover:bg-red-50",
    },
  ];

  const field = "h-10 rounded-none border-stone-200 focus-visible:ring-0 focus-visible:border-primary";

  return (
    <div className="min-h-screen bg-stone-50 font-body pb-24">
      <Helmet>
        <title>My Account — IJSDS</title>
      </Helmet>

      <PageHeader
        title="My"
        subtitle="Account"
        accent="Profile"
        description="Manage your details, notifications, and the roles you hold on the journal."
      />

      <ContentSection dark>
        <div className="max-w-5xl mx-auto space-y-6">
          {/* ── Identity ─────────────────────────────────────────────── */}
          <div className={`${CARD} p-6 flex flex-col sm:flex-row sm:items-center gap-5`}>
            <div className="w-16 h-16 bg-primary text-white flex items-center justify-center font-headline text-xl shrink-0">
              {getInitials(profile.full_name || "U")}
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="font-headline text-2xl text-stone-900 leading-tight truncate">
                {profile.full_name || "Unnamed"}
              </h1>
              <p className="text-sm text-stone-500 truncate mt-0.5">{profile.email}</p>
              <div className="flex flex-wrap items-center gap-1.5 mt-3">
                {roleChips.map((r) => (
                  <span key={r.label} className={`${CHIP} ${r.cls}`}>
                    {r.label}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex gap-2 shrink-0">
              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  className="inline-flex items-center gap-2 h-10 px-5 border border-stone-200 text-[10px] font-bold uppercase tracking-widest text-stone-600 hover:border-primary hover:text-primary transition-colors"
                >
                  <Pencil size={13} /> Edit profile
                </button>
              ) : (
                <>
                  <button
                    onClick={handleCancelEdit}
                    className="inline-flex items-center gap-1.5 h-10 px-4 border border-stone-200 text-[10px] font-bold uppercase tracking-widest text-stone-500 hover:border-stone-300 transition-colors"
                  >
                    <X size={13} /> Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="inline-flex items-center gap-1.5 h-10 px-5 bg-primary hover:bg-[#7a2d11] text-white text-[10px] font-bold uppercase tracking-widest transition-colors disabled:opacity-50"
                  >
                    <Save size={13} /> {saving ? "Saving…" : "Save"}
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* ── Main column ────────────────────────────────────────── */}
            <div className="lg:col-span-2 space-y-6">
              {/* Personal information */}
              <section className={`${CARD} p-6`}>
                <h2 className="font-headline text-lg text-stone-900 mb-6 flex items-center gap-2">
                  <User size={17} className="text-primary" /> Personal Information
                </h2>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <Label className={`${LABEL} mb-2 block`}>Full name</Label>
                      {editing ? (
                        <Input
                          value={form.full_name}
                          onChange={(e) => setForm((p) => ({ ...p, full_name: e.target.value }))}
                          placeholder="Your full name"
                          className={field}
                        />
                      ) : (
                        <p className="text-sm text-stone-800 py-2">
                          {profile.full_name || <span className="text-stone-400">Not set</span>}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label className={`${LABEL} mb-2 block`}>Email address</Label>
                      <div className="flex items-center gap-2 py-2">
                        <p className="text-sm text-stone-800 truncate">{profile.email}</p>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500 bg-stone-100 px-2 py-0.5 shrink-0">
                          Verified
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className={`${LABEL} mb-2 block`}>Institution / affiliation</Label>
                    {editing ? (
                      <div className="relative">
                        <Building2 size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                        <Input
                          value={form.affiliation}
                          onChange={(e) => setForm((p) => ({ ...p, affiliation: e.target.value }))}
                          placeholder="e.g. University of Ilorin"
                          className={`${field} pl-9`}
                        />
                      </div>
                    ) : (
                      <p className="text-sm text-stone-800 py-2">
                        {profile.affiliation || <span className="text-stone-400">Not set</span>}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label className={`${LABEL} mb-2 block`}>ORCID iD</Label>
                    {editing ? (
                      <div className="relative">
                        <Globe size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                        <Input
                          id="orcid-input"
                          value={form.orcid_id}
                          onChange={(e) => setForm((p) => ({ ...p, orcid_id: e.target.value }))}
                          placeholder="0000-0000-0000-0000"
                          className={`${field} pl-9`}
                        />
                      </div>
                    ) : (
                      <p className="text-sm py-2">
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
                          <span className="text-stone-400">Not set</span>
                        )}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label className={`${LABEL} mb-2 block`}>Biography</Label>
                    {editing ? (
                      <Textarea
                        value={form.bio}
                        onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
                        placeholder="A short description of your research interests and background…"
                        rows={4}
                        className="resize-none text-sm rounded-none border-stone-200 focus-visible:ring-0 focus-visible:border-primary"
                      />
                    ) : (
                      <p className="text-sm text-stone-700 py-2 leading-relaxed">
                        {profile.bio || <span className="text-stone-400">No bio yet.</span>}
                      </p>
                    )}
                  </div>
                </div>
              </section>

              {/* Notifications */}
              <section className={`${CARD} p-6`}>
                <h2 className="font-headline text-lg text-stone-900 mb-6 flex items-center gap-2">
                  <Bell size={17} className="text-primary" /> Notifications
                </h2>

                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-4 p-4 bg-stone-50 border border-stone-100">
                    <div className="flex items-center gap-3 min-w-0">
                      {form.email_notifications_enabled ? (
                        <Bell size={17} className="text-primary shrink-0" />
                      ) : (
                        <BellOff size={17} className="text-stone-400 shrink-0" />
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-stone-800">Email notifications</p>
                        <p className="text-xs text-stone-500">Updates on your submissions and reviews</p>
                      </div>
                    </div>
                    {editing ? (
                      <button
                        role="switch"
                        aria-checked={form.email_notifications_enabled}
                        aria-label="Email notifications"
                        onClick={() =>
                          setForm((p) => ({
                            ...p,
                            email_notifications_enabled: !p.email_notifications_enabled,
                          }))
                        }
                        className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${
                          form.email_notifications_enabled ? "bg-primary" : "bg-stone-300"
                        }`}
                      >
                        <span
                          className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                            form.email_notifications_enabled ? "left-6" : "left-1"
                          }`}
                        />
                      </button>
                    ) : (
                      <span
                        className={`${CHIP} shrink-0 ${
                          profile.email_notifications_enabled
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-stone-100 text-stone-500 border-stone-200"
                        }`}
                      >
                        {profile.email_notifications_enabled ? "On" : "Off"}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-4 p-4 bg-stone-50 border border-stone-100">
                    <div className="flex items-center gap-3 min-w-0">
                      <Clock size={17} className="text-stone-500 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-stone-800">Deadline reminder</p>
                        <p className="text-xs text-stone-500">How early to remind you before a deadline</p>
                      </div>
                    </div>
                    {editing ? (
                      <select
                        aria-label="Deadline reminder"
                        value={form.deadline_reminder_days}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, deadline_reminder_days: Number(e.target.value) }))
                        }
                        className="text-sm border border-stone-200 px-3 h-9 bg-white focus:outline-none focus:border-primary shrink-0"
                      >
                        {[1, 2, 3, 5, 7, 14].map((d) => (
                          <option key={d} value={d}>
                            {d} day{d !== 1 ? "s" : ""}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-sm font-semibold text-stone-700 shrink-0">
                        {profile.deadline_reminder_days ?? 3} days
                      </span>
                    )}
                  </div>
                </div>
              </section>
            </div>

            {/* ── Sidebar ────────────────────────────────────────────── */}
            <div className="space-y-6">
              <section className={`${CARD} p-6`}>
                <h2 className="font-headline text-base text-stone-900 mb-5 flex items-center gap-2">
                  <CalendarDays size={15} className="text-primary" /> Account details
                </h2>
                <dl className="space-y-4">
                  <div>
                    <dt className={LABEL}>Member since</dt>
                    <dd className="text-sm text-stone-700 mt-1">{formatDate(profile.created_at)}</dd>
                  </div>
                  <div>
                    <dt className={LABEL}>Last updated</dt>
                    <dd className="text-sm text-stone-700 mt-1">{formatDate(profile.updated_at)}</dd>
                  </div>
                </dl>
              </section>

              <section className={`${CARD} p-6`}>
                <h2 className="font-headline text-base text-stone-900 mb-5 flex items-center gap-2">
                  <BookOpen size={15} className="text-primary" /> Roles &amp; access
                </h2>

                <div className="space-y-3">
                  {roles.map((r) => (
                    <div key={r.key} className="border border-stone-200 p-4">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2 min-w-0">
                          {r.icon}
                          <span className="text-sm font-semibold text-stone-800 truncate">{r.title}</span>
                        </div>
                        {r.active ? (
                          <span className={`${CHIP} bg-emerald-50 text-emerald-700 border-emerald-200 shrink-0`}>
                            <CheckCircle2 size={10} /> Active
                          </span>
                        ) : r.pending ? (
                          <span className={`${CHIP} bg-amber-50 text-amber-700 border-amber-200 shrink-0`}>
                            <AlertCircle size={10} /> Pending
                          </span>
                        ) : null}
                      </div>
                      <p className="text-xs text-stone-500 leading-relaxed">{r.blurb}</p>
                      {!r.active && !r.pending && (
                        <button
                          disabled={r.busy}
                          onClick={() => requestRole(r.key)}
                          className={`mt-3 w-full h-9 border text-[10px] font-bold uppercase tracking-widest transition-colors disabled:opacity-50 ${r.btn}`}
                        >
                          {r.busy ? "Sending…" : "Request access"}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </section>

              {!profile.orcid_id && (
                <section className="bg-primary/5 border border-primary/20 p-5">
                  <div className="flex items-start gap-3">
                    <BadgeCheck size={18} className="text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-stone-800 mb-1">Add your ORCID iD</p>
                      <p className="text-xs text-stone-600 leading-relaxed mb-3">
                        It identifies you as a researcher and links your published work to you.
                      </p>
                      <button
                        onClick={() => {
                          setEditing(true);
                          setTimeout(() => document.getElementById("orcid-input")?.focus(), 100);
                        }}
                        className="text-[10px] font-bold uppercase tracking-widest text-primary hover:underline"
                      >
                        Add ORCID iD →
                      </button>
                    </div>
                  </div>
                </section>
              )}
            </div>
          </div>
        </div>
      </ContentSection>
    </div>
  );
};

export default Profile;
