import React from "react";
import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./components/Home";
import Sell from "./components/Sell";
import MyProfile from "./components/MyProfile";
import BrowseItems from "./components/BrowseItems";
import Itemdetails from "./components/Itemdetails";
import Reportitem from "./components/Reportitem";
//import Reviewmod from "./components/Reviewmod";
import ScrollToTop from './ScrollToTop';

function App() {
  return (
    <div>
      <Header /> {/* This will be globally rendered for all routes */}

      <main>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Home />} /> {/* Home page */}
          <Route path="browseItems" element={<BrowseItems />} /> {/* Browse items page */}
          <Route path="sell" element={<Sell />} /> {/* Sell page */}
          <Route path="myProfile" element={<MyProfile />} /> {/* My Profile page */}
          <Route path="itemdetails" element={<Itemdetails />} /> {/* Sell page */}
          <Route path="reportitem" element={<Reportitem/>} /> {/* Report Item page */}
          
        {/* <Route path="reviewmod" element={<Reviewmod />} />  Report Item page */}
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;
