import React from 'react'
import { data } from 'react-router-dom'
import '../Styles/Socialdata.css';
const Socialdata = () => {

    const socialdata=[

        {id:1, key:"Display Name",value:"Suresh 01"},
        {id:2,key:"User ID", value:"HL20241003ABC123"},
        {id:3, key:"Bio",value:"Explorer at heart 🌍 | Fitness enthusiast 💪 | Dog lover 🐾 | Living life one adventure at a time ✨"},
        {id:4, key:"Account type", value:"Public"},
        {id:5,key:"Status", value:"Explorer at heart 🌍 | Fitness enthusiast 💪 | Dog lover 🐾 | Living life one adventure at a time ✨"}
      
    ]

  return (
   <div className='social-container'>
    <div className='social-wrapper'>
     <div className="social-title-box">
      <p className='social-title'>Social media Information</p>
     </div>
    
      {
         socialdata.map( data=>(
          <div className="social-data1">
          <p style={{color:"#B9B9B9"}}>{data.key}</p>
          <p style={{color:"#FFFFFF"}}>{data.value}</p>

          </div>
         ))
}
    

    </div>

   </div>
  )
}

export default Socialdata