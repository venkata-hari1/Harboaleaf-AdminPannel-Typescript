import React from 'react'
import Popupimg from'../../assets/popimg.jpg'
import '../../Styles/UserPopUp.css';
 const UserPopUp = ({ handleClick }) => {
    const[value,setValue]=React.useState(false)
    const handleDelete=()=>{
        handleClick()
    }
  return (
     <div className='main-popup-container'>
      <div className='popup-container'>
         <div className='popup-title-container'>
           <img src={Popupimg} width="20px" height="20px"className="rounded-circle" alt=''/><p>David Wilden</p>
              <span>1d ago</span>
         </div>
         <div className='popimg-container'>
       
           <img src={Popupimg} width="100%" height="100%" /> 
             
            <div className='menu-delete-box'>
                 <div className='dot' onClick={()=>setValue(!value)}>
                 <button className='dot-menu rounded-circle'>&#8942;</button>
                 
                 </div>
                 {value&&<div className='dot-delete'>
                  <button onClick={handleDelete}>Delete</button>  
                  </div>}
           </div>  
             <div className='image-text'>
              <p>Explored new heights today! Nothing beats the feeling of fresh air and freedom. 🌲🏔️ 
                #AdventureAwaits #MountainLife</p>
             </div>
           </div>
         <div className='tools-wrapper'>
           <div className='left-tool'>
           <i className="bi bi-hand-thumbs-up-fill ms-3"></i>
           <i className="bi bi-hand-thumbs-down ms-3"></i>
           <i className="bi bi-chat-left-text ms-3"></i>

           </div>
           <div className='right-tool'>
           <i className="bi bi-link me-3"></i>
           <i className="bi bi-send ms-3"></i> 
           <i className="bi bi-three-dots-vertical ms-3"></i>

           </div>
           
         </div>

      </div>
      </div>
 
  )
}

export default UserPopUp