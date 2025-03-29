import React from "react";
import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./components/Home";
import Sell from "./components/Sell";
import MyProfile from "./components/MyProfile";
import BrowseItems from "./components/BrowseItems";

function App() {
  return (
    <div>
      <Header /> {/* This will be globally rendered for all routes */}

      <main>
        <Routes>
          <Route path="/" element={<Home />} /> {/* Home page */}
          <Route path="browseItems" element={<BrowseItems />} /> {/* Browse items page */}
          <Route path="sell" element={<Sell />} /> {/* Sell page */}
          <Route path="myProfile" element={<MyProfile />} /> {/* Sell page */}
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;
