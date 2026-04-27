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
        <div className="min-h-screen bg-[#fcf9f8] font-body">
            <Helmet>
                <title>ORCID Integration Guide — IJSDS</title>
                <meta name="description" content="Official guide for synchronizing IJSDS publications with your ORCID registry." />
            </Helmet>

            <div className="max-w-3xl mx-auto px-6 md:px-8 py-16 md:py-24">
                <div className="mb-14 pb-10 border-b border-stone-200">
                    <div className="flex justify-between items-start mb-4">
                        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary block">
                            Integration Guide
                        </span>
                        <Link to="/" className="text-sm text-stone-500 hover:text-primary transition-colors underline underline-offset-4">
                            Back to Home
                        </Link>
                    </div>
                    <h1 className="font-headline text-3xl md:text-4xl font-bold text-stone-900 tracking-tight mb-4">
                        ORCID Registry Sync
                    </h1>
                    <p className="text-stone-500 text-sm leading-relaxed max-w-xl">
                        Follow these simple steps to manually add your published IJSDS articles to your global ORCID investigator profile.
                    </p>
                </div>

                <div className="space-y-16">
                    {guideObject.map((guide, index) => (
                        <div key={index} className="flex flex-col gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm shrink-0">
                                    {index + 1}
                                </div>
                                <h3 className="text-lg font-semibold text-stone-900 leading-tight">
                                    {guide.instruction}
                                </h3>
                            </div>
                            <div className="pl-12">
                                <img 
                                    src={guide.image} 
                                    alt={`Step ${index + 1}`} 
                                    className="w-full h-auto border border-stone-200 rounded-sm shadow-sm"
                                />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-16 pt-10 border-t border-stone-200">
                    <div className="bg-white p-8 border border-stone-200 rounded-sm text-center">
                        <h3 className="font-bold text-stone-900 mb-2">Sync Complete!</h3>
                        <p className="text-stone-600 text-sm mb-6">By integrating with ORCID, your intellectual contributions are accurately attributed and globally discoverable.</p>
                        <Link to="/" className="inline-block bg-primary text-white px-6 py-2 text-sm font-medium hover:bg-primary/90 transition-colors">
                            Return to Home
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Guide;