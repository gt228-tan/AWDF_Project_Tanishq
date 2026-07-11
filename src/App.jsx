import Header from "./components/Header";
import About from "./components/About";
import Skills from "./components/Skills";
import Footer from "./components/Footer";

function App() {
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
export default App
