import React, { useRef, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { database } from '../firebaseConfig';
import { ref, onValue, push, set } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import "./Message.css";
import { Send, Search, Flag, MoveLeft, Images } from "lucide-react";


function Message() {


  const ip = process.env.REACT_APP_LAPTOP_IP;
  const navigate = useNavigate();


  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
 
  const location = useLocation();
  const { passedUserID, passedItemID} = location.state || {};


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
  const [receiverID, setReceiverID] = useState(null);        // ==> Linagyan ito
  const [chatBlock, setChatBlock] = useState(false);
  const [chats, setChats] = useState([]);


  //setting up userName, itemName, and fetching itemPicture and price
  const [itemId, setItemId] = useState("");
  const [userName, setUserName] = useState("");
  const [itemName, setItemName] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [itemPicture, setItemPicture] = useState("");
  const [receiverPicture, setReceiverPicture] = useState("");
  const [chat_id, setChat_id] = useState("");

  
  //for chat refreshing after sending message
  const [refreshChats, setRefreshChats] = useState(false);


  //changed ito
  //Checking if logged in, if not redirected to log-in
   useEffect(() => {
    
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
        }
      })
      .catch((error) => {
        console.error("Error fetching session data:", error);
      });
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
            setReceiverPicture(data.profile_pic);
            setItemId(passedItemID);
          })
        .catch((error) => console.error("Error fetching pics:", error));
    }

  }, []);



  //fetching list of chats for messagebox class or chat inbox
  const fetchChats = () => {
  fetch(`${ip}/tua_marketplace/fetchChatsList.php`, {
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
    credentials: 'include',
  })
  .then((response) => response.json())
  .then((data) => {
    if (Array.isArray(data)) {
      setChats(data);
    } else {
      console.warn("Unexpected data format from fetchChatsList.php:", data);
      setChats([]);
    }
  })
  .catch((error) => console.error("Error fetching chats:", error));
};



  //chat inbox loading and refresh 
  useEffect(() => {
    fetchChats(); // Initial load

    const intervalId = setInterval(() => {
      fetchChats();
    }, 3000);

    return () => clearInterval(intervalId);
  }, []);


  
  //For Automatic Scroll to the latest message
  const messagesEndRef = useRef(null);


  useEffect(() => {
    if (messagesEndRef.current) {
      const el = messagesEndRef.current;
      el.parentNode.scrollTop = el.parentNode.scrollHeight;
    }
  }, [messages]);




  // Sending Message sender/receiver --> Ito pinagchchange ko yung passedID into receiverID
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

  const chatId = chat_id ? chat_id : [String(itemId), String(currentUserId), String(receiverID)].sort().join("_");
  const newMessageRef = push(ref(database, `messages/${chatId}`));
  const messageData = {
    text: input,
    senderId: currentUserId,
    receiverId: receiverID,
    itemID: itemId,
    timestamp: Date.now(),
  };


  try {
    // Store the message in Firebase (or wherever `set` and `newMessageRef` come from)
    await set(newMessageRef, messageData);

    // Send chat metadata to your PHP backend
    const response = await fetch(`${ip}/tua_marketplace/insertMessage.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        item_id: itemId,
        buyerID: currentUserId,
        sellerID: receiverID,
        last_message: input,
      }),
    });

    const data = await response.json();

    if (response.ok && data.message === "Message sent successfully.") {
      setInput(""); // Clear the input only if the message is accepted
      console.log("Message sent:", messageData);
      fetchChats(); // Toggle to force re-fetch
    } else {
      console.error("Message not accepted by server:", data.message);
    }

  } catch (error) {
    console.error("Error sending message:", error);
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
  }, [itemId]);





  //For search filtering chats
  const [searchQuery, setSearchQuery] = useState("");

  const filteredChats = Array.isArray(chats)
    ? chats.filter((chat) => {
        return (
          chat.item_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          chat.fullName?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      })
    : [];




  const openChat = (itemId, userName, itemName, price, itemPicture, receiverPic, chat_id, receiverId) => {
    console.log( itemId, userName, itemName, price, receiverPic, receiverId);
    console.log ("currentUserId: " + currentUserId);
    setItemId(itemId);
    setUserName(userName);
    setItemName(itemName);
    setItemPrice(price);
    setItemPicture(itemPicture);
    setReceiverPicture(receiverPic);
    setReceiverID(receiverId);
    setChatBlock(true);
    setChat_id(chat_id);
  }


  return (
    <div className='messagecontainer'>
      <div className={`${chatBlock ? 'messagebox-dup' : 'messagebox'}`} >
       <div className='messagetitle' style={{ color: "#547B3E" }}>
         <h2 >Messages</h2>
       </div>
     
         <div className="search-container-messaging">
           <Search className="search-icon" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search items..."
            />
         </div>



       <div className="messagesList">
         {filteredChats.map ((chat, i) => {
          const receiverId = currentUserId === `${chat.seller_id}` ? `${chat.buyer_id}` : `${chat.seller_id}`;

          return (
           <div className="listChats" key={i} onClick={(e) => {e.preventDefault(); openChat(chat.item_id, chat.fullName, chat.item_name, chat.price, chat.preview_pic, chat.profile_pic, chat.chat_id, receiverId);}}>
             <img src= {chat.profile_pic} className="messagePFP"/>
             <div className="nameMessage">
               <p style={{display: "none"}}>{chat.item_id}</p>
               <p>{chat.fullName}</p>
               <h4>{chat.item_name}</h4>
               <p>{chat.last_message}</p>
             </div>
           </div>
         );
        })}
       </div> 
      </div>


      <div className={`messageRightCon-default ${chatBlock ? 'hidden' : ''}`}>


        <img src='tuamar.png' className='message-defaultPic'/>
        <h1>Press Any Chat To Continue</h1>


      </div>


      <div className={`messageRightCon ${chatBlock ? '' : 'hidden'}`}>
        <div className = "messagebar">
            <div className = "profile">
              <MoveLeft className='arrow-left'onClick={(e) => {e.preventDefault(); setChatBlock(false);}}/>
              <img src={receiverPicture} className="right-con-pfp"/>
              <h3>{userName}</h3>   {/* change fetch in db */}
              <Flag color='white'/>
            </div>      


            <div className = "profile-buttons">
              <button className="review-button">Leave Review</button>
            </div>      
        </div>


        <div className='itemInquired'>
          <img src={itemPicture}/>
          <div className='itemInquiredDeets'>
            <h3>{itemName}</h3>
            <p>&#8369;{itemPrice}</p>
          </div>
          <div className = "item-buttons">
              <button className="view-button">
                <span>Mark Sold</span>
              </button>
              <button className="view-button">
                <span>Reserve</span>
              </button>
          </div>    
        </div>


        <div className='messagesholder'> {/* start  */}
            <div className='adjust-holder' >
              {messages.map((msg, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    justifyContent: msg.senderId === currentUserId ? "flex-end" : "flex-start",
                    paddingRight: msg.senderId === currentUserId ? "10px" : "0",
                    paddingLeft: msg.senderId !== currentUserId ? "25px" : "0",
                  }}
                >
                  <p
                    className={
                      msg.senderId === currentUserId
                        ? "specific-messages sent-message"
                        : "specific-messages received-message"
                    }
                  >
                    {msg.text}
                  </p>
                </div>
              ))}
              {/* 👇 Invisible anchor to scroll to */}
              <div ref={messagesEndRef} />
            </div>




            <div className='send-container'>
              <button className='submit-image'>
                <Images size={25} color='green' />
              </button>
              <textarea className='sendinput'
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
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
  </div>
  )
}




export default Message
