import React from 'react'
import Pagination from './Pagination'
import '../Styles/Emergencymanagement.css';
import { useNavigate } from 'react-router-dom';
const Emergencymanagement = () => {
  const navigate=useNavigate()
   const handleNavigate=()=>{
      navigate(`/admin/safety-reports`)
   }
    const tabledata=[
        {
          id:1,
          utiliseduser:'Navogithkour',
          rescuseduser: 'Navigosh pateel',
          state: "Maharastra",
          area: "Thane",
          date:"20/12/2024",
       },
       {
        id:2,
        utiliseduser:'Andrew',
        rescuseduser: 'Smith waarn',
        state: "Gujarath",
        area: "Dhooran",
        date:"21/12/2023",        },
       {
        id:3,
          utiliseduser:'Preranrao',
          rescuseduser: 'Preran viswam',
          state: "Maharastra",
          area: "Thane",
          date:"20/09/2023",
      },
     {
        id:4,
        utiliseduser:'Ranveer',
        rescuseduser: 'Dhruvan sen',
        state: "Uttarpradesh",
        area: "Dharavi",
        date:"20/12/2022",
    }
]
  return (
    <div className='container'>
      
    <div className='d-flex justify-content-end mt-4' style={{paddingLeft:"50px"}}>
      <button className='btn btn-primary me-3'>Filter <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-funnel-fill" viewBox="0 0 16 16">
        <path d="M1.5 1.5A.5.5 0 0 1 2 1h12a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.128.334L10 8.692V13.5a.5.5 0 0 1-.342.474l-3 1A.5.5 0 0 1 6 14.5V8.692L1.628 3.834A.5.5 0 0 1 1.5 3.5z"/>
    </svg></button>
      <button className='btn' style={{color:"#FF0000",border:"1px solid #FF0000",fontFamily:"Roboto"}}> Emergency Reports</button>
    </div>
    <div className="tab-content table-responsive">
   <table className="table table-borderless mt-4 ">
   <thead >
  <tr>
    <th>S.No</th>
    <th>Utilised By</th>
    <th>Rescued By</th>
    <th>State</th>
    <th>Area</th>
    <th>Date</th>
  </tr>
</thead><br/>
<tbody >
  {
     tabledata.map((tdata,index)=>(
      <tr key={tdata.id}>
      <th>{tdata.id}</th>
      <td onClick={handleNavigate}> <img
            src={`https://robohash.org/${tdata.utiliseduser}?size=40x40`}
            alt="avatar"
            className="rounded-circle me-2"
            width="30"
            height="30"
            style={{objectFit:"cover",border:'1px solid white',marginBottom:'2px'}}
          />{tdata.utiliseduser}</td>
      <td>
      <img
            src={`https://robohash.org/${tdata.rescuseduser}?size=40x40`}
            alt="avatar"
            className="rounded-circle me-2"
            width="30"
            height="30"
            style={{objectFit:"cover",border:'1px solid white',marginBottom:'2px'}}
          />
        {tdata.rescuseduser}</td> 
      <td>{tdata.state}</td>
      <td>{tdata.area}</td> 
      <td>{tdata.date}</td>    
     </tr>


   ))
  }
</tbody>
  </table>
  </div>
  <div>
  <Pagination />
  </div>    
  </div>
  )
}

export default Emergencymanagement
