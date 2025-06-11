import React from 'react';
import './Styles.css';

function TotalInformation() {
  const Earning = [
    { id: 1, txt: 'Total Users', data: 100 },
    { id: 2, txt: 'Total Reports', data: 500 },
    { id: 3, txt: 'Total Suspended Accounts', data: 300 },
    { id: 4, txt: 'Total GST Users', data: 1500 },
    { id: 5, txt: 'Total Advertises', data: 3000 },
  ];
  return (
    <div className="total-information py-3">
      <div>
        <div className="grid-rows">
          {Earning.map((data) => (
            <div key={data.id}>
              <div className="info-card">
                <h6 className="mb-1">{data.txt}</h6>
                <small className="text-light">{data.data}</small>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TotalInformation;
