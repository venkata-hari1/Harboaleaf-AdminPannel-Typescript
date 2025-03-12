import React from 'react'
import Rectangle from '../assets/Rectangle.png';
import { data } from 'react-router-dom';
import '../Styles/Profiledata.css';
const Profiledata = () => {

  const profiledata=[

    {id:1, key:"First Name",value:"Suresh"},
    {id:2,key:"Last Name", value:"Kumar"},
    {id:3, key:"Gender",value:"Male"},
    {id:4, key:"Date of Birth", value:"12-09-2022"},
    {id:5,key:"Phone Number", value:"+91-9434439454"}
  ]

return (
<div className='container-box'>
    <div className="profile-container" >
     <div className="profile-image-box">
      <img className="profile-image"src={Rectangle} width="174px" height="213px" />
     </div>
      
      <div className="profile-title-box">
        <p className="profile-title">Suresh Kumar</p>
        {
          profiledata.map(data=>(
           
             <div className="profile-data" > 
              <p className="data-key">{data.key}</p>
              <p  className="data-value">{data.value}</p>
             </div>

          )) 
       } 
     </div>
     
     <div className="download-report"> 
     <button className='download-report-btns' >Download Report<i className="bi bi-download ms-2"></i></button>
     </div>
     </div>

     </div>

)
}
export default Profiledata

