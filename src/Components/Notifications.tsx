import React from 'react'
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import '../Styles/Notification.css';
import Post1 from '../assets/post1.png';


const Notifications = () => {

  const Userlist=[
   
     {id:1,imgurl:"src/assets/post1.png" ,username:"John", des:"New Photo added",time:"10.00am"},
     {id:2,imgurl:"src/assets/post1.png", username:"Peter", des:"New Photo added",time:"11.00am"},
     {id:3,imgurl:"src/assets/post1.png" ,username:"Sharma", des:"New Photo added",time:"09.00am"},
     {id:4,imgurl:"src/assets/post1.png" ,username:"Viarat", des:"New Photo added",time:"08.00am"},
     {id:5,imgurl:"src/assets/post1.png" ,username:"Sofia", des:"New Photo added",time:"11.00am"},
 

  ]

  return (
    <>
    <div
    className="modal show notification-modal">
    <Modal.Dialog>
      <Modal.Header closeButton>
        <Modal.Title><i className="bi bi-arrow-left-short"></i>Notification</Modal.Title>
      </Modal.Header>

      <Modal.Body  className='modal-body2'>
      
        <div className='notification-container'>
        
          {
            Userlist.map(user=>(
                <div className="card card-notification">
                <img src={user.imgurl} className="rounded-circle" width="25px" height="25px"/>
                <p className="card-item"><b>{user.username}</b></p>
                <p className="card-item">{user.des}</p>
                <p className="card-item">{user.time}</p>
            </div>
            ))
          }
         
       
    
        
        </div>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary m-auto see-all-button">See All</Button>
       
      </Modal.Footer>
    </Modal.Dialog>
  </div>

  </>
  )
}

export default Notifications