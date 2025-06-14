import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Pagination from './Pagination';
import Actions from './ActionBtns/Actions';
import Loader from '../../Utils/Loader';
import { showToast } from '../../Utils/Validation';
import { MonitorCampaigns } from '../Redux/Reducers/UserMangement';
import { AppDispatch, RootState } from '../Redux/store/Store';

const ITEMS_PER_PAGE = 5;

const formatDate = (dateString: string | null | undefined) => {
  if (!dateString || dateString === 'N/A') return 'N/A';
  const date = new Date(dateString);
  return isNaN(date.getTime())
    ? dateString
    : date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
};

const Monitercompaign = () => {
  const [id, setId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { monitorCampaigns: apiResponse, loading, error } = useSelector(
    (state: RootState) => state.UserMangment
  );

  const campaignsData = apiResponse?.data || [];
  const totalCount = apiResponse?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE) || 1;

  useEffect(() => {
    dispatch(MonitorCampaigns({ page: currentPage, limit: ITEMS_PER_PAGE }));
  }, [dispatch, currentPage]);

  useEffect(() => {
    if (error) showToast(false, error);
  }, [error]);

  const handleOpen = (campaignId: number) => {
    setId((prev) => (prev === campaignId ? null : campaignId));
  };

  const handleAdd = () => navigate('/admin/admgmt');

  return (
    <div className='container'>
      <div className='d-flex justify-content-end mt-4 gap-2'>
        <button className='btn btn-primary' style={{ backgroundColor: '#3856F3', fontFamily: 'Roboto' }}>
          Filter
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
            className="bi bi-funnel-fill ms-2" viewBox="0 0 16 16">
            <path d="M1.5 1.5A.5.5 0 0 1 2 1h12a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.128.334L10 
              8.692V13.5a.5.5 0 0 1-.342.474l-3 1A.5.5 0 0 1 
              6 14.5V8.692L1.628 3.834A.5.5 0 0 1 1.5 3.5z" />
          </svg>
        </button>
        <button className='btn' style={{ color: '#FF0000', border: '1px solid #FF0000', fontFamily: 'Roboto' }}>
          Suspended Accounts
        </button>
      </div>

      <div className="tab-content table-responsive" style={{ position: 'relative', minHeight: '300px' }}>
        {loading && (
          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 999,
          }}>
            <Loader />
          </div>
        )}

        <table className="table table-borderless mt-4">
          <thead>
            <tr>
              <th>S.No</th>
              <th>Advertisement Name</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Status</th>
              <th>Impressions</th>
              <th>Engagement Rate</th>
              <th>Budget</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {!loading && campaignsData.length > 0 ? (
              campaignsData.map((tdata: any, index: number) => (
                <tr key={tdata._id || index}>
                  <td>{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</td>
                  <td>{tdata.title || 'N/A'}</td>
                  <td>{formatDate(tdata.adDuration?.startDate)}</td>
                  <td>{formatDate(tdata.adDuration?.endDate)}</td>
                  <td>{tdata.status || 'N/A'}</td>
                  <td>{'N/A'}</td>
                  <td>{'N/A'}</td>
                  <td>
                    {tdata.eliminatedBudget
                      ? `₹${tdata.eliminatedBudget.toLocaleString('en-IN')}`
                      : tdata.dailyBudget
                      ? `₹${tdata.dailyBudget.toLocaleString('en-IN')}`
                      : 'N/A'}
                  </td>
                  <td>
                    <button
                      onClick={() => handleOpen(tdata._id || index)}
                      className="btn dropdown-toggle border"
                      type="button"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      Actions
                    </button>
                    {id === (tdata._id || index) && <Actions />}
                  </td>
                </tr>
              ))
            ) : (
              !loading && (
                <tr>
                  <td colSpan={9} className="text-center">No campaigns found</td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        totalPages={totalPages}
        currentPage={currentPage}
        setPage={setCurrentPage}
      />

      <div className='d-flex justify-content-end mt-4'>
        <button className='btn btn-success' style={{ backgroundColor: '#28a745', fontFamily: 'Roboto' }} onClick={handleAdd}>
          Add Campaigns
        </button>
      </div>
    </div>
  );
};

export default Monitercompaign;
