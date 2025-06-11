import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation} from "react-router-dom";
import { Heart, Flag, SquarePen, Trash2 } from "lucide-react";
import "./MyProfile.css";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content'; 

function MyProfile() {
  const MySwal = withReactContent(Swal);

  const [userId, setUserId] = useState("");
  const [activeTab, setActiveTab] = useState("myListings");
  const [searchQuery, setSearchQuery] = useState("");
  const [myListings, setMyListings] = useState([]);
  const [likedItems, setLikedItems] = useState([]);

  /* (For change password in case implemented)
  const [oldPasswordType, setOldPasswordType] = useState("password");
  const [newPasswordType, setNewPasswordType] = useState("password");
  const [confirmPasswordType, setConfirmPasswordType] = useState("password");

  const [oldPassView, setOldPassView] = useState("bi bi-eye-fill");
  const [newPassView, setNewPassView] = useState("bi bi-eye-fill");
  const [confirmPassView, setConfirmPassView] = useState("bi bi-eye-fill");*/

  const [userData, setUserData] = useState([]);

  const navigate = useNavigate();
  const myListingsArray = Array.isArray(myListings) ? myListings : [];
  const likedItemsArray = Array.isArray(likedItems) ? likedItems : [];




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
        setUserId(data.user_id);
      })
      .catch((error) => {
        console.error("Error fetching session data:", error);
      });


    //fetching account owner details
    fetch(`${ip}/tua_marketplace/fetchMyProfileDeets.php`, {
      method: "GET",
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        setUserData(data);
      })
      .catch((error) => {
        console.error("Error fetching session data:", error);
      });

    //fetching account owner's liked items
    fetch(`${ip}/tua_marketplace/fetchLikedItems.php?`, {
      method: "GET",
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        setLikedItems(data);
      })
      .catch((error) => {
        console.error("Error fetching liked items:", error);
      });
  }, [activeTab]);
  

  /* (For change password in case implemented)
  const togglePassword = (field) => {
    if (field === "oldPassword") {
      setOldPasswordType(oldPasswordType === "password" ? "text" : "password");
      setOldPassView(oldPassView === "bi bi-eye-fill" ? "bi bi-eye-slash-fill" : "bi bi-eye-fill");
    } 
    else if (field === "newPassword") {
      setNewPasswordType(newPasswordType === "password" ? "text" : "password");
      setNewPassView(newPassView === "bi bi-eye-fill" ? "bi bi-eye-slash-fill" : "bi bi-eye-fill");
    } 
    else if (field === "confirmPassword") {
      setConfirmPasswordType(confirmPasswordType === "password" ? "text" : "password");
      setConfirmPassView(confirmPassView === "bi bi-eye-fill" ? "bi bi-eye-slash-fill" : "bi bi-eye-fill");
    }
  };*/




