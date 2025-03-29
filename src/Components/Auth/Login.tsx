import React, { Fragment, useState } from "react"
import { useNavigate } from 'react-router-dom';
import './Styles/Login.css'
import Logo from "./Logo"
import { PasswordRegex, PhoneRegex, showToast } from "../../../Utils/Validation";
import { SignIn } from "../../Redux/Reducers/Auth";
import {AppDispatch} from '../../Redux/store/Store'
import { useDispatch } from "react-redux";
type IState = {
  mobile: string,
  password: string,
}
function Login() {
  const [auth, setAuth] = useState<IState>({
    mobile: '',
    password: ''
})
const [error, setError] = useState<IState>({
    mobile: '',
    password: '',
})
  const navigate = useNavigate()
  const dispatch=useDispatch<AppDispatch>()
  const handleForgetPassword = () => {
    navigate('/otp')
  }

const handleSignInInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
  
    if (name === "mobile") {
      if (!PhoneRegex.test(value)) {
        setError((prev) => ({
          ...prev,
          mobile: "Invalid Phone Number",
        }));
      } else {
        setError((prev) => ({ ...prev, mobile: "" }));
      }
    }
  
    if (name === "password") {
      if (!PasswordRegex.test(value)) {
        setError((prev) => ({
          ...prev,
          password:
            "Password must be 8 characters long and include at least one special character, one uppercase letter, one lowercase letter, and one number.",
        }));
      } else {
        setError((prev) => ({ ...prev, password: "" }));
      }
    }
  
    setAuth((prev) => ({ ...prev, [name]: value }));

  };
  const handleSignIn=async(e: React.MouseEvent<HTMLButtonElement>)=>{
    const data:any = {
      countryCode:"+91",
      mobile: auth.mobile,
      password: auth.password,
  }
  const response = await dispatch(SignIn({ data: data }))
  const fulfilled = response.payload
 if(!fulfilled.status){
  showToast(false,fulfilled.message)
 }
 else{
  if(fulfilled.role==='Admin'){
    showToast(true,'Login Successfully')
    localStorage.setItem('token',fulfilled.accesstoken)
    setTimeout(()=>{
      navigate('/admin/admin-pannel');
    },600)
  }
  else{
    showToast(false,'Access denied')
  }
}
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
              <div className="mobile-box">
                <input type="text" placeholder="mobile" name='mobile' value={auth.mobile} className="mobile-input form-control" required onChange={handleSignInInput} />
              </div>
              {error.mobile && <div className="validate-mobile"><span className="text-danger">{error.mobile}</span></div>}
              <div className="password-box">
                <input type="text" placeholder="Password" name='password' value={auth.password} className="password-input form-control" required onChange={handleSignInInput}/>
                <span onClick={handleForgetPassword} >Forget Password?</span>
              </div>
              {error.password && <div className="validate-password"><span className="text-danger">{error.password}</span></div>}
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