  import React, { useEffect, useRef, useState } from 'react';
  import '../assets/Recomm.css';
  import { Link, useNavigate } from "react-router-dom";
  import { Heart, Flag, ChevronLeft, ChevronRight } from "lucide-react";
  import LoaderPart from './LoaderPart';


  function RecommItemsHighlyRated({userId, onFetchFail, isNotLoading}) {
    const scrollRef = useRef(null);
    
    const ip = process.env.REACT_APP_LAPTOP_IP; // from .env file (e.g., 192.168.1.10)

    const [recommendations, setRecommendations] = useState([]); //setting up recommendations

    const [isloading, setIsLoading] = useState(true); // for loading state


    /* -- For Scrolling Left or Right -- */
    const scrollLeft = () => {
        if (scrollRef.current) {
        scrollRef.current.scrollBy({ left: -275, behavior: 'smooth' }); // adjust pixel value as needed
        }
    };

    const scrollRight = () => {
        if (scrollRef.current) {
        scrollRef.current.scrollBy({ left: 275, behavior: 'smooth' }); // adjust pixel value
        }
    };


   /* -- this section is for liked items -- */

   // for fetching likes
    const [liked, setLiked] = useState({});
    useEffect(() => {
    let intervalId;

    const fetchLikedItems = () => {
        if (!userId) return;

        fetch(`${ip}/fetchLikedItems.php?user_id=${userId}`, {
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
    };

    // Initial fetch
    fetchLikedItems();

    // Poll every 10 seconds
    intervalId = setInterval(fetchLikedItems, 10000);

    // Cleanup
    return () => clearInterval(intervalId);

    }, [userId, ip]);
  
  
     // for setting or toggling likes
    const toggleLike = (item) => {
    const isLiked = !liked[item.item_id]; // Toggle like
  
    // Update local state immediately
    setLiked((prevLiked) => ({
      ...prevLiked,
      [item.item_id]: isLiked,
    }));
  
    // Send like/unlike to the backend
    fetch(`${ip}/InsertLikeditems.php`, {
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

  {/* fetching items from highly rated sellers within the last 30 days*/}
  useEffect(() => {

      fetch(`${ip}/fetchItemsHighlyRated.php`, {
        method: "GET",
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then((res) => res.json())
        .then((data) => {
          const shuffled = [...data].sort(() => Math.random() - 0.5);
          setRecommendations(shuffled); 
          setIsLoading(false);
          if (isNotLoading) isNotLoading();  // Notify parent to stop loading state
          
          if ((Array.isArray(data) && data.length === 0) || data.message === "Error: Failed to Fetch Recently Posted Listings.") {
            if (onFetchFail) onFetchFail(); // Notify parent if fetch fails
            if (isNotLoading) isNotLoading();  // Notify parent to stop loading state
          }
        })
        .catch((err) => {
          console.error("Recommendation fetch failed:", err);
          setIsLoading(false);
          if (onFetchFail) onFetchFail();  // Notify parent if fetch fails
          if (isNotLoading) isNotLoading();  // Notify parent to stop loading state
        });

  }, [userId]);


    if (isloading == true){
      return (
      <div className="recommendation-container" style={{display: "flex", alignItems: "center", justifyContent: "center", height:"20vh"}}>
        <LoaderPart/>
      </div>
      );
    }

    else{
      return (
        <div className="recommend-container">
          <h1>From Highly Rated Sellers</h1>
          <div className='recomm-flexcon'>
            <div className="recomm-scroll-controls">
                <button onClick={scrollLeft} className="scroll-button left"><ChevronLeft/></button>
            </div>
                    <div className="recomm-listingCard" ref={scrollRef}>
                    <div className="recomm-items">
                        {recommendations.length > 0 ? (
                        recommendations.map((item) => (
                            <div className="recomm-itemCard" key={item.item_id}>
                                <Link
                                    to={`/itemdetails/${item.item_id}/${encodeURIComponent(item.item_name)}`}
                                    className="recomm-item-details-link"
                                >
                                        <img
                                            src={item.preview_pic || "/default-image.png"}
                                            onError={(e) => (e.target.src = "/default-image.png")}
                                            style={{
                                              width: "180px",
                                              height: "180px",
                                              border: "3px solid green",
                                              borderRadius: "12px",
                                              alignItems: "center",
                                              marginLeft: "5.5px"
                                            }}
                                            alt={item.item_name}
                                        />
                                    </Link>

                                    <div className="recomm-itemDeets">
                                        <Link
                                        to={`/itemdetails/${item.item_id}/${encodeURIComponent(item.item_name)}`}
                                        className="recomm-item-details-link">     
                                            <div className="recomm-itemTitle">
                                            <h3>{item.item_name}</h3>
                                            </div>
                                        </Link>

                                <div className="recomm-listButtons">
                                    <Heart className="recomm-heart" onClick={() => toggleLike(item)} fill= {liked[item.item_id] ?'green' : 'none'} color= {liked[item.item_id] ?'green' : 'black'}/>
                                    <Link to="/reportitem"  className="recomm-browse-flag" state={{ passedID: item.item_id, previewPic: item.preview_pic, itemName: item.item_name }} style={{display: userId == item.user_id ? "none" : "block"}} >
                                        <Flag size={20} />
                                    </Link>
                                </div>

                                <div className="recomm-price-condition">
                                    <p></p>
                                    <p>&#8369;{item.price}</p>
                                    <p>&#x2022; {item.item_condition}</p>
                                    </div>
                                </div>

                                <Link to={userId == item.user_id ? "/myProfile" : `/userProfile/${item.first_name + " " + item.last_name}`} className="recomm-sellerLink">
                                <div className="recomm-itemSeller">
                                    <img 
                                      src={item.profile_pic || "/tuamar-profile-icon.jpg"} 
                                      alt="Seller" 
                                      onError={(e) => (e.target.src = "/tuamar-profile-icon.jpg")}
                                    />
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
                <div className="recomm-scroll-controls">
                    <button onClick={scrollRight} className="scroll-button right"><ChevronRight/></button>
                </div>
          </div>

        </div>
      );
    }


  }


  export default RecommItemsHighlyRated;
