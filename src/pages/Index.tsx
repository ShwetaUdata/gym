import Header from "@/components/Header";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Services from "@/components/Services";
import Gallery from "@/components/Gallery";
import Steam from "@/components/Steam";
import Protein from "@/components/Protein";
import Location from "@/components/Location";
import Enquire from "@/components/Enquire";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-20">
        <Hero />
        <About />
        <Services />
        <Gallery />
        <Steam />
        <Protein />
        <Location />
        <Enquire />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
