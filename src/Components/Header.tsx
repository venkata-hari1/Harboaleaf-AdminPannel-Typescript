import React, { useState } from 'react'
import '../Styles/Header.css';
import { useLocation } from 'react-router-dom'
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../Redux/store/Store';
import { Admin_Dashboard, GST_User_Reports, GSTUSERS, Subscription, UserReports, Users } from '../Redux/Reducers/UserMangement';
const Header = () => {
  const[search,setSearch]=useState('')
  const totalusers= localStorage.getItem('totalusers')
  const location = useLocation()
  const pathanme=location.pathname

  const dispatch=useDispatch<AppDispatch>()
  const handleHeaderBack = () => {
    window.history.back();
  };

  const handleSearch=async()=>{
    switch (location.pathname) {
      case '/admin/admin-pannel':{
        const data={
          year:search
        }
       await dispatch(Admin_Dashboard({data:data}))
       break; 
      }
      case '/admin/user-management':{
        const data={
          page:1,
          sort:'desc',
          filter: '',
          state:search
        }
       await dispatch(Users({data:data}))
       break;
      }
      case '/admin/user-reports':{
        const data={
          page:1,
          sort:'desc',
          filter: '',
          state:search
        }
       await dispatch(UserReports({data:data}))
       break;
      }
      case '/admin/gst-users':{
        const data={
          page:1,
          sort:'desc',
          filter: '',
          state:search
        }
       await dispatch(GSTUSERS(({data:data})))
       break;
      }
      case '/admin/gst-reports':{
        const data={
          page:1,
          sort:'desc',
          filter: '',
          state:search
        }
       await dispatch(GST_User_Reports(({data:data})))
       break;
      }
      case '/admin/subscription-management':{
        const data={
          page:1, 
          filter:'' ,
          state:search
        }
       await dispatch(Subscription(({data:data})))
       break;
      }
      default:{
        break
      }
    }
    
  }
  let name = "";

  React.useEffect(() => {
    if ([
      "/admin/user-management",
      "/admin/user-reports",
      "/admin/gst-users",
      "/admin/gst-reports",
      "/admin/emergency",
      "/admin/admgmt/userform",
      "/admin/admgmt",
      "/admin/edit-profile",
      "/admin/billing-invoice",
      "/admin/subscription-management",
      "/admin/moniter-compaign"
    ].includes(location.pathname)) {
      setSearch('');
  
      
    }
    
  }, [location.pathname]);

  switch (location.pathname) {
    case "/admin/admin-pannel":
      name='Admin Pannel'
   
      break;
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
    case "/admin/subscription-management":
        name = "Subscription Management";
      break;
    case "/admin/moniter-compaign":
       name = "Monitor Campaign";
      break;
    
    default:
      name = "Profile Info";
  }
  return (
    <div className='main-header-Container'>
     <div className={(location.pathname==="/admin/emergency" || location.pathname==="/admin/safety-reports")?'header-container1':'header-container'}>
      <div className='header-items'>
       <div className='header-title' style={{cursor:'pointer'}} onClick={handleHeaderBack}>
           <p>{name}</p> 
        </div>
        <div className='search-notify'>
        {(location.pathname!=="/admin/edit-profile" && location.pathname!=="/admin/admgmt" && location.pathname!=='/admin/admgmt/userform') &&<div className='header-serach'>
        <input type={pathanme==="/admin/admin-pannel"?'number':'text'} value={search} name='year' onChange={(e)=>setSearch(e.target.value)} placeholder={pathanme==="/admin/admin-pannel"?'Search with year...':'Search with State'} id='header-input'/><i className="bi bi-search" onClick={handleSearch}></i> 
        </div>}

        {/* <div className='header-notify'>
          <button id="notify-button" ><i className="bi bi-bell-fill "></i></button>
        </div> */}

        </div>
       </div> 


     </div>

     {(location.pathname!=="/admin/user-management/profile-info/1" &&
      location.pathname!=="/admin/edit-profile" && location.pathname!=="/admin/safety-reports" &&
      location.pathname!=="/admin/admin-pannel" &&location.pathname!=="/admin/admgmt/userform"
      ) &&<div className='total'>
      <p id="total1">Total Users</p>
      <p id="total2">{totalusers}</p>
      <p id="total3"><i className="bi bi-arrow-up-right "  style={{ background:"#26666333",color: "#4AD991" }}></i><span style={{ background:"#26666333",color: "#4AD991" }}>4.8</span> from yesterday</p>
     </div>}

   </div>   

  )
}

export default Header