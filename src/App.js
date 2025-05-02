import React from "react";
import { Routes, Route, Outlet} from "react-router-dom";
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
//import Reviewmod from "./components/Reviewmod";
import ScrollToTop from './ScrollToTop';


function App() {
  return (
    <div>
      <main>
          <ScrollToTop />
          <Routes>
              {/* Public Route */}
              <Route path="/" element={<LogIn />} /> {/* Home page */}
              
              {/* Need Authentication to Route */}
              <Route element={<Layout />}>
                <Route path="home" element={<Home />} />
                <Route path="browseItems" element={<BrowseItems />} />
                <Route path="sell" element={<Sell />} />
                <Route path="messages" element={<Message />} />
                <Route path="myProfile" element={<MyProfile />} />
                <Route path="itemdetails" element={<Itemdetails />} />
                <Route path="reportitem" element={<Reportitem />} />
                {/* <Route path="reviewmod" element={<Reviewmod />} />  Report Item page */}
              </Route>
          </Routes>
      </main>
    </div>
  );
}

// Layout wrapper for protected pages
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
