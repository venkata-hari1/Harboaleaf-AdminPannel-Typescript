
import React, { Fragment, useState, useTransition } from "react"
import { useNavigate } from 'react-router-dom';
import './Styles/Login.css'
import Logo from "./Logo"
import { showToast } from "../../../Utils/Validation";
import { SignIn } from "../../Redux/Reducers/Auth";
import { AppDispatch } from '../../Redux/store/Store';
import { useDispatch } from "react-redux";
import Loader from "../../../Utils/Loader";
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
  const [value, setValue] = useState(false);
  const [isPending, startTransition] = useTransition();
  const dispatch = useDispatch<AppDispatch>()
  const handleForgetPassword = () => {
    navigate('/otp')
  }

  const handleSignInInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // if (name === "mobile") {
    //   if (!PhoneRegex.test(value)) {
    //     setError((prev) => ({
    //       ...prev,
    //       mobile: "Invalid Phone Number",
    //     }));
    //   } else {
    //     setError((prev) => ({ ...prev, mobile: "" }));
    //   }
    // }

    // if (name === "password") {
    //   if (!PasswordRegex.test(value)) {
    //     setError((prev) => ({
    //       ...prev,
    //       password:
    //         "Password must be 8 characters long and include at least one special character, one uppercase letter, one lowercase letter, and one number.",
    //     }));
    //   } else {
    //     setError((prev) => ({ ...prev, password: "" }));
    //   }
    // }

    setAuth((prev) => ({ ...prev, [name]: value }));

  };
  const handleSignIn =  async(e: React.MouseEvent<HTMLButtonElement>) => {
    try{
      setValue(true)
      const data = {
        countryCode: "+91",
        mobile: auth.mobile,
        password: auth.password,
      }
      const response = await dispatch(SignIn({ data:data }))
      const fulfilled = response.payload
      if (!fulfilled.status) {
        showToast(false, fulfilled.message)
      }
      else {
        if (fulfilled.role === 'Admin') {
          showToast(true, 'Login Successfully')
          localStorage.setItem('token', fulfilled.accesstoken)
            navigate('/admin/admin-pannel');
        }
        else {
          showToast(false, 'Access denied')
        }
      }
    }
    catch(error){}
    finally{
      setValue(false)
    }
   
  }
  return (
    <Fragment>


      <div className="parent-container">
      {value&&<Loader/>}
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
                <input type="text" placeholder="mobile" name='mobile' value={auth.mobile} className="form-control" style={{ color: 'white' }} required onChange={handleSignInInput} />
              </div>
              {error.mobile && <div className="validate">{error.mobile}</div>}
              <div className="password-box">
                <input type="text" placeholder="Password" name='password' value={auth.password} className="form-control" style={{ color: 'white' }} required onChange={handleSignInInput} />
                {/* <span onClick={handleForgetPassword}>Forget Password?</span> */}
              </div>
              {error.password && <div className="validate" style={{ width: '30%' }}>{error.password}</div>}
              <div className="password-box">
                <button disabled={value} className="form-control" id="login-submit" onClick={handleSignIn}>
                {value ? 'Signing In...' : 'Sign In'}
                  </button>
              </div>
            </div>
          </div>


        </div>
      </div>
    </Fragment>
  )
}
export default Login
