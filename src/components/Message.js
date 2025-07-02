import React, { useRef, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { database } from '../firebaseConfig';
import { ref, onValue, push, set, get, update} from 'firebase/database';
import {Link} from 'react-router-dom';
import "./Message.css";
import { Send, Search, Flag, MoveLeft, Images } from "lucide-react";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content'; // For SweetAlert2
import MessageLoader from './MessageLoader';
import LoaderPart from './LoaderPart';


function Message() {

  const [isLoading, setIsLoading] = useState(true); //for loading state

  const MySwal = withReactContent(Swal); // Initialize SweetAlert2


  const ip = process.env.REACT_APP_LAPTOP_IP;
  const navigate = useNavigate();


  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
 
  const location = useLocation();
  const { passedUserID, passedUserIDSender, passedUserIDReceiver, passedItemID, passedItemStatus } = location.state || {};


  useEffect(() => { //for retreving receiverID and the item_id from useLocation
  if (location.state && location.state.passedUserID && location.state.passedItemID) {
    setReceiverID(location.state.passedUserID);
    setItemId(location.state.passedItemID);
    console.log("Set receiverID:", location.state.passedUserID);
  } else {
    console.log("No passedUserID in location.state", location.state);
  }
}, [location.state]);


  const [currentUserId, setcurrentUserId] = useState(null);
  const [currentUserName, setCurrentUserName] = useState(null);
  const [currentPfp, setCurrentPfp] = useState(null);
  const [receiverID, setReceiverID] = useState(null);        // ==> Linagyan ito
  const [chatBlock, setChatBlock] = useState(false);
  const [chats, setChats] = useState([]);


  //setting up userName, itemName, and fetching itemPicture and price
  const [itemId, setItemId] = useState("");
  const [userName, setUserName] = useState("");
  const [itemName, setItemName] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [itemPicture, setItemPicture] = useState("");
  const [itemStatus, setItemStatus] = useState("");
  const [receiverPicture, setReceiverPicture] = useState("");
  const [chat_id, setChat_id] = useState("");
  const [receiverStatus, setReceiverStatus] = useState("");

  //Setting up seller and buyer ID
  const [buyerID, setBuyerID] = useState("");
  const [sellerID, setSellerID] = useState("");

  
  // Alternative user ID for data fetching to be passed to userProfile module
  const [appUserID, setAppUserID] = useState(""); 


  //setting up message count
  const [messageCount, setMessageCount] = useState(0);


  //changed ito
  //Checking if logged in, if not redirected to log-in
   useEffect(() => {

    const intervalId = setInterval(() => {
      fetch(`${ip}/tua_marketplace/fetchSession.php`, {
        method: "GET",
        credentials: "include",
      })
        .then((response) => response.json())
        .then((data) => {
          if (!data.user_id) {
            navigate("/"); // Redirect to login if not authenticated
          }
          else{
            setcurrentUserId(data.firebase_uid);
            setCurrentUserName(data.full_name);
            setCurrentPfp(data.pfp);

            fetchChats(data.firebase_uid);
          }
        })
        .catch((error) => {
          console.error("Error fetching session data:", error);
        });
    }, 3000);

    return () => clearInterval(intervalId);
  }, [ip]);

  



  //Opening Chat Block for Messaging if the user comes from Item Deets Page
  useEffect(() => {
    if (passedUserID && passedItemID){
        setChatBlock(true);
       
        fetch(`${ip}/tua_marketplace/fetchContactSellerDeets.php`, {
          headers: {
            "Content-Type": "application/json",
          },
          method: "POST",
          body: JSON.stringify({ sellerID: passedUserID, itemID: passedItemID}),
        })
        .then((response) => response.json())
        .then((data) => {
            setUserName(data.fullName);
            setItemName(data.item_name);
            setItemPrice(data.price);
            setItemPicture(data.preview_pic);
            setItemStatus(data.status);
            setReceiverPicture(data.profile_pic);
            setItemId(passedItemID);
            setAppUserID(data.user_id); // Set the appUserID for userProfile
          })
        .catch((error) => console.error("Error fetching pics:", error));
    }

  }, []);



  //fetching list of chats for messagebox class or chat inbox
const fetchChats = (currentUserID) => {
  if (!currentUserID) {
    console.warn("fetchChats: currentUserId not yet available.");
    return;
  }

  const chatsRef = ref(database, 'chatsList');

  onValue(chatsRef, (snapshot) => {
    if (!snapshot.exists()) {
      console.log("fetchChats: No chats found.");
      setChats([]);
      return;
    }

    const allChats = snapshot.val();
    const filteredChats = [];

    Object.entries(allChats).forEach(([chatId, chatData]) => {
      // Only include chats where the current user is either buyer or seller
      if (chatData.buyerID_fb === currentUserID || chatData.sellerID_fb === currentUserID) {
        filteredChats.push({
          ...chatData,
          chat_id: chatId, // store the chat ID too
        });
      }
    });

    // Optional: sort by timestamp (most recent first)
    filteredChats.sort((a, b) => b.timestamp - a.timestamp);

    console.log("fetchChats: Filtered chats for currentUserId", currentUserID, filteredChats);
    setChats(filteredChats);
    setIsLoading(false);
  }, {
  });
};


  
  //For Automatic Scroll to the latest message
  const messagesEndRef = useRef(null);


  useEffect(() => {
    if (messagesEndRef.current) {
      const el = messagesEndRef.current;
      el.parentNode.scrollTop = el.parentNode.scrollHeight;
    }
  }, [messages]);




const sendMessage = async () => {
  if (!input.trim()) return;

  if (!currentUserId || !receiverID) {
    console.warn("Cannot send message: Missing IDs", {
      currentUserId,
      receiverID,
      input,
    });
    return;
  }

  const chatId = chat_id
    ? chat_id
    : [String(itemId), String(currentUserId), String(receiverID)].sort().join("_");

  const newMessageRef = push(ref(database, `messages/${chatId}`));
  const messageData = {
    text: input,
    senderId: currentUserId,
    receiverId: receiverID,
    itemID: itemId,
    timestamp: Date.now(),
  };

  try {
    await set(newMessageRef, messageData);

    const chatListRef = ref(database, `chatsList/${chatId}`);
    const snapshot = await get(chatListRef);

    if (snapshot.exists()) {
      await update(chatListRef, {
        last_message: input,
        timestamp: Date.now(),
        last_sender_id: currentUserId, // ✅ FIX ADDED
      });
    } else {
      const chatData = {
        item_id: itemId,
        item_name: itemName,
        item_pic: itemPicture,
        item_price: itemPrice,
        item_status: passedItemStatus,
        buyer_id: passedUserIDSender,
        buyerID_fb: currentUserId,
        buyer_name: currentUserName,
        buyer_pfp: currentPfp,
        seller_id: passedUserIDReceiver,
        sellerID_fb: receiverID,
        seller_name: userName,
        seller_pfp: receiverPicture,
        last_message: input,
        timestamp: Date.now(),
        last_sender_id: currentUserId, // ✅ FIX ADDED HERE TOO
      };
      await set(chatListRef, chatData);
    }

    setInput("");
  } catch (error) {
    console.error("Error sending message or updating chat list:", error);
  }
};







  // Listen for messages
  useEffect(() => {
    if (!currentUserId || !receiverID || !itemId) {
      console.log("Missing IDs for message listening:", { currentUserId, receiverID });
      return;
    }


    // Convert both IDs to strings for consistent comparison
    const chatId = [String(itemId), String(currentUserId), String(receiverID)].sort().join("_");
    console.log("Listening for messages on chatId:", chatId);
    console.log("Full Firebase path:", `messages/${chatId}`);
    console.log("IDs being used:", {
      currentUserId: String(currentUserId),
      receiverID: String(receiverID),
      currentUserIdType: typeof currentUserId,
      receiverIDType: typeof receiverID
    });
   
    const messagesRef = ref(database, `messages/${chatId}`);


    const unsubscribe = onValue(messagesRef, (snapshot) => {
      console.log("=== FIREBASE SNAPSHOT DEBUG ===");
      console.log("Snapshot exists:", snapshot.exists());
      console.log("Snapshot key:", snapshot.key);
      console.log("Snapshot ref path:", snapshot.ref.toString());
     
      if (snapshot.exists()) {
        const data = snapshot.val();
        console.log("Raw Firebase data:", JSON.stringify(data, null, 2));
        console.log("Data type:", typeof data);
        console.log("Data keys:", Object.keys(data));
       
        // Handle different data structures
        let messageList = [];
       
        if (Array.isArray(data)) {
          // If data is an array
          messageList = data.filter(msg => msg !== null).map((msg, index) => ({
            id: index,
            ...msg  
          }));
        } else if (typeof data === 'object') {
          // If data is an object
          messageList = Object.entries(data).map(([key, value]) => ({
            id: key,
            ...value
          }));
        }
       
        // Sort by timestamp if available
        if (messageList.length > 0 && messageList[0].timestamp) {
          messageList.sort((a, b) => a.timestamp - b.timestamp);
          setMessageCount(messageList.length);
        }
       
        console.log("Processed messages:", JSON.stringify(messageList, null, 2));
        console.log("Message count:", messageList.length);
        setMessages(messageList);
      } else {
        console.log("No messages found for this chat");
        console.log("Trying alternative chatId formats...");
       
        // Try the exact format that might exist in your database
        const altChatIds = [
          `${currentUserId}_${passedUserID}`,
          `${passedUserID}_${currentUserId}`,
          //1_yoHBr1jgIWTHtangYKeeCHiQ1mo1, // Based on your data
          //yoHBr1jgIWTHtangYKeeCHiQ1mo1_1,
          //1_2, // If both were numbers
          //2_1
        ];
       
        console.log("Alternative chatIds to check:", altChatIds);
       
        // Let's manually check if any messages exist at the root level
        const rootRef = ref(database, 'messages');
        onValue(rootRef, (rootSnapshot) => {
          if (rootSnapshot.exists()) {
            console.log("All message keys in database:", Object.keys(rootSnapshot.val()));
          }
        }, { onlyOnce: true });
       
        setMessages([]);
      }
    }, (error) => {
      console.error("Error listening to messages:", error);
      console.error("Error code:", error.code);
      console.error("Error message:", error.message);
    });
   
    return () => unsubscribe();
  }, [itemId, currentUserId, receiverID]);





  //For search filtering chats
  const [searchQuery, setSearchQuery] = useState("");

  const filteredChats = Array.isArray(chats)
    ? chats.filter((chat) => {
      const receiverName = currentUserId === `${chat.sellerID_fb}` ? `${chat.buyer_name}` : `${chat.seller_name}`;
        return (
          chat.item_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          receiverName?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      })
    : [];




  const openChat = (itemId, userName, itemName, price, itemPicture, receiverPic, status, chat_id, receiverId, buyerID, sellerID, user_id, receiverStatus) => {
    console.log( itemId, userName, itemName, price, receiverPic, receiverId);
    console.log ("currentUserId: " + currentUserId);
    setItemId(itemId);
    setUserName(userName);
    setItemName(itemName);
    setItemPrice(price);
    setItemPicture(itemPicture);
    setItemStatus(status);
    setReceiverPicture(receiverPic);
    setReceiverID(receiverId);
    setChatBlock(true);
    setChat_id(chat_id);
    setBuyerID(buyerID);
    setSellerID(sellerID);
    setAppUserID(user_id); // Set the appUserID for userProfile
    setReceiverStatus(receiverStatus);
  }



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

      fetch(`${ip}/tua_marketplace/setItemStatus.php`, {
        method: "POST",
        body: JSON.stringify({ itemStatus, itemId }),
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
      })
      .then((response) => response.json())
      .then((data) => {
        updateStatus = data.updateStatus;
        message = data.message;

        if (updateStatus === "success") {
          // 🔥 Update item_status in Firebase
          const db = database;
          const chatsRef = ref(db, "chatsList");

          get(chatsRef).then((snapshot) => {
            if (snapshot.exists()) {
              const chatsData = snapshot.val();

              Object.entries(chatsData).forEach(([chatId, chat]) => {
                if (chat.item_id === itemId) {
                  const chatRef = ref(db, `chatsList/${chatId}`);
                  update(chatRef, { item_status: itemStatus.toUpperCase() })
                    .then(() => {
                      console.log(`Firebase item_status updated for chat ${chatId}`);
                    })
                    .catch((error) => {
                      console.error("Error updating Firebase item_status:", error);
                    });
                }
              });
            }
          });

          // 🟢 Success alert
          if (itemStatus === "Sold") {
            message = "Congratulations! This item is now marked Sold.";
          } else if (itemStatus === "Reserved") {
            message = "This item is now marked Reserved.";
          } else {
            message = "This item is now marked Available.";
          }

          MySwal.fire({
            title: itemStatus.toUpperCase() + "!",
            text: message,
            icon: "success",
            confirmButtonColor: "#547B3E",
          }).then((result) => {
            if (result.isConfirmed) {
              window.location.reload();
            }
          });
        }

        // ❌ Failure alert
        else {
          MySwal.fire({
            title: "Failure to Update Status!",
            text: "Failed to Update Listing Status",
            icon: "error",
            confirmButtonColor: "#547B3E",
          }).then((result) => {
            if (result.isConfirmed) {
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
};




return (
  <div className='messagecontainer'>

    {/* Left Sidebar */}
    {isLoading === false ? (
      <div className={`${chatBlock ? 'messagebox-dup' : 'messagebox'}`}>
        <div className='messagetitle' style={{ color: "#547B3E" }}>
          <h2>Messages</h2>
        </div>

        <div className="search-container-messaging">
          <Search className="search-icon-messaging" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search items..."
          />
        </div>

        <div className="messagesList">
          {filteredChats.map((chat, i) => {
            const receiverId = currentUserId === chat.sellerID_fb ? chat.buyerID_fb : chat.sellerID_fb;
            const receiverName = currentUserId === chat.sellerID_fb ? chat.buyer_name : chat.seller_name;
            const receiverPfp = currentUserId === chat.sellerID_fb ? chat.buyer_pfp : chat.seller_pfp;
            const user_id = currentUserId === chat.sellerID_fb ? chat.buyer_id : chat.seller_id;
            const receiverStatus = currentUserId === chat.sellerID_fb ? "buyer" : "seller";
            const isLatestFromOther = chat.last_sender_id && chat.last_sender_id !== currentUserId;

            const markChatAsRead = (chatId, userId, timestamp) => {
            const chatRef = ref(database, `chatsList/${chatId}/read/${userId}`);
            set(chatRef, timestamp);
          };
          const isUnread =
          chat.last_sender_id !== currentUserId &&
          (!chat.read || !chat.read[currentUserId] || chat.read[currentUserId] < chat.timestamp);


            return (
              <div
                className="listChats"
                key={i}
                onClick={(e) => {
                  e.preventDefault();
                  
                  markChatAsRead(chat.chat_id, currentUserId, Date.now());
                  // Optional: force update local `chats` after a small delay
                  setTimeout(() => fetchChats(currentUserId), 300);

                  openChat(
                    chat.item_id,
                    receiverName,
                    chat.item_name,
                    chat.item_price,
                    chat.item_pic,
                    receiverPfp,
                    chat.item_status,
                    chat.chat_id,
                    receiverId,
                    chat.buyer_id,
                    chat.sellerID_fb,
                    user_id,
                    receiverStatus
                  );
                  markChatAsRead(chat.chat_id, currentUserId, Date.now());
                }}
              >
                <img src={receiverPfp} className="messagePFP" alt="User PFP" />
                
                <div className="nameMessage">
                  <p style={{ display: "none" }}>{chat.item_id}</p>
                  <p>{receiverName}</p>
                  <h4>{chat.item_name}</h4>
                  <p className={isLatestFromOther && isUnread ? "latest-message-bold" : ""}>
                    {chat.last_message}
                  </p>
                </div>
                {isUnread && <p className='unread-indicator'>🟢</p>}
              </div>
            );
          })}
        </div>
      </div>
    ) : (
      <div className={`${chatBlock ? 'messagebox-dup' : 'messagebox'}`}>
        <div className='messagetitle' style={{ color: "#547B3E" }}>
          <h2>Messages</h2>
        </div>

        <div className="search-container-messaging">
          <Search className="search-icon-messaging" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search items..."
          />
        </div>

        <div className="messagesList">
          {[1,2,3,4,5].map((index) =>(
            <div key={index} className="listChats-loader">
              <MessageLoader/>
            </div>
          ))}
        </div>
      </div>)}


    
    {/* Default Message Prompt */}
    {isLoading === false ? (
      <div className={`messageRightCon-default ${chatBlock ? 'hidden' : ''}`}>
        <img src='tuamar.png' className='message-defaultPic' />
        <h1>Press Any Chat To Continue</h1>
      </div> 
      ): (
        <div className={`messageRightCon-default ${chatBlock ? 'hidden' : ''}`}>
          <LoaderPart/>
        </div>
      )
    }


    {/* Right Panel - Active Chat */}
    <div className={`messageRightCon ${chatBlock ? '' : 'hidden'}`}>
      <div className="messagebar">
        <div className="profile">
          <MoveLeft className='arrow-left' onClick={() => setChatBlock(false)} />
          <Link to={`/userProfile/${appUserID}`} className="messageSellerLink"><img src={receiverPicture} className="right-con-pfp" /></Link>
          <Link to={`/userProfile/${appUserID}`} className="messageSellerLink"><h3>{userName}</h3></Link>
          <Link to="/reportUser" className="reportLink" state={{ passedItemID: itemId, receiverPicture, reportedUser: userName }}><Flag /></Link>
        </div>
      </div>

      <div className='itemInquired'>
        <div className='itemInquiredDetails'>
          <Link to={`/itemdetails/${itemId}/${encodeURIComponent(itemName)}`} className="item-details-link"><img src={itemPicture} /></Link>
          <div className='itemInquiredDeets'>
            <Link to={`/itemdetails/${itemId}/${encodeURIComponent(itemName)}`} className="item-details-link"><h3>{itemName}</h3></Link>
            <p>&#8369;{itemPrice} {itemStatus === "AVAILABLE" ? "" : " • " + itemStatus}</p>
          </div>
        </div>
        <div className="item-buttons">
          <Link to = "/Reviewmod" state={{
                passedID: itemId, // This is the reporter ID
                previewPic: itemPicture,
                itemName: itemName,
                reviewedUser: userName,
                reviewedUserID: appUserID,
                receiverPicture: receiverPicture, // This is the user ID you want to report
                passedStatus: receiverStatus //status of the receiver (buyer or seller)
              }}>
            <button className="review-button" disabled={messageCount < 10}>Leave Review</button>
          </Link>
          <button className="view-button" style={{ display: currentUserId != sellerID || itemStatus == "SOLD" || itemStatus == "IN REVIEW" ? "none" : "block" }} onClick={() => handleItemStatus("Sold", itemId)}>Mark Sold</button>
          <button className="view-button" style={{ display: currentUserId != sellerID || itemStatus == "RESERVED" || itemStatus == "SOLD" || itemStatus == "IN REVIEW" ? "none" : "block" }} onClick={() => handleItemStatus("Reserved", itemId)}>Reserve</button>
          <button className="view-button" style={{ display: currentUserId != sellerID || itemStatus == "AVAILABLE" || itemStatus == "IN REVIEW" ? "none" : "block" }} onClick={() => handleItemStatus("Available", itemId)}>Available</button>
        </div>
      </div>

     <div className='adjust-holder'>
       {messages.map((msg, i) => (
        <div
    key={i}
    style={{
      display: "flex",
      flexDirection: msg.senderId === currentUserId ? "row-reverse" : "row",
      alignItems: "flex-end",
      marginBottom: "10px",
      gap: "8px"
    }}
  >
    {/* Profile Picture */}
    <Link to={currentUserId === msg.senderId ? `/myProfile` : `/userProfile/${appUserID}`} className="sellerLink">
      <img
        src={
          msg.senderId === currentUserId
            ? currentPfp // your own profile pic
            : receiverPicture // the other user's profile pic
        }
        alt="Profile"
        className="message-bubble-pfp"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 25,
          height: 25,
          borderRadius: "50%",
          padding: "0",
          objectFit: "cover",
          border: "1.5px solid #5a8d5a",
          background: "#f0f0f0"
        }}
      /></Link>
           <div
             style={{
               display: "flex",
               flexDirection: "column",
               alignItems: msg.senderId === currentUserId ? "flex-end" : "flex-start",
               //marginBottom: "10px"
             }}
           >
             <div className={msg.senderId === currentUserId ? "specific-messages sent-message" : "specific-messages received-message"}>
               {msg.imageUrl ? (
                 <img src={msg.imageUrl} alt="sent" style={{ maxWidth: "200px", maxHeight: "200px", borderRadius: "8px" }} />
               ) : (
                 msg.text
               )}
             </div>
             <span className="time-stamp">
               {msg.timestamp ? `${new Date(msg.timestamp).toLocaleDateString([], {
                 month: 'short',
                 day: '2-digit',
                 year: 'numeric'
               })} ${new Date(msg.timestamp).toLocaleTimeString([], {
                 hour: '2-digit',
                 minute: '2-digit',
                 hour12: true
               })}` : ""}
             </span>
           </div>
         </div>
       ))}
       {/* Invisible anchor to scroll to */}
       <div ref={messagesEndRef} />
     </div>


      <div className='send-container'>
        <input
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          ref={input => (window.__imageInputRef = input)}
          onChange={async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            // Placeholder for image upload
            e.target.value = "";
          }}
        />
        <button
          className='submit-image'
          onClick={() => {
            if (window.__imageInputRef) window.__imageInputRef.click();
          }}
          type="button"
        >
          <Images size={25} color='green' />
        </button>
        <textarea
          className='sendinput'
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault(); // prevent newline
              sendMessage();
            }
          }}
          placeholder='Type here your message...'
        />
        <button onClick={sendMessage} className='submit-message'>
          <Send size={20} color='green' />
        </button>
      </div>
    </div>
  </div>
);

}




export default Message
