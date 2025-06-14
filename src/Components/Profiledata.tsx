import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchSocialUser } from '../Redux/Reducers/UserMangement'; // Adjust path as needed
import Rectangle from '../assets/Rectangle.png';
import '../Styles/Profiledata.css';
import { AppDispatch, RootState } from '../Redux/store/Store';


const Profiledata = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { socialUser,socialUserError } = useSelector((state:RootState) => state.UserMangment);


  // Fetch social user data on mount


  // Prepare data for display
  const profiledata = socialUser
    ? [
        { id: 1, key: 'First Name', value: socialUser?.user?.firstname },
        { id: 2, key: 'Last Name', value: socialUser?.user?.lastname || 'N/A' },
        { id: 3, key: 'Gender', value: socialUser?.user?.gender.charAt(0).toUpperCase() + socialUser?.user?.gender.slice(1) },
        { id: 4, key: 'Date of Birth', value: new Date(socialUser?.user?.dateofbirth).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) },
        { id: 5, key: 'Phone Number', value: `${socialUser?.user?.countryCode}${socialUser?.user?.mobile}` },
      ]
    : [];

  // Construct display name
  const displayName = socialUser ? `${socialUser?.user?.firstname} ${socialUser?.user?.lastname}` : 'Loading...';

 

  if (socialUserError) {
    return <div>{socialUserError}</div>;
  }

  return (
    <div className="container-box">
      <div className="profile-container">
        <div className="profile-image-box">
          <img
            className="profile-image"
            src={socialUser?.user?.coverphoto || Rectangle}
            width="174px"
            height="213px"
            alt="Profile"
          />
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
          <button className="download-report-btns">
            Download Report <i className="bi bi-download ms-2"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profiledata;