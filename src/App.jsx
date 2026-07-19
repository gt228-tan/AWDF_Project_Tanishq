import Home from "./components/Home";
import NavBar from "./components/Navbar";
import { Routes, Route } from "react-router-dom";
import Projects from "./components/Projects";
import Contact from "./components/Contact";

function App() {

  return (
    <>
      <NavBar />
       <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/contact" element={<Contact />} /> 
      </Routes>
    </>
  )
}
export default App
