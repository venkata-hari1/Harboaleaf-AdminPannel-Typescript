import React from 'react'
import Pagination from './Pagination'
import { useNavigate } from 'react-router-dom'
import Actions from './ActionBtns/Actions';
const Monitercompaign =() =>{
    const[id,setId]=React.useState(null)
         const handleOpen=(id)=>{
           setId((prev)=>(prev===id?null:id))
         }
  const navigate=useNavigate()
  const handleAdd=()=>{
    navigate('/admin/admgmt')
  }
    const tabledata=[
        {
          id:1,
          advertisename:'Gillete',
          startdate: '01/12/2023',
          enddate: '01/12/2023',
          status:'Active',
          impressions:653518,
          clicks:16415,
          engagementrate:'97%',
          budget:"₹1,10,000",
       },
       {
        id:2,
        advertisename:'Ferrari',
        startdate: '01/12/2022',
        enddate: '02/12/2023',
        status:'Active',
        impressions:653512,
        clicks:16417,
        engagementrate:'67%',
        budget:"₹26,10,000",
     },
     {
        id:3,
        advertisename:'Facebook',
        startdate: '01/12/2023',
        enddate: '01/05/2024',
        status:'Active',
        impressions:653540,
        clicks:16415,
        engagementrate:'58%',
        budget:"₹25,10,000",
     }
 ]
 

  return (
    <div className='container'>
      
    <div className='d-flex justify-content-end mt-4 gap-2'>
      <button className='btn btn-primary'  style={{backgroundColor:"#3856F3",fontFamily:"Roboto"}}>Filter <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-funnel-fill ms-2" viewBox="0 0 16 16">
<path d="M1.5 1.5A.5.5 0 0 1 2 1h12a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.128.334L10 8.692V13.5a.5.5 0 0 1-.342.474l-3 1A.5.5 0 0 1 6 14.5V8.692L1.628 3.834A.5.5 0 0 1 1.5 3.5z"/>
</svg></button>
      
      <button className='btn' style={{color:"#FF0000",border:"1px solid #FF0000", fontFamily:"Roboto"}}> Suspended Accounts</button>
    </div>
    <div class="tab-content table-responsive">
   <table className="table table-borderless mt-4 ">
   <thead >
  <tr>
    <th>S.No</th>
    <th>Advertisement Name</th>
    <th>Start Date</th>
    <th>End Date</th>
    <th>Status</th>
    <th>Impression</th>
    <th>Engagement Rate</th>
    <th>Budget</th>
    <th>Actions</th>
  </tr>
</thead><br/>
<tbody >
  {
     tabledata.map((tdata,index)=>(
      <tr key={tdata.id}>
      <th>{tdata.id}</th>
      <td>{tdata.advertisename}</td>
      <td>{tdata.startdate}</td> 
      <td>{tdata.enddate}</td>
      <td>{tdata.status}</td>
      <td>{tdata.impressions}</td>
      <td>{tdata.engagementrate}</td>
      <td>{tdata.budget}</td>    
      <td><button onClick={()=>handleOpen(tdata.id)} className="btn dropdown-toggle border" type="button" data-bs-toggle="dropdown" aria-expanded="false">
      Actions
    </button>
       {id===tdata.id&&<Actions/>}
    </td>
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

export default Monitercompaign
