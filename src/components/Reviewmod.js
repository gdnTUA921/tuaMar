import React from 'react'
import "./Reviewmod.css"
import { Link } from "react-router-dom";
import Reviewimg from './Reviewimg';
import { Star } from "lucide-react";
 {/* Library for icons*/}

const reviewmod = () => {
  return (
    <div className='reviewcontainer'>
        <div className='reviewbar'>
        <img className='reviewimg'
          src="https://media.karousell.com/media/photos/products/2023/10/5/tua_uniform_type_a_size_m_1696509414_7476203e_progressive.jpg" 
          alt="TUA Logo" 
        />

        <div className='itemtitle'>
            <h2>Uniform</h2>
        </div>
        <div className="iconcontainer"> {/* array for adding more icons*/}
        {Array.from({ length: 5 }).map((_, index) => ( 
                <Star key={index} size={30} /> 
            ))}
            </div>

                <h2 className='experiencetitle'>
                    How was your experience with: Seller Name {/* Fetch sellername in database */}
                </h2>
            <Reviewimg/>

            <div className='reviewdetails'>
            <textarea id="description" className="reviewdesc" name="description" 
            placeholder="Share details about how it was like interacting with this buyer.">
            </textarea>

                </div>
                <div className='buttons'>
                     <Link to="/" >
                <button type="submit" className="submit-button"><b>Submit</b></button>
                <button type="cancel" className="cancel-button"><b>Cancel</b></button>
                </Link>
                </div>
        </div>
      
    </div>
  )
}

export default reviewmod
