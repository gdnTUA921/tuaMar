  import React, { useEffect, useState } from 'react';
  import './MyProfile.css';
  import { Link, useNavigate } from "react-router-dom";
  import { Heart, Flag } from "lucide-react";
  import LoaderPart from './LoaderPart';
  import { display } from '@mui/system';


  function Recommendation({itemName, userId}) {
    
    const ip = process.env.REACT_APP_LAPTOP_IP; // from .env file (e.g., 192.168.1.10)

    const [recommendations, setRecommendations] = useState([]); //setting up recommendations

    const [isloading, setIsLoading] = useState(true); // for loading state


   /* -- this section is for liked items -- */

   // for fetching likes
  const [liked, setLiked] = useState({});
  useEffect(() => {
    if (userId) {
      fetch(`${ip}/tua_marketplace/fetchLikedItems.php?user_id=${userId}`, {
        credentials: "include",
      })
        .then((res) => res.json())
        .then((likedItemsData) => {
          const likedMap = {};
          likedItemsData.forEach((item) => {
            likedMap[item.item_id] = true;
          });
          setLiked(likedMap);
        })
        .catch((error) => {
          console.error("Error fetching liked items:", error);
        });
    }
  }, [userId]);
  
  
     // for setting or toggling likes
    const toggleLike = (item) => {
    const isLiked = !liked[item.item_id]; // Toggle like
  
    // Update local state immediately
    setLiked((prevLiked) => ({
      ...prevLiked,
      [item.item_id]: isLiked,
    }));
  
    // Send like/unlike to the backend
    fetch(`${ip}/tua_marketplace/InsertLikeditems.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: userId,
        item_id: item.item_id,
        item_name: item.item_name,
        description: item.description,
        category: item.category,
        preview_pic: item.previewpic,
        liked: isLiked,
      }),
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Fetched data:", data);
        // Optionally refresh liked items
    });
  };

  {/* fetching items based only to the clicked item*/}
  useEffect(() => {
    if (itemName) {
      fetch(`http://localhost:5050/recommend-item`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ item_name: itemName }),
      })
        .then((res) => res.json())
        .then((data) => {
          console.log("Fetched recommendations:", data);
          setRecommendations(data); // this should be an array
          setIsLoading(false);
        })
        .catch((err) => {
          console.error("Recommendation fetch failed:", err);
        });
    }
  }, [itemName]);


    if (isloading == true){
      return (
      <div className="recommendation-container" style={{display: "flex", alignItems: "center", justifyContent: "center", height:"20vh"}}>
        <LoaderPart/>
      </div>
      );
    }

    else{
      return (
        <div className="recommendation-container">
          <h1>Similar Listings</h1>
                <div className="listingCard">
                  <div className="items">
                    {recommendations.length > 0 ? (
                      recommendations.map((item) => (
                        <div className="itemCard" key={item.item_id}>
                          <Link
                            to={`/itemdetails/${item.item_id}/${encodeURIComponent(item.item_name)}`}
                            className="item-details-link"
                          >
                                <img
                                    src={item.preview_pic}
                                    style={{
                                    width: "180px",
                                    height: "180px",
                                    border: "3px solid green",
                                    borderRadius: "12px",
                                    alignItems: "center",
                                    marginLeft: "5.5px"
                                    }}
                                    alt="Item"
                                />
                            </Link>

                            <div className="itemDeets">
                                <Link
                                to={`/itemdetails/${item.item_id}/${encodeURIComponent(item.item_name)}`}
                                className="item-details-link">     
                                    <div className="itemTitle">
                                    <h3>{item.item_name}</h3>
                                    </div>
                                </Link>

                        <div className="listButtons">
                          <Heart className="heart" onClick={() => toggleLike(item)} fill= {liked[item.item_id] ?'green' : 'none'} color= {liked[item.item_id] ?'green' : 'black'}/>
                          <Link to="/reportitem"  className="browse-flag" state={{ passedID: item.item_id, previewPic: item.preview_pic, itemName: item.item_name }} style={{display: userId == item.user_id ? "none" : "block"}} >
                            <Flag size={20} />
                          </Link>
                        </div>

                        <div className="price-condition">
                          <p></p>
                          <p>&#8369;{item.price}</p>
                          <p>&#x2022; {item.item_condition}</p>
                          </div>
                        </div>

                        <Link to={userId == item.user_id ? "/myProfile" : `/userProfile/${item.user_id}`} className="sellerLink">
                          <div className="itemSeller">
                            <img src={item.profile_pic || "/tuamar-profile-icon.jpg"} />
                            <p>
                              {item.first_name}
                              <br />
                              {item.last_name}
                            </p>
                          </div>
                        </Link>


                        </div>
                      ))
                    ) : (
                      <p><b>No items found.</b></p>
                    )}
                  </div>
                </div>

        </div>
      );
    }


  }


  export default Recommendation;
