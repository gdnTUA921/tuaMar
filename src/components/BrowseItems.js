import React, { useState, useEffect } from "react";
import { Flag, Heart, X, Search} from "lucide-react";
import "./BrowseItems.css";
import { Link, useNavigate} from "react-router-dom";

const BrowseItems = () => {
  const [items, setItems] = useState([]);
  const [userId, setUserId] = useState("");

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
    setUserId(data.user_id);
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

  const [inputValue, setInputValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredItems = items.filter((item) =>
    item.item_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  //for filter menu
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


  //State for filtering
    const initialFilterState = {
    textbooks: false,
    electronics: false,
    uniforms: false,
    schoolSupplies: false,
    foods: false,
    collectibles: false,
    others: false,
    new: false,
    likeNew: false,
    good: false,
    minPrice: "",
    maxPrice: "",
  }

  const [filters, setFilters] = useState(initialFilterState);

  //checkbox
  const handleCheckBoxChange = (e) => {
  const { name, checked } = e.target;
  setFilters((prevFilters) => ({
    ...prevFilters,
    [name]: checked,
  }));
};

  //price filter
  const handlePriceFilter = (e) => {
  const { name, value } = e.target;
  setFilters((prevFilters) => ({
    ...prevFilters,
    [name]: value,
  }));
};


//passing filters to backend for processing queries
const handleFilters = (filters) => {

    fetch(`${ip}/tua_marketplace/browseItemsFiltering.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        filters
      }),
      credentials: 'include'
    })
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
  }

  //for applying filters 
  const applyFilters = (event) => {
    event.preventDefault();
    handleFilters(filters);
}

  //for resetting filters to default or none
  const resetFilters = (event) => {
    event.preventDefault();
    setFilters(initialFilterState);
    handleFilters(initialFilterState);
}

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
    <div className="browsecontainer">
      <div className="browseDiv">
        <div className="search-container-browse">
          <Search className="search-icon" onClick={(e) => setSearchQuery(inputValue)}/>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setSearchQuery(inputValue);
                }
              }}
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
                <input type="checkbox" name="textbooks" checked={filters.textbooks} onChange={handleCheckBoxChange}/>
                Textbooks
              </label>
              <label>
                <input type="checkbox" name="electronics" checked={filters.electronics} onChange={handleCheckBoxChange}/>
                Electronics
              </label>
              <label>
                <input type="checkbox" name="uniforms" checked={filters.uniforms} onChange={handleCheckBoxChange}/>
                Uniforms
              </label>
              <label>
                <input type="checkbox" name="schoolSupplies" checked={filters.schoolSupplies} onChange={handleCheckBoxChange}/>
                School Supplies
              </label>
              <label>
                <input type="checkbox" name="foods" checked={filters.foods} onChange={handleCheckBoxChange}/>
                Foods
              </label>
              <label>
                <input type="checkbox" name="collectibles" checked={filters.collectibles} onChange={handleCheckBoxChange}/>
                Collectibles
              </label>
              <label>
                <input type="checkbox" name="others" checked={filters.others} onChange={handleCheckBoxChange}/>
                Others
              </label>

              <div style={{ color: "#547B3E", marginTop: "8px"}}>
                <h2>Price</h2>
                <input type="number" placeholder="MIN" name="minPrice" className="priceText no-arrows2" value={filters.minPrice} onChange={handlePriceFilter}/>to&nbsp;&nbsp;<input type="number" placeholder="MAX" name="maxPrice" className="priceText no-arrows2" value={filters.maxPrice} onChange={handlePriceFilter}/>
              </div>
              <div style={{ color: "#547B3E", marginTop: "8px"}}>
                <h2>Condition</h2>
              </div>

              <label>
                <input type="checkbox" name="new" checked={filters.new} onChange={handleCheckBoxChange}/>
                New
              </label>
              <label>
                <input type="checkbox" name="likeNew" checked={filters.likeNew} onChange={handleCheckBoxChange}/>
                Like New
              </label>
              <label>
                <input type="checkbox" name="good" checked={filters.good} onChange={handleCheckBoxChange}/>
                Good
              </label>
            </div>
            <br/>
            <center>
              <button className="applyFilter" onClick={applyFilters}>APPLY</button>
              <button className="resetFilter" onClick={resetFilters}>RESET</button>
            </center>
          </div>

          <div className="menuBurger" onClick={() => setIsOpen(true)}>&#9776;</div>

          <div className="items-browse" style={browseMove}>
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <div className="itemCard-browse" key={item.item_id}>
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

                  <div className="itemDeets-browse">
                    <Link
                      to={`/itemdetails/${item.item_id}/${item.item_name}`}
                      className="item-details-link"
                    >
                      <div className="itemTitle">
                        <h3>{item.item_name}</h3>
                      </div>
                    </Link>

                    <div className="listButtons">
                      <Heart className="heart" onClick={() => toggleLike(item)} fill= {liked[item.item_id] ?'green' : 'none'} color= {liked[item.item_id] ?'green' : 'black'} />
                      <Link to="/reportitem"  className="browse-flag" state={{ passedID: item.item_id, previewPic: item.preview_pic, itemName: item.item_name }} style={{display: userId == item.user_id ? "none" : "block"}}>
                        <Flag size={20} />
                      </Link>
                    </div>

                    <div className="browse-price-condition">
                      <p>&#8369;{item.price}</p>
                      <p>&#x2022; {item.item_condition}</p>
                    </div>

                    <Link to={userId == item.user_id ? "/myProfile" : `/userProfile/${item.user_id}`} className="sellerLink">
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