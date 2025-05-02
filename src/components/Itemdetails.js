import React, {useState, useEffect} from 'react'
import "./Itemdetails.css";
import { Link, useLocation } from "react-router-dom";
import { Heart } from "lucide-react"; {/* Library for icons*/}


const Itemdetails = () => {

    const location = useLocation();
    const { passedID, passedPic } = location.state || {}; {/* For Passing of Values from One Page to another*/}
    let num = 0;

    const [pics, setPics] = useState([]);
    const [itemDeets, setItemDeets] = useState([]);
    
    const ip = process.env.REACT_APP_LAPTOP_IP;
    useEffect(() => {
        fetch(`${ip}/tua_marketplace/itemPicsFetch.php`, {
        method: "POST",
        body: JSON.stringify({
            item_id: passedID,
        }),
        })
          .then((response) => response.json())
          .then((pics) => {setPics(pics); })
          .catch((error) => console.error("Error fetching data:", error));

        fetch(`${ip}/tua_marketplace/fetchItemDeets.php`, {
        method: "POST",
        body: JSON.stringify({
            item_id: passedID,
        }),
        })
          .then((response) => response.json())
          .then((data) => {setItemDeets(data); })
          .catch((error) => console.error("Error fetching data:", error));
      });

      const [picsDisplay, setPicsDisplay] = useState(passedPic);


  return (
    <div className='itemcontainer'>
        <div className='detailsbar'>
            <div className="itemDeetails">
                <div className="itemContents1">
                    <img className='itemimage'
                    src={picsDisplay}
                    alt="TUA Logo" 
                    />
                    
                    <div className="smallImgSlots">
                        {Array.isArray(pics) && pics.length > 0 ? (
                            pics.map((pics, index) => (
                            <img
                                key={index}
                                src={pics.image}
                                className="smallPics"
                                style={{opacity: pics.image==picsDisplay ? "" : "0.5"}}
                                onClick={() => setPicsDisplay(pics.image)}
                            />
                        ))): (
                            <p>No additional images.</p>
                        )}
                    </div>
                    


                    <Link to="/messages" ><button className = 'contactbutton'>Contact Seller</button></Link>
                    <div className='numLikes'>
                        <Heart size={40} className='hearticon'/> {/*style={{ fill: '#547B3E', stroke: '#547B3E' }} - to be used later */} 
                        <p>{num} Likes</p>
                    </div>
                </div>
            
                <div className="itemContents2">
                    <div className='itemtitle'> 
                        <h2>
                            {itemDeets.itemName} {/* Sample Passing */}
                        </h2>
                    </div>
            
                    <div className='price'>
                    <h2 >
                        &#8369;{itemDeets.price}
                    </h2>
                    </div>

                    <div className='itemdetails'>
                        <div className="itemDeetsRow">
                            <h3 className='condition'>Condition: </h3> 
                            <h3 className='deetsLabel'>{itemDeets.item_condition}</h3>
                        </div>
                        
                        <div className="itemDeetsRow">
                            <h3 className='category'>Category: </h3> 
                            <h3 className='deetsLabel'>{itemDeets.category}</h3>
                        </div>
                        
                            
                        <h3 className='descriptions'>
                            Description: 
                        </h3>

                        <p className='itemDesc'>
                        {itemDeets.description}
                        </p>
                    </div>          
                </div>
            </div>
            <hr/>
            <div className="sellerSection">
                <h1>Meet The Seller</h1>
                <div className="seller-profile-pic">
                    <img src={itemDeets.profilePic} alt="Profile Photo" />
                </div>
                <div className="seller-profile-name">
                    <h1>{itemDeets.firstName + " " + itemDeets.lastName}</h1>
                    <p>{itemDeets.email}</p>
                    <div className="seller-rating-container">
                        <i id="seller-starReview" className="bi bi-star-fill"></i>
                        <p className="seller-rating-score">{"0.0"}</p>
                    </div>
                </div>
        </div>
        <hr/>
    </div>
</div>


  )
}

export default Itemdetails
