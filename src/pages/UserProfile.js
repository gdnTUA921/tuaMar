import React, { useState, useEffect } from "react";
import { useNavigate, Link, useParams} from "react-router-dom";
import { Flag, Heart, X, Search} from "lucide-react";
import "../assets/MyProfile.css";
import LoaderPart from "../components/LoaderPart";

function UserProfile() {

  const [loading, setLoading] = useState(true); //For loading state

  const [activeTab, setActiveTab] = useState("myListings");
  const [searchQuery, setSearchQuery] = useState("");

  const [userData, setUserData] = useState([]);
  const [userId, setUserId] = useState("");

  const [userReviewData, setUserReviewData] = useState([]);

  const navigate = useNavigate();
  const { userName: userName } = useParams();


  const ip = process.env.REACT_APP_LAPTOP_IP; //IP address (see env file for set up)

  
  //New state for large image viewing modal
  const [showEnlargeImg, setShowEnlargeImg] = useState(false);
  const [enlargedImg, setEnlargeImg] = useState("");


  useEffect(() => {
  const fetchData = async () => {

    console.log(userName);

    try {
      // Fetching session
      const sessionRes = await fetch(`${ip}/fetchSession.php`, {
        method: "GET",
        credentials: "include",
      });
      const sessionData = await sessionRes.json();

      if (!sessionData.user_id) {
        navigate("/");
        return;
      }

      if (userName === sessionData.full_name) {
        navigate("/myProfile");
        return;
      }

      setUserId(sessionData.user_id);

      // Fetch user profile & listings concurrently
      const [profileRes, itemsRes] = await Promise.all([
        fetch(`${ip}/fetchUserProfileDeets.php`, {
          method: "POST",
          credentials: "include",
          body: JSON.stringify({ user_name: userName }),
        }),
        fetch(`${ip}/fetchUserProfileItems.php`, {
          method: "POST",
          credentials: "include",
          body: JSON.stringify({ user_name: userName }),
        }),
      ]);

      const profileData = await profileRes.json();
      const itemsData = await itemsRes.json();

      if (profileData.user_id == null){
       navigate("/error404", {replace: true});
      }
      else{
        setUserData(profileData);
        setItem(itemsData);
      }

      if (profileData.is_banned === 1){
        navigate("/error404", {replace: true});
      }
      

      //Step 5: Fetch user review data
      const reviewDataRes = await fetch(`${ip}/fetchUserReviewData.php`, {
        method: "POST",
        body: JSON.stringify({user_id: profileData.user_id}),
      });

      const reviewData = await reviewDataRes.json();
      setUserReviewData(reviewData);


    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false); // Hide loader after all data is fetched
    }
  };

  fetchData();
}, [userName, activeTab]);

  

  const [item, setItem] = useState([]);

  // Filter items based on search input
  const filteredItems = item.filter((item) =>
    item.item_name.toLowerCase().includes(searchQuery.toLowerCase())
  );


//for setting likes
const [liked, setLiked] = useState({});
useEffect(() => {
  if (userId) {
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
  }
}, [userId]);


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

if (loading) {
  return (
    <div className="profile-loader-container">
      <LoaderPart />
    </div>
  );
}

