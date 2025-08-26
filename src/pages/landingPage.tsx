import {Hero} from "@/components/landingPageF/Hero";
import { Features } from "@/components/landingPageF/feature";
import { MainFeatures } from "@/components/landingPageF/MainfeaturePage";
import { MainFeaturetwo } from "@/components/landingPageF/mainFeature2";
import { Portfolio } from "@/components/landingPageF/portfolio";
import { Contact } from "@/components/landingPageF/contactUs";
// import { Testi } from "@/components/landingPageF/testimonial";



export const Landing = () => {
    return <>
        <Hero/>
        <MainFeatures/>
        <Features/>
        <MainFeaturetwo/>
        <Contact/>
    </>
}