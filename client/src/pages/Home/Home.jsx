import Navbar from "../../components/Navbar/Navbar";
import Hero from "../../components/Hero/Hero";
import Companies from "../../components/Companies/Companies";
import Features from "../../components/Features/Features";
import HowItWorks from "../../components/HowItWorks/HowItWorks";
import Footer from "../../components/Footer/Footer";

function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <Companies />
      <Features />
      <HowItWorks />
      <Footer />
    </>
  );
}

export default Home;