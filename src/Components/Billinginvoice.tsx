import React from 'react'
import '../Styles/Billinginvoice.css'
import Pagination from './Pagination'

const Billinginvoice = () => {

  const tabledata=[

     { 
       id:1,
       advertisefirm:"Binfoled ltd",
       advertisename:"active",
       amount:'₹2,50,000',
       date:'-02/04/2023',
    },
    { 
      id:2,
      advertisefirm:"Abstergo ltd",
      advertisename:"active",
      amount:'₹2,48,000',
      date:'02/04/2022',
   },
   { 
    id:3,
    advertisefirm:"Big kuhana Burger ltd",
    advertisename:"active",
    amount:'₹3,45,000',
    date:'02/04/2024',
 },
 { 
  id:4,
  advertisefirm:"Barno LLC",
  advertisename:"active",
  amount:'₹4,50,000',
  date:'04/04/2024',
}

  ]
  return (
    <div className='container'>
      
    <div className='d-flex justify-content-end mt-4'>
      <button className='btn btn-primary me-3' style={{backgroundColor:"#3856F3"}}>Filter <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-funnel-fill ms-2" viewBox="0 0 16 16">
<path d="M1.5 1.5A.5.5 0 0 1 2 1h12a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.128.334L10 8.692V13.5a.5.5 0 0 1-.342.474l-3 1A.5.5 0 0 1 6 14.5V8.692L1.628 3.834A.5.5 0 0 1 1.5 3.5z"/>
</svg></button>
      
    </div>
    <div className="tab-content table-responsive">
<table className="table table-borderless mt-4">
   <thead >
  <tr >
    <th>Advertisment No</th>
    <th>Advertisment firm</th>
    
    <th>Advertise Name</th>
    <th>Amount paid</th>
    <th>Date of payment</th>
    <th>Download</th>
  </tr>
</thead><br/>
<tbody >
{
     tabledata.map((tdata,index)=>(
      <tr key={tdata.id}>
      <th>{tdata.id}</th>
      <td>{tdata.advertisefirm}</td>
      <td>{tdata.advertisename}</td> 
      <td>{tdata.amount}</td>
      <td>{tdata.date}</td>
          
      <td><button className="btn dropdown-toggle border" type="button" data-bs-toggle="dropdown" aria-expanded="false">
    Download
    </button></td>
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

export default Billinginvoice
