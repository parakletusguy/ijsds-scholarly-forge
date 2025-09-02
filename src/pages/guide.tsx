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
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

interface guideType  {
    image: string,
    instruction: string
}[]
export const Guide = () => {
    const navigate = useNavigate()
    const guideObject : guideType[] = [
        {image:one, instruction:'sign in to your ORCID account'},
        {image:two, instruction:'after signing in, scroll down to the bottom where you will a label called "works", click on the add button'},
        {image:three, instruction:'from the drop down, click on "add manually"'},
        {image:four, instruction:'click on "work type'},
        {image:five, instruction:'choose a work type of "journal article"'},
        {image:six, instruction:`fill in the neccessaty details, make sure to use the date the journal was officially published on IJSDS website`},
        {image:seven, instruction:'to get the link to your article, go to https://ijsds.org, go to the article page and view your article details from your list of articles'},
        {image:eight, instruction:'go to the top of your browser and copy the url'},
        {image:nine, instruction:'paste the copied url in the link input box'},
        {image:ten, instruction:'scroll to the bottom and save your changes'},
        {image:eleven, instruction:'after saving your changes, you can see that your article as been added to ORCID repositories'},
    ]

    return <div className="mt-6">
        <div className="relative py-3 top-0" >
                  <Button 
                    variant="outline" 
                    onClick={() => navigate(-1)}
                    className="mb-4 absolute top-1 left-3"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                </div>
        <h1 className="mt-8 text-[30px] font-extrabold text-center">GUIDE TO ADD YOUR PUBLISHED PAPER ON ORCID</h1>
        
           {
            guideObject.map((guide, index) => (
                <div  className="my-8 flex flex-col items-center justify-evenly">
                    <p className="w-[80%] text-xl text-[#3d3d3d]">step {index + 1}:</p>
                    <img src={guide.image} alt={`guide for instruction_${index}`} className="w-[80%]"/>
                    <p className="text-xl w-[75%]">{guide.instruction}</p>
                </div>
            ))
        }
     </div>
}