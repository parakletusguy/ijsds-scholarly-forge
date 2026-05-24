import React, { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle, Info, Globe } from "lucide-react";

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
    <div className="pb-32 bg-stone-50 min-h-screen font-body text-stone-900">
      <Helmet>
        <title>About — IJSDS</title>
        <meta
          name="description"
          content="The mission, editorial board, and submission overview of the International Journal of Social Work and Development Studies."
        />
      </Helmet>

      <header className="pt-20 pb-12 px-8 border-b border-stone-100 bg-white">
        <div className="max-w-5xl mx-auto">
          <Link to="/" className="text-[10px] font-bold uppercase tracking-widest text-stone-400 hover:text-primary transition-colors mb-4 inline-block">
            ← Home
          </Link>
          <h1 className="text-3xl font-headline font-light tracking-tight text-stone-900">
            About <span className="italic text-primary">IJSDS</span>
          </h1>
          <p className="mt-3 text-stone-500 text-sm leading-relaxed max-w-xl">
            The International Journal of Social Work and Development Studies publishes peer-reviewed research at the intersection of social welfare, policy, and sustainable development.
          </p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-8 py-16 space-y-20">

        {/* Mission */}
        <section id="about" className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Mission</span>
            <h2 className="text-3xl font-headline font-light tracking-tight text-stone-900 leading-snug">
              Connecting research<br />to <span className="italic text-primary">real-world practice</span>
            </h2>
            <div className="space-y-4 text-sm text-stone-600 leading-relaxed">
              <p>
                IJSDS is dedicated to publishing high-quality research at the intersection of social welfare and sustainable development. We prioritise work that tackles inequality and supports communities across Africa and the wider world.
              </p>
              <p>
                Founded in 2025 and based at Rivers State University, the journal provides a global platform for scholars, practitioners, and policymakers working on development challenges in the Global South.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-6 pt-2">
              {[
                { label: 'Founded', value: '2025' },
                { label: 'Focus', value: 'Global South' },
                { label: 'Review', value: 'Double-blind' },
                { label: 'Access', value: 'Open Access' },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1">{label}</p>
                  <p className="text-sm font-bold text-stone-900">{value}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white border border-stone-100 p-10 flex items-center justify-center aspect-square">
            <img
              src="/Logo_Black_Edited-removebg-preview.png"
              alt="IJSDS"
              className="w-full max-w-[240px] object-contain"
            />
          </div>
        </section>

        {/* Editorial Board */}
        <section id="editorial" className="space-y-12">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary mb-3 block">Editorial Board</span>
            <h2 className="text-2xl font-headline font-light tracking-tight text-stone-900">
              The people behind <span className="italic text-primary">IJSDS</span>
            </h2>
            <p className="mt-2 text-stone-500 text-sm leading-relaxed max-w-xl">
              Our journal is guided by an international team of academics and practitioners who ensure every published article meets the highest scholarly standards.
            </p>
          </div>

          {/* Editor in Chief */}
          <div className="bg-white border border-stone-100 p-8 md:p-10 flex flex-col md:flex-row gap-10 items-start group">
            <div className="w-full md:w-48 shrink-0">
              <div className="aspect-[4/5] overflow-hidden bg-stone-100 grayscale group-hover:grayscale-0 transition-all duration-700">
                <img src={chiefEditor.image} alt={chiefEditor.name} className="w-full h-full object-cover" />
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary">{chiefEditor.role}</span>
                <h3 className="text-xl font-headline font-light tracking-tight text-stone-900 mt-1">{chiefEditor.name}</h3>
                <p className="text-sm text-stone-500 italic mt-0.5">{chiefEditor.designation}</p>
                <p className="text-xs font-bold uppercase tracking-widest text-stone-400 mt-1">{chiefEditor.institution}</p>
              </div>
              <div className="flex flex-wrap gap-6 pt-2 border-t border-stone-100">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-stone-300 mb-0.5">Website</p>
                  <a href={`https://${chiefEditor.website}`} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline">{chiefEditor.website}</a>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-stone-300 mb-0.5">Email</p>
                  <a href={`mailto:${chiefEditor.contact}`} className="text-sm text-primary hover:underline">{chiefEditor.contact}</a>
                </div>
              </div>
            </div>
          </div>

          {/* Board members */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {boardMembers.map((member, idx) => (
              <div key={idx} className="group bg-white border border-stone-100 p-6 hover:border-stone-300 hover:shadow-sm transition-all">
                <div className="aspect-square mb-5 overflow-hidden bg-stone-100 grayscale group-hover:grayscale-0 transition-all duration-500">
                  <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src={member.image} alt={member.name} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary">{member.role}</span>
                <h3 className="text-sm font-bold text-stone-900 mt-1 leading-snug group-hover:text-primary transition-colors">{member.name}</h3>
                <p className="text-xs text-stone-400 mt-1 leading-relaxed">{member.institution}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Submission overview */}
        <section id="submissions" className="bg-white border border-stone-100 p-8 md:p-12 space-y-10">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary mb-3 block">Submit Your Research</span>
            <h2 className="text-2xl font-headline font-light tracking-tight text-stone-900">How to submit</h2>
            <p className="mt-2 text-stone-500 text-sm leading-relaxed max-w-xl">
              We welcome original research, case studies, and critical reviews on social work and development. Submissions are open year-round.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { step: "01", title: "Format your paper", desc: "Use APA 7th edition. Double-spaced, 12pt font, 1-inch margins." },
              { step: "02", title: "Remove identifying details", desc: "Delete your name and institution from the main manuscript file before submitting." },
              { step: "03", title: "Upload your files", desc: "Submit your anonymised manuscript plus a separate title page with your author details." },
              { step: "04", title: "Track your submission", desc: "Log in to your dashboard to follow your submission through review and editorial decisions." },
            ].map((s) => (
              <div key={s.step} className="flex gap-4">
                <span className="text-2xl font-headline text-stone-200 leading-none shrink-0">{s.step}</span>
                <div>
                  <h4 className="text-sm font-bold text-stone-900">{s.title}</h4>
                  <p className="text-xs text-stone-500 mt-1 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-stone-100">
            <button
              onClick={() => navigate("/submit")}
              className="inline-flex items-center gap-2 bg-stone-900 text-white px-6 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-primary transition-colors active:scale-[0.98]"
            >
              Submit Manuscript
              <ArrowRight size={12} />
            </button>
            <p className="text-xs text-stone-400">
              Questions? <a href="mailto:editor.ijsds@gmail.com" className="text-primary hover:underline">editor.ijsds@gmail.com</a>
            </p>
          </div>
        </section>

      </main>
    </div>
  );
};
