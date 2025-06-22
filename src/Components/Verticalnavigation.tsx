import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../Styles/Verticalnavigation.css';
import Harborleaf from '../assets/Harboleaf_logo.png';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../Redux/store/Store';
import { AdminProfile } from '../Redux/Reducers/UserMangement';
import { showToast } from '../../Utils/Validation';

const Verticalnavigation = () => {
  const dispatch=useDispatch<AppDispatch>()
  useEffect(()=>{
    async function getData(){
     dispatch(AdminProfile());
    }getData()
  },[dispatch])
  const { profile, loading }: any = useSelector((state: RootState) => state.UserMangment);
  const navigate = useNavigate();
  const location = useLocation();

  const menudata = [
    { id: 1, menu: "Admin Panel", icon: "bi-people-fill", route: "admin-pannel", locationRoute: "/admin/admin-pannel" },
    { id: 2, menu: "User Management", icon: "bi-people-fill", route: "user-management", locationRoute: "/admin/user-management" },
    { id: 3, menu: "User Management Reports", icon: "bi-file-earmark-fill", route: "user-reports", locationRoute: "/admin/user-reports" },
    { id: 4, menu: "GST User Management", icon: "bi-briefcase-fill", route: "gst-users", locationRoute: "/admin/gst-users" },
    { id: 5, menu: "GST User Reports", icon: "bi-cash-stack", route: "gst-reports", locationRoute: "/admin/gst-reports" },
    { id: 6, menu: "Subscription Management", icon: "bi-person-vcard", route: "subscription-management", locationRoute: "/admin/subscription-management" },
    { id: 7, menu: "Emergency Management", icon: "bi-shield-fill-check", route: "emergency", locationRoute: "/admin/emergency", color: "#FF4C4C" },
    { id: 8, menu: "AD Management", icon: "bi-badge-ad-fill", route: "admgmt", locationRoute: "/admin/admgmt" },
    { id: 9, menu: "Edit Profile", icon: "bi-person-circle", route: "edit-profile", locationRoute: "/admin/edit-profile" },
  ];

  const handleClick = (menu) => {
    navigate(`/admin/${menu.route}`);
    if (window.innerWidth < 900) {
    
    }
  };
const handleLogout=()=>{
  localStorage.clear()
  setTimeout(()=>{
    navigate('/')
  },300)

  showToast(true,'Successfully Logout')
}
  return (
    <>
      <div
        className="sidebar-container"
        style={{
          background: 'linear-gradient(to bottom, #101010, #1a1a1a)',
          color: '#fff',
          padding: '20px 0px',
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <div className="text-center mb-4">
            <img src={Harborleaf} width="170px" height="40px" alt="Logo" />
          </div>

          <ul style={{ listStyle: 'none', paddingLeft: '18px', margin: 0 }}>
            {menudata.map((menu) => {
              let isActive = location.pathname === menu.locationRoute;

              if (menu.menu === "AD Management") {
                isActive =
                  location.pathname.startsWith('/admin/admgmt') ||
                  location.pathname.startsWith('/admin/userform') ||
                  location.pathname.startsWith('/admin/moniter-compaign') ||
                  location.pathname.startsWith('/admin/billing-invoice');
              }

              return (
                <li
                  key={menu.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    marginBottom: '8px',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    backgroundColor: isActive ? '#1f2937' : 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease-in-out',
                  }}
                  onClick={() => handleClick(menu)}
                >
                  <i
                    className={`bi ${menu.icon}`}
                    style={{
                      fontSize: '18px',
                      color: menu.color
                        ? menu.color
                        : isActive
                          ? '#4dc9ff'
                          : '#bbb',
                    }}
                  />
                  <span
                    style={{
                      fontSize: '14px',
                      fontWeight: isActive ? 600 : 400,
                      color: isActive ? '#4dc9ff' : '#e0e0e0',
                      fontFamily: 'Roboto',
                    }}
                  >
                    {menu.menu}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        <div
          className="adminbutton d-flex align-items-center px-3 py-2 rounded"
          style={{
            margin: '16px',
            backgroundColor: '#2a2a2e',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <img
            src={profile?.user?.image}
            className="rounded-circle"
            width="36px"
            height="36px"
            alt="Admin"
          />
          <div className="ms-2" style={{ lineHeight: '1.2' }} onClick={() => navigate('/')}>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#fff' }}>
              {profile?.user?.firstname}
            </div>
            <div style={{ fontSize: '12px', color: '#a0a0a0' }}>Admin</div>
          </div>
          <div className="ms-auto d-flex align-items-center gap-2">
            {/* <i className="bi bi-bell-fill" style={{ color: '#ccc' }}></i> */}
            {/* Logout icon */}

            <i
            onClick={handleLogout}
            data-toggle="modal" data-target="#exampleModalCenter"
              className="bi bi-box-arrow-right"
              style={{ color: '#ccc', cursor: 'pointer' }}
              data-bs-toggle="modal"
              data-bs-target="#logoutModal"
            ></i>
          </div>
        </div>
      </div>
    </>
  );
};

export default Verticalnavigation;
