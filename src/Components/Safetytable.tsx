import React from 'react'
import '../Styles/Safetable.css';
type IProps = {
  victiminfo:{
    createdAt:string,
    reason:string,

    reported:{
      firstname:string,
      mobile:string,
      countryCode:string,
      image:string
    }
  }[]
}
const Safetytable = ({ victiminfo }: IProps) => {

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };
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
            {victiminfo?.map((data,index) => {
              return (
                <tr key={index}>
                  <td>{index+1}</td>
                  <td>
                    {data.reported.image ? <img
                      src={data.reported.image}
                      alt="rescuer"
                      className="rounded-circle me-2"
                      width="30"
                      height="30"
                      style={{ objectFit: 'cover', border: '1px solid white' }}
                    /> :
                      <img
                        src={`https://robohash.org/${data.reported.firstname}?size=40x40`}
                        alt="avatar"
                        className="rounded-circle me-2"
                        width="30"
                        height="30"
                      />}

                    {data.reported.firstname}</td>
                  <td>{formatDate(data.createdAt)}</td>
                  <td>{data.reported.countryCode}{data.reported.mobile}</td>
                  <td>{data.reason}</td>
                </tr>


              )
            })


            }
          </tbody>

        </table>







      </div>


    </div>
  )
}

export default Safetytable
