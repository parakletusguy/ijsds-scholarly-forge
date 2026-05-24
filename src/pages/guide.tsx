import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

import one from "../images/orcidGuide/Screenshot from 2025-09-01 11-11-12.png"
import two from "../images/orcidGuide/Untitled design.png"
import three from "../images/orcidGuide/Untitled design (1).png"
import four from "../images/orcidGuide/Untitled design (2).png"
import five from "../images/orcidGuide/Untitled design (3).png"
import six from "../images/orcidGuide/Screenshot from 2025-09-01 13-34-34.png"
import seven from "../images/orcidGuide/Untitled design (4).png"
import eight from "../images/orcidGuide/Untitled design (5).png"
import nine from "../images/orcidGuide/Untitled design (6).png"
import ten from "../images/orcidGuide/Untitled design (7).png"
import eleven from "../images/orcidGuide/Screenshot from 2025-09-01 20-10-55.png"

interface GuideStep {
    image: string;
    instruction: string;
}

export const Guide = () => {
    const guideObject : GuideStep[] = [
        {image:one, instruction:'Sign in to your official ORCID investigator account.'},
        {image:two, instruction:'After authentication, navigate to the "Works" section at the bottom of your profile and select "Add".'},
        {image:three, instruction:'From the dropdown, select "Add Manually".'},
        {image:four, instruction:'Specify the manuscript type by clicking on "Work Type".'},
        {image:five, instruction:'Select "Journal Article" as the primary categorization.'},
        {image:six, instruction:'Fill in the required details. Ensure the publication date corresponds exactly with the official IJSDS release.'},
        {image:seven, instruction:'To retrieve the unique URL for your article, navigate to the IJSDS archive and access your specific publication.'},
        {image:eight, instruction:'Copy the URL from your browser address bar.'},
        {image:nine, instruction:'Paste the copied URL into the "Link" field within the ORCID form.'},
        {image:ten, instruction:'Save your changes to complete the addition.'},
        {image:eleven, instruction:'Verify that your published article is now successfully listed on your ORCID profile.'},
    ]

    return (
        <div className="pb-32 bg-stone-50 min-h-screen font-body text-stone-900">
            <Helmet>
                <title>ORCID Guide — IJSDS</title>
                <meta name="description" content="How to add your published IJSDS articles to your ORCID profile — a step-by-step guide." />
            </Helmet>

            <header className="pt-20 pb-12 px-8 border-b border-stone-100 bg-white">
                <div className="max-w-3xl mx-auto">
                    <Link to="/" className="text-[10px] font-bold uppercase tracking-widest text-stone-400 hover:text-primary transition-colors mb-4 inline-block">
                        ← Home
                    </Link>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary block mb-3">Author Resources</span>
                    <h1 className="text-3xl font-headline font-light tracking-tight text-stone-900">
                        Adding your article to <span className="italic text-primary">ORCID</span>
                    </h1>
                    <p className="mt-3 text-stone-500 text-sm leading-relaxed max-w-xl">
                        Follow these steps to manually add your published IJSDS article to your ORCID profile.
                    </p>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-8 py-16">
                <div className="space-y-16">
                    {guideObject.map((guide, index) => (
                        <div key={index} className="flex flex-col gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-8 h-8 bg-stone-900 text-white flex items-center justify-center font-bold text-sm shrink-0">
                                    {index + 1}
                                </div>
                                <h3 className="text-sm font-bold text-stone-900 leading-tight">
                                    {guide.instruction}
                                </h3>
                            </div>
                            <div className="pl-12">
                                <img
                                    src={guide.image}
                                    alt={`Step ${index + 1}`}
                                    className="w-full h-auto border border-stone-100"
                                />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-16 pt-10 border-t border-stone-100">
                    <div className="bg-white p-8 border border-stone-100 text-center">
                        <h3 className="font-bold text-stone-900 mb-2">All done</h3>
                        <p className="text-stone-500 text-sm mb-6">Your article is now linked on your ORCID profile and will appear in your publication list.</p>
                        <Link to="/" className="inline-block bg-stone-900 text-white px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest hover:bg-primary transition-colors active:scale-[0.98]">
                            Back to Home
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Guide;