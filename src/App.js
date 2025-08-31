import React, { Suspense, useState, useEffect} from "react";
import { Routes, Route, Outlet } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ScrollToTop from './ScrollToTop';
import Loader from "./components/Loader";

const LogIn = React.lazy(() => import ('./pages/LogIn'));
const Home = React.lazy(() => import ('./pages/Home'));
const Sell = React.lazy(() => import ('./pages/Sell'));
const MyProfile = React.lazy(() => import ('./pages/MyProfile'));
const BrowseItems = React.lazy(() => import ('./pages/BrowseItems'));
const Itemdetails = React.lazy(() => import ('./pages/Itemdetails'));
const Reportitem = React.lazy(() => import ('./pages/Reportitem'));
const Message = React.lazy(() => import ('./pages/Message'));
const EditListing = React.lazy(() => import ('./pages/EditListing'));
const ReportUser = React.lazy(() => import ('./pages/Reportuser'));
const Reviewmod = React.lazy(() => import ('./pages/Reviewmod'));
const UserProfile = React.lazy(() => import ('./pages/UserProfile'));
const Admin = React.lazy(() => import ('./pages/adminFolder/TuaMarAdmin'));
const Error = React.lazy(() => import ('./components/Error'));



function App() {
  //For logged-in state check
  const [loggedIn, setLoggedIn] = useState(false);

  const ip = process.env.REACT_APP_LAPTOP_IP; //IP address (see env file for set up)

  //Fetch session to check if user is logged in
  useEffect(() => {
      fetch(`${ip}/fetchSession.php`, {
        method: "GET",
        credentials: "include",
      })
        .then((response) => response.json())
        .then((data) => {
          if (!data.user_id) {
            //Do nothing, user is not logged in
          } else {
            setLoggedIn(true);
          }
        })
        .catch((error) => {
          console.error("Error fetching session data:", error);
        });
    }, [ip]);


  // Layout for user routes
  function Layout() {
    return (
      <>
        <Header loggedIn={loggedIn} setLoggedIn={setLoggedIn}/>
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

  return (
    <div>
      <ScrollToTop />
      <Suspense fallback={<Loader />}>
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<LogIn setLoggedIn={setLoggedIn} />} />
        

        {/* Admin Route - uses Layout2 (no header/footer)*/}
        <Route path="/admin" element={<Layout2 />}>
          <Route index element={<Admin />} />
        </Route> 

        {/* Authenticated User Routes - uses Layout with header/footer */}
        <Route element={<Layout />}>
          <Route path="/" element={<Home loggedIn={loggedIn}/>} />
          <Route path="/browseItems" element={<BrowseItems loggedIn={loggedIn}/>} />
          <Route path="/sell" element={<Sell />} />
          <Route path="/messages" element={<Message />} />
          <Route path="/myProfile" element={<MyProfile />} />
          <Route path="/itemdetails/:itemId/:itemName" element={<Itemdetails loggedIn={loggedIn}/>} />
          <Route path="/reportitem" element={<Reportitem />} />
          <Route path="/userProfile/:userName" element={<UserProfile loggedIn={loggedIn}/>} />
          <Route path="/editListing" element={<EditListing />} />
          <Route path="/reportUser" element={<ReportUser />} />
          <Route path="/reviewmod" element={<Reviewmod />} />
          <Route path="/loader" element={<Loader />} />
        </Route>

        <Route path="/error404" element={<Error />} />
        <Route path="*" element={<Error />} />
      </Routes>
      </Suspense>
    </div>
  );
}


export default App;
