import React, { useRef, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { database } from '../firebaseConfig';
import { ref, onValue, push, set, get, update } from 'firebase/database';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Link } from 'react-router-dom';
import "../assets/Message.css";
import { Send, Search, Flag, MoveLeft, Images } from "lucide-react";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import MessageLoader from '../components/MessageLoader';
import LoaderPart from '../components/LoaderPart';

function Message() {
  const [isLoading, setIsLoading] = useState(true);
  const MySwal = withReactContent(Swal);
  const ip = process.env.REACT_APP_LAPTOP_IP;
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const location = useLocation();
  const { passedUserID, passedUserIDSender, passedUserIDReceiver, passedItemID, passedItemStatus } = location.state || {};

  useEffect(() => {
    if (location.state && location.state.passedUserID && location.state.passedItemID) {
      setReceiverID(location.state.passedUserID);
      setItemId(location.state.passedItemID);
      console.log("Set receiverID:", location.state.passedUserID);
    } else {
      console.log("No passedUserID in location.state", location.state);
    }
  }, [location.state]);

  const [currentUserId, setcurrentUserId] = useState(null); //firebase user_id
  const [currentUserName, setCurrentUserName] = useState(null);
  const [currentPfp, setCurrentPfp] = useState(null);
  const [receiverID, setReceiverID] = useState(null);
  const [chatBlock, setChatBlock] = useState(false);
  const [chats, setChats] = useState([]);

  // Setting up userName, itemName, itemPicture, price, etc.
  const [itemId, setItemId] = useState("");
  const [userName, setUserName] = useState("");
  const [itemName, setItemName] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [itemPicture, setItemPicture] = useState("");
  const [itemStatus, setItemStatus] = useState("");
  const [receiverPicture, setReceiverPicture] = useState("");
  const [chat_id, setChat_id] = useState("");
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [receiverStatus, setReceiverStatus] = useState("");
  const [sellerID, setSellerID] = useState("");

  // New state for image preview modal
  const [showPreview, setShowPreview] = useState(false);

  //New state for large image viewing modal
  const [showEnlargeImg, setShowEnlargeImg] = useState(false);
  const [enlargedImg, setEnlargeImg] = useState("");

  // Alternative user ID for data fetching
  const [appUserID, setAppUserID] = useState("");

  // Setting up message count
  const [messageCount, setMessageCount] = useState(0);

  // Checking if logged in, if not redirected to log-in
  useEffect(() => {
    
      fetch(`${ip}/fetchSession.php`, {
        method: "GET",
        credentials: "include",
      })
        .then((response) => response.json())
        .then((data) => {
          if (!data.user_id) {
            navigate("/login", {replace: true});
          }
          else {
            console.log(data.firebase_uid);
            setcurrentUserId(data.firebase_uid);
            setCurrentUserName(data.full_name);
            setCurrentPfp(data.pfp);
            fetchChats(data.firebase_uid);
          }
        })
        .catch((error) => {
          console.error("Error fetching session data:", error);
        });

  }, [ip, navigate]);

  // Opening Chat Block for Messaging if the user comes from Item Deets Page
  useEffect(() => {
    if (passedUserID && passedItemID) {
      setChatBlock(true);

      fetch(`${ip}/fetchContactSellerDeets.php`, {
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({ sellerID: passedUserID, itemID: passedItemID }),
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
          setAppUserID(data.user_id);
        })
        .catch((error) => console.error("Error fetching pics:", error));
    }
  }, [ip, passedItemID, passedUserID]);

  // Fetching list of chats for messagebox class or chat inbox
  const fetchChats = (currentUserID) => {
    const intervalId = setInterval(() => {
        if (!currentUserID) {
          console.warn("fetchChats: currentUserId not yet available.");
          return;
        }

        const chatsRef = ref(database, 'chatsList');

        onValue(chatsRef, (snapshot) => {
          if (!snapshot.exists()) {
            console.log("fetchChats: No chats found.");
            setChats([]);
            setIsLoading(false);
            return;
          }

          const allChats = snapshot.val();
          const filteredChats = [];

          Object.entries(allChats).forEach(([chatId, chatData]) => {
            if (chatData.buyerID_fb === currentUserID || chatData.sellerID_fb === currentUserID) {
              filteredChats.push({
                ...chatData,
                chat_id: chatId,
              });
            }
          });

          filteredChats.sort((a, b) => b.timestamp - a.timestamp);

          setChats(filteredChats);
          setIsLoading(false);
        });
    }, 3000);

    return () => clearInterval(intervalId);
  };

  // For Automatic Scroll to the latest message
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      const el = messagesEndRef.current;
      el.parentNode.scrollTop = el.parentNode.scrollHeight;
    }
  }, [messages]);


  //Sending text messages
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
          last_sender_id: currentUserId,
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
          last_sender_id: currentUserId,
        };
        await set(chatListRef, chatData);
      }

      setInput("");
    } catch (error) {
      console.error("Error sending message or updating chat list:", error);
    }
  };


  // Sending images
  const handleImageUpload = async (file, chat_id, currentUserId, receiverID, itemId) => {
    const finalChatId = chat_id
      ? chat_id
      : [String(itemId), String(currentUserId), String(receiverID)].sort().join("_");

    const storage = getStorage();
    const imageRef = storageRef(storage, `chat_images/${Date.now()}_${file.name}`);

    try {
      const snapshot = await uploadBytes(imageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      const messageRef = push(ref(database, `messages/${finalChatId}`));

      await set(messageRef, {
        imageUrl: downloadURL,
        senderId: currentUserId,
        receiverID: receiverID,
        itemId: itemId,
        timestamp: Date.now()
      });

      // Update chat list with image message
      const chatListRef = ref(database, `chatsList/${finalChatId}`);
      await update(chatListRef, {
        last_message: "📷 Image",
        timestamp: Date.now(),
        last_sender_id: currentUserId,
      });

      console.log("Image sent");
    } catch (error) {
      console.error("Image not sent", error);
    }
  };

  // Listen for messages
  useEffect(() => {
    if (!currentUserId || !receiverID || !itemId) {
      console.log("Missing IDs for message listening:", { currentUserId, receiverID, itemId});
      return;
    }

    const chatId = [String(itemId), String(currentUserId), String(receiverID)].sort().join("_");
    const messagesRef = ref(database, `messages/${chatId}`);

    const unsubscribe = onValue(messagesRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        let messageList = [];

        if (Array.isArray(data)) {
          messageList = data.filter(msg => msg !== null).map((msg, index) => ({
            id: index,
            ...msg
          }));
        } else if (typeof data === 'object') {
          messageList = Object.entries(data).map(([key, value]) => ({
            id: key,
            ...value
          }));
        }

        if (messageList.length > 0 && messageList[0].timestamp) {
          messageList.sort((a, b) => a.timestamp - b.timestamp);
          setMessageCount(messageList.length);
        }

        setMessages(messageList);

        // Automatically mark as read if new message comes in while chat is open
        const latest = messageList[messageList.length - 1];
        if (
          latest &&
          latest.senderId !== currentUserId &&
          chatBlock
        ) {
          const chatRef = ref(database, `chatsList/${chatId}/read/${currentUserId}`);
          set(chatRef, Date.now());
        }

      } else {
        setMessages([]);
      }
    }, (error) => {
      console.error("Error listening to messages:", error);
    });

    return () => unsubscribe();
  }, [itemId, currentUserId, receiverID, chatBlock]);

  // For search filtering chats
  const [searchQuery, setSearchQuery] = useState("");

  const filteredChats = Array.isArray(chats)
    ? chats.filter((chat) => {
      const receiverName = currentUserId === chat.sellerID_fb ? chat.buyer_name : chat.seller_name;
      return (
        chat.item_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        receiverName?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    })
    : [];

  const openChat = (itemId, userName, itemName, price, itemPicture, receiverPic, status, chat_id, receiverId, sellerID, user_id, receiverStatus) => {
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
    setSellerID(sellerID);
    setAppUserID(user_id);
    setReceiverStatus(receiverStatus);
  }

  // Function for Seller marking item as SOLD / RESERVED / AVAILABLE
  // This function will update the item_status in PHP Backend and the chatsList in Firebase
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

        fetch(`${ip}/setItemStatus.php`, {
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
              // Update item_status in Firebase
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
            } else {
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

  // Update existing image input onChange handler:
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      MySwal.fire({
        html: "<h1>Image must be under 2MB.</h1>",
        confirmButtonColor: "green"
      })
      e.target.value = "";
      return;
    }

    if (!file.type.startsWith('image/')) {
      MySwal.fire({
        html: "<h1>Only image files are allowed.</h1>",
        confirmButtonColor: "green"
      })
      MySwal.fire();
      e.target.value = "";
      return;
    }

    setPreviewUrl(URL.createObjectURL(file));
    setSelectedImageFile(file);
    setShowPreview(true);
  };

  // Add this function to close the preview:
  const closePreview = () => {
    setShowPreview(false);
    setPreviewUrl(null);
    setSelectedImageFile(null);
    if (window.__imageInputRef) {
      window.__imageInputRef.value = "";
    }
  };

  // Add this function to send the image:
  const sendPreviewImage = async () => {
    if (selectedImageFile) {
      await handleImageUpload(selectedImageFile, chat_id, currentUserId, receiverID, itemId);
      closePreview();
    }
  };

  //Navigate to Review Module
  const goToReview = (itemId, itemPicture, itemName, userName, appUserID, receiverPicture, receiverStatus) => {

    fetch (`${ip}/checkReview.php`, {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({ itemId: itemId, reviewed_user_id: appUserID}),
      credentials: "include",
    })
    .then ((res) => res.json())
    .then ((data) => {
      if (data.message === "No Reviews Yet"){
        navigate("/Reviewmod", {
          state: {
            passedID: itemId,
            previewPic: itemPicture,
            itemName: itemName,
            reviewedUser: userName,
            reviewedUserID: appUserID,
            receiverPicture: receiverPicture,
            passedStatus: receiverStatus
          }
        })
      }
      else{
        MySwal.fire({
          html: "<h2>You have already made a review for this " + receiverStatus + ".</h2>",
          confirmButtonColor: "#547B3E",
        });
      }
    })
    .catch((error) => {
      console.error("Error checking review data:", error);
    });
  }


  return (
    <div className='messagecontainer'>
      {/* Left Sidebar */}
      {isLoading === false ? (
        <div className={`messagebox ${chatBlock ? 'messagebox-dup' : ''}`}>
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
                      chat.sellerID_fb,
                      user_id,
                      receiverStatus
                    );
                  }}
                >
                  <img src={receiverPfp || "/tuamar-profile-icon.jpg"} className="messagePFP" alt="User PFP" onError={(e) => (e.target.src = "/tuamar-profile-icon.jpg")} />

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
        <div className={`messagebox ${chatBlock ? 'messagebox-dup' : ''}`}>
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
            {[1, 2, 3, 4, 5].map((index) => (
              <div key={index} className="listChats-loader">
                <MessageLoader />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Default Message Prompt */}
      {isLoading === false ? (
        <div className={`messageRightCon-default ${chatBlock ? 'hidden' : ''}`}>
          <img src='tuamar.png' className='message-defaultPic' alt='tuamar_logo'/>
          <h1>Press Any Chat To Continue</h1>
        </div>
      ) : (
        <div className={`messageRightCon-default ${chatBlock ? 'hidden' : ''}`}>
          <LoaderPart />
        </div>
      )}

      {/* Right Panel - Active Chat */}
      <div className={`messageRightCon ${chatBlock ? '' : 'hidden'}`}>
        <div className="messagebar">
          <div className="profile">
            <MoveLeft className='arrow-left' onClick={() => setChatBlock(false)} />
            <Link to={`/userProfile/${userName}`} className="messageSellerLink">
              <img src={receiverPicture || "/tuamr-profile-icon.jpg"} className="right-con-pfp" alt='userName' onError={(e) => (e.target.src = "/tuamar-profile-icon.jpg")}/>
            </Link>
            <Link to={`/userProfile/${userName}`} className="messageSellerLink">
              <h3>{userName}</h3>
            </Link>
            <Link to="/reportUser" className="reportLink" state={{ passedItemID: itemId, receiverPicture, reportedUser: userName, reportedUserId: appUserID }}>
              <Flag />
            </Link>
          </div>
        </div>

        <div className='itemInquired'>
          <div className='itemInquiredDetails'>
            <Link to={`/itemdetails/${itemId}/${encodeURIComponent(itemName)}`} className="item-details-link">
              <img src={itemPicture || "/default-image.png"} alt='itemName' onError={(e) => (e.target.src = "/default-image.png")}/>
            </Link>
            <div className='itemInquiredDeets'>
              <Link to={`/itemdetails/${itemId}/${encodeURIComponent(itemName)}`} className="item-details-link">
                <h3>{itemName}</h3>
              </Link>
              <p>&#8369;{itemPrice} {itemStatus === "AVAILABLE" ? "" : " • " + itemStatus}</p>
            </div>
          </div>
          <div className="item-buttons">
            <button className="review-button" disabled={messageCount < 7} onClick={() => goToReview(itemId, itemPicture, itemName, userName, appUserID, receiverPicture, receiverStatus)}>
              Leave Review
            </button>
            <button className="view-button" style={{ display: currentUserId !== sellerID || itemStatus === "SOLD" || itemStatus === "IN REVIEW" || itemStatus === "UNLISTED" ? "none" : "block" }} onClick={() => handleItemStatus("Sold", itemId)}>Mark Sold</button>
            <button className="view-button" style={{ display: currentUserId !== sellerID || itemStatus === "RESERVED" || itemStatus === "SOLD" || itemStatus === "IN REVIEW" || itemStatus === "UNLISTED" ? "none" : "block" }} onClick={() => handleItemStatus("Reserved", itemId)}>Reserve</button>
            <button className="view-button" style={{ display: currentUserId !== sellerID || itemStatus === "AVAILABLE" || itemStatus === "IN REVIEW" || itemStatus === "UNLISTED" ? "none" : "block" }} onClick={() => handleItemStatus("Available", itemId)}>Available</button>
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
              <Link to={currentUserId === msg.senderId ? '/myProfile' : `/userProfile/${userName}`} className="sellerLink">
                <img
                  src={
                    msg.senderId === currentUserId
                      ? currentPfp || "/tuamar-profile-icon.jpg"
                      : receiverPicture || "/tuamar-profile-icon.jpg"
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
                  onError={(e) => (e.target.src = "/tuamar-profile-icon.jpg")}
                />
              </Link>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: msg.senderId === currentUserId ? "flex-end" : "flex-start",
                }}
              >
                <div className={msg.senderId === currentUserId ? "specific-messages sent-message" : "specific-messages received-message"}>
                  {msg.imageUrl ? (
                    <img src={msg.imageUrl} alt="sent" style={{ width: "auto", height: "120px", borderRadius: "8px", padding: 0 }} onClick={(e) => {setShowEnlargeImg(true); setEnlargeImg(msg.imageUrl)}}/>
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
                  })}` : ""} </span>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className='send-container'>
          <input
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            ref={input => (window.__imageInputRef = input)}
            onChange={handleImageSelect}
          />

          {/* Image Preview Modal */}
          {showPreview && (
            <div className="image-preview-overlay">
              <div className="image-preview-container">
                <div className="image-preview-header">
                  <h3>Send Image</h3>
                  <button className="close-preview-btn" onClick={closePreview}>
                    ×
                  </button>
                </div>
                <div className="image-preview-content">
                  <img src={previewUrl} alt="Preview" className="popup-preview-image-2" />
                </div>
                <div className="image-preview-actions">
                  <button className="cancel-btn" onClick={closePreview}>
                    Cancel
                  </button>
                  <button className="send-image-btn" onClick={sendPreviewImage}>
                    Send Image
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* View Image Modal */}
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
                  <img src={enlargedImg} alt="Preview" className="popup-preview-image" />
                </div>
              </div>
            </div>
          )}

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
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder='Type here your message...'
          />

          <button
            onClick={sendMessage}
            className='submit-message'
          >
            <Send size={20} color='green' />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Message;