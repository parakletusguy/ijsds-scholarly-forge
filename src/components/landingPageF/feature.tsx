import React from "react";
import styled from "styled-components";
import tw from "twin.macro";
import { SectionHeading } from "../misc/Headings.js";

const Container = tw.div`relative`;

const ThreeColumnContainer = styled.div`
  ${tw`flex flex-col items-center md:items-stretch md:flex-row flex-wrap md:justify-center max-w-screen-xl mx-auto py-12 md:py-20 lg:py-24 px-4 sm:px-6 md:px-8`}
`;
const Heading = tw(SectionHeading)`w-full text-center text-3xl sm:text-4xl lg:text-5xl`;

const Column = styled.div`
  ${tw`w-full md:w-1/2 lg:w-1/3 px-6 flex`}
`;

const Card = styled.div`
  ${tw`flex flex-col mx-auto max-w-xs items-center px-6 py-10 rounded-lg mt-12 border border-2 border-black bg-opacity-50`}
  .imageContainer {
    ${tw`text-center rounded-full p-1 `}
    img {
      ${tw`w-20 h-20 sm:w-24 sm:h-24`} // Responsive image size
    }
  }

  .textContainer {
    ${tw`mt-6 text-center`}
  }

  .title {
    ${tw`mt-2 font-bold text-xl sm:text-2xl leading-none text-primary`} // Responsive title size
  }

  .description {
    ${tw`mt-3 font-semibold text-sm leading-loose`}
  }
`;

export const Features = () => {
  const cards = [
    {
      imageSrc: 'https://img.icons8.com/?size=100&id=CiGKDwbd2k7v&format=png&color=000000',
      title: "Expert Peer Review",
      description: "Rigorous peer review process by leading experts in social work and development studies"
    },
    {
      imageSrc: 'https://img.icons8.com/?size=100&id=gDsayWJPd5I8&format=png&color=000000',
      title: "Global Reach",
      description: "Global platform for researchers, practitioners, and policymakers to share insights and research findings"
    },
    {
      imageSrc: 'https://img.icons8.com/?size=100&id=sQwWueo7kDHr&format=png&color=000000',
      title: "Impact & Quality",
      description: "Evidence-based research that informs policy and practice in social work and development studies"
    },
  ];

  return (
    <Container className="bg-[#FBE5B6]">
      <ThreeColumnContainer>
        <Heading>What IJSDS <span tw="">Offers?</span></Heading>
        {cards.map((card, i) => (
          <Column key={i}>
            <Card>
              <span className="imageContainer">
                <img src={card.imageSrc} className="h-full w-full object-contain" alt="" />
              </span>
              <span className="textContainer">
                <span className="title">{card.title}</span>
                <p className="description">
                  {card.description}
                </p>
              </span>
            </Card>
          </Column>
        ))}
      </ThreeColumnContainer>
    </Container>
  );
};