else{
    return (
      <>
        <main>
          {/* PROFILE */}
          <div className="profile-container">
            <div className="profile-nameBox">
              <div className="profile-coverBG"></div>
              <div className="profile-pic">
                <img 
                  src={userData.profile_pic || "/tuamar-profile-icon.jpg"} 
                  alt="Profile Photo" 
                  onError={(e) => (e.target.src = "/tuamar-profile-icon.jpg")}
                />
              </div>
              <div className="profile-name">
                <h1>{userData.first_name + " " + userData.last_name}</h1>
                <p>{userData.email}</p>
                <div className="rating-container">
                  <span id="starReview">
                    <i className="bi bi-star-fill"></i>
                  </span>
                  <p className="rating-score">{userData.ratingAvg || "0.0"}</p>
                </div>
              </div>
            </div>

            {/* PROFILE TABS */}
            <div className="profile-tabs">
              <div className="navMenu">
                <a href="#myListings" onClick={() => setActiveTab("myListings")}>
                  Listings
                </a>
                <a href="#reviews" onClick={() => setActiveTab("reviews")}>
                  Reviews
                </a>
                <a href="#userDetails" onClick={() => setActiveTab("details")}>
                  User Details
                </a>
              </div>
            </div>

            {/* Listings Tab */}
            <div className="myListings" style={{ display: activeTab === "myListings" ? "block" : "none" }}>
              <div className="listingCard">
                <h2>Listings</h2>

                <div className="search-container">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search items..."
                  />
                </div>

                <div className="items">
                  {filteredItems.length > 0 ? (
                    filteredItems.map((item) => (
                      <div className="itemCard" key={item.item_id}>
                        <div className="soldBanner" style={{display: item.status === "SOLD" ? "block" : "none"}}> {/*set this up if item is considered SOLD*/}
                          SOLD
                        </div>
                        <div className="reservedBanner" style={{display: item.status === "RESERVED" ? "block" : "none"}}> {/*set this up if item is considered RESERVED*/}
                          RESERVED
                        </div>
                        <Link
                          to={`/itemdetails/${item.item_id}/${encodeURIComponent(item.item_name)}`}
                          className="item-details-link"
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
                        <Link to="/reportitem"  className="browse-flag" state={{ passedID: item.item_id, previewPic: item.preview_pic, itemName: item.item_name }} style={{display: userId === item.user_id ? "none" : "block"}} >
                          <Flag size={20} />
                        </Link>
                      </div>

                          <div className="price-condition">
                            <p></p>
                            <p>&#8369;{item.price}</p>
                            <p>&#x2022; {item.item_condition}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p><b>No items found.</b></p>
                  )}
                </div>
              </div>
            </div>

          {/* Reviews Tab */}
          <div className="reviews" style={{ display: activeTab === "reviews" ? "block" : "none" }}>
              <h2>Reviews</h2>

              {userReviewData.length > 0 ? (userReviewData.map((rev) => (
                  <div className='reviewCard' key={rev.reviewer_id}>
                    <div className="profile-reviews">
                      <Link to={`/userProfile/${rev.userName}`} className="sellerLink"><img src={rev.profile_pic || "tua-mar-profile-icon.jpg"} alt="Profile Photo" /></Link>
                      <p><Link to={`/userProfile/${rev.userName}`} className="sellerLink">{rev.userName}</Link></p>
                      <p>&#x2022;&nbsp;Review from {rev.reviewer_status}</p>
                      <p>{new Date(rev.time_stamp).toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    </div>

                    <div className="stars">
                      {[1,2,3,4,5].map ((star, index) => (
                          <i key={index} className={rev.rating >= star ? "bi bi-star-fill" : "bi bi-star"}></i>
                      ))}
                    </div>

                    <div className="review-description">
                      <p>{rev.reviewText}</p>
                    </div>

                    <div className="review-images">
                      {rev.images && rev.images.length > 0 ? (rev.images.map((img, index) => (       
                          <img key={index} src={img || "/default-image.png"} onError={(e) => (e.target.src = "/default-image.png")} className="review-image" onClick={() => {setShowEnlargeImg(true); setEnlargeImg(img)}}/>
                      ))) : ("")}
                    </div>
                  

                    <hr/>
                  </div>
                ))
              ) : (<div className="no-reviews">No reviews for&nbsp;<span className="spanName">{userData.first_name + " " + userData.last_name}.</span>&nbsp;</div>)}
          </div>

          
          {/* View Image Modal For Review Pics*/}
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
                  <img src={enlargedImg || "/default-image.png"} alt="Preview" className="popup-preview-image" onError={(e) => (e.target.src = "/default-image.png")}/>
                </div>
              </div>
            </div>
          )}


            {/* Settings Tab */}
            <div className="settings" style={{ display: activeTab === "details" ? "block" : "none" }}>
                <h2>User Details</h2>
                <div className="settingsCard">
                <table>
                    <tbody>
                      <tr>
                        <td><b>Account Type</b></td>
                        <td>{userData.user_type}</td>
                      </tr>
                      <tr>
                        <td><b>User ID</b></td>
                        <td>{userData.user_id}</td>
                      </tr>
                      <tr>
                        <td><b>Email</b></td>
                        <td>{userData.email}</td>
                      </tr>
                      <tr>
                        <td><b>Department</b></td>
                        <td>{userData.department}</td>
                      </tr>
                      <tr>
                        <td><b>Date Registered</b></td>
                        <td>{new Date(userData.regDate).toLocaleDateString("en-US", { month: 'long', day: 'numeric', year: 'numeric' })}</td>
                      </tr>
                    </tbody>
                  </table>
                  <br/><hr/>
                </div>
                
            </div>
          </div>
        </main>
      </>
    );
  }
}

export default UserProfile;
