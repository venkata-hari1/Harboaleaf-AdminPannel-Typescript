import React from 'react'
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import  '../Styles/Logout.css';
import Actions from './ActionBtns/Actions';


const Logout = ({suspendLogout}) => {

  const closePopup=()=>{

    suspendLogout()
  }
return (
    <>
      <div
      className="modal show logout-modal1">
      <Modal.Dialog>
        <Modal.Header  className='modal-header-log'>
          <Modal.Title className='logout-title'>Logout</Modal.Title>
          <button
           type="button"
           className="btn-close btn-close-white"
           onClick={closePopup}
       />
        </Modal.Header>

        <Modal.Body className='modal-body1'>
          <p style={{fontSize:"15px",margin:"auto",padding:"10px",color:"#fff"}}>Are you sure you want to logout?</p>
        </Modal.Body>

        <Modal.Footer className='log-buttons'>
        <Button variant="primary log-button1">Yes</Button>
          <Button variant="secondary log-button2" onClick={closePopup}>Cancel</Button>
          
        </Modal.Footer>
      </Modal.Dialog>
    </div>

  

    </>
  )
}

export default Logout
