import React from 'react'
import '../Styles/PreviewPopUp.css';
import Camera from '../assets/Camera.png';
import Statusicon from '../assets/Status Icons.png';
import Hblogo from '../assets/Hblogo.png'
import Harboleaf_title from '../assets/Hbtitle.png'
import  BadgeImg from '../assets/BadgeImg.png' 
import PreviewImg from '../assets/PreviewImg.png'
import PreviewTv from '../assets/Preview-tv.png'
const PreviewPopUp = () => {

return (

     <div className='main-preview-container'>
       <div className='preview-popup-container'>

        <div className="tool-row-container">{/*first row  */}
           <div className='time-container'>  
              <p className='time-text'>09:30</p>
           </div>

           <div className='camera-container'>  
           <img src={Camera} className='camera-img'/>
           </div>
          
           <div className='network-container'>  
           <img src={Statusicon} className='status-img'/>
           </div>

          </div>{/* first row end */}

     
         <div className='logo-search-container'>{/* 2nd row */}
             
             <div className='logos-container'>
              <img src={Hblogo} className='logos-image1'/>
              <span className="notification-badge badge bg-danger rounded-pill">5</span>
              <img src={Harboleaf_title} className='logos-image2'/>
             </div>

             <div className='search-container'>
              <input type="search" className='search-box1' placeholder='SEARCH'/><i className="bi bi-search search-icon1"></i>
             </div>
             <div className='badge-container'>
             <img src={BadgeImg} className='badge-image1 img-fluid rounded-circle' /> 
             </div>  

            </div>{/* 2nd row end */}
       
           <div className='preview-bgimage-container'>
            
               <img src={PreviewImg} className='preview-image-box'/> 
              <div className='preview-img-text'>
                 Explored new hights today! Nothing beats the feelings
                 of fresh air and freedom.
              </div>
            </div> 

             <div className='preview-tool-wrapper'>
               <div className='preview-left-tool'>
                  <i className="bi bi-hand-thumbs-up-fill ms-2 "></i>
                  <i className="bi bi-hand-thumbs-down ms-2"></i>
                  <i className="bi bi-chat-left-text ms-2"></i>
                </div>
                <div className='preview-right-tool'>
                  <i className="bi bi-link ms-2"></i>
                  <i className="bi bi-send ms-2"></i> 
                  <i className="bi bi-three-dots-vertical ms-2"></i>
                </div>
              </div>

             <div className="product-desc-container">
              <div className='product-image'>
              <img src={PreviewTv} className='product-img-box'/>
              </div> 
              <div className='product-des-info'>
                <p className='product-desc-title'>Title</p>
                
                <p className='product-desc-desc'>Description of the Product<span><a href='#'>Link</a></span></p>

              </div>
              </div>  
       
       
       
       
       
       
       
       </div> 
    </div>
  )
}

export default PreviewPopUp