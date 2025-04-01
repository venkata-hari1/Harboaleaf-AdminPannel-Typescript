import React from 'react'
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import  '../Styles/Logout.css';

const Logout = () => {
return (
    <>
      <div
      className="modal show logout-modal1">
      <Modal.Dialog>
        <Modal.Header closeButton>
          <Modal.Title>Logout</Modal.Title>
        </Modal.Header>

        <Modal.Body className='modal-body1'>
          <p>Are you sure you want to logout?</p>
        </Modal.Body>

        <Modal.Footer className='log-buttons'>
        <Button variant="primary log-button1">Yes</Button>
          <Button variant="secondary log-button2">Cancel</Button>
          
        </Modal.Footer>
      </Modal.Dialog>
    </div>

  

    </>
  )
}

export default Logout
