import React from "react";
import { useState } from "react";
import { Flag } from "lucide-react";
import { Heart } from "lucide-react";
import { X } from "lucide-react";
import "./BrowseItems.css";
import { Link } from "react-router-dom";

const BrowseItems = () => {

      const [searchQuery, setSearchQuery] = useState("");

    /* Placholder Values. Change this code in database retrieval */
    const items = [
        { id: 1, title: "Jollibee Sanrio Happy Meal Collection", price: 600, condition: "Like New" },
        { id: 2, title: "NBA Cards - Victor Wembanyama Top Class Rookie Card (RC)", price: 600, condition: "Like New" },
        { id: 3, title: "Funko Pop Iron Man 2025 Summer Convention Exclusive", price: 600, condition: "Like New" },
        { id: 4, title: "NBA Cards - Miami Heat 2013-14 Panini NBA (International) #151 - LeBron James Dwayne Wade Chris Bosh", price: 600, condition: "Like New" },
        { id: 5, title: "TUA Uniform", price: 600, condition: "Like New" },
        { id: 6, title: "ITEM #6", price: 600, condition: "Like New" },
        { id: 7, title: "ITEM #7", price: 600, condition: "Like New" },
        { id: 8, title: "ITEM #8", price: 600, condition: "Like New" },
      ]; 
    
      // Filter items based on search input
      const filteredItems = items.filter((item) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase())
      );

      //For filter menu box
      const [isOpen, setIsOpen] = useState(false);

      const navStyle = {
        width: isOpen ? '228px' : '0',
        transition: '0.5s',
        padding: isOpen ? '25px' : '0',
        paddingTop: isOpen ? '30px' : '0',
      };

      const browseMove = {
        marginLeft: isOpen ? '265px' : '35px',
        transition: '0.5s',
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
                    <div className="itemCard-browse" key={item.id}>
                        <Link to="/itemdetails" state={{passedWord: item.title}} className="item-details-link">
                        <img
                            src="https://d1nhio0ox7pgb.cloudfront.net/_img/o_collection_png/green_dark_grey/512x512/plain/objects.png"
                            style={{
                              width: "180px",
                              height: "180px",
                              border: "3px solid green",
                              borderRadius: "12px",
                              alignItems: "center",
                              justifyContent: "center",
                              marginLeft: "5.5px",
                              objectFit: "cover",
                              padding: "0"
                            }}
                            alt="Item"
                          /></Link>

                        <div className="itemDeets-browse">
                            <Link to="/itemdetails" state={{passedWord: item.title}} className="item-details-link">
                            <div className="itemTitle">
                              <h3>{item.title}</h3> {/* Change this via database retrieval*/}
                            </div></Link>

                            <div className="listButtons">
                            <Heart className="heart"/>
                            <Link to="/reportitem" className="browse-flag"><Flag size={20}/></Link>
                            </div>
                            

                            <div className="browse-price-condition">
                              <p>&#8369;{item.price}.00</p>
                              <p>&#x2022; {item.condition}</p>
                            </div>
                            
                            <div className="itemSeller">
                                <img src="https://lh3.googleusercontent.com/a-/ALV-UjWgmyu8CmNMWPDq_ODNxIvVbNzd_XMpu93FNWeUiWuh9aXd_ZeO=s1000-p"/>
                                <p>{"Marc Adrian"}<br/>{"Miranda"}</p>
                            </div>
                        </div>
                    </div>
                      ))
                    ) : (
                      <center><p className="noItems">No items found.</p></center>
                    )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default BrowseItems;
