import React, { useState } from 'react';
import moment from 'moment';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../Redux/store/Store';
import { DeletePostReel } from '../../Redux/Reducers/UserMangement';
import { showToast } from '../../../Utils/Validation';
import Loader from '../../../Utils/Loader';

type IProps={
  handleClose:(t:boolean)=>void,
  post:{
type:string,
postId:string,
vibeId:string,
files:{file:string}[],
text:string
  } | any

}
const UserPopUp = ({ post,handleClose}:IProps) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
 const[loading,setLoading]=useState(false)
  const isPost = post?.type === 'post';
  const isVibe = post?.type === 'vibe';
  const content = isPost ? post?.postId : isVibe ? post?.vibeId : null;
  const text = content?.text;
  const image = content?.files?.[0].file;
  const firstname = post?.user?.firstname;

  const userimage = post?.user?.image;
  const createdAt = content?.createdAt || post?.createdAt;
const dispatch=useDispatch<AppDispatch>()
  const handleDeleteConfirm = async() => {
    try{
      setLoading(true)
      const data={
        id:content?._id
      }
     const response= await dispatch(DeletePostReel({data:data}))
     const fulfilled=response.payload
     if(fulfilled?.status){
      showToast(true,'deleted successfully')
      setShowConfirm(false);
      handleClose(false)
     } 
     else{
      showToast(true,'something went wrong')
     }
   
    }
    catch(error){
      
    }
    finally{
      setLoading(false)
    }
  };
const handleCancel=()=>{
  setShowConfirm(false)
  handleClose(false)
}
const handleDelete=()=>{
  setShowMenu(false);
  setShowConfirm(true);
}
  return (
    <>
      {/* Main Popup */}
      <div
        className="modal fade show"
        tabIndex={-1}
        style={{ display: 'block', background: 'rgba(0,0,0,0.5)' }}
        role="dialog"
      >
        {loading&&<Loader/>}
        <div className="modal-dialog modal-dialog-centered" style={{width: '320px',height:'20vh'}}>
          <div className="modal-content main-popup-container">
            <div className="popup-container p-3 position-relative">

              {/* Header */}
              <div className="popup-title-container d-flex align-items-center">
                <img
                  src={userimage }
                  width="30px"
                  height="30px"
                  className="rounded-circle me-2"
                  alt=""
                />
                <div>
                <div className="ms-auto text-muted small">{firstname}</div>
                <div className="ms-auto text-muted small">{moment(createdAt).fromNow()}</div>
                </div>
               

                {/* 3-dot menu */}
                <div className="position-absolute" style={{ top: '10px', right: '10px' }}>
  <button
    className="btn btn-link text-dark p-0"
    onClick={() => setShowMenu(!showMenu)}
  >
    <i className="bi bi-three-dots-vertical fs-5"></i>
  </button>

  {showMenu && (
    <ul
      className="dropdown-menu show"
      style={{
        position: 'absolute',
        right: 0,
        top: '100%',
        zIndex: 1050,
        display: 'block',
        minWidth: '120px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      }}
    >
  
      <li>
        <button
          className="dropdown-item"
          onClick={() => {
            handleClose(false);
          }}
        >
          Close
        </button>
      </li>
      <li>
        <button
          className="dropdown-item text-danger"
          onClick={handleDelete}
        >
          Delete
        </button>
      </li>
    </ul>
  )}
</div>

              </div>

              {/* Image or Video */}
              <div className="popimg-container my-3">
                {isVibe ? (
                  <video
                    src={image}
                    controls
                    loop
                    style={{ width: '100%', height: '100%', borderRadius: '10px' }}
                  />
                ) : (
                  <img
                    src={image }
                    style={{ width: '100%', borderRadius: '10px' }}
                    alt="popup"
                  />
                )}

                <div className="image-text mt-2">
                  <p>{text}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div
          className="modal fade show"
          tabIndex={-1}
          role="dialog"
          style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
      <div className="modal-dialog modal-dialog-centered">
  <div className="modal-content border border-white rounded-3">
    <div className="modal-header border-1 border-grey">
    <h5 className="modal-title text-danger fs-5">Confirm Deletion</h5>
    </div>
    <div className="modal-body border-0"> 
      <p className="fs-7 text-black">Are you sure you want to delete this {isPost ? 'post' : 'vibe'}?</p>
    </div>
    <div className="modal-footer border-0">
      <button className="btn btn-secondary" onClick={handleCancel}>Cancel</button>
      <button className="btn btn-danger" disabled={loading} onClick={handleDeleteConfirm}>{loading?'Delete...':'Delete'}</button>
    </div>
  </div>
</div>

        </div>
      )}
    </>
  );
};

export default UserPopUp;
