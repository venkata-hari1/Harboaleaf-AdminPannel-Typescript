import React from 'react'
import './Styles.css'
import { useLocation } from 'react-router-dom'
export default function Actions() {
    const location=useLocation()
    const pathname=location.pathname
    const handleTemSuspended=()=>{
   
    }
    return (
        <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
            <a className="dropdown-item" href="#" onClick={()=>handleTemSuspended}>Temporary Suspended</a>
            <a className="dropdown-item" href="#">Suspended</a>
            <a className="dropdown-item" href="#">Deleted</a>
        </div>
    )
}
