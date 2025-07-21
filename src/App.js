import React, { Suspense } from "react";
import { Routes, Route, Outlet } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ScrollToTop from './ScrollToTop';
import Loader from "./components/Loader";
import LoaderPart from "./components/LoaderPart";
import MessageLoader from "./components/MessageLoader";


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
  return (
    <div>
      <ScrollToTop />
      <Suspense fallback={<Loader />}>
      <Routes>
        {/* Public Route */}
        <Route path="/" element={<LogIn />} />
        <Route path="/loader" element={<Loader />} />
        <Route path="/loaderpart" element={<LoaderPart />} />
        <Route path="/messageLoader" element={<MessageLoader />} />
        

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
          <Route path="/userProfile/:userName" element={<UserProfile />} />
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
