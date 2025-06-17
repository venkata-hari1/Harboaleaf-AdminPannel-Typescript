import React, { Fragment } from 'react';
import './Styles.css';
import { useSelector } from 'react-redux';
import { RootState } from '../../../Redux/store/Store';
import Skeleton from 'react-loading-skeleton';


function TotalInformation() {
  const {dashboard,loading}:any=useSelector((state:RootState)=>state.UserMangment)
  localStorage.setItem('totalusers',dashboard?.data?.TotalUsers)
  localStorage.setItem('userspercentage',dashboard?.data?.YesterdayActivity?.percentage)
  const Earning = [
    { id: 1, txt: 'Total Users', data: dashboard?.data?.TotalUsers || 0},
    { id: 2, txt: 'Total Reports', data: dashboard?.data?.TotalReports || 0 },
    { id: 3, txt: 'Total Suspended Accounts', data: dashboard?.data?.TotalSuspendedAccounts|| 0 },
    { id: 4, txt: 'Total GST Users', data: dashboard?.data?.GstUsers|| 0  },
    { id: 5, txt: 'Total Advertises', data: dashboard?.data?.TotalAdvertisments|| 0 },
  ];

  return (
    <div className="total-information py-3">
      <div>
        <div className="grid-rows">
        
         <Fragment>
          {Earning.map((data) => (
            <div key={data.id}>
              <div className="info-card">
                <h6 className="mb-1">{data.txt}</h6>
                <small className="text-light">{data.data}</small>
              </div>
            </div>
           
          ))}
          </Fragment>
        </div>
      </div>
    </div>
  );
}

export default TotalInformation;
