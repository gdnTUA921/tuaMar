import React from 'react'
import "./Itemdetails.css";
import { Link } from "react-router-dom";
import { Heart } from "lucide-react"; {/* Library for icons*/}


const Itemdetails = () => {
  return (
    <div className='itemcontainer'>
        <div className='detailsbar'>
            <div className='itemtitle'> 
                <h2>
                    Uniform {/* Change via database retrieval */}
                </h2>
            </div>
      
        <div className='price'>
        <h2 >
             ₱200
        </h2>
        </div>
        <div className='itemdetails'>
            <h4 className='condition'>
                Condition: {/* Change this via database retrieval*/}
            </h4> 
            <h4 className='category'>
               Category: {/* Change this via database retrieval*/}
            </h4> 
                <h4 className='descriptions'>
                    Description: {/* Change this via database retrieval*/}
                </h4>


        </div>
        
      
        <img className='itemimage'
          src="https://media.karousell.com/media/photos/products/2023/10/5/tua_uniform_type_a_size_m_1696509414_7476203e_progressive.jpg" 
          alt="TUA Logo" 
        />
            <div className='hearticon'>
                 <Heart size={40} /> 
            
             </div>
          
                 
                           
                             <Link to="/message" ><button className = 'contactbutton'>
                           Contact Seller
                             </button> </Link>
        </div>
        </div>


  )
}

export default Itemdetails
