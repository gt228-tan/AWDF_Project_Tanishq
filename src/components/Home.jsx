import Header from "./home/Header";
import About from "./home/About";
import Skills from "./home/Skills";
import Footer from "./home/Footer";


function Home() {
  const skills = [
    "HTML",
    "CSS",
    "JavaScript",
    "UI/UX Design",
    "SQL",
    "Video Editing",
    "Graphic Design"

  ];

  return (
    <>
      <div>
    
        <Header name="Tanishq Mehta" />
        <About />
        <Skills skillList={skills} />
        <Footer />
      </div>
    </>
  )
}
export default Home
