import React, {useState, useEffect} from 'react';
import "../assets/Itemdetails.css";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Heart, Flag } from "lucide-react"; 
import LoaderPart from "../components/LoaderPart";
import Recommendation from '../components/ItemdetailsRecomm';

const Itemdetails = () => {

  const [loading, setLoading] = useState(true); //for loading state

  const { itemId, itemName } = useParams(); 
  
  const navigate = useNavigate(); 

  const [numLikes, setNumLikes] = useState(0); //for setting number of likes

  //for setting item's details such as pictures, descriptions, etc.
  const [pics, setPics] = useState([]);
  const [itemDeets, setItemDeets] = useState([]);
  const [userID, setUserID] = useState("");
  const [picsDisplay, setPicsDisplay] = useState({});

  const ip = process.env.REACT_APP_LAPTOP_IP; //ip address

  
  //New state for large image viewing modal
  const [showEnlargeImg, setShowEnlargeImg] = useState(false);
  const [enlargedImg, setEnlargeImg] = useState("");


useEffect(() => {
  const fetchAndLog = async () => {
    let userId;

    try {

      // Fetch session
      const sessionRes = await fetch(`${ip}/fetchSession.php`, {
        method: "GET",
        credentials: "include",
      });
      const sessionData = await sessionRes.json();

      if (!sessionData.user_id) {
        navigate("/");
        return;
      } else {
        userId = sessionData.user_id;
        setUserID(sessionData.user_id);
      }


      // Fetch item pictures
      const picsRes = await fetch(`${ip}/itemPicsFetch.php`, {
        method: "POST",
        body: JSON.stringify({ item_id: itemId }),
      });
      const pics = await picsRes.json();
      const picsWithIds = pics.map((pic, idx) => ({
        ...pic,
        uid: `${pic.image}_${idx}_${Date.now()}`,
      }));
      setPics(picsWithIds);
      setPicsDisplay(picsWithIds[0]);


      // Fetch item details
      const itemRes = await fetch(`${ip}/fetchItemDeets.php`, {
        method: "POST",
        body: JSON.stringify({ item_id: itemId, item_name: itemName }),
      });
      const itemData = await itemRes.json();


      if (itemData.user_id !== userId && itemData.status === "IN REVIEW") {
        navigate("/home");
        return;
      }

      if (itemData.itemName == null && itemData.user_id == null){
        navigate("/error404", {replace: true});
        return;
      }

      if (itemData.status == "UNLISTED"){
        navigate("/error404", {replace: true});
        return;
      }

      setItemDeets(itemData);


      // Log view history if viewer is not the item's owner
      if (itemData.user_id && itemData.user_id !== userId && !sessionStorage.getItem(`viewed_${itemId}`) && itemData.status === "AVAILABLE") {
        const logRes = await fetch(`${ip}/itemViewLog.php`, {
          method: "POST",
          body: JSON.stringify({
            item_id: itemId,
            item_name: itemData.itemName,
            item_description: itemData.description,
            item_category: itemData.category,
          }),
          credentials: "include",
        });
        const logData = await logRes.json();
        console.log(logData.message);
        
        // Mark as viewed for this session
        sessionStorage.setItem(`viewed_${itemId}`, "true");
      }

    } catch (error) {
      console.error("Error in combined fetch and log:", error);
    } finally {
      setLoading(false); // Hide loader after all data is fetched
    }
  };

  fetchAndLog();
}, [itemId, itemName]);




  //the following codes below is for liked items:

  // for setting likes
    const [liked, setLiked] = useState({});
    useEffect(() => {
      if (userID) {
        fetch(`${ip}/fetchLikedSpecific.php`, {
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
      fetch(`${ip}/fetchLikeCountSpecific.php`, {
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
      fetch(`${ip}/InsertLikeditems.php`, {
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


  if (loading) {
    return (
      <div className="itemDeets-loader-container">
        <div className='detailsbar-loader'>
          <LoaderPart />
        </div>
      </div>
    );
  }

  else {
    return (
    <div className='itemcontainer'>
        <div className='detailsbar'>
            <div className="itemDeetails">
                <div className="itemContents1">
                    <img className='itemimage'
                    src={picsDisplay.image || "/default-image.png"}
                    onError={(e) => (e.target.src = "/default-image.png")}
                    alt={itemDeets.itemName}
                    onClick={(e) => {setShowEnlargeImg(true); setEnlargeImg(picsDisplay.image)}}
                    />
                    
                    <div className="smallImgSlots" style={{justifyContent: pics.length > 3 ? "flex-start" : "center"}}>
                        {Array.isArray(pics) && pics.length > 0 ? (
                            pics.map((pics) => (
                            <img
                                key={pics.uid}
                                src={pics.image || "/default-image.png"}
                                onError={(e) => (e.target.src = "/default-image.png")}
                                className="smallPics"
                                style={{opacity: pics.uid==picsDisplay.uid ? "" : "0.5"}}
                                onClick={() => setPicsDisplay(pics)}
                            />
                        ))): (
                            <p>No additional images.</p>
                        )}
                    </div>

                    <Link to="/messages" state={{passedUserID: itemDeets.fb_uid, passedUserIDSender: userID, passedUserIDReceiver: itemDeets.user_id, passedItemID: itemId, passedItemStatus: itemDeets.status}} className='messageLink'><button className = 'contactbutton' style={{ display: userID == itemDeets.user_id || itemDeets.status == "IN REVIEW" ? "none" : "block"}} disabled={itemDeets.status == "SOLD" || itemDeets.status == "RESERVED"}>{itemDeets.status == "SOLD" ? "SOLD" : itemDeets.status == "RESERVED" ? "RESERVED" : "Contact Seller"}</button></Link>
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
                    <Link to={userID == itemDeets.user_id ? "/myProfile" : `/userProfile/${itemDeets.firstName + " " + itemDeets.lastName}`} className="sellerLink">
                      <img 
                        src={itemDeets.profilePic || "/tuamar-profile-icon.jpg"} 
                        alt="Profile Photo"
                        onError={(e) => (e.target.src = "/tuamar-profile-icon.jpg")}
                      />
                    </Link>
                  </div>
                
                
                <div className="seller-profile-name">   
                    <Link to={userID == itemDeets.user_id ? "/myProfile" : `/userProfile/${itemDeets.firstName + " " + itemDeets.lastName}`} className="sellerLink"><h1>{itemDeets.firstName + " " + itemDeets.lastName}</h1></Link>
                    <p>{itemDeets.email}</p>
                    <div className="seller-rating-container">
                        <i id="seller-starReview" className="bi bi-star-fill"></i>
                        <p className="seller-rating-score">{itemDeets.ratingAvg || "0.0"}</p>
                    </div>
                </div>
            </div>
            <hr/>
            
            {itemDeets.status == "AVAILABLE" &&
            <div className='itemsRecommended'>
             <Recommendation itemName={itemDeets.itemName} userId={userID}/> 
            </div>}

          {/* View Image Modal */}
          {showEnlargeImg && (
            <div className="image-preview-overlay">
              <div className="image-preview-container">
                <div className="image-preview-header">
                  <h3></h3>
                  <button className="close-preview-btn" onClick={(e) => {setShowEnlargeImg(false); setEnlargeImg("");}}>
                    ×
                  </button>
                </div>
                <div className="image-preview-content">
                  <img src={enlargedImg} alt="Preview" className="popup-preview-image" />
                </div>
              </div>
            </div>
          )}

        </div>
    </div>
    )
  }
}

export default Itemdetails

