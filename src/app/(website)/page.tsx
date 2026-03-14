import HeroSection from "@/components/home/HeroSection";
import AboutSection from "@/components/home/AboutSection";
import DogbookSection from "@/components/home/DogbookSection";
import ThemesCarousel from "@/components/home/ThemesCarousel";
import PersonalidadeCanina from "@/components/home/PersonalidadeCanina";
import MarcaDaPegada from "@/components/home/MarcaDaPegada";
import ComoFunciona from "@/components/home/ComoFunciona";
import SessoesPet from "@/components/home/SessoesPet";
import GiveBack from "@/components/home/GiveBack";
import Depoimentos from "@/components/home/Depoimentos";
import FAQ from "@/components/home/FAQ";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <AboutSection />
      <DogbookSection />
      <ThemesCarousel />
      <PersonalidadeCanina />
      <MarcaDaPegada />
      <ComoFunciona />
      <SessoesPet />
      <GiveBack />
      <Depoimentos />
      <FAQ />
    </>
  );
}
