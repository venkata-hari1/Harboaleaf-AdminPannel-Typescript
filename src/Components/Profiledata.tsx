import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import '../Styles/Profiledata.css';
import { AppDispatch, RootState } from '../Redux/store/Store';


const Profiledata = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { socialUser,socialUserError }:any = useSelector((state:RootState) => state.UserMangment);
  // Fetch social user data on mount

  // Prepare data for display
  const profiledata = socialUser
    ? [
        { id: 1, key: 'Full Name', value: socialUser?.user?.firstname },
        { id: 2, key: 'Gender', value: socialUser?.user?.gender.charAt(0).toUpperCase() + socialUser?.user?.gender.slice(1) },
        { id: 3, key: 'Date of Birth', value: new Date(socialUser?.user?.dateofbirth).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) },
        { id: 4, key: 'Phone Number', value: `${socialUser?.user?.countryCode}${socialUser?.user?.mobile}` },
      ]
    : [];

  // Construct display name
  const displayName = socialUser ? `${socialUser?.user?.firstname}` : 'Loading...';

 

  if (socialUserError) {
    return <div>{socialUserError}</div>;
  }

  return (
    <div className="container-box">
      <div className="profile-container">
        <div className="profile-image-box">
          {socialUser?.user?.image ? <img
            className="profile-image"
            src={socialUser?.user?.image}
            width="174px"
            height="213px"
            alt="Profile"
          /> :
          <div style={{border:'1px solid white',marginTop:'35px',background:'rgb(56, 86, 243)',width:'200px',height:'200px',display:'flex',justifyContent:'center',alignItems:'center'}}>
            <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" fill="currentColor" className="bi bi-person" viewBox="0 0 16 16">
              <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z" />
            </svg>
            </div>
            }
        </div>

        <div className="profile-title-box">
          <div>
            <p className="profile-title">{displayName}</p>
          </div>
          {profiledata.map((data) => (
            <div className="profile-data" key={data.id}>
              <p className="data-key">{data.key}</p>
              <p className="data-value">{data.value}</p>
            </div>
          ))}
        </div>

        <div className="download-report">
          {/* <button className="download-report-btns">
            Download Report <i className="bi bi-download ms-2"></i>
          </button> */}
        </div>
      </div>
    </div>
  );
};

export default Profiledata;