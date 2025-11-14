import React from "react";
import tw from "twin.macro";
import styled from "styled-components";
import { Button } from '@/components/ui/button';
import { useNavigate } from "react-router-dom";
import { BookOpen, Users, Globe, ArrowRight, Calendar, User } from 'lucide-react';

const Container = styled.div`
  ${tw`bg-center bg-cover `}
  background-image: url("https://images.unsplash.com/photo-1632152053988-e94d3d77829b?q=80&w=1032&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D");
`;

const OpacityOverlay = tw.div`z-10 absolute w-[100%] h-[106%] inset-0 bg-[#FBE5B6] opacity-30`;

const HeroContainer = tw.div`z-20 absolute h-full`;

const Heading = styled.h1`
  ${tw`text-3xl text-center lg:text-left sm:text-4xl lg:text-5xl xl:text-6xl font-black text-gray-100 leading-none`}
  span {
    ${tw`inline-block mt-2`}
  }
`;

const SlantedBackground = styled.span`
  ${tw`relative text-primary px-4 -mx-4 py-2`}
  &::before {
    content: "";
    ${tw`absolute inset-0 bg-gray-100 transform -skew-x-12 -z-10`}
  }
`;

const Notification = tw.span`inline-block my-4 pl-3 py-1 text-gray-100 border-l-4 border-blue-500 font-medium text-sm`;

const PrimaryAction = tw.button`px-8 py-3 mt-10 text-sm sm:text-base sm:mt-16 sm:px-8 sm:py-4 bg-gray-100 text-primary font-bold rounded shadow transition duration-300 hocus:bg-primary hocus:text-gray-100 focus:outline`;

export const Hero = () => {
  const navigate = useNavigate();
  const user = true;

  return (
    <Container className="h-screen overflow-hidden">
      <OpacityOverlay className="w-[100%]" />
      <HeroContainer className="z-10">
        <div className=" h-full flex flex-col items-center justify-center backdrop-blur-[4px] p-4 lg:p-8">
          <img src="" alt="" />
          <div className="w-full sm:w-11/12 md:w-3/4 lg:w-3/5 xl:w-[80%] text-center px-4">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white font-bold leading-tight">
              <span className="block mb-2">IJSDS</span>
              <span className="block text-2xl sm:text-3xl md:text-4xl lg:text-5xl">International Journal On Social Work and Development Studies</span>
            </h1>
            <p className="text-sm sm:text-base text-white mt-4">
              "Empowering Communities through Research and Practice" - A peer-reviewed journal dedicated to advancing knowledge and practice in social work and development studies.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center my-6">
              <Button size="lg" className="bg-[#561217] border-[1px] border-white" onClick={() => navigate('/articles')}>
                Browse Articles
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" className="" variant="outline" onClick={() => navigate(user ? '/submit' : '/auth')}>
                {user ? 'Submit Article' : 'Submit Your Research'}
              </Button>
            </div>
          </div>
        </div>
      </HeroContainer>
    </Container>
  );
};