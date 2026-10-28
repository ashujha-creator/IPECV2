
import Announcement from "@/components/consumer/UI/announcement";
import Carousel from "@/components/consumer/UI/Carousel";
import OurStrength from "@/components/consumer/UI/strength";
import CampusAndAccreditations from "@/components/consumer/UI/campus";
import PlacementHighlights from "@/components/consumer/UI/placement"
import InnovationHub from "@/components/consumer/UI/InnovationHub"
import SpotlightAlumni from "@/components/consumer/UI/SpotLight"
import Notice from "@/components/consumer/UI/Notice"
import EventsSection from "@/components/consumer/UI/EventSection"
import Footer from "@/components/consumer/UI/footer"
import LifeGallery from "@/components/consumer/UI/Gallery"
import AboutSection from "@/components/consumer/UI/about"


export default async function Home() {


  return (
    <>
      <main>
        <Announcement />
        <Carousel />
        <AboutSection />
        <OurStrength />
        <CampusAndAccreditations />
        <PlacementHighlights />
        <InnovationHub />
        <SpotlightAlumni />
        <Notice />
        <EventsSection />
        <LifeGallery />
        <Footer />
      </main>
    </>
  );
}
