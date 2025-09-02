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

interface guideType  {
    image: string,
    instruction: string
}[]
const Guide = () => {
    const guideObject : guideType[] = [
        {image:one, instruction:'sign in to your ORCID account'},
        {image:two, instruction:'after signing in, scroll down to the bottom where you will a label called "works", click on the add button'},
        {image:three, instruction:'from the drop down, click on "add manually"'},
        {image:four, instruction:'click on "work type'},
        {image:five, instruction:'choose a work type of "journal article"'},
        {image:six, instruction:`to get the link to your article, go to https://ijsds.org, go to the article page and view your article details from your list of articles`},
        {image:one, instruction:'sign in to your ORCID account'},
        {image:one, instruction:'sign in to your ORCID account'},
    ]
}