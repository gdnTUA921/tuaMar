import React, { useEffect, useState } from 'react';
import { database } from '../firebaseConfig';
import { ref, onValue, push } from 'firebase/database';
import "./Message.css";
import { Send } from "lucide-react"; {/* Library for icons*/}


function Message() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    const messagesRef = ref(database, 'messages');
    onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setMessages(Object.values(data));
      }
    });
  }, []);

  const sendMessage = () => {
    const messagesRef = ref(database, 'messages');
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
        </div>
        <div className = "messagebar">
            <div className = "profile">
            <h3>Profile Name</h3>   {/* change fetch in db */}
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