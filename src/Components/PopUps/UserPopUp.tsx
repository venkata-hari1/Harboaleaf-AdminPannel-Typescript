import React from 'react'
import Popupimg from '../../assets/popimg.jpg'
import '../../Styles/UserPopUp.css';
import moment from 'moment';
 const UserPopUp = ({ handleClick,post }:any) => {
    const[value,setValue]=React.useState(false)
    const handleDelete=()=>{
       
    }
    console.log(post)
    const text=post.type==='post'?post.post?.[0].text:post.story?.[0].text
    const image=post.type==='post'?post.post?.[0].files?.[0]:post.story?.[0].files?.[0]
    const firstname=post.type==='post'?post.post?.[0].user?.firstname:post.story?.[0].user?.firstname
    const lastname=post.type==='post'?post.post?.[0].user?.lastname:post.story?.[0].user?.lastname
    const userimage=post.type==='post'?post.post?.[0].user?.image:post.story?.[0].user?.image
    const createdAt=post.type==='post'?post.post?.[0].createdAt:post.story?.[0].createdAt
    return (
     <div className='main-popup-container'>
      <div className='popup-container'>
         <div className='popup-title-container'>
           <img src={userimage?userimage:Popupimg} width="20px" height="20px"className="rounded-circle" alt=''/><p>{firstname}{lastname}</p>
              <span>{moment(createdAt).fromNow()}</span>
         </div>
         <div className='popimg-container'>
       
           <img src={image?image:Popupimg} width="100%" height="100%" /> 
             
            <div className='menu-delete-box'>
                 <div className='dot' onClick={()=>setValue(!value)}>
                 <button className='dot-menu rounded-circle'>&#8942;</button>
                 
                 </div>
                 {value&&<div className='dot-delete'>
                  <button onClick={handleDelete}>Delete</button>  
                  </div>}
           </div>  
             <div className='image-text'>
              <p>{text}</p>
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