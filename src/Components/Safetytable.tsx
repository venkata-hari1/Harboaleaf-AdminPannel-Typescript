import React from 'react'
import '../Styles/Safetable.css';

const Safetytable = () => {

    const safedata=[

            {id:1,username:"Navjoth kur",date:"01/01/2023", contact:"+(91)79000010101", reason:"Spam"},
            {id:2,username:"Viswas Patel",date:"02/03/2022", contact:"+(91)9000010202", reason:"Spam"},
            {id:3,username:" Fazil md",date:"05/03/2024", contact:"+(91)8000010204", reason:"Spam"}
]
  return (
    <div className='container'>
    <div className='safety-table-box'> 
       <div className='safe-buttons'>
        <p>Reports</p>
        <button className='safe-btn'>Reports</button>
       </div> 
    
       <table className='table'>
       <thead>
        <tr>
         <th>S.No</th>
         <th>User Reported</th>
         <th>Date</th>
         <th>Contact Details</th>
         <th>Reason</th>   
        </tr>
      </thead>
      <tbody>
        {

          safedata.map(data=>(
            <tr key={data.id}>
             <td>{data.id}</td>
             <td><img
            src="http://www.w3.org/2000/svg"
            alt="avatar"
            className="rounded-circle "
            width="30"
            height="30"
            style={{objectFit:"cover"}}
          />{data.username}</td>
             <td>{data.date}</td>
             <td>{data.contact}</td>
             <td>{data.reason}</td>   
            </tr>
              

          ))


        }
       </tbody>
       
       </table>
      
       





     </div>


   </div>
  )
}

export default Safetytable
