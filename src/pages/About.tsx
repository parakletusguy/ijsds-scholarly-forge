import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import {
  Search,
  ArrowRight,
  Menu,
  X,
  CheckCircle,
  Info,
  Send,
  Share2,
  Globe,
} from "lucide-react";

// Editorial Board Images
import mina from "../images/editors/Mina.jpeg";
import ariel from "../images/editors/Ariel.jpeg";
import ukamaka from "../images/editors/Ukamaka.jpeg";
import adesope from "../images/editors/Adesope.jpeg";
import khadija from "../images/editors/Khadija.jpeg";
import adolphus from "../images/editors/Adolphus.jpeg";
import irikana from "../images/editors/irkana.jpeg";
import sharma from "../images/editors/Sharma.jpeg";
import daniel from "../images/editors/daniel.jpeg";

export const About = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const element = document.querySelector(hash);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, []);

  const chiefEditor = {
    name: "Prof. Mina Magaret Ogbanga",
    role: "Editor-in-Chief",
    designation: "Professor of Social Work",
    institution: "Rivers State University, Nigeria",
    contact: "mina.ogbanga@ust.edu.ng",
    website: "www.minaogbanga.com",
    image: mina,
  };

  const boardMembers = [
    {
      name: "Prof. Roberto Ariel Zuñiga",
      role: "Editorial Board Member",
      institution: "University of Sierra Sur (Mexico)",
      image: ariel,
    },
    {
      name: "Prof. Ukamaka M. Oruche",
      role: "Editorial Board Member",
      institution: "USF Health College of Nursing, USA",
      image: ukamaka,
    },
    {
      name: "Prof. Olufemi Martins Adesope",
      role: "Editorial Board Member",
      institution: "University of Port Harcourt, Nigeria",
      image: adesope,
    },
    {
      name: "Dr. Khadija Khaja",
      role: "Editorial Board Member",
      institution: "Indiana University, Indianapolis",
      image: khadija,
    },
    {
      name: "Prof. T. Adolphus",
      role: "Editorial Board Member",
      institution: "Rivers State University, Nigeria",
      image: adolphus,
    },
    {
      name: "Prof. Daniel Uranta",
      role: "Editorial Board Member",
      institution: "University of Port-Harcourt, Nigeria",
      image: daniel,
    },
    {
      name: "Prof. Godspower Jackson Irikana",
      role: "Editorial Board Member",
      institution: "Ignatius Ajuru University, Nigeria",
      image: irikana,
    },
    {
      name: "Shashikant Nishant Sharma",
      role: "Editorial Board Member",
      institution: "MANIT (Bhopal), India",
      image: sharma,
    },
  ];

  return (
    <div className="bg-[#fcf9f8] text-[#1c1b1b] font-body selection:bg-primary/10">
      <Helmet>
        <title>About & Submissions | IJSDS</title>
        <meta
          name="description"
          content="Discover the mission, editorial leadership, and submission guidelines of the International Journal of Social Work and Development Studies."
        />
      </Helmet>

      <main className="max-w-7xl mx-auto px-8 py-20 overflow-hidden">
        {/* ── Hero / About Section ────────────────────────────────────────── */}
        <section
          id="about"
          className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-40 items-center"
        >
          <div className="lg:col-span-7">
            <span className="text-primary font-bold tracking-[0.4em] text-[10px] uppercase mb-6 block">
              International Scholarly Forum
            </span>
            <h1 className="text-7xl md:text-8xl font-headline leading-none tracking-tighter mb-10 text-on-background">
              About the <br />
              <span className="italic text-primary">Journal</span>
            </h1>
            <div className="space-y-8 text-lg leading-relaxed text-secondary/80 pr-12 max-w-2xl">
              <p className="first-letter:text-6xl first-letter:font-headline first-letter:mr-4 first-letter:float-left first-letter:text-primary first-letter:leading-none font-medium text-on-background/80">
                The International Journal of Social Work and Development Studies
                (IJSDS) serves as a prestigious global forum for critical
                inquiry into the intersections of social welfare and sustainable
                development.
              </p>
              <p className="italic">
                Our mission is to bridge the gap between rigorous academic
                theory and transformative frontline practice, prioritizing
                research that addresses systemic inequalities and innovative
                community-led strategies.
              </p>
              <div className="flex gap-10 pt-4">
                <div>
                  <div className="text-3xl font-headline text-primary mb-1">
                    Established
                  </div>
                  <div className="text-[10px] font-black uppercase tracking-widest opacity-40">
                    2025 · Heritage
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-headline text-primary mb-1">
                    Impact
                  </div>
                  <div className="text-[10px] font-black uppercase tracking-widest opacity-40">
                    Global South · Focus
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="lg:col-span-5 relative">
            <div className="aspect-[4/5] bg-surface-container-low overflow-hidden shadow-2xl relative z-10 skew-y-1">
              <img
                className="w-full h-full object-cover grayscale-[20%] hover:grayscale-0 hover:scale-105 transition-all duration-1000"
                alt="IJSDS scholarly heritage"
                src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&q=80&w=900"
              />
            </div>
            <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10 animate-pulse"></div>
            <div className="absolute top-1/2 -right-20 w-40 h-40 bg-secondary/5 rotate-45 -z-10 border border-primary/10"></div>
          </div>
        </section>

        {/* ── Editorial Board Section ─────────────────────────────────────── */}
        <section id="editorial" className="mb-40">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
            <div className="max-w-2xl">
              <span className="font-bold text-[10px] text-primary uppercase tracking-[0.4em] mb-4 block">
                Scholarly Directorate
              </span>
              <h2 className="text-5xl md:text-6xl font-headline tracking-tighter mb-6 underline decoration-primary/10 decoration-8 underline-offset-[12px]">
                Editorial Board
              </h2>
              <p className="text-secondary/60 text-lg leading-relaxed italic">
                Guided by a distinguished collective of global experts ensuring
                the highest standards of intellectual integrity and social
                discourse.
              </p>
            </div>
            <div className="flex items-center gap-1 border border-outline-variant/10 p-1 bg-white/50 backdrop-blur">
              {["Executive", "Reviewers", "Advisory"].map((cat, i) => (
                <button
                  key={cat}
                  className={`px-5 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${i === 0 ? "bg-primary text-white shadow-lg" : "hover:bg-primary/5 text-secondary"}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Chief Leadership Spotlight */}
          <div className="mb-32 group">
            <div className="bg-white border border-outline-variant/10 p-10 md:p-16 flex flex-col lg:flex-row gap-16 items-center shadow-2xl relative overflow-hidden">
              <div
                className="absolute top-0 right-0 w-32 h-32 bg-primary/5 -z-0"
                style={{ clipPath: "polygon(18% 0, 100% 0, 100% 82%)" }}
              ></div>

              <div className="w-full lg:w-1/3 relative">
                <div className="aspect-[4/5] bg-stone-100 overflow-hidden relative grayscale-[100%] group-hover:grayscale-0 transition-all duration-1000 shadow-xl">
                  <img
                    src={chiefEditor.image}
                    alt={chiefEditor.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-primary/10 rounded-full blur-2xl -z-10 accent-pulse"></div>
              </div>

              <div className="flex-grow space-y-8 relative z-10">
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-px w-10 bg-primary"></div>
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">
                      {chiefEditor.role}
                    </span>
                  </div>
                  <h3 className="text-4xl md:text-6xl font-headline tracking-tighter mb-4 leading-none italic">
                    {chiefEditor.name}
                  </h3>
                  <p className="text-xl font-medium text-secondary/60 italic">
                    {chiefEditor.designation}
                  </p>
                  <p className="text-sm font-black uppercase tracking-widest opacity-40 mt-2">
                    {chiefEditor.institution}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-8 border-t border-outline-variant/10">
                  <div className="flex items-center gap-4 group/link cursor-pointer">
                    <div className="w-10 h-10 bg-primary/5 flex items-center justify-center rounded-full group-hover/link:bg-primary group-hover/link:text-white transition-all">
                      <Globe size={16} />
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest opacity-30">
                        Platform
                      </p>
                      <a
                        href={`https://${chiefEditor.website}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm border-b border-primary/20 hover:border-primary transition-all"
                      >
                        {chiefEditor.website}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 group/link cursor-pointer">
                    <div className="w-10 h-10 bg-primary/5 flex items-center justify-center rounded-full group-hover/link:bg-primary group-hover/link:text-white transition-all">
                      <Info size={16} />
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest opacity-30">
                        Contact
                      </p>
                      <a
                        href={`mailto:${chiefEditor.contact}`}
                        className="text-sm border-b border-primary/20 hover:border-primary transition-all"
                      >
                        {chiefEditor.contact}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {boardMembers.map((member, idx) => (
              <div
                key={idx}
                className="group bg-white p-8 border border-outline-variant/10 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-2 transition-all duration-700"
              >
                <div className="aspect-square mb-8 overflow-hidden bg-stone-100 grayscale-[100%] group-hover:grayscale-0 transition-all duration-1000 relative">
                  <img
                    className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-1000"
                    src={member.image}
                    alt={member.name}
                  />
                  <div className="absolute inset-0 border-[1.5rem] border-white group-hover:border-0 transition-all duration-700"></div>
                </div>
                <div className="space-y-4">
                  <div className="flex gap-2 items-center">
                    <div className="h-0.5 w-6 bg-primary/20 group-hover:w-full transition-all duration-700"></div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary whitespace-nowrap">
                      {member.role}
                    </span>
                  </div>
                  <h3 className="text-2xl font-headline tracking-tight group-hover:text-primary transition-colors">
                    {member.name}
                  </h3>
                  <p className="text-xs text-secondary/60 leading-relaxed font-label uppercase tracking-wider">
                    {member.institution}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Submission Guidelines Section ───────────────────────────────── */}
        <section
          id="submissions"
          className="bg-[#1c1b1b] text-white p-12 lg:p-24 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-1/3 h-full opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity duration-1000">
            <span className="material-symbols-outlined text-[40rem] rotate-12 text-primary translate-x-20">
              description
            </span>
          </div>
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-20">
            <div className="lg:col-span-5 flex flex-col justify-center">
              <span className="text-primary font-bold tracking-[0.3em] text-[10px] uppercase mb-8 block">
                Author Protocols
              </span>
              <h2 className="text-6xl md:text-8xl font-headline leading-[0.9] tracking-tighter mb-10">
                Submit <br />
                <span className="italic text-primary">Your Work</span>
              </h2>
              <p className="text-white/40 text-xl mb-12 leading-relaxed italic pr-10">
                We invite original research, case studies, and critical reviews
                aligning with our focus on social work and development.
              </p>

              <div className="space-y-6 mb-16">
                {[
                  { icon: CheckCircle, label: "Peer-Reviewed Publication" },
                  { icon: Info, label: "DOAJ & Scopus Indexed" },
                  { icon: Globe, label: "Open Access Options" },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-5 text-white/80 group/li cursor-default"
                  >
                    <item.icon className="text-primary w-5 h-5 transition-transform group-hover/li:scale-125" />
                    <span className="text-sm font-bold uppercase tracking-widest font-label">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => navigate("/submit")}
                className="bg-primary text-white px-10 py-5 font-bold text-sm uppercase tracking-widest hover:bg-primary/90 shadow-2xl shadow-primary/30 transition-all flex items-center justify-between group/btn w-full sm:w-80 active:scale-95"
              >
                Start Submission
                <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-2 transition-transform" />
              </button>
            </div>

            <div className="lg:col-span-7">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {[
                  {
                    step: "01",
                    title: "Format Manuscript",
                    desc: "Follow APA 7th edition formatting and our journal-specific style guide criteria.",
                  },
                  {
                    step: "02",
                    title: "Anonymize File",
                    desc: "Remove all identifying metadata to ensure a fair double-blind editorial review.",
                  },
                  {
                    step: "03",
                    title: "Upload Files",
                    desc: "Submit the anonymized manuscript, title page, and supplementary data sets.",
                  },
                  {
                    step: "04",
                    title: "Track Progress",
                    desc: "Monitor the real-time status of your peer review and editorial decisions.",
                  },
                ].map((s, idx) => (
                  <div
                    key={idx}
                    className="space-y-6 p-8 border border-white/10 hover:bg-white/[0.03] transition-colors relative overflow-hidden group"
                  >
                    <div className="absolute top-0 right-0 w-16 h-16 bg-white/[0.02] rotate-45 translate-x-8 -translate-y-8"></div>
                    <span className="text-5xl font-headline text-primary/30 group-hover:text-primary transition-colors block leading-none">
                      {s.step}
                    </span>
                    <h4 className="font-headline text-xl tracking-tight text-white/90">
                      {s.title}
                    </h4>
                    <p className="text-sm text-white/30 leading-relaxed italic">
                      {s.desc}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-16 p-8 bg-white/[0.02] border border-white/5 backdrop-blur-sm flex gap-6 items-start">
                <Info className="text-primary w-6 h-6 shrink-0 mt-1" />
                <div>
                  <h5 className="font-black text-[10px] uppercase tracking-[0.2em] mb-2 text-white/80">
                    Pre-Submission Inquiry
                  </h5>
                  <p className="text-sm text-white/40 leading-relaxed italic">
                    Not sure if your work fits our scope? Send an abstract to{" "}
                    <a
                      href="mailto:editorial@ijsds.org"
                      className="text-primary hover:underline underline-offset-4"
                    >
                      editor.ijsds@gmail.com
                    </a>{" "}
                    for an informal assessment.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="bg-stone-100 py-24 mt-20 border-t border-outline-variant/10">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-24">
            <div className="space-y-8">
              <div className="font-headline italic text-3xl font-black text-primary">
                IJSDS
              </div>
              <p className="text-secondary/60 text-sm leading-relaxed max-w-xs italic font-medium">
                Advancing global discourse in social work and sustainable
                development through rigorous research and continental heritage.
              </p>
              <div className="flex gap-4">
                <button className="w-10 h-10 border border-outline-variant/20 flex items-center justify-center text-secondary hover:bg-primary hover:text-white transition-all">
                  <Share2 size={16} />
                </button>
                <button className="w-10 h-10 border border-outline-variant/20 flex items-center justify-center text-secondary hover:bg-primary hover:text-white transition-all">
                  <Globe size={16} />
                </button>
              </div>
            </div>
            <div>
              <h5 className="text-primary font-black text-[10px] uppercase tracking-[0.4em] mb-10">
                Journal
              </h5>
              <ul className="space-y-4">
                {[
                  "Ethics & Policy",
                  "Editorial Board",
                  "Open Access",
                  "Archive",
                ].map((link) => (
                  <li key={link}>
                    <button className="text-secondary/60 hover:text-primary transition-colors text-sm font-medium">
                      {link}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h5 className="text-primary font-black text-[10px] uppercase tracking-[0.4em] mb-10">
                Support
              </h5>
              <ul className="space-y-4">
                {[
                  "Contact",
                  "Institutional Login",
                  "Help Center",
                  "Guidelines",
                ].map((link) => (
                  <li key={link}>
                    <button className="text-secondary/60 hover:text-primary transition-colors text-sm font-medium">
                      {link}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h5 className="text-primary font-black text-[10px] uppercase tracking-[0.4em] mb-10">
                Contact
              </h5>
              <p className="text-secondary/60 text-sm italic leading-relaxed mb-6">
                Rivers State University, Nkpolu-Oroworukwo, Port Harcourt,
                Nigeria.
              </p>
              <p className="text-sm font-bold text-primary">
                editor.ijsds@gmail.com
              </p>
            </div>
          </div>
          <div className="pt-12 border-t border-outline-variant/10 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-secondary/30 text-[10px] font-black uppercase tracking-[0.2em]">
              © 2025 International Journal of Social Work and Development
              Studies. All Rights Reserved.
            </p>
            <div className="flex gap-10 text-[10px] font-black uppercase tracking-widest text-secondary/40">
              <button className="hover:text-primary transition-colors">
                Privacy
              </button>
              <button className="hover:text-primary transition-colors">
                Terms
              </button>
              <button className="hover:text-primary transition-colors">
                Cookies
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
