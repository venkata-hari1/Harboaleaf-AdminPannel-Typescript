import React from 'react'
import './Styles.css'
export default function Actions() {
    return (
        <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
            <a className="dropdown-item" href="#">Temporary Suspended</a>
            <a className="dropdown-item" href="#">Suspended</a>
            <a className="dropdown-item" href="#">Deleted</a>
        </div>
    )
}
