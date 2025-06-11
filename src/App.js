import React from "react";
import { Routes, Route, Outlet } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import LogIn from "./components/LogIn";
import Home from "./components/Home";
import Sell from "./components/Sell";
import MyProfile from "./components/MyProfile";
import BrowseItems from "./components/BrowseItems";
import Itemdetails from "./components/Itemdetails";
import Reportitem from "./components/Reportitem";
import Message from "./components/Message";
import EditListing from "./components/EditListing";
// import Reviewmod from "./components/Reviewmod";
import ScrollToTop from './ScrollToTop';
import UserProfile from "./components/UserProfile";
import Admin  from "./components/adminFolder/TuaMarAdmin";

function App() {
  return (
    <div>
      <ScrollToTop />
      <Routes>
        {/* Public Route */}
        <Route path="/" element={<LogIn />} />

        {/* Admin Route - uses Layout2 (no header/footer)*/}
        <Route path="/admin" element={<Layout2 />}>
          <Route index element={<Admin />} />
        </Route> 

        {/* Authenticated User Routes - uses Layout with header/footer */}
        <Route element={<Layout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/browseItems" element={<BrowseItems />} />
          <Route path="/sell" element={<Sell />} />
          <Route path="/messages" element={<Message />} />
          <Route path="/myProfile" element={<MyProfile />} />
          <Route path="/itemdetails/:itemId/:itemName" element={<Itemdetails />} />
          <Route path="/reportitem" element={<Reportitem />} />
          <Route path="/userProfile/:userId" element={<UserProfile />} />
          <Route path="/editListing" element={<EditListing />} />
        </Route>
      </Routes>
    </div>
  );
}

// Layout for user routes
function Layout() {
  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}

// Layout for admin (no header/footer)
function Layout2() {
  return (
    <>
      <main>
      <Outlet />
      </main>
    </>

  );
}

export default App;
