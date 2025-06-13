import React, { useState, useEffect } from 'react';
import '../Styles/PreviewPopUp.css'; // Link to your CSS file

// Import images from your assets folder
import Camera from '../assets/Camera.png';
import Statusicon from '../assets/Status Icons.png';
import Hblogo from '../assets/Hblogo.png';
import Harboleaf_title from '../assets/Hbtitle.png';
import BadgeImg from '../assets/BadgeImg.png';
import PreviewImg from '../assets/PreviewImg.png';

interface FormData {
  title: string;
  description: string;
  callToAction: string;
  file: File | null;
  placing: string[]; // Assuming this is an array like ['top'] or ['bottom']
}

interface PreviewPopUpProps {
  handlePopup: () => void;
  formData: FormData;
}

const PreviewPopUp: React.FC<PreviewPopUpProps> = ({ handlePopup, formData }) => {
  const { title, description, callToAction, file, placing } = formData;
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setMediaUrl(url);

      // Cleanup function to revoke the object URL
      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setMediaUrl(null);
    }
  }, [file]); // Re-run effect if the file changes

  const closeHandle = () => {
    handlePopup();
  };

  // Determine media type for rendering
  const mediaType = file ? file.type.split('/')[0] : ''; // 'image' or 'video'

  // Post Component (remains the same in terms of structure, but will use external CSS)
  const PostComponent: React.FC<{ index: number }> = ({ index }) => (
    <div className="post-component-card">
      {/* Profile Row (Centered) */}
      <div className="post-profile-row">
        <img src={PreviewImg} alt="Profile" className="post-profile-img" />
        <div>
          <span className="post-profile-name"> Deepak Kumar </span>
          <span className="post-time">2d ago</span>
        </div>
      </div>

      {/* Image Section */}
      <img src={PreviewImg} alt={`Preview ${index}`} className="post-image-section" />

      {/* Title and Description (if any within the dummy post) */}
      <div className="post-title-desc-row">
        {/* Placeholder for title/desc if needed */}
      </div>

      {/* Buttons */}
      <div className="post-buttons-row">
        <div className="post-actions-left">
          <i className="bi bi-hand-thumbs-up-fill"></i>
          <i className="bi bi-hand-thumbs-down"></i>
          <i className="bi bi-chat-left-text"></i>
        </div>
        <div className="post-actions-right">
          <i className="bi bi-link"></i>
          <i className="bi bi-send"></i>
          <i className="bi bi-three-dots-vertical"></i>
        </div>
      </div>
    </div>
  );

  return (
    <div className="main-preview-overlay" onClick={closeHandle}>
      <div className="preview-popup-container" onClick={(e) => e.stopPropagation()}>

        {/* Top Status Bar - Fixed */}
        <div className="top-status-bar">
          <p className="time-text">09:30</p>
          <img src={Camera} alt="Camera" className="camera-img" />
          <img src={Statusicon} alt="Status" className="status-img" />
        </div>

        {/* Title/Search/Close Bar - Fixed */}
        <div className="title-search-bar">
          <div className="logos-container">
            <img src={Hblogo} alt="Logo1" className="logos-image1" />
            <span className="notification-badge">10</span>
            <img src={Harboleaf_title} alt="Logo2" className="harboleaf-title-img" />
          </div>
          <div className="search-container">
            <input
              type="search"
              placeholder="SEARCH"
              className="search-box1"
              onClick={(e) => e.stopPropagation()} // Prevent search input click from closing popup
            />
            <i className="bi bi-search search-icon1"></i>
          </div>
          <img src={BadgeImg} alt="Close" className="badge-image1" onClick={closeHandle} />
        </div>

        {/* Scrollable Feed Content */}
        <div className="scrollable-feed-content hide-scrollbar">
          {/* Render Ad at Top if placement includes 'top' */}
          {placing.includes('top') && file && (
            <div className="ad-card-preview">
              {mediaType === 'image' ? (
                <img src={mediaUrl || ''} alt="Ad Media" className="ad-media" />
              ) : mediaType === 'video' ? (
                <video controls className="ad-media">
                  <source src={mediaUrl || ''} type={file.type} />
                  Your browser does not support the video tag.
                </video>
              ) : null}
              <div className="ad-details-row">
                <p className="ad-title">{title}</p>
                <span className="ad-sponsored-tag">Sponsored</span>
              </div>
              <p className="ad-description">{description}</p>
              {callToAction && (
                <button className="ad-cta-button">
                  {callToAction}
                </button>
              )}
            </div>
          )}

          <PostComponent index={1} />
          <PostComponent index={2} />
          <PostComponent index={3} />

          {/* Render Ad at Bottom if placement includes 'bottom' */}
          {placing.includes('bottom') && file && (
            <div className="ad-card-preview">
              {mediaType === 'image' ? (
                <img src={mediaUrl || ''} alt="Ad Media" className="ad-media" />
              ) : mediaType === 'video' ? (
                <video controls className="ad-media">
                  <source src={mediaUrl || ''} type={file.type} />
                  Your browser does not support the video tag.
                </video>
              ) : null}
              <div className="ad-details-row">
                <p className="ad-title">{title}</p>
                <span className="ad-sponsored-tag">Sponsored</span>
              </div>
              <p className="ad-description">{description}</p>
              {callToAction && (
                <button className="ad-cta-button">
                  {callToAction}
                </button>
              )}
            </div>
          )}

          <PostComponent index={4} />
          <PostComponent index={5} />
          <PostComponent index={6} />
          <PostComponent index={7} />
          <PostComponent index={8} />
        </div>

        {/* Bottom Navigation Bar */}
        <div className="bottom-nav-bar">
          <div className="bottom-nav-indicator"></div>
        </div>
      </div>
    </div>
  );
};

export default PreviewPopUp;