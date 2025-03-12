import React, { Fragment } from "react"
import { useNavigate } from 'react-router-dom';
import './Styles/Login.css'
import Logo from "./Logo"
function Login() {
const navigate=useNavigate()
const handleSignIn = (e) => {
  e.preventDefault();
  navigate('/admin/admin-pannel');
};
 const handleForgetPassword=()=>{
  navigate('/otp')
 }
  return (
    <Fragment>
 <div className="parent-container">  
 <div className="logo-box">
           <Logo />
          </div>
          <div className="title-box">
            <p>ADMIN PANEL</p>
          </div> 
    <div className="container-fluid1">
     
        
           <div className="form-container-box">
            <div className="signin-heading">
            <p>Sign in</p>
            </div>
              <div className="inputfiled-group">
              <div className="email-box">
              <input type="email" placeholder="Email" className="form-control" required/>
              </div>
              <div className="password-box">
              <input type="password" placeholder="Password" className="form-control" required/>
               <span onClick={handleForgetPassword}>Forget Password?</span>
              </div>  

              <div className="password-box">
               <button className="form-control" id="login-submit" onClick={handleSignIn}>Sign in</button>
              </div>   

              </div>
          </div>
      

    </div>
    </div>
    </Fragment>
  )
}
export default Login