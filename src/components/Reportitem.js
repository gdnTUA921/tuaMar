import React from 'react'
import "./Reportitem.css"
import { Send } from "lucide-react"; {/* Library for icons*/}
const Reportitem = () => {
  return (
    <div className = "reportcontainer">
        <div className= 'reportbox'>
        <h2 className ='reporttitle'>Report</h2>
        <h3 className='subheading'>Please fill out the form below to report the item</h3>
        <div className = "itembar"> 
        <h3>This is the item (change here)</h3>
       </div>
   

       <label className = "reasontitle" htmlFor="category">Reason for report</label>
       <form>
            <select id="category" className="report-select" name="category">
              <option value="" disabled selected hidden>Select a reason</option>
              <option value="Scam">Scam Listing</option>
              <option value="Inappropriate">Inappropriate or Offensive Content </option>
              <option value="Prohibited">Prohibited or Restricted Items</option>
              <option value="Incorrect Supplies">Incorrect or Misleading Information</option>
              <option value="Others">Others</option>
            </select>
       </form>
        <label className='reasondesc'>Description:</label>
                   <input type="text" id="itemName" className="desc-input" name="itemName" placeholder="Enter Report Description"/>

                   <button className="submit">
                   <Send size={19} />   Submit Report
                    </button>
        </div>
      
    </div>
  )
}

export default Reportitem
