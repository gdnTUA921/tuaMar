import React from 'react'
import "./Itemdetails.css";
import { Link, useLocation } from "react-router-dom";
import { Heart } from "lucide-react"; {/* Library for icons*/}


const Itemdetails = () => {

    const location = useLocation();
    const { passedWord } = location.state || {}; {/* For Passing of Values from One Page to another*/}
    let num = 0;

  return (
    <div className='itemcontainer'>
        <div className='detailsbar'>
            <div className="itemContents1">
                <img className='itemimage'
                src="https://media.karousell.com/media/photos/products/2023/10/5/tua_uniform_type_a_size_m_1696509414_7476203e_progressive.jpg" 
                alt="TUA Logo" 
                />
                <br/><br/>
                <Link to="/message" ><button className = 'contactbutton'>Contact Seller</button></Link>
                <div className='numLikes'>
                    <Heart size={40} className='hearticon'/> {/*style={{ fill: '#547B3E', stroke: '#547B3E' }} - to be used later */} 
                    <p>{num} Likes</p>
                </div>
            </div>
           
            <div className="itemContents2">
                <div className='itemtitle'> 
                    <h2>
                        {passedWord} {/* Sample Passing */}
                    </h2>
                </div>
        
                <div className='price'>
                <h2 >
                    &#8369;200
                </h2>
                </div>

                <div className='itemdetails'>
                    <h3 className='condition'>
                        Condition: {/* Change this via database retrieval*/}
                    </h3> 
                    
                    <h3 className='category'>
                        Category: {/* Change this via database retrieval*/}
                    </h3> 
                        
                    <h3 className='descriptions'>
                        Description: {/* Change this via database retrieval*/ }
                    </h3>

                    <p className='itemDesc'>
                       {"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."}
                    </p>
                </div>       
                    
            </div>
        </div>
            
    </div>


  )
}

export default Itemdetails
