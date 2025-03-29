import React from 'react'
import "./Message.css";
const Message = () => {
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

            <p>This is messages</p>
          </div>
        </div>
    </div>
  )
}

export default Message
