import React from 'react'
import '../Styles/Safetyreports.css';
import safetyimg from "../assets/safetyimg.png"
import Safetytable from './Safetytable';
const Safetyreports = () => {

    const safedata=[

         {id:1,key:"Gender",value:"Female"},
         {id:2,key:"Date of Birth", value:"12-02-1998"},
         {id:3,key:"Phone number", value:"+91 7550723470"},
         {id:4,key:"Rescued By", value:"Akhil pradhan"},
         {id:5,key:"Emergency Time and Date", value:"11 : 53 AM, 13th October 2024"},
         {id:6,key:"Emergency Location", value:"11 : 53 AM, 13th October 2024"}

    ]

  return (
    <div className='container'>
        <div className='safety-reports-box'>
          <div className='img-box'> 
           <img src={safetyimg} width="174px" height="213px" />
          </div>  
           <div className='safety-titles'>
             <div className='safety-names'> 
             <p>Navjot Kaur</p>
             <p style={{color:"#FF0000"}}>[Critical Emergency]</p>
             </div>
             {
              safedata.map(data=>(

                 <div className='safety-data-box'>
                   <p className='safety-key'> {(data.id===5 || data.id===6)?(<span style={{color:"#FF0000"}}>{data.key}</span>):(data.key)}</p>
                   <p className='safety-value'>{data.id==4 && <img src="http://www.w3.org/2000/svg" className="rounded-circle" />}{data.value}</p>    
          
                 </div>


              ))

            }
           </div>
          
           <div className='reportchat' >
            <button className='download-chat'>Download Chat Report <i className="bi bi-download ms-2"></i></button>
           </div>




           </div>


          <div>
        </div>        
          <Safetytable/>

        </div>
  
  )
}

export default Safetyreports
