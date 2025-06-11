import React, {useState, useEffect} from 'react'
import "./Itemdetails.css";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Heart, Flag } from "lucide-react"; {/* Library for icons*/}

const Itemdetails = () => {
  const { itemId, itemName } = useParams();
  const navigate = useNavigate();

  const [numLikes, setNumLikes] = useState(0);

  const [pics, setPics] = useState([]);
  const [itemDeets, setItemDeets] = useState([]);
  const [userID, setUserID] = useState("");
  const [picsDisplay, setPicsDisplay] = useState({});

  const ip = process.env.REACT_APP_LAPTOP_IP;

  useEffect(() => {

    let userId;

    fetch(`${ip}/tua_marketplace/fetchSession.php`, {
      method: "GET",
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        if (!data.user_id) {
          navigate("/");
        } else {
          console.log(data.user_id);
          userId = data.user_id;
          setUserID(data.user_id);
        }
      })
      .catch((error) => console.error("Error fetching session data:", error));


    //fetching item pictures
    fetch(`${ip}/tua_marketplace/itemPicsFetch.php`, {
      method: "POST",
      body: JSON.stringify({ item_id: itemId }),
    })
      .then((response) => response.json())
      .then((pics) => {
        const picsWithIds = pics.map((pic, idx) => ({
          ...pic,
          uid: `${pic.image}_${idx}_${Date.now()}`
        }));
        console.log(picsWithIds);
        setPics(picsWithIds);
        setPicsDisplay(picsWithIds[0]);
      })
      .catch((error) => console.error("Error fetching pics:", error));


    //fetching item details
    fetch(`${ip}/tua_marketplace/fetchItemDeets.php`, {
      method: "POST",
      body: JSON.stringify({ item_id: itemId, item_name: itemName }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(userId);
        if (data.user_id != userId && data.status == "IN REVIEW"){
          navigate("/home");
        }
        setItemDeets(data);
      })
      .catch((error) => console.error("Error fetching item details:", error));

  }, [itemId]);

  
  useEffect(() => {
    //logging view history
    if (itemDeets.user_id){
      if (userID != itemDeets.user_id) {
        fetch(`${ip}/tua_marketplace/itemViewLog.php`, {
          method: "POST",
          body: JSON.stringify({ 
            item_id: itemId,
            item_name: itemDeets.itemName,
            item_description: itemDeets.description,
            item_category: itemDeets.category,
          }),
          credentials: "include",
        })
          .then((response) => response.json())
          .then((data) => {
            console.log(data.message);
          })
          .catch((error) => console.error("Error Logging View History:", error));
      }
    }
  }, [itemDeets]);



  //the following codes below is for liked items:

  // for setting likes
    const [liked, setLiked] = useState({});
    useEffect(() => {
      if (userID) {
        fetch(`${ip}/tua_marketplace/fetchLikedSpecific.php`, {
          credentials: "include",
          method: "POST",
          body: JSON.stringify({ item_id: itemId })
        })
          .then((res) => res.json())
          .then((item) => {
            const likedMap = {};
            if (item && item.item_id){
              likedMap[item.item_id] = true;
              setLiked(likedMap);
              console.log(likedMap);
            }
            else{
              likedMap[item.item_id] = false;
              setLiked(likedMap);
            }
          })
          .catch((error) => {
            console.error("Error fetching liked items:", error);
          });
      }
    }, [userID]);


    //fetching item like count
    const [likeChanged, setLikeChanged] = useState(false);
    useEffect(() => {
      fetch(`${ip}/tua_marketplace/fetchLikeCountSpecific.php`, {
        method: "POST",
        body: JSON.stringify({ item_id: itemId })
      })
        .then((response) => response.json())
        .then((data) => {
          setNumLikes(data.like_count);
        })
        .catch((error) => {
          console.error("Error fetching liked items:", error);
        });
    }, [itemId, likeChanged]); // Re-fetch when like status changes



      //when liked is toggled
      const toggleLike = (item) => {
      const isLiked = !liked[itemId]; // Toggle like
    
      // Update local state immediately
      setLiked((prevLiked) => ({
        ...prevLiked,
        [itemId]: isLiked,
      }));

      setNumLikes(isLiked ? numLikes+1 : numLikes-1)
    
      // Send like/unlike to the backend
      fetch(`${ip}/tua_marketplace/InsertLikeditems.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userID,
          item_id: itemId,
          item_name: item.item_name,
          description: item.description,
          category: item.category,
          preview_pic: pics[0].image,
          liked: isLiked,
        }),
        credentials: "include",
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("Fetched data:", data);
          setLikeChanged(prev => !prev); // trigger re-fetch
          // Optionally refresh liked items
      });
    };


  return (
    <div className='itemcontainer'>
        <div className='detailsbar'>
            <div className="itemDeetails">
                <div className="itemContents1">
                    <img className='itemimage'
                    src={picsDisplay.image}
                    alt={itemDeets.itemName}
                    />
                    
                    <div className="smallImgSlots">
                        {Array.isArray(pics) && pics.length > 0 ? (
                            pics.map((pics) => (
                            <img
                                key={pics.uid}
                                src={pics.image}
                                className="smallPics"
                                style={{opacity: pics.uid==picsDisplay.uid ? "" : "0.5"}}
                                onClick={() => setPicsDisplay(pics)}
                            />
                        ))): (
                            <p>No additional images.</p>
                        )}
                    </div>

                    <Link to="/messages" state={{passedUserID: itemDeets.user_id}} style={{textDecoration: "none"}}><button className = 'contactbutton' style={{ display: userID == itemDeets.user_id || itemDeets.status == "IN REVIEW" ? "none" : "block"}} disabled={itemDeets.status == "SOLD" || itemDeets.status == "RESERVED"} >{itemDeets.status == "SOLD" ? "SOLD" : itemDeets.status == "RESERVED" ? "RESERVED" : "Contact Seller"}</button></Link>
                    <div className='numLikes'>
                        <Heart size={40} className='hearticon' onClick={itemDeets.status == "IN REVIEW" ? () => {} : () => toggleLike(itemDeets)} fill= {liked[itemId] ?'green' : 'none'} color= {liked[itemId] ?'green' : 'black'}/>
                        <p>{numLikes}{numLikes == 1 ? " Like" : " Likes"}</p>
                    </div>

                    <Link to="/reportitem" className="reportLink" state={{ passedID: itemId, previewPic: picsDisplay.image, itemName: itemDeets.itemName }} style={{display: userID == itemDeets.user_id ? "none" : "block"}}>
                    <div className='reportItem'>
                        <Flag size={30} /><p>Report Item</p>
                    </div>
                    </Link>


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
                    <Link to={userID == itemDeets.user_id ? "/myProfile" : `/userProfile/${itemDeets.user_id }`} className="sellerLink">
                      <img src={itemDeets.profilePic} alt="Profile Photo" />
                    </Link>
                  </div>
                
                
                <div className="seller-profile-name">   
                    <Link to={userID == itemDeets.user_id ? "/myProfile" : `/userProfile/${itemDeets.user_id}`} className="sellerLink"><h1>{itemDeets.firstName + " " + itemDeets.lastName}</h1></Link>
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
