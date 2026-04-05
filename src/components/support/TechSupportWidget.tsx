import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LifeBuoy, Send, Loader2, CheckCircle, X } from "lucide-react";
import { submitSupportTicket } from "@/lib/supportService";

const CATEGORIES = [
  { value: "General", label: "General Inquiry" },
  { value: "Bug Report", label: "Bug Report" },
  { value: "Account Issue", label: "Account Issue" },
  { value: "Submission Problem", label: "Submission Problem" },
  { value: "Payment Issue", label: "Payment Issue" },
  { value: "DOI Issue", label: "DOI / Publication" },
  { value: "Other", label: "Other" },
] as const;

export const TechSupportWidget = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState("");

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState("General");

  // Validation tracking
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    subject: false,
    message: false,
  });

  // Pre-fill from profile when modal opens
  useEffect(() => {
    if (open && profile) {
      setName(profile.full_name || "");
      setEmail(profile.email || "");
    }
  }, [open, profile]);

  // Reset when modal closes
  useEffect(() => {
    if (!open) {
      // Delay reset so close animation completes
      const timer = setTimeout(() => {
        setSubmitted(false);
        setTicketId("");
        setSubject("");
        setMessage("");
        setCategory("General");
        setTouched({ name: false, email: false, subject: false, message: false });
        if (!profile) {
          setName("");
          setEmail("");
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [open, profile]);

  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async () => {
    // Mark all as touched
    setTouched({ name: true, email: true, subject: true, message: true });

    // Client validation
    if (
      !name.trim() ||
      !email.trim() ||
      !isValidEmail(email.trim()) ||
      !subject.trim() ||
      !message.trim()
    ) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields with valid data.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const result = await submitSupportTicket({
        name: name.trim(),
        email: email.trim(),
        subject: subject.trim(),
        message: message.trim(),
        category,
      });

      setTicketId(result.data?.ticketId || "");
      setSubmitted(true);

      toast({
        title: "Ticket Submitted",
        description: `Your ticket has been received. Check your email for confirmation.`,
      });
    } catch (error: any) {
      const status = error?.status;
      if (status === 400) {
        toast({
          title: "Validation Error",
          description:
            error.message || "Please check your form fields and try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Submission Failed",
          description:
            "We couldn't submit your ticket. Please email tech@ijsds.org directly.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const fieldError = (field: keyof typeof touched, value: string) =>
    touched[field] && !value.trim();

  const emailError =
    touched.email && email.trim() && !isValidEmail(email.trim());

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* ── Floating Trigger Button ──────────────────────────── */}
      <DialogTrigger asChild>
        <button
          className="fixed bottom-6 right-6 z-50 group flex items-center gap-3 bg-primary text-white pl-5 pr-6 py-3.5 shadow-2xl shadow-primary/25 hover:shadow-primary/40 hover:scale-105 active:scale-95 transition-all duration-300 rounded-full"
          aria-label="Open tech support"
        >
          <LifeBuoy className="h-5 w-5 group-hover:rotate-[20deg] transition-transform duration-300" />
          <span className="text-xs font-bold uppercase tracking-widest hidden sm:inline">
            Support
          </span>
        </button>
      </DialogTrigger>

      {/* ── Modal ────────────────────────────────────────────── */}
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden border-none rounded-none shadow-2xl">
        {/* Header */}
        <div className="bg-foreground text-white px-8 py-6">
          <DialogHeader>
            <DialogTitle className="font-headline font-black text-xl uppercase tracking-widest flex items-center gap-3">
              <LifeBuoy className="h-5 w-5" />
              Tech Support
            </DialogTitle>
            <DialogDescription className="text-white/60 font-body text-sm mt-1">
              Describe your issue and we'll get back to you promptly.
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* ── Success State ──────────────────────────────────── */}
        {submitted ? (
          <div className="px-8 py-12 text-center space-y-6">
            <div className="mx-auto w-16 h-16 bg-green-50 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <div className="space-y-2">
              <h3 className="font-headline font-black text-lg uppercase tracking-wider">
                Ticket Submitted
              </h3>
              <p className="text-sm text-muted-foreground font-body">
                A confirmation has been sent to your email.
              </p>
            </div>
            {ticketId && (
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">
                  Your Ticket ID
                </p>
                <code className="text-lg font-headline font-black text-primary">
                  {ticketId}
                </code>
              </div>
            )}
            <Button
              onClick={() => setOpen(false)}
              className="bg-foreground text-white rounded-none font-headline font-black uppercase text-xs tracking-widest px-8 py-5 hover:bg-primary transition-colors"
            >
              Close
            </Button>
          </div>
        ) : (
          /* ── Form State ────────────────────────────────────── */
          <div className="px-8 py-6 space-y-5">
            {/* Name */}
            <div className="space-y-1.5">
              <Label
                htmlFor="support-name"
                className="text-[10px] uppercase tracking-widest font-bold text-foreground/60"
              >
                Full Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="support-name"
                placeholder="Dr. Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                className={`rounded-none border-foreground/15 focus:border-primary ${fieldError("name", name) ? "border-red-400 bg-red-50/50" : ""}`}
              />
              {fieldError("name", name) && (
                <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider">
                  Name is required
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <Label
                htmlFor="support-email"
                className="text-[10px] uppercase tracking-widest font-bold text-foreground/60"
              >
                Email Address <span className="text-red-500">*</span>
              </Label>
              <Input
                id="support-email"
                type="email"
                placeholder="jane.doe@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                className={`rounded-none border-foreground/15 focus:border-primary ${fieldError("email", email) || emailError ? "border-red-400 bg-red-50/50" : ""}`}
              />
              {fieldError("email", email) && (
                <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider">
                  Email is required
                </p>
              )}
              {emailError && (
                <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider">
                  Please enter a valid email address
                </p>
              )}
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase tracking-widest font-bold text-foreground/60">
                Category
              </Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="rounded-none border-foreground/15">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Subject */}
            <div className="space-y-1.5">
              <Label
                htmlFor="support-subject"
                className="text-[10px] uppercase tracking-widest font-bold text-foreground/60"
              >
                Subject <span className="text-red-500">*</span>
              </Label>
              <Input
                id="support-subject"
                placeholder="Brief summary of your issue"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, subject: true }))}
                className={`rounded-none border-foreground/15 focus:border-primary ${fieldError("subject", subject) ? "border-red-400 bg-red-50/50" : ""}`}
              />
              {fieldError("subject", subject) && (
                <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider">
                  Subject is required
                </p>
              )}
            </div>

            {/* Message */}
            <div className="space-y-1.5">
              <Label
                htmlFor="support-message"
                className="text-[10px] uppercase tracking-widest font-bold text-foreground/60"
              >
                Message <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="support-message"
                placeholder="Describe your issue in detail..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, message: true }))}
                rows={4}
                className={`rounded-none border-foreground/15 focus:border-primary resize-none ${fieldError("message", message) ? "border-red-400 bg-red-50/50" : ""}`}
              />
              {fieldError("message", message) && (
                <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider">
                  Message is required
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2 pb-2">
              <p className="text-[9px] text-muted-foreground uppercase tracking-widest">
                We typically respond within 24 hours
              </p>
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-primary text-white rounded-none font-headline font-black uppercase text-[11px] tracking-widest px-8 py-5 flex items-center gap-2.5 hover:bg-foreground transition-colors disabled:opacity-40"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting…
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Submit Ticket
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
