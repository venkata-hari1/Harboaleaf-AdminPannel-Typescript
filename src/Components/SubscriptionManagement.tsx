import React, { useState } from 'react';
import Pagination from './Pagination';
import { SubscriptionTable } from './JSON_Data/JSON';

const SubscriptionManagement = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [showDropdown, setShowDropdown] = useState(false);

  const recordsPerPage = 6;
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = SubscriptionTable.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(SubscriptionTable.length / recordsPerPage);

  const handleOptionClick = (option) => {
    console.log("Selected:", option);
    setShowDropdown(false);
  };

  return (
    <div className='container'>
      {/* Filter Button */}
      <div className='d-flex justify-content-end mt-4' style={{ position: 'relative' }}>
        <div style={{ position: 'relative' }}>
          <button
            className='btn btn-primary me-3'
            onClick={() => setShowDropdown(!showDropdown)}
            style={{
              backgroundColor: "#3856F3",
              fontFamily: "Roboto",
              display: 'flex',
              alignItems: 'center',
              borderRadius: '8px',
              padding: '8px 16px',
              border: 'none'
            }}
          >
            Filter
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
              fill="currentColor" className="bi bi-funnel-fill ms-2" viewBox="0 0 16 16">
              <path d="M1.5 1.5A.5.5 0 0 1 2 1h12a.5.5 
              0 0 1 .5.5v2a.5.5 0 0 1-.128.334L10 
              8.692V13.5a.5.5 0 0 1-.342.474l-3 
              1A.5.5 0 0 1 6 
              14.5V8.692L1.628 
              3.834A.5.5 0 0 1 1.5 3.5z" />
            </svg>
          </button>

          {/* Dropdown */}
          {showDropdown && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                backgroundColor: 'white',
                boxShadow: '0px 8px 16px rgba(0,0,0,0.1)',
                borderRadius: '10px',
                marginTop: '5px',
                zIndex: 1000,
                width: '180px',
                maxHeight: '200px',
                overflowY: 'auto'
              }}
            >
              {['Business', 'Creator', 'Premium'].map((option, idx) => (
                <div
                  key={idx}
                  onClick={() => handleOptionClick(option)}
                  style={{
                    padding: '10px 16px',
                    cursor: 'pointer',
                    color: '#000',
                    whiteSpace: 'nowrap',
                    borderRadius: '8px',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f0f0'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                >
                  {option}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="tab-content table-responsive">
        <table className="table table-borderless mt-4">
          <thead>
            <tr>
              <th>S.No</th>
              <th>User</th>
              <th>Unique Name</th>
              <th>Subscription Type</th>
              <th>Subscription Start</th>
              <th>Subscription End</th>
              <th>State</th>
            </tr>
          </thead>
          <tbody>
            {currentRecords.map((tdata, index) => (
              <tr
                key={tdata.id}
                style={{
                  transition: 'background-color 0.3s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor = '#fff';
                  e.currentTarget.style.color = '#000';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = '';
                  e.currentTarget.style.color = '';
                }}
              >
                <th>{(currentPage - 1) * recordsPerPage + index + 1}</th>
                <td className="d-flex align-items-center">
                  <img
                    src={tdata.avatar}
                    alt={tdata.username}
                    style={{
                      width: '35px',
                      height: '35px',
                      borderRadius: '50%',
                      marginRight: '10px',
                      objectFit: 'cover',
                    }}
                  />
                  {tdata.username}
                </td>
                <td>{tdata.uniquename}</td>
                <td>{tdata.subscriptionType}</td>
                <td>{tdata.ssdate}</td>
                <td>{tdata.sedate}</td>
                <td>{tdata.state}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <Pagination
        totalPages={totalPages}
        currentPage={currentPage}
        setPage={setCurrentPage}
      />
    </div>
  );
};

export default SubscriptionManagement;