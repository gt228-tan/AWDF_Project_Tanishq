import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import NavBar from "./components/Navbar";
import PageLoader from "./components/PageLoader";

const Projects = lazy(() => import("./components/Projects"));
const Tasks = lazy(() => import("./components/Tasks"));
const Contact = lazy(() => import("./components/Contact"));

function App() {
  return (
    <>
      <NavBar />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </Suspense>
    </>
  );
}

export default App;
