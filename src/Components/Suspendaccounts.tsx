import React from 'react'
import  '../Styles/Suspendaccounts.css';
import Pagination from './Pagination';

const Suspendaccounts = () => {

  const tabledata=[
    {
      id:1,
      username:'Navogithkour',
      contact: +91-9939393939,
      date: '10/01/2022',
      reason:"spam",
      status:"temporarly suspended"
   },
   {
    id:2,
    username:'Jakob',
    contact: +91-9939393939,
    date: '10/02/2022',
    reason:"spam",
    status:"temporarly suspended"
 },
 {
  id:3,
  username:'Mark',
  contact: +91-9939393939,
  date: '20/02/2023',
  reason:"illegal",
  status:"suspended"
},
{
  id:4,
  username:'Shoel altaf',
  contact: +91-9939393939,
  date: '20/02/2023',
  reason:"illegal",
  status:"suspended"
},
]

return (
    <div className='container'>
      
    <div className='d-flex justify-content-end mt-4'>
      <button className='btn btn-primary' style={{backgroundColor:"#3856F3",fontFamily:"Roboto"}}>Filter <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-funnel-fill ms-1" viewBox="0 0 16 16">
      <path d="M1.5 1.5A.5.5 0 0 1 2 1h12a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.128.334L10 8.692V13.5a.5.5 0 0 1-.342.474l-3 1A.5.5 0 0 1 6 14.5V8.692L1.628 3.834A.5.5 0 0 1 1.5 3.5z"/>
       </svg></button>
      <button className='btn' style={{color:"#FF0000",border:"1px solid #FF0000",fontFamily:"Roboto"}}>Suspended</button>
    </div>
    <div class="tab-content table-responsive">
   <table className="table table-borderless mt-4">
   <thead>
  <tr>
    <th id="sno">S.No</th>
    <th id="username">User Name</th>
    
    <th id="contact-details">Contact details</th>
    <th id="date">Date Suspended</th>
    <th id="reason">Reason</th>
    <th id="action">Actions</th>
    <th id="status">Status</th>
  </tr>
 </thead><br/> 
 <tbody id="user-data">
 {
     tabledata.map((tdata,index)=>(
      <tr key={tdata.id}>
      <th id='suspend-data1'>{tdata.id}</th>
      <td id='suspend-data2'><img src="http://www.w3.org/2000/svg" className="rounded-circle" /> {tdata.username}</td>
       <td id='suspend-data3'>{tdata.contact}</td>
       <td id='suspend-data4'>{tdata.date}</td>
       <td id='suspend-data5'>{tdata.reason}</td>    
       <td ><button id='suspend-data6' className="btn dropdown-toggle" style={{border:"1px solid red"}}>
      Actions
    </button></td>
    <td id="suspend-data7">{tdata.status}</td>
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
export default Suspendaccounts
