import React, { useEffect } from 'react'
import '../Styles/Editprofile.css';
import Profilepic from'../assets/Adminpic.jpg';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../Redux/store/Store';
import { AdminProfile } from '../Redux/Reducers/UserMangement';
const Editprofile = () => {
  const {profile,loading}:any=useSelector((state:RootState)=>state.UserMangment)
  const dispatch=useDispatch<AppDispatch>()
  useEffect(()=>{
    async function getData(){
      dispatch(AdminProfile())
    }getData()
  },[])
     const editdata=[
            { id:1, key:"Phone Number",value:`${profile?.user?.countryCode}${profile?.user?.mobile}`},
            {id:3,key:"Password",value:"*******"}
          ]

  return (
    <div className='container'>
        <div className='edit-profile'>
          
          <div className='profileimg-box'>
          <img src={Profilepic} width="170px" height="200px" /> 
          </div>
     
          <div className='edit-data-box'>
               <p className='edit-title'>{profile?.user?.firstname}</p>
                {
                    editdata.map(data=>(

                        <div className="edit-data" > 
                        <p className="edit-key">{data.key}</p>
                        <p  className="edit-value">{data.value}<i className="bi bi-pencil-square ms-2"></i></p>
                        </div>
                        
                         ))
                    }
              </div>
                 <div className='change-pwd-box'><button>Change Password</button></div>   

        </div>
      </div>
  )
}

export default Editprofile
