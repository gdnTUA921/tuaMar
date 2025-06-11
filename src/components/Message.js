import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { database } from '../firebaseConfig';
import { ref, onValue, push } from 'firebase/database';
import "./Message.css";
import { Send } from "lucide-react";
import { doc, setDoc } from 'firebase/firestore';

//const chatRef = doc(dblClick, "chats")


function Message() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  
  const location = useLocation();
  const { passedUserID } = location.state || {};


  useEffect(() => {
    const messagesRef = ref(database, `messages/${passedUserID}`)    ;
    onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setMessages(Object.values(data));
      }
    });
  }, [passedUserID]);


  const sendMessage = () => {
    const messagesRef = ref(database, `messages/${passedUserID}`)  //put this to call the id  ;
    push(messagesRef, {
      text: input,
      timestamp: Date.now(),
    });
    //setInput("");
  };

  return (
    <div className='messagecontainer'>
       <div className='messagebox'>
       <div className='messagetitle' style={{ color: "#547B3E" }}>
          <h2 >Messages</h2>
        </div>
        <hr/>
        </div>
        <div className = "messagebar">
            <div className = "profile">
            <h3>Profile Name </h3>   {/* change fetch in db */}
            </div>
          <div className='messagesholder'>


          <div className='messagescroll' style={{ overflowY: 'scroll' }}>
             {messages.map((msg, i) => <p key={i}>{msg.text}</p>)}
           </div>


       
             <input className='sendinput' value={input} onChange={(e) => setInput(e.target.value)} />
             <button onClick={sendMessage} className="submitmessage">
                                <Send size={19} /> Send
                                 </button>
           
               
          </div>
        </div>
    </div>
  )
}


export default Message