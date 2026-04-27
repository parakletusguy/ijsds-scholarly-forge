import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Mail, Phone, MessageCircle, MapPin, Clock, LucideIcon } from "lucide-react";

interface ContactCardProps {
  icon: LucideIcon;
  label: string;
  title: string;
  href: string;
  linkText: string;
  description: string;
  note?: React.ReactNode;
  external?: boolean;
}

const ContactCard = ({ icon: Icon, label, title, href, linkText, description, note, external }: ContactCardProps) => (
  <div className="bg-white p-8 space-y-4">
    <div className="w-10 h-10 bg-primary/5 flex items-center justify-center">
      <Icon size={18} className="text-primary" />
    </div>
    <div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1">{label}</p>
      <p className="text-sm font-bold text-stone-900 mb-1">{title}</p>
      <a
        href={href}
        className="text-sm text-primary hover:underline break-all"
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {linkText}
      </a>
    </div>
    <p className="text-xs text-stone-400 leading-relaxed">{description}</p>
    {note}
  </div>
);

export const Contact = () => (
  <div className="pb-32 bg-stone-50 min-h-screen font-body text-stone-900">
    <Helmet>
      <title>Contact — IJSDS</title>
      <meta
        name="description"
        content="Get in touch with the IJSDS editorial team for submissions, inquiries, or support."
      />
    </Helmet>

    <header className="pt-20 pb-12 px-8 border-b border-stone-100 bg-white">
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="text-[10px] font-bold uppercase tracking-widest text-stone-400 hover:text-primary transition-colors mb-4 inline-block">
          ← Home
        </Link>
        <h1 className="text-3xl font-headline font-light tracking-tight text-stone-900">
          Get in <span className="italic text-primary">Touch</span>
        </h1>
        <p className="mt-3 text-stone-500 text-sm leading-relaxed max-w-xl">
          Reach out to the editorial team for submissions, questions, or collaboration inquiries.
          We respond within 24–48 hours on working days.
        </p>
      </div>
    </header>

    <main className="max-w-4xl mx-auto px-8 py-16 space-y-16">

      <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-stone-100">
        <ContactCard
          icon={Mail}
          label="Email"
          title="Editorial Office"
          href="mailto:editor.ijsds@gmail.com"
          linkText="editor.ijsds@gmail.com"
          description="For manuscript submissions and general editorial inquiries."
        />
        <ContactCard
          icon={Phone}
          label="Phone"
          title="Direct Line"
          href="tel:+2348080224405"
          linkText="+234 808 022 4405"
          description="Available during office hours."
          note={
            <div className="flex items-center gap-2 text-xs text-stone-400">
              <Clock size={11} />
              Mon–Fri, 08:00–17:00 WAT
            </div>
          }
        />
        <ContactCard
          icon={MessageCircle}
          label="WhatsApp"
          title="Quick Messages"
          href="https://wa.me/2348080224405"
          linkText="Message us"
          description="For urgent queries. Average response under 5 minutes during office hours."
          external
        />
      </div>

      <div className="bg-white border border-stone-100 p-8 flex flex-col sm:flex-row gap-8">
        <div className="w-10 h-10 bg-primary/5 flex items-center justify-center shrink-0">
          <MapPin size={18} className="text-primary" />
        </div>
        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Address</p>
          <p className="text-sm font-bold text-stone-900">Rivers State University</p>
          <p className="text-sm text-stone-500">
            Nkpolu-Oroworukwo, Port Harcourt,<br />
            Rivers State, Nigeria
          </p>
          <p className="text-xs text-stone-400 pt-1">UTC +1 · West Africa Time</p>
        </div>
      </div>

      <div className="border-l-4 border-primary pl-6 py-2">
        <p className="text-sm text-stone-500 leading-relaxed">
          We aim to respond to all inquiries within <strong className="text-stone-700">24–48 business hours</strong>.
          For manuscript-related questions, please include your submission reference number if available.
        </p>
      </div>

    </main>
  </div>
);

export default Contact;
