import { useState } from 'react'
import './Styles.css'
import Logout from '../Logout';
export default function Actions() {
  
   const[flag,setFlag]=useState(false)

    const suspendLogout=()=>{
        
        setFlag((prev)=>!prev)
    }
    return (

        <div className='action_btns_container'>
            <button className='gst-retrive-child'>Temporary Suspended</button>
            <button className='gst-retrive-child' onClick={suspendLogout}>Suspended</button>
            {flag&&<Logout  suspendLogout={suspendLogout} />}    
            <button className='gst-retrive-child' onClick={suspendLogout}>Deleted</button>
        </div>
    )
}
