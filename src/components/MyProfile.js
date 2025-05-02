import React, { useState, useEffect} from "react";
import "./MyProfile.css";

function MyProfile() {
  const [activeTab, setActiveTab] = useState("myListings");
  const [searchQuery, setSearchQuery] = useState("");

  const [oldPasswordType, setOldPasswordType] = useState("password");
  const [newPasswordType, setNewPasswordType] = useState("password");
  const [confirmPasswordType, setConfirmPasswordType] = useState("password");

  const [oldPassView, setOldPassView] = useState("bi bi-eye-fill");
  const [newPassView, setNewPassView] = useState("bi bi-eye-fill");
  const [confirmPassView, setConfirmPassView] = useState("bi bi-eye-fill");


  const ip = process.env.REACT_APP_LAPTOP_IP; //IP address (see env file for set up)
  useEffect(() => {
    fetch(`${ip}/tua_marketplace/fetchSession.php`, {
      method: "GET",
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Session Data:", data);
        alert(`Session Email: ${data.email}`);
      })
      .catch((error) => {
        console.error("Error fetching session data:", error);
      });
  }, [ip]);
  


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
  };


  const items = [
    { id: 1, title: "Jollibee Sanrio Happy Meal Collection", price: 600, condition: "Like New" },
    { id: 2, title: "NBA Cards - Victor Wembanyama Top Class Rookie Card (RC)", price: 600, condition: "Like New" },
    { id: 3, title: "ITEM #3", price: 600, condition: "Like New" },
    { id: 4, title: "ITEM #4", price: 600, condition: "Like New" },
    { id: 5, title: "ITEM #5", price: 600, condition: "Like New" },
    { id: 6, title: "ITEM #6", price: 600, condition: "Like New" },
    { id: 7, title: "ITEM #7", price: 600, condition: "Like New" },
    { id: 8, title: "ITEM #8", price: 600, condition: "Like New" },
  ];

  // Filter items based on search input
  const filteredItems = items.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <main>
        {/* PROFILE */}
        <div className="profile-container">
          <div className="profile-nameBox">
            <div className="profile-coverBG"></div>
            <div className="profile-pic">
              <img src="https://lh3.googleusercontent.com/a-/ALV-UjUIStqWY_RaxX007NIEzp3CHWWc_H0573ci0o-N61I=s1000" alt="Profile Photo" />
            </div>
            <div className="profile-name">
              <h1>{"Elisha Marie Vea Daliba"}</h1>
              <p>{"elishamarieveapdaliba@tua.edu.ph"}</p>
              <div className="rating-container">
                <span id="starReview">
                  <i className="bi bi-star-fill"></i>
                </span>
                <p className="rating-score">5.0</p>
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
              <a href="#settings" onClick={() => setActiveTab("settings")}>
                Settings
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
                    <div className="itemCard" key={item.id}>
                      <img
                        src="https://d1nhio0ox7pgb.cloudfront.net/_img/o_collection_png/green_dark_grey/512x512/plain/objects.png"
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
                      <div className="itemDeets">
                        <div className="itemTitle">
                          <h3>{item.title}</h3>
                        </div>
                        <i className="bi bi-heart-fill heart"></i>
                        <p><b>0</b></p>

                        <div className="price-condition">
                          <p></p>
                          <p>&#8369;{item.price}.00</p>
                          <p>&#x2022; {item.condition}</p>
                        </div>
                        
                        <button className="editListButton">EDIT LISTING</button>
                        <button className="soldButton">MARK SOLD</button>
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
                  <i class="bi bi-star-fill"></i>
                  <i class="bi bi-star-fill"></i>
                  <i class="bi bi-star-fill"></i>
                  <i class="bi bi-star-fill"></i>
                  <i class="bi bi-star"></i>
                </div>

                <div className="review-description">
                  <p>Buyer is very friendly and easy to deal with. To more deals to come.</p>
                </div>

                <hr/>
              </div>
                 
          </div>

          {/* Settings Tab */}
          <div className="settings" style={{ display: activeTab === "settings" ? "block" : "none" }}>
              <h2>Account Settings</h2>
              <div className="settingsCard">
                <div style={{display: "flex", gap:"40px"}}><p><b>Account Type</b>: </p> <p>{"USER"}</p></div>
                <div style={{display: "flex", gap:"40px"}}><p><b>User ID</b>: </p> <p>{"USER"}</p></div>
                <div style={{display: "flex", gap:"40px"}}><p><b>Email</b>: </p> <p>{"USER"}</p></div>
                <br/><hr/>

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
                </form>
              </div>
              
          </div>
        </div>
      </main>
    </>
  );
}

export default MyProfile;
