import { Route, Routes } from "react-router-dom";
import Header from "./components/Header.tsx";
import Home from "./pages/Home.tsx";
import ClusterDetails from "./pages/ClusterDetails.tsx";


function App() {
  return (
    <div className="min-h-screen bg-background text-text py-4 px-2">
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cluster/:id" element={<ClusterDetails />} />
      </Routes>
    </div>
  );
}

export default App;
