import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import '../Styles/Postdata.css';
import { RootState } from '../Redux/store/Store';

const Postdata = () => {
  const { socialUser }:any = useSelector((state: RootState) => state.UserMangment);
  const [activeTab, setActiveTab] = useState('Posts');

  const pvtdata = [
    { id: 1, title: 'Posts' },
    { id: 2, title: 'Vibes' },
    { id: 3, title: 'Tag' },
  ];

  const handleTabClick = (title: string) => {
    setActiveTab(title);
  };

  const renderContent = () => {
    if (!socialUser) {
      return <div>No data available</div>;
    }

    switch (activeTab) {
      case 'Posts':
  return (
    <div className="post-content" style={{display:'grid',gridTemplateColumns:'30% 30% 30%',gridGap:'2%',width:'100%'}}>
      {Array.isArray(socialUser.posts) && socialUser.posts.length > 0 ? (
        socialUser.posts.map((post: any, index: number) => (
          <div key={post._id || index}>
      
            {post.files?.map((file: {file:string}, i: number) => (
              <img key={i} src={file.file} alt="Post media" style={{width:'100%',height:'100%',objectFit:'cover'}} />
            ))}
          </div>
        ))
      ) : (
        <p>No posts available</p>
      )}
    </div>
  );

      case 'Vibes':
        return (
          <div className="post-content" style={{display:'grid',gridTemplateColumns:'30% 30% 30%',gridGap:'2%',width:'100%'}}>
            {Array.isArray(socialUser.reels) && socialUser.reels.length > 0 ? (
              socialUser.reels.map((reel: any, index: number) => (
                <div key={reel._id || index} className="reel-item">
                  {Array.isArray(reel.files) && reel.files.length > 0 ? (
                    reel.files.map((file: {file:string}, fIndex: number) => (
                      <video
                      key={fIndex}
                      src={file.file}
                      controls
                      muted
                      loop
                      style={{width:'100%', borderRadius: "10px", }}
                    />
                    ))
                  ) : (
                    <p>No media available</p>
                  )}
                </div>
              ))
            ) : (
              <p>No reels available</p>
            )}
          </div>
        );
        case 'Tag':
          return (
            <div className="post-content" style={{display:'grid',gridTemplateColumns:'30% 30% 30%',gridGap:'2%',width:'100%'}}>
              {socialUser?.Tagged_Posts && socialUser?.Tagged_Posts?.targetId ? (
                <div className="tagged-post-item">
        
        
                  {socialUser.Tagged_Posts.targetId.files?.length > 0 ? (
                    socialUser.Tagged_Posts.targetId.files.map((file, index) => (
                      <img
                        key={index}
                        src={file.file}
                        alt="Tagged post media"
                        style={{width:'100%',height:'100%'}}
                      />
                    ))
                  ) : (
                    <p>No media available</p>
                  )}
                </div>
              ) : (
                <p>No tagged posts available</p>
              )}
            </div>
          );
        
     

      default:
        return null;
    }
  };

  return (
    <div className="postbox-container">
      <div className="post-container">
        <div className="post-data mt-3">
          <ul className="tab-list" style={{display:'flex'}}>
            {pvtdata.map((data) => (
              <li
                key={data.id}
                style={{textAlign:'center',color:activeTab === data.title ?'rgb(56, 86, 243)':'',marginRight:'10px'}}
                className={`tab-item ${activeTab === data.title ? 'active' : ''}`}
                onClick={() => handleTabClick(data.title)}
              >
                {data.title}
                {data.id < pvtdata.length && <span className="ms-4">|</span>}
              </li>
            ))}
          </ul>
        </div>
        <div className="post-content-wrapper">{renderContent()}</div>
      </div>
    </div>
  );
};

export default Postdata;
