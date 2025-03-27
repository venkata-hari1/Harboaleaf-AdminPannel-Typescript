import React from 'react'
import '../Styles/Header.css';
import { useLocation } from 'react-router-dom'
const Header = () => {
  const location = useLocation()
  const handleHeaderBack = () => {
    window.history.back();
  };
  let name = "";
  switch (location.pathname) {
    case "/admin/user-management":
      name = "User Management";
      break;
    case "/admin/user-reports":
      name = "User Management Reports";
      break;
    case "/admin/gst-users":
      name = "GST User Management"
      break;
    case "/admin/gst-reports":
      name = "GST User Reports";
      break;
    case "/admin/emergency":
      name = "Emergency Management";
      break;
    case "/admin/admgmt/userform":
      name = "AD Management";
      break;
    case "/admin/admgmt":
        name = "AD Management";
     break;
    case "/admin/edit-profile":
      name = "Edit Profile";
      break;
    case "/admin/billing-invoice":
        name = "Billing and Invoice details";
      break;
    case "/admin/moniter-compaign":
       name = "Monitor Campaign";
      break;
      case "/admin/admin-pannel":
        name = "Admin Pannel";
      break;
    default:
      name = "Dashboard";
  }
  return (
    <div className='main-header-Container'>
     <div className={(location.pathname==="/admin/emergency" || location.pathname==="/admin/safety-reports")?'header-container1':'header-container'}>
      <div className='header-items'>
       <div className='header-title' style={{cursor:'pointer'}} onClick={handleHeaderBack}>
           <p>{name}</p> 
        </div>
        <div className='search-notify'>
        <div className='header-serach'>
        <input type='search' placeholder='Search' id='header-input'/><i className="bi bi-search"></i> 
        </div>

        <div className='header-notify'>
          <button id="notify-button" ><i className="bi bi-bell-fill "></i></button>
        </div>

        </div>
       </div> 


     </div>

     {(location.pathname!=="/admin/user-management/profile-info/1" &&
      location.pathname!=="/admin/edit-profile" && location.pathname!=="/admin/safety-reports" &&
      location.pathname!=="/admin/admin-pannel" &&location.pathname!=="/admin/admgmt/userform"
      ) &&<div className='total'>
      <p id="total1">Total Users</p>
      <p id="total2">40,300</p>
      <p id="total3"><i className="bi bi-arrow-up-right "  style={{ background:"#26666333",color: "#4AD991" }}></i><span style={{ background:"#26666333",color: "#4AD991" }}>4.8</span>from yesterday</p>
     </div>}

   </div>   

  )
}

export default Header