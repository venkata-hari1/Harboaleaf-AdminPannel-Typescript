import React from 'react'
import Pagination from './Pagination'
import {GSTReports} from './JSON_Data/JSON'
import Actions from './ActionBtns/Actions';
const Gstreportsmanagement = () => {
    const[id,setId]=React.useState(null)
    const handleOpen=(id)=>{
      setId((prev)=>(prev===id?null:id))
    }

  return (
    <div className='container'>
      
    <div className='d-flex justify-content-end mt-4'>
      <button className='btn btn-primary me-3'  style={{backgroundColor:"#3856F3",fontFamily:"Roboto"}}>Filter <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-funnel-fill ms-2" viewBox="0 0 16 16">
    <path d="M1.5 1.5A.5.5 0 0 1 2 1h12a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.128.334L10 8.692V13.5a.5.5 0 0 1-.342.474l-3 1A.5.5 0 0 1 6 14.5V8.692L1.628 3.834A.5.5 0 0 1 1.5 3.5z"/>
    </svg></button>
      <button className='btn' style={{color:"#FF0000",border:"1px solid #FF0000",fontFamily:"Roboto"}}>Suspended Accounts</button>
    </div>
    <div className="tab-content table-responsive">
   <table className="table table-borderless mt-4">
   <thead >
  <tr >
    <th>S.No</th>
    <th>User Name</th>
    <th>GST Username</th>
    <th>Reason</th>
    <th>State</th>
    <th>Actions</th>
    <th>Date</th>
    <th>Users Reported</th>
    <th>Reason</th>
    
  </tr>
</thead><br/>
<tbody >
{
     GSTReports.map((tdata,index)=>(
      <tr key={tdata.id}>
      <th>{tdata.id}</th>
      <td> 
      <img
            src={`https://robohash.org/${tdata.username}?size=40x40`}
            alt="avatar"
            className="rounded-circle me-2"
            width="30"
            height="30"
            style={{objectFit:"cover",border:'1px solid white',marginBottom:'2px'}}
          />
        {tdata.username}</td>
      <td>{tdata.gstusername}</td> 
      <td>{tdata.reason}</td>
      <td>{tdata.state}</td>
      <td><button onClick={()=>handleOpen(tdata.id)} className="btn dropdown-toggle border" type="button" data-bs-toggle="dropdown" aria-expanded="false">
      Actions
    </button>
       {id===tdata.id&&<Actions/>}
    </td>
      <td>{tdata.date}</td>
      <td>{tdata.userreported}</td>
      <td>{tdata.reasonview}</td>
     
          
     </tr>


   ))
  }
  
 </tbody>
  </table>
</div>
  <Pagination />
     
  </div>
  )
}

export default Gstreportsmanagement