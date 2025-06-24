import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import '../Styles/Profiledata.css';
import { AppDispatch, RootState } from '../Redux/store/Store';
import moment from 'moment';


const Profiledata = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { socialUser,socialUserError }:any = useSelector((state:RootState) => state.UserMangment);
  const [showPreview, setShowPreview] = useState(false);
  const [csvContent, setCsvContent] = useState(''); 
  const profiledata = socialUser
    ? [
        { id: 1, key: 'Full Name', value: socialUser?.user?.firstname },
        { id: 2, key: 'Gender', value: socialUser?.user?.gender.charAt(0).toUpperCase() + socialUser?.user?.gender.slice(1) },
        { id: 3, key: 'Date of Birth', value:moment("1997-01-15T00:00:00.000Z").format("DD-MM-YYYY")},
        { id: 4, key: 'Phone Number', value: `${socialUser?.user?.countryCode}${socialUser?.user?.mobile}` },
      ]
    : [];

  const displayName = socialUser ? `${socialUser?.user?.firstname}` : 'Loading...';
  const generateCsvData = () => {
    const csvData = [
      ['Key', 'Value'],
      ['Full Name', socialUser?.user?.firstname || 'N/A'],
      ['Gender', socialUser?.user?.gender ? socialUser.user.gender.charAt(0).toUpperCase() + socialUser.user.gender.slice(1) : 'N/A'],
      ['Date of Birth', moment(socialUser?.user?.dateofbirth).format('DD-MM-YYYY') || 'N/A'],
      ['Phone Number', `${socialUser?.user?.countryCode || ''}${socialUser?.user?.mobile || 'N/A'}`],
      ['Display Name', socialUser?.user?.firstname || 'N/A'],
      ['User ID', socialUser?.user?._id || 'N/A'],
      ['Bio', socialUser?.user?.bio || 'N/A'], 
      ['Account Type', socialUser?.user?.privacy ? 'Private' : 'Public'],
    ];
    return csvData.map(row => row.join(',')).join('\n');
  };

  const handlePreviewClick = () => {
    const csv = generateCsvData();
    setCsvContent(csv);
    setShowPreview(true);
  };
  const parseCsvForTable = (csv: string) => {
    return csv.split('\n').map(row => row.split(','));
  };
  const handleDownload = () => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'profile_report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setShowPreview(false);  
  };
  const handleClosePreview = () => {
    setShowPreview(false);
  };

  if (socialUserError) {
    return <div>{socialUserError}</div>;
  }

  return (
    <div className="container-box">
      <div className="profile-container">
        <div className="profile-image-box">
          {socialUser?.user?.image ? <img
            className="profile-image"
            src={socialUser?.user?.image}
            width="174px"
            height="213px"
            alt="Profile"
          /> :
          <div style={{border:'1px solid white',marginTop:'35px',background:'rgb(56, 86, 243)',width:'200px',height:'200px',display:'flex',justifyContent:'center',alignItems:'center'}}>
            <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" fill="currentColor" className="bi bi-person" viewBox="0 0 16 16">
              <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z" />
            </svg>
            </div>
            }
        </div>

        <div className="profile-title-box">
          <div>
            <p className="profile-title">{displayName}</p>
          </div>
          {profiledata.map((data) => (
            <div className="profile-data" key={data.id}>
              <p className="data-key">{data.key}</p>
              <p className="data-value">{data.value}</p>
            </div>
          ))}
        </div>

        <div className="download-report"  onClick={handlePreviewClick}>
          <button className="download-report-btns">
            Download Report <i className="bi bi-download ms-2"></i>
          </button>
        </div>
      </div>
      {showPreview && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: 'white',
              padding: '20px',
              borderRadius: '8px',
              maxWidth: '500px',
              width: '100%',
              maxHeight: '80vh',
              overflowY: 'auto',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
            }}
          >
            <h3 style={{ marginBottom: '20px', fontSize: '20px', fontWeight: 'bold',color:'black' }}>CSV Preview</h3>
            <div style={{ overflowX: 'auto' }}>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '14px',
                  border: '1px solid #ccc',
                }}
              >
                <thead>
                  <tr>
                    {parseCsvForTable(csvContent)[0].map((header, index) => (
                      <th
                        key={index}
                        style={{
                          background: 'black',
                          color:'white',
                          padding: '10px',
                          border: '1px solid #ccc',
                          textAlign: 'left',
                          fontWeight: 'bold',
                        }}
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {parseCsvForTable(csvContent).slice(1).map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {row.map((cell, cellIndex) => (
                        <td
                          key={cellIndex}
                          style={{
                            color:'black',
                            padding: '10px',
                            border: '1px solid #ccc',
                            textAlign: 'left',
                          }}
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button
                style={{
                  padding: '8px 16px',
                  background: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
                onClick={handleClosePreview}
              >
                Cancel
              </button>
              <button
                style={{
                  padding: '8px 16px',
                  background: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
                onClick={handleDownload}
              >
                Download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profiledata;