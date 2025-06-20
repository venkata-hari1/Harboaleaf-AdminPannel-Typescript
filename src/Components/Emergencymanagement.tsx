import React, { Fragment, useEffect, useRef, useState } from 'react';
import Pagination from './Pagination';
import '../Styles/Emergencymanagement.css';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../Redux/store/Store';
import { Emergency_Management } from '../Redux/Reducers/UserMangement';
import SkeletonRows from '../../Utils/Skeleton';
import Loader from '../../Utils/Loader';

const Emergencymanagement = () => {
  const [page, setPage] = useState<number>(1);
  const [sortOrder, setSortOrder] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const firstLoad = useRef(true);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { emergency, loading }: any = useSelector((state: RootState) => state.UserMangment);

  useEffect(() => {
    const fetchData = async () => {
      if (firstLoad.current) {
        setInitialLoading(true);
        firstLoad.current = false;
      }

      const data = {
        page,
        state: '',
        sort: sortOrder ? 'desc' : 'asc',
      };

      await dispatch(Emergency_Management({ data }));
      setInitialLoading(false); // Ensure this happens after dispatch completes
    };

    fetchData();
  }, [page, sortOrder, dispatch]);

  const handleNavigate = (tdata:{victim:{_id:string},rescuer:{firstname:string,image:string} ,createdAt:string,area:string,type:string}) => {
    navigate(`/admin/safety-reports`);
    localStorage.setItem('id',tdata?.victim?._id)
    localStorage.setItem('rescuername',tdata?.rescuer?.firstname ||'')
    localStorage.setItem('rescuerimage',tdata?.rescuer?.image ||'')
    localStorage.setItem('rescuerimage',tdata?.rescuer?.image ||'')
    localStorage.setItem('rescuetime',tdata?.createdAt||'')
    localStorage.setItem('rescuearea',tdata?.area||'')
    localStorage.setItem('type',tdata?.type||'')
    console.log(tdata?.rescuer?.firstname)
  };

  const handleAscDesc = () => {
    setSortOrder((prev) => !prev);
    setPage(1); // Reset to page 1 on sort change
  };

  const getSerialNumber = (index: number) => {
    return emergency?.sort === 'desc'
      ? (emergency?.page - 1) * emergency?.limit + index + 1
      : emergency?.totalRecords - ((emergency?.page - 1) * emergency.limit + index);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className='container' style={{marginTop:'60px'}}>
      <div className='d-flex justify-content-end mt-4' style={{ paddingLeft: '50px' }}>
        <button className='btn btn-primary me-3' onClick={handleAscDesc}>
          Filter{' '}
          {sortOrder ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-funnel-fill ms-1" viewBox="0 0 16 16">
              <path d="M1.5 1.5A.5.5 0 0 1 2 1h12a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.128.334L10 8.692V13.5a.5.5 0 0 1-.342.474l-3 1A.5.5 0 0 1 6 14.5V8.692L1.628 3.834A.5.5 0 0 1 1.5 3.5z" />
            </svg>
          ) : (
            <svg width="16" height="18" viewBox="0 0 16 16" fill="white" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 9V1.12C5.96 0.82 6.06 0.5 6.29 0.29C6.38 0.2 6.49 0.12 6.61 0.07C6.73 0.02 6.86 0 6.99 0C7.13 0 7.25 0.02 7.38 0.07C7.5 0.12 7.61 0.2 7.7 0.29L9.71 2.3C9.82 2.41 9.9 2.54 9.95 2.68C10 2.83 10.02 2.98 10 3.13V9H10.03L15.79 16.38C15.95 16.59 16.03 16.85 15.99 17.12C15.96 17.38 15.83 17.62 15.62 17.78C15.43 17.92 15.22 18 15 18H1C0.78 18 0.57 17.92 0.38 17.78C0.17 17.62 0.04 17.38 0.01 17.12C-0.03 16.85 0.05 16.59 0.21 16.38L5.97 9H6Z" />
            </svg>
          )}
        </button>
        {/* <button className='btn' style={{ color: '#FF0000', border: '1px solid #FF0000', fontFamily: 'Roboto' }}>
          Emergency Reports
        </button> */}
      </div>

      {initialLoading ? (
        <Loader />
      ) : (
        <Fragment>
          {emergency?.data?.length > 0 ? <div className="tab-content table-responsive">
            <table className="table table-borderless mt-4">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Utilised By</th>
                  <th>Rescued By</th>
                  <th>State</th>
                  <th>Area</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <SkeletonRows count={6} />
                ) :
                  emergency?.data?.map((tdata: any, index: number) => (
                    <tr key={tdata._id}>
                      <th>{getSerialNumber(index)}</th>
                      <td onClick={()=>handleNavigate(tdata)}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                        {tdata.victim.image?<img
                            src={tdata.victim.image}
                            alt="rescuer"
                            className="rounded-circle me-2"
                            width="30"
                            height="30"
                            style={{ objectFit: 'cover', border: '1px solid white' }}
                          />:
                          <img
                            src={`https://robohash.org/${tdata.victim.firstname}?size=40x40`}
                            alt="victim"
                            className="rounded-circle me-2"
                            width="30"
                            height="30"
                            style={{ objectFit: 'cover', border: '1px solid white' }}
                          />}
                          <div className="text-truncate" style={{ maxWidth: '100px' }}>
                            {tdata?.victim?.firstname}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          {tdata.rescuer.image?<img
                            src={tdata.rescuer.image}
                            alt="rescuer"
                            className="rounded-circle me-2"
                            width="30"
                            height="30"
                            style={{ objectFit: 'cover', border: '1px solid white' }}
                          />:
                           <img
                            src={`https://robohash.org/${tdata.rescuer.firstname}?size=40x40`}
                            alt="victim"
                            className="rounded-circle me-2"
                            width="30"
                            height="30"
                            style={{ objectFit: 'cover', border: '1px solid white' }}
                          />}
                          <div className="text-truncate" style={{ maxWidth: '100px' }}>
                            {tdata.rescuer.firstname}
                          </div>
                        </div>
                      </td>
                      <td>{tdata?.victim?.state}</td>
                      <td>{tdata?.area}</td>
                      <td>{formatDate(tdata?.createdAt)}</td>
                    </tr>
                  )
                  )}
              </tbody>
      
            </table>
            <Pagination currentPage={page} totalPages={emergency?.totalPages || 1} setPage={setPage} />
          </div> : <div className="nodata">
            <p className="content">No  data found</p>
          </div>}
        </Fragment>
      )}
    </div>
  );
};

export default Emergencymanagement;
