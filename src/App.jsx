import Home from "./components/Home";
import NavBar from "./components/Navbar";
import { Routes, Route } from "react-router-dom";
import Tasks from "./components/Tasks";
import Contact from "./components/Contact";

function App() {

  return (
    <>
      <NavBar />
       <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/projects" element={<Tasks />} />
        <Route path="/contact" element={<Contact />} /> 
      </Routes>
    </>
  )
}
export default App
