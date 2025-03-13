import React from 'react'
import '../Styles/Editprofile.css';
import Profilepic from'../assets/Adminpic.jpg';
const Editprofile = () => {

     const editdata=[
            { id:1, key:"Phone Number",value:"+91 7550723470"},
            {id:2,key:"Email",value:"Sourav@gmail.com"},
            {id:3,key:"Password",value:"*******"}
          ]

  return (
    <div className='container'>
        <div className='edit-profile'>
          
          <div className='profileimg-box'>
          <img src={Profilepic} width="170px" height="200px" /> 
          </div>
     
          <div className='edit-data-box'>
               <p className='edit-title'>Sourav Singh</p>
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