//function for marking item as SOLD / RESERVED / AVAILABLE
  const handleItemStatus = (itemStatus, itemId) => {
    MySwal.fire({
      title: "Mark this listing as " + itemStatus + "?",
      text: "Are you sure you want to mark this listing as " + itemStatus + "?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#547B3E",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes"
    }).then((result) => {
      if (result.isConfirmed) {

        let updateStatus;
        let message;

        fetch (`${ip}/tua_marketplace/setItemStatus.php`, {
          method: "POST",
          body: JSON.stringify({itemStatus, itemId}),
          credentials: "include",
          headers: {
            "Content-Type": "application/json"  // ✅ ensure correct header
          },
        })
        .then ((response) => response.json())
        .then ((data) => { 
            console.log(data.updateStatus);
            updateStatus = data.updateStatus;
            message = data.message;

            if (updateStatus == "success") {

              if (itemStatus === "Sold"){
                message = "Congratulations! This item is now marked Sold.";
              }
             
              else if (itemStatus === "Reserved") {
                message = "This item is now marked Reserved.";
              } 
              
              else {
                message = "This item is now marked Available.";
              }

              MySwal.fire({
                title: itemStatus.toUpperCase() + "!",
                text: message,
                icon: "success",
                confirmButtonColor: "#547B3E",
              }).then((result) => {
                  if (result.isConfirmed){
                    window.location.reload();
                  }
              });
            }

            else {
              MySwal.fire({
                title: "Failure to Update Status!",
                text: "Failed to Update Listing Status",
                icon: "error",
                confirmButtonColor: "#547B3E",
              }).then((result) => {
                  if (result.isConfirmed){
                    window.location.reload();
                  }
              });
            }
        })

        .catch((error) => {
          console.error("Error updating listing status:", error);
        });
      }
    });
  }



  //function for DELETING the item
  const handleDelete = (itemId, item_name) => {
    MySwal.fire({
      title: "Delete This Listing?",
      html: "<br>Are you sure you want to delete this listing? <br><br><strong>" + item_name + "</strong>",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#547B3E",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes"
    }).then((result) => {

      if (result.isConfirmed) {
        //processing the deletion
        fetch(`${ip}/tua_marketplace/deleteItem.php?`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json"  // ✅ ensure correct header
          },
          body: JSON.stringify({item_id: itemId}),
        })
          .then((response) => response.json())
          .then((data) => {
            console.log(data);
            MySwal.fire({
              title: "DELETED!",
              text: "Item successfully deleted.",
              icon: "success",
              confirmButtonColor: "#547B3E",
            }).then((result) => {
              if (result.isConfirmed){
                window.location.reload();
              }
            });
          })
          .catch((error) => {
            console.error("Error fetching liked items:", error);
          });
      }
    });
  }

  //fetching items owned and the number of likes per item
  const [numLikes, setNumLikes] = useState({})
  useEffect(() => {

    const fetchMyProfileItems = async () => {
    
      try{
        //fetching items owned by account owner
        const res1 = await fetch(`${ip}/tua_marketplace/fetchMyProfileItems.php`, {
          method: "GET",
          credentials: "include",
        });
        const data = await res1.json();
        setMyListings(data);

        //fetching number of likes from the items owned by account owner
        const res2 = await fetch(`${ip}/tua_marketplace/fetchLikeCount.php`, {
          credentials: "include",
          method: "POST",
          body: JSON.stringify({myListings: data}),
        });
        const likeCounts = await res2.json();
        console.log(likeCounts);
        setNumLikes(likeCounts);
      }
      
      catch (error) {
        console.error("Error:", error);
      }

    };
    
    if (userId){
      fetchMyProfileItems();
    }
    
  }, [userId, activeTab]);

   


  const [item, setItem] = useState([]);

  // Filter items based on search input
  let filteredItems = [];
  //this is to avoid item or search conflicts between MyListings and LikedItems
  if (activeTab === "myListings") {
    filteredItems = [
      ...myListingsArray.map(item => ({ ...item, source: 'my' }))
    ].filter(item =>
      item.item_name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  } else if (activeTab === "liked") {
    filteredItems = [
      ...likedItemsArray.map(item => ({ ...item, source: 'liked' }))
    ].filter(item =>
      item.item_name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }



   //this section is for liked items
   // for setting likes
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
                My Listings
              </a>
              <a href="#reviews" onClick={() => setActiveTab("reviews")}>
                Reviews
              </a>
              <a href="#userDetails" onClick={() => setActiveTab("details")}>
                User Details
              </a>
               <a href="#likedItems" onClick={() => setActiveTab("liked")}>
                Liked Items
              </a>
            </div>
          </div>

          {/* Listings Tab */}
          <div className="myListings" style={{ display: activeTab === "myListings" ? "block" : "none" }}>
            <div className="listingCard">
              <h2>My Listings</h2>

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
                       <div className="reviewBanner" style={{display: item.status == "IN REVIEW" ? "block" : "none"}}> {/*set this up if item is considered UNDER REVIEW*/}
                        IN REVIEW
                      </div>
                      <Link
                        to={`/itemdetails/${item.item_id}/${item.item_name}`}
                        className="item-details-link"> 
                        <img
                          src={item.preview_pic}
                          style={{
                            width: "180px",
                            height: "180px",
                            border: "3px solid green",
                            borderRadius: "10px",
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
                        <i className="bi bi-heart-fill heart1"></i>
                        <p className="heartCount1">{numLikes[item.item_id]}</p>

                        <div className="price-condition">
                          <p></p>
                          <p>&#8369;{item.price}</p>
                          <p>&#x2022; {item.item_condition}</p>
                        </div>
                        
                        <div className="actionButtons">
                            <button className="editListButton" onClick={() => navigate("/editListing", {state: { passedID: item.item_id, passedName: item.item_name }})} ><SquarePen/>EDIT</button>
                            <button className="deleteListButton" onClick={() => handleDelete(item.item_id, item.item_name)}><Trash2 color="red"/>DELETE</button>
                        </div>
                        <button className="reserveButton" onClick={() => handleItemStatus("Reserved", item.item_id)} style={{display: item.status == "AVAILABLE" || item.status == "IN REVIEW" ? "block" : "none"}} disabled={item.status === "IN REVIEW"}>MARK RESERVED</button>
                        <button className="sold-or-availableButton" onClick={() => handleItemStatus("Sold", item.item_id)} disabled={item.status === "IN REVIEW" || item.status == "SOLD"}>MARK SOLD</button>
                        <button className="sold-or-availableButton" onClick={() => handleItemStatus("Available", item.item_id)} style={{display: item.status == "SOLD" || item.status == "RESERVED" ? "block" : "none"}}>MARK AVAILABLE</button>
                      </div>
                    </div>
                  ))
                ) : (
                  <h3><b>No items found.</b></h3>
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

                {/* (For change password in case implemented)
                <h3>Change Password</h3><br/>
                
                <form action="">
                  <label>Enter Old Password:</label>
                  <div class="password-wrapper">
                      <input type={oldPasswordType} id="password1" placeholder="Old Password" name="oldPass"/>
                      <i id="eyeBtn_1" className={oldPassView} onClick={() => togglePassword("oldPassword")}></i>
                  </div><br/><br/>

                  <label>Enter New Password:</label>
                  <div class="password-wrapper">
                      <input type={newPasswordType} id="password2" placeholder="New Password" name="newPass"/>
                      <i id="eyeBtn2" className={newPassView} onClick={() => togglePassword("newPassword")}></i>
                  </div><br/><br/>

                  <label>Confirm New Password:</label>
                  <div class="password-wrapper">
                      <input type={confirmPasswordType} id="password3" placeholder="Confirm New Password" name="confirmPass"/>
                      <i id="eyeBtn3" className={confirmPassView} onClick={() => togglePassword("confirmPassword")}></i>
                  </div>

                  <center><button>Update</button></center>
                </form>*/}
              </div>
              
          </div>
            <div className="likeditems" style={{ display: activeTab === "liked" ? "block" : "none" }}>
              <div className="listingCard">
              <h2>Liked Items</h2>

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
                    <Link
                      to={`/itemdetails/${item.item_id}/${item.item_name}`}
                      className="item-details-link"
                    >
                      <img
                        src={item.preview_pic}
                        alt={item.item_name}
                        style={{
                          width: "180px",
                          height: "180px",
                          border: "3px solid green",
                          borderRadius: "12px",
                          objectFit: "cover",
                          marginLeft: "5.5px",
                          padding: "0"
                        }}
                      />
                    </Link>

                    <div className="itemDeets">
                      <Link
                        to={`/itemdetails/${item.item_id}/${item.item_name}`}
                        className="item-details-link"
                      >
                        <div className="itemTitle">
                          <h3>{item.item_name}</h3>
                        </div>
                      </Link>

                      <div className="listButtons">
                        <Heart className="heart" onClick={() => toggleLike(item)} fill= {liked[item.item_id] ?'green' : 'none'} color= {liked[item.item_id] ?'green' : 'black'}/>
                        <Link to="/reportitem" className="browse-flag" state={{ passedID: item.item_id, previewPic: item.preview_pic, itemName: item.item_name }} style={{display: userId == item.user_id ? "none" : "block"}} >
                          <Flag size={20} />
                        </Link>
                      </div>

                        <div className="price-condition">
                          <p></p>
                          <p>&#8369;{item.price}</p>
                          <p>&#x2022; {item.item_condition}</p>
                        </div>

                      <Link to={userId == item.user_id ? "/myProfile" : `/userProfile/${item.user_id}`} className="sellerLink">
                      <div className="itemSeller">
                        <img src={item.profile_pic} />
                        <p></p>
                        <p>
                          {item.first_name}
                          <br />
                          {item.last_name}
                        </p>
                      </div>
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <h3><b>No items found.</b></h3>
              )}
                </div>
              </div>       
            </div>
        </div>
      </main>
    </>
  );
}

export default MyProfile;