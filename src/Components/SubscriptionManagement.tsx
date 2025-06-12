import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSubscriptions } from '../Redux/Reducers/SubscriptionThunk';
import { setPage, setFilterType } from '../Redux/Reducers/SubscriptionSlice';
import Pagination from './Pagination';
import { RootState, AppDispatch } from '../Redux/store/Store'

const SubscriptionManagement = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { data, loading, currentPage, totalPages, filterType } = useSelector(
    (state: RootState) => state.subscription
  );
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    dispatch(fetchSubscriptions({ page: currentPage, accountType: filterType || undefined }));
  }, [dispatch, currentPage, filterType]);


  const handleOptionClick = (option) => {
    dispatch(setFilterType(option));
    setShowDropdown(false);
  };

  return (
    <div className='container'>
      <div className='d-flex justify-content-end mt-4' style={{ position: 'relative' }}>
        <div style={{ position: 'relative' }}>
          <button
            className='btn btn-primary me-3'
            onClick={() => setShowDropdown(!showDropdown)}
            style={{
              backgroundColor: '#3856F3',
              fontFamily: 'Roboto',
              display: 'flex',
              alignItems: 'center',
              borderRadius: '8px',
              padding: '8px 16px',
              border: 'none',
            }}
          >
            Filter
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-funnel-fill ms-2" viewBox="0 0 16 16">
              <path d="M1.5 1.5a.5.5 0 0 1 .5-.5h12a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.128.334L10 8.692V13.5a.5.5 0 0 1-.342.474l-3 1A.5.5 0 0 1 6 14.5V8.692L1.628 3.834A.5.5 0 0 1 1.5 3.5v-2z" />
            </svg>
          </button>

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
                overflowY: 'auto',
              }}
            >
              {['BusinessAccount', 'CreatorAccount', 'PremiumAccount'].map((option, idx) => (
                <div
                  key={idx}
                  onClick={() => handleOptionClick(option)}
                  style={{
                    padding: '10px 16px',
                    cursor: 'pointer',
                    color: '#000',
                    whiteSpace: 'nowrap',
                    borderRadius: '8px',
                    transition: 'background-color 0.2s ease',
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
        {loading ? <div>Loading...</div> : (
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
              {data.map((tdata, index) => (
                <tr key={tdata.id}>
                  <th>{(currentPage - 1) * 6 + index + 1}</th>
                  <td className="d-flex align-items-center">
                    <img src={tdata.avatar} alt={tdata.username} style={{ width: '35px', height: '35px', borderRadius: '50%', marginRight: '10px', objectFit: 'cover' }} />
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
        )}
      </div>

      {/* Pagination */}
      <Pagination totalPages={totalPages} currentPage={currentPage} setPage={(page) => dispatch(setPage(page))} />
    </div>
  );
};

export default SubscriptionManagement;
