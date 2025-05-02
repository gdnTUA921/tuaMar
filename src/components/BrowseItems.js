import React, { useState, useEffect } from "react";
import { Flag, Heart, X } from "lucide-react";
import "./BrowseItems.css";
import { Link, useNavigate} from "react-router-dom";

const BrowseItems = () => {
  const [items, setItems] = useState([]);

  const navigate = useNavigate();
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
  })
  .catch((error) => {
    console.error("Error fetching session data:", error);
  });

  //fetching items posted in the marketplace
  fetch(`${ip}/tua_marketplace/browseItems.php`)
    .then((response) => response.json())
    .then((data) => {
      console.log('Fetched data:', data); // Log the data to see the structure
      if (Array.isArray(data)) {
        setItems(data);
      } else {
        console.error('Fetched data is not an array:', data);
        setItems([]);
      }
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
      setItems([]); // Fallback to an empty array
    });
  }, []);


  const [searchQuery, setSearchQuery] = useState("");

  const filteredItems = items.filter((item) =>
    item.item_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const [isOpen, setIsOpen] = useState(false);

  const navStyle = {
    width: isOpen ? "228px" : "0",
    transition: "0.5s",
    padding: isOpen ? "25px" : "0",
    paddingTop: isOpen ? "30px" : "0",
  };

  const browseMove = {
    marginLeft: isOpen ? "265px" : "35px",
    transition: "0.5s",
  };

  return (
    <div className="browsecontainer">
      <div className="browseDiv">
        <div className="search-container-browse">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search items..."
            />
        </div>
        <div className="itemFileContainer">
          <div className="filecontainer" style={navStyle} id="mySidenav"> 
          <X className="xButton" onClick={() => setIsOpen(false)}/>
            <div className="filter" style={{ color: "#547B3E" }}>
              <h2>Categories</h2>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <label>
                <input type="checkbox" name="textbooks" />
                Textbooks
              </label>
              <label>
                <input type="checkbox" name="electronics" />
                Electronics
              </label>
              <label>
                <input type="checkbox" name="uniforms" />
                Uniforms
              </label>
              <label>
                <input type="checkbox" name="schoolsupplies" />
                School Supplies
              </label>
              <label>
                <input type="checkbox" name="schoolsupplies" />
                Foods
              </label>
              <label>
                <input type="checkbox" name="schoolsupplies" />
                Collectibles
              </label>
              <label>
                <input type="checkbox" name="others" />
                Others
              </label>

              <div style={{ color: "#547B3E" }}>
                <h2>Price</h2>
                <input type="number" placeholder="MIN" name="min" className="priceText no-arrows2"/>to&nbsp;&nbsp;<input type="number" placeholder="MAX" name="max" className="priceText no-arrows2"/>
              </div>
              <div style={{ color: "#547B3E" }}>
                <h2>Condition</h2>
              </div>

              <label>
                <input type="checkbox" name="new" />
                New
              </label>
              <label>
                <input type="checkbox" name="likenew" />
                Like New
              </label>
              <label>
                <input type="checkbox" name="good" />
                Good
              </label>
            </div>
            <br/>
            <center><button className="applyFilter">APPLY</button></center>
          </div>

          <div className="menuBurger" onClick={() => setIsOpen(true)}>&#9776;</div>

          <div className="items-browse" style={browseMove}>
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <div className="itemCard-browse" key={item.item_id}>
                  <Link
                    to="/itemdetails"
                    state={{passedID: item.item_id, passedPic: item.preview_pic}}
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

                  <div className="itemDeets-browse">
                    <Link
                      to="/itemdetails"
                      state={{passedID: item.item_id, passedPic: item.preview_pic}}
                      className="item-details-link"
                    >
                      <div className="itemTitle">
                        <h3>{item.item_name}</h3>
                      </div>
                    </Link>

                    <div className="listButtons">
                      <Heart className="heart" />
                      <Link to="/reportitem" className="browse-flag">
                        <Flag size={20} />
                      </Link>
                    </div>

                    <div className="browse-price-condition">
                      <p>&#8369;{item.price}</p>
                      <p>&#x2022; {item.item_condition}</p>
                    </div>

                    <Link to="/myProfile" className="sellerLink" state={{passedID: item.user_id}}>
                    <div className="itemSeller">
                      <img src={item.profile_pic} />
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
              <center>
                <p className="noItems">No items found.</p>
              </center>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrowseItems;
