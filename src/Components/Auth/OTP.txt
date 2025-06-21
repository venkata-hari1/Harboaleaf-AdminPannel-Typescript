import { useEffect, useState } from 'react';
import './Styles/OTP.css'
import Logo from "./Logo"
import OtpInput from 'react-otp-input';
import { useNavigate } from 'react-router-dom';
function ForgotPassword() {
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(10);
  const [canResend, setCanResend] = useState(false);
  const navigate=useNavigate()
  useEffect(() => {
    if (timer > 0) {
      const countdown = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);

      return () => clearInterval(countdown);
    } else {
      setCanResend(true);
    }
  }, [timer]);
  const handleResend = (e) => {
    e.preventDefault()
    if (canResend) {
      console.log('Resending OTP...');
      setTimer(60);
      setCanResend(false);
    }
  };
  const isFormComplete=()=>{
    if(otp){
      return true
    }
    else{
      return false
    }
  }
  const handleSubmit=(e)=>{
    e.preventDefault()
  navigate('/reset-password')
  }
  return (
    <div className="parent-container">  
<div className="logo-box">
           <Logo />
          </div>
          <div className="title-box">
            <p>ADMIN PANEL</p>
          </div> 
      
    <div className="container-fluid1 ">


      <div className="form-container-box">
        <div>
          <div>
            <div className='title-para'>
            <h4 className="forget-title">Forgot Password</h4>

              <p className="text-center text-white mt-3">We've sent an activation code to<br /> your email Sourav@gmail.com</p>


            </div>
            
            <form>
              <div className="d-flex justify-content-center align-items-center">
                <OtpInput
                  value={otp}
                  onChange={setOtp}
                  numInputs={5}
                  renderSeparator={<span>-</span>}
                  renderInput={(props) => (
                    <input
                      {...props}
                      style={{
                        width: '50px',
                        height: '50px',
                        color:'white',
                        fontSize: '20px',
                        textAlign: 'center',
                        border: '3px solid #ccc',
                        borderRadius: '50px',
                        margin: '0 5px',
                      }}
                    />
                  )}
                />
              </div>

              <div className="resendotp">
                <p className="text-center text-white mt-2">
                  {canResend ? (
                    <a href="#" onClick={handleResend}>
                      Send code again
                    </a>
                  ) : (
                    <>
                      Send code again in: <span>{`0:${timer.toString().padStart(2, '0')}`}</span>
                    </>
                  )}
                </p>
              </div>

              <div className="text-center mt-3">
                <button id ="fogot-pwd" type="submit" className={!isFormComplete()?"btn btn-secondary":"btn btn-primary"} disabled={!isFormComplete()} onClick={handleSubmit}>Submit</button>
              </div>

            </form>
          </div>


        </div>

      </div>

    </div>
    </div>

  )
}
export default ForgotPassword
