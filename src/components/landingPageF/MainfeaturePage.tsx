import React from "react";
import tw from "twin.macro";
import styled from "styled-components";
// import { css } from "styled-components/macro"; //eslint-disable-line
import { SectionHeading, Subheading as SubheadingBase } from "../misc/Headings.js";
import { PrimaryButton as PrimaryButtonBase } from "../misc/Buttons.js";
import StatsIllustrationSrc from "../../images/stats-illustration.svg";
import SvgDotPattern from "../../images/dot-pattern.svg";

const Container = tw.div`relative`;
const TwoColumn = tw.div`flex flex-col md:flex-row justify-between max-w-screen-xl mx-auto py-12 md:py-20 lg:py-24 px-4 sm:px-6 md:px-8`;
const Column = tw.div`w-full max-w-md mx-auto md:max-w-none md:mx-0`;
const ImageColumn = tw(Column)`md:w-[45%] flex-shrink-0 h-80 md:h-auto`;
const TextColumn = styled(Column)<any>(props => [
  tw`md:w-[45%] mt-12 md:mt-0 md:ml-[40px]`,
  props.textOnLeft ? tw`md:mr-12 lg:mr-16 md:order-first md:w-[45%] md:ml-[40px]` : tw`md:ml-12 lg:ml-16 md:order-last md:w-[45%]`
]);

const Image = styled.div<any>(props => [
  `background-image: url("${props.imageSrc}");`,
  tw`rounded bg-contain bg-no-repeat bg-center h-full`
]);
const TextContent = tw.div`lg:py-8 text-center md:text-left md:ml-[50px]`;

const Subheading = tw(SubheadingBase)`text-center md:text-left`;
const Heading = tw(
  SectionHeading
)`mt-4 font-black text-3xl sm:text-4xl lg:text-5xl text-center md:text-left leading-tight`;
const Description = tw.p`mt-4 text-center md:text-left text-sm md:text-base lg:text-lg font-medium leading-relaxed text-secondary`;

const Statistics = tw.div`flex flex-col items-center sm:block text-center md:text-left mt-4`;
const Statistic = tw.div`text-left sm:inline-block sm:mr-12 last:mr-0 mt-4`;
const Value = tw.div`font-bold text-lg sm:text-xl lg:text-2xl text-secondary tracking-wide`;
const Key = tw.div`font-medium text-primary`;

const PrimaryButton = tw(PrimaryButtonBase)`mt-8 md:mt-10 text-sm inline-block mx-auto md:mx-0`;

const DecoratorBlob = styled(SvgDotPattern)(props => [
  tw`w-20 h-20 absolute right-0 bottom-0 transform translate-x-1/2 translate-y-1/2 fill-current text-primary -z-10`
]);

export const MainFeatures = ({
  subheading = "About Us...",
  heading = (
    <>
      "Empowering Communities through Research and Practice"
    </>
  ),
  description = "The International Journal On Social Work and Development Studies (IJSDS) is a peer-reviewed journal dedicated to advancing knowledge and practice in social work and development studies. Our aim is to provide a platform for researchers, practitioners, and policymakers to share their experiences, insights, and research findings.",
  primaryButtonText = "Learn More",
  primaryButtonUrl = "https://ijsds.org/about",
  imageSrc = StatsIllustrationSrc,
  imageCss = null,
  imageContainerCss = null,
  imageDecoratorBlob = false,
  imageDecoratorBlobCss = null,
  imageInsideDiv = true,
  statistics = null,
  textOnLeft = false
}) => {
  const defaultStatistics = [
    {
      key: "Books Published",
      value: "100+"
    },
  ];

  if (!statistics) statistics = defaultStatistics;

  return (
    <Container className="bg-gradient-to-b to-[#561217] from-[#2C6E63]">
      <TwoColumn>
        <ImageColumn>
          {imageInsideDiv ? <Image imageSrc={imageSrc} css={imageCss} /> : <img src={imageSrc} />}
          {imageDecoratorBlob && <DecoratorBlob />}
        </ImageColumn>
        <TextColumn textOnLeft={textOnLeft}>
          <TextContent>
            {subheading && <Subheading>{subheading}</Subheading>}
            <Heading>{heading}</Heading>
            <Description>{description}</Description>
            <Statistics>
              {statistics.map((statistic, index) => (
                <Statistic key={index}>
                  <Value>{statistic.value}</Value>
                  <Key>{statistic.key}</Key>
                </Statistic>
              ))}
            </Statistics>
            <PrimaryButton as="a" href={primaryButtonUrl}>
              {primaryButtonText}
            </PrimaryButton>
          </TextContent>
        </TextColumn>
      </TwoColumn>
    </Container>
  );
};