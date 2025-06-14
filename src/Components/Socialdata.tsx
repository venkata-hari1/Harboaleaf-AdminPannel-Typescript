import React from 'react'
import { data } from 'react-router-dom'
import '../Styles/Socialdata.css';
import { useSelector } from 'react-redux';
import { RootState } from '../Redux/store/Store';

const Socialdata = () => {
  const state=useSelector((state:RootState)=>state.UserMangment.socialUser)
    const socialdata=[

        {id:1, key:"Display Name",value:state?.user?.uniquename ||  'N/A'},
        {id:2,key:"User ID", value:state?.user?._id},
        {id:3, key:"Bio",value:state?.user?.bio || 'N/A'},
        {id:4, key:"Account type", value:state?.user?.privacy?'Private':'Public'},
       
      
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
          <p className="social-data-key"style={{color:"#B9B9B9"}}>{data.key}</p>
          <p className="social-data-value"style={{color:"#FFFFFF"}}>{data.value}</p>

          </div>
         ))
}
    

    </div>

   </div>
  )
}

export default Socialdata