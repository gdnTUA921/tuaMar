import React, { useEffect, useState, useRef } from 'react';
import './Home.css';
import { Link, useNavigate } from "react-router-dom";
import PersonalizedRecommendation from "./PersonalizedRecomm";
import RecentlyPosted from "./RecentlyPosted";
import MostViewed from './MostViewed';
import RecommItemsHighlyRated from './RecommItemsHighlyRated';
import TopPicks from './TopPicks';
import Popup from 'reactjs-popup';

function Home() {
  const navigate = useNavigate();
  const [userID, setUserID] = useState("");
  const ip = process.env.REACT_APP_LAPTOP_IP;

  const [showPopup, setShowPopup] = useState(false);
  const formPolicyRef = useRef(null); // 👈 Ref to scroll container

  useEffect(() => {
    fetch(`${ip}/tua_marketplace/fetchSession.php`, {
      method: "GET",
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        if (!data.user_id) {
          navigate("/");
        } else {
          if (!userID) {
            setUserID(data.user_id);
            const hasSeenPopup = sessionStorage.getItem("hasSeenPopup");
            if (!hasSeenPopup) {
              setTimeout(() => {
                setShowPopup(true);
                window.scrollTo({ top: 0, behavior: "instant" });
              }, 2000);
            }
          }
        }
      })
      .catch((error) => {
        console.error("Error fetching session data:", error);
      });
  }, [ip, userID, navigate]);

  // Handle popup scroll to top
  useEffect(() => {
    if (showPopup) {
      document.body.style.overflow = "hidden";

      setTimeout(() => {
        if (formPolicyRef.current) {
          formPolicyRef.current.scrollTop = 0;
        }
      }, 50);
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showPopup]);

  return (
    <>
      {/* Overlay */}
      {showPopup && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 999,
          }}
        />
      )}

      <main>
        <div className="background-wrapper">
          {/* Background Image */}
          <div className="background"></div>

          {/* Popup */}
          <Popup
            open={showPopup}
            onClose={() => setShowPopup(false)}
            modal
            contentClassName="custom-modal-content"
            overlayClassName="custom-modal-overlay"
            closeOnDocumentClick={false}
          >
            <div
              className='form-policy'
              ref={formPolicyRef} // 👈 Attach ref here
              style={{ zIndex: 1000 }}
            >
              <div className="modal" tabIndex="-1" role="dialog">
                <div className="modal-dialog" role="document">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h2 className="modal-title">Buyer & Seller Agreement Policy</h2>
                      <h5>
                        By using the TUA Marketplace, both buyers and sellers agree to the following terms:
                      </h5>
                    </div>
                    <div className="modal-body">
                      <h3 className='genrules'>📜General Rules </h3>
                      <ul>
                        <li>This platform is for school-related, secondhand, or personal-use item exchanges only.</li>
                        <li>Users must respect each other and communicate politely.</li>
                        <li>No offensive, illegal, or inappropriate items are allowed.</li>
                      </ul>
                      <h3 className='forbuyers'>🛒 For Buyers: </h3>
                      <ul>
                        <li>Read item descriptions carefully before purchasing or messaging.</li>
                        <li>Always meet sellers in a safe, agreed-upon school location.</li>
                        <li>If unsure about an item, ask questions before committing to buy.</li>
                        <li>Payments and exchanges are handled directly between you and the seller. </li>
                      </ul>
                      <h3 className='forsellers'>🙎‍♂️ For Sellers: </h3>
                      <ul>
                        <li>Only list items that you own and are ready to sell.</li>
                        <li>Be honest about item condition and details.</li>
                        <li>Coordinate responsibly and respectfully with buyers.</li>
                      </ul>
                      <h3 className='important'>Important Notice </h3>
                      <ul>
                        <li>The school and platform administrators are not responsible for transactions or item quality.</li>
                        <li>By continuing, you agree to follow these rules and promote a safe, respectful trading environment.</li>
                      </ul>
                    </div>
                    <div className="modal-footer">
                      <button
                        onClick={() => {
                          setShowPopup(false);
                          sessionStorage.setItem("hasSeenPopup", "true");
                        }}
                        type="button"
                        className="btn-secondary"
                      >
                        Agree & Continue
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Popup>

          {/* Text */}
          <div className="welcome">
            <b>Welcome To TUA Marketplace</b>
          </div>

          <div className="welcome2">
            <h2>A secure platform where everything a Trinitian needs is at their fingertips.</h2>
          </div>

          <div className="button1">
            <Link to="/browseItems"><button>Start Shopping</button></Link>
          </div>

          <div className="button2">
            <Link to="/sell"><button>Start Selling</button></Link>
          </div>
        </div>

        {/* Recommendations */}
        <div className="items-recommend">
          <PersonalizedRecommendation userId={userID} />
        </div>
        <div className="items-recommend">
          <TopPicks userId={userID} />
        </div>
        <div className="items-recommend">
          <RecentlyPosted userId={userID} />
        </div>
        <div className="items-recommend">
          <MostViewed userId={userID} />
        </div>
        <div className="items-recommend">
          <RecommItemsHighlyRated userId={userID} />
        </div>
      </main>
    </>
  );
}

export default Home;
