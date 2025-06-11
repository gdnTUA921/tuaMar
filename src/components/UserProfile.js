import React, { useState, useEffect } from "react";
import { useNavigate, Link, useParams} from "react-router-dom";
import { Flag, Heart, X, Search} from "lucide-react";
import "./MyProfile.css";

function UserProfile() {
  const [activeTab, setActiveTab] = useState("myListings");
  const [searchQuery, setSearchQuery] = useState("");

  const [userData, setUserData] = useState([]);
  const [userId, setUserId] = useState("");

  const navigate = useNavigate();
  const { userId: sellerId } = useParams();


  const ip = process.env.REACT_APP_LAPTOP_IP; //IP address (see env file for set up)
  useEffect(() => {

    //Checking if logged in, if not redirected to log-in
    fetch(`${ip}/tua_marketplace/fetchSession.php`, {
      method: "GET",
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        if (!data.user_id) {
          navigate("/"); // Redirect to login if not authenticated
        }
        
        if (sellerId == data.user_id){
          navigate("/myProfile");
        }

        setUserId(data.user_id);
      })
      .catch((error) => {
        console.error("Error fetching session data:", error);
      });


    //fetching account user details
    fetch(`${ip}/tua_marketplace/fetchUserProfileDeets.php`, {
      method: "POST",
      credentials: "include",
      body: JSON.stringify({
        user_id: sellerId,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        setUserData(data);
      })
      .catch((error) => {
        console.error("Error fetching user data:", error);
      });

    //fetching items owned by account owner
    fetch(`${ip}/tua_marketplace/fetchUserProfileItems.php`, {
      method: "POST",
      credentials: "include",
      body: JSON.stringify({
        user_id: sellerId,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        setItem(data);
      })
      .catch((error) => {
        console.error("Error fetching session data:", error);
      });

  }, []);
  

  const [item, setItem] = useState([]);

  // Filter items based on search input
  const filteredItems = item.filter((item) =>
    item.item_name.toLowerCase().includes(searchQuery.toLowerCase())
  );


//for setting likes
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


  return (
    <>
      <main>
        {/* PROFILE */}
        <div className="profile-container">
          <div className="profile-nameBox">
            <div className="profile-coverBG"></div>
            <div className="profile-pic">
              <img src={userData.profile_pic} alt="Profile Photo" />
            </div>
            <div className="profile-name">
              <h1>{userData.first_name + " " + userData.last_name}</h1>
              <p>{userData.email}</p>
              <div className="rating-container">
                <span id="starReview">
                  <i className="bi bi-star-fill"></i>
                </span>
                <p className="rating-score">{"0.0"}</p>
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
                      <div className="soldBanner" style={{display: item.status == "SOLD" ? "block" : "none"}}> {/*set this up if item is considered SOLD*/}
                        SOLD
                      </div>
                       <div className="reservedBanner" style={{display: item.status == "RESERVED" ? "block" : "none"}}> {/*set this up if item is considered RESERVED*/}
                        RESERVED
                      </div>
                        <Link
                        to={`/itemdetails/${item.item_id}/${item.item_name}`}
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
                            to={`/itemdetails/${item.item_id}/${item.item_name}`}
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
              <div className='reviewCard'>
                <div className="profile-reviews">
                  <img src="https://lh3.googleusercontent.com/a/ACg8ocL0ay37DbsBCGDn_jmSQ2eFz3NJoFRlmcAc0gNp0llDGfPAYaY=s1000-p-k-rw-no" alt="Profile Photo" />
                  <p>{"Giancarlo Nonato"}</p>
                  <p>&#x2022;&nbsp;Review from {"buyer"}</p>
                  <p>{"10/30/2025"}</p>
                </div>

                <div className="stars">
                  <i class="bi bi-star-fill"></i>
                  <i class="bi bi-star-fill"></i>
                  <i class="bi bi-star-fill"></i>
                  <i class="bi bi-star-fill"></i>
                  <i class="bi bi-star-fill"></i>
                </div>

                <div className="review-description">
                  <p>Seller is very friendly and easy to deal with. Hope we can do more transactions again soon.</p>
                </div>

                <hr/>
              </div>

              <div className='reviewCard'>
                <div className="profile-reviews">
                <img src="https://lh3.googleusercontent.com/a-/ALV-UjUWuYwvrpzPj7i5lL5Zcz99CCVQl1zzI9B2cbu2kx1fdjKWSKw=s1000-p-k-rw-no" alt="Profile Photo" />
                <p>{"Jandrik Lana"}</p>
                <p>&#x2022;&nbsp;Review from {"seller"}</p>
                <p>{"09/21/2025"}</p>
                </div>

                <div className="stars">
                  <i className="bi bi-star-fill"></i>
                  <i className="bi bi-star-fill"></i>
                  <i className="bi bi-star-fill"></i>
                  <i className="bi bi-star-fill"></i>
                  <i className="bi bi-star"></i>
                </div>

                <div className="review-description">
                  <p>Buyer is very friendly and easy to deal with. To more deals to come.</p>
                </div>

                <hr/>
              </div>
                 
          </div>

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
                      <td>{userData.regDate}</td>
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

export default UserProfile;
