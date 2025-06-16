import React, { useEffect, useRef, useState } from 'react';
import Pagination from './Pagination';
import Actions from './ActionBtns/Actions';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../Redux/store/Store';
import { GSTUSERS } from '../Redux/Reducers/UserMangement';
import SkeletonRows from '../../Utils/Skeleton';
import { useNavigate } from 'react-router-dom';
import Loader from '../../Utils/Loader';

const Gstreportsmanagement = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { GSTUsers, loading }: any = useSelector((state: RootState) => state.UserMangment);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('desc');
  const [initialLoading, setInitialLoading] = useState(false);
  const [filter, setFilter] = useState('');
  const navigate = useNavigate()
  const firstLoad = useRef(true);
  useEffect(() => {
    async function fetchData(){
      if (firstLoad.current) {
        setInitialLoading(true);
        firstLoad.current = false;
      }
      const data={
        page:page, 
        sort:sort, 
        filter:filter,
        state:''
      }
    await dispatch(GSTUSERS({ data:data }));
    setInitialLoading(false)
    }fetchData()
  }, [dispatch, page, sort, filter]);


  const getIndianStateFromAddress = (address: string) => {
    const stateRegex = /\b(Andhra Pradesh|Arunachal Pradesh|Assam|Bihar|Chhattisgarh|Goa|Gujarat|Haryana|Himachal Pradesh|Jharkhand|Karnataka|Kerala|Madhya Pradesh|Maharashtra|Manipur|Meghalaya|Mizoram|Nagaland|Odisha|Punjab|Rajasthan|Sikkim|Tamil Nadu|Telangana|Tripura|Uttar Pradesh|Uttarakhand|West Bengal|Andaman and Nicobar Islands|Chandigarh|Dadra and Nagar Haveli and Daman and Diu|Delhi|Jammu and Kashmir|Ladakh|Lakshadweep|Puducherry)\b/i;
    const match = address?.match(stateRegex);
    return match ? match[0] : null;
  };
  const TotalUsers = Math.ceil(GSTUsers?.pagination?.total / GSTUsers?.pagination?.limit);
  const limit = GSTUsers?.pagination?.limit
  const userInfo = (id: number) => {
    navigate(`/admin/user-management/profile-info/${id}`);
  };
  return (
    <div className='container'>
      <div className='d-flex justify-content-end mt-4'>
        <button className='btn btn-primary me-3'
          style={{ backgroundColor: "#3856F3", fontFamily: "Roboto" }} onClick={() => setSort(prev => (prev === 'asc' ? 'desc' : 'asc'))}>
          Filter
          {sort === 'desc' ? <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-funnel-fill ms-1" viewBox="0 0 16 16">
            <path d="M1.5 1.5A.5.5 0 0 1 2 1h12a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.128.334L10 8.692V13.5a.5.5 0 0 1-.342.474l-3 1A.5.5 0 0 1 6 14.5V8.692L1.628 3.834A.5.5 0 0 1 1.5 3.5z" />
          </svg> : <svg width="16" height="18" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5.99999 9V1.12C5.95999 0.820002 6.05999 0.5 6.28999 0.290001C6.38251 0.197298 6.49239 0.123751 6.61337 0.0735683C6.73434 0.023386 6.86402 -0.00244331 6.99499 -0.00244331C7.12596 -0.00244331 7.25564 0.023386 7.37662 0.0735683C7.49759 0.123751 7.60748 0.197298 7.69999 0.290001L9.70999 2.3C9.81899 2.40666 9.90188 2.53707 9.95218 2.68104C10.0025 2.82502 10.0188 2.97866 9.99999 3.13L9.99999 9H10.03L15.79 16.38C15.9524 16.5885 16.0257 16.8527 15.9938 17.1151C15.9619 17.3774 15.8276 17.6165 15.62 17.78C15.43 17.92 15.22 18 15 18L0.999991 18C0.779991 18 0.56999 17.92 0.379991 17.78C0.172425 17.6165 0.0380325 17.3774 0.00617886 17.1151C-0.0256748 16.8527 0.0475988 16.5885 0.209991 16.38L5.96999 9H5.99999Z" fill="white" />
          </svg>
          }
        </button>

      </div>
 {initialLoading ? (
        <Loader />
      ):
      <div className="tab-content table-responsive">
        <table className="table table-borderless mt-4">
          <thead>
            <tr>
              <th>S.No</th>
              <th>User Name</th>
              <th>GST Username</th>
              <th>Sub Start</th>
              <th>Sub End</th>
              <th>State</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (

              <SkeletonRows count={6} />

            ) : (
              GSTUsers?.data?.map((tdata: any, index: number) => (
                <tr key={tdata._id}>
                  <td>

                    {sort === 'desc'
                      ? (page - 1) * limit + index + 1
                      : GSTUsers?.pagination?.total - ((page - 1) * limit + index)}
                  </td>
                  <td onClick={() => userInfo(tdata._id)}>
                    <img
                      src={tdata.image || `https://robohash.org/${tdata.firstname}?size=40x40`}
                      alt="avatar"
                      className="rounded-circle me-2"
                      width="30"
                      height="30"
                      style={{ objectFit: "cover", border: '1px solid white' }}
                    />
                    {tdata.firstname} 
                  </td>
                  <td>{tdata.gstname}</td>
                  <td>{new Date(tdata.substart).toLocaleDateString()}</td>
                  <td>{new Date(tdata.subend).toLocaleDateString()}</td>
                  <td>{tdata?.state?tdata?.state:'N/A'}</td>

                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>}

      {!loading && <Pagination currentPage={page} totalPages={TotalUsers} setPage={setPage} />}
    </div>
  );
};

export default Gstreportsmanagement;
