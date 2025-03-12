import React from 'react'
import '../Styles/Admanagement.css'
import { useNavigate } from 'react-router-dom'
const Admanagement = () => {
  const navigate=useNavigate()
  return (
    <div className='admanagment'>
      <div className='ad-container'> 

      <div className='advertisement'>
      <button onClick={()=>navigate('userform')}>Create New Advertisement</button> 
      </div>
      <div className='moniter-cmpg'>
      <button onClick={()=>navigate('/admin/moniter-compaign')}>Moniter Campaign</button> 
      </div>
      <div className='billing-invoice'>
      <button onClick={()=>navigate('/admin/billing-invoice')}>Billing and Invoice Details</button> 
      </div>
      </div>

    </div>
  )
}

export default Admanagement