import React from 'react'
import { data } from 'react-router-dom'
import '../Styles/Socialdata.css';
import { useSelector } from 'react-redux';
import { RootState } from '../Redux/store/Store';

const Socialdata = () => {
  const state: any = useSelector((state: RootState) => state.UserMangment.socialUser)
  
  const followersCount = Array.isArray(state?.followers) ? state.followers.length : 0;
  const followingCount = Array.isArray(state?.following) ? state.following.length : 0;
  const friendsCount = Array.isArray(state?.friends) ? state.friends.length : 0;
  
  const postsCount =
    typeof state?.posts === "string" && state.posts.includes("No")
      ? 0
      : Array.isArray(state?.posts)
      ? state.posts.length
      : 0;
  
 
  
  const vibesCount =
    typeof state?.reels=== "string" && state.reels.includes("No")
      ? 0
      : Array.isArray(state?.reels)
      ? state.reels.length
      : 0;
  
  const socialdata = [
    { id: 1, key: "Display Name", value: state?.user?.uniquename || "N/A" },
    { id: 2, key: "User ID", value: state?.user?._id || "N/A" },
    { id: 3, key: "Bio", value: state?.user?.bio || "N/A" },
    { id: 4, key: "Account type", value: state?.user?.privacy ? "Private" : "Public" },
    {
      id: 5,
      key: "Status",
      value: `${postsCount} - Posts, ${friendsCount} - Friends, ${followersCount} - Followers, ${followingCount} - Following, ${vibesCount} - Vibes`,
    },
  ];
  

  return (
    <div className='social-container'>
      <div className='social-wrapper'>
        <div className="social-title-box">
          <p className='social-title'>Social media Information</p>
        </div>
        {
          socialdata.map((data, index) => (
            <div className="social-data1" key={index}>
              <p className="social-data-key" style={{ color: "#B9B9B9" }}>{data.key}</p>
              <p className="social-data-value" style={{ color: "#FFFFFF" }}>{data.value}</p>
            </div>
          ))
        }
      </div>

    </div>
  )
}

export default Socialdata