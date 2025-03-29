//import './App.css';
import React from 'react';
import './Home.css';
import { Link } from "react-router-dom";

function Home() {
  

  return (
   <>
    
  <main>
  <div className="background-wrapper">
    {/* Background Image  */}
    <div className="background"></div>

    {/* Text  */}
    <div className="welcome">
      <b>Welcome To TUA Marketplace</b>
    </div>

   {/* Text  */}
      <div className="welcome2">
        <h2>A secure platform where everything a Trinitian needs is at their fingertips.</h2>
      </div>
    
      <div className="button1">
        <button>Start Shopping</button>
      </div>
          
      <div className="button2">
        <Link to="/sell"><button>Start Selling</button></Link>
      </div>

  </div>
</main>

   </>
  );
}

export default Home;