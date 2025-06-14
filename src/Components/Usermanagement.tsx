import React, { Fragment, useEffect, useRef, useState } from 'react';
import "../Styles/Usermanagement.css";
import Pagination from './Pagination';
import '../Styles/Pagination.css';
import { useNavigate } from 'react-router-dom';
import Actions from './ActionBtns/Actions';
import { useDispatch, useSelector } from 'react-redux';
import { Users, UserSuspended } from '../Redux/Reducers/UserMangement';
import { AppDispatch, RootState } from '../Redux/store/Store';
import moment from 'moment';
import Loader from '../../Utils/Loader';
import { showToast } from '../../Utils/Validation';
import SkeletonRows from '../../Utils/Skeleton';

const Usermanagement = () => {
  const [id, setId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState<number | string>(1);
  const [loading, setLoading] = useState(false);
  const [value, setValue] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const[sortOrder,setSortOrder]=useState(true)
  const[filter,setFilter]=useState('')
  const firstLoad = useRef(true);

  const state: any = useSelector((state: RootState) => state.UserMangment.data);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      if (firstLoad.current) {
        setInitialLoading(true);
        firstLoad.current = false;
      } else {
        setLoading(true);
      }
      setValue(true);
      const data={
        page:currentPage,
        sort:sortOrder?'desc':'asc',
        filter:filter
      }
      await dispatch(Users({data:data}));
      setLoading(false);
      setValue(false);
      setInitialLoading(false);
    };
    fetchData();
  }, [dispatch, currentPage,sortOrder,filter]);

  const userInfo = (id: number) => {
    navigate(`profile-info/${id}`);
  };

  const handleTemSuspend = async (id: string, type: string) => {
    try {
   
      setLoading(true);
      let data;
      switch (type) {
        case "TemporarySuspended":
          data = { id, temSuspended: true };
          break;
        case "Suspended":
          data = { id, suspended: true };
          break;
        case "ResetTemporarySuspension":
          data = { id, temSuspended: false };
          break;
        case "ResetPermanentSuspension":
          data = { id, suspended: false };
          break;
        default:
          setValue(false);
          return;
      }
      const res = await dispatch(UserSuspended({ data }));
      const fulfilled = res.payload;
      if (fulfilled?.status) {
        showToast(true, fulfilled.message);
      } else {
        showToast(false, fulfilled?.message || "Operation failed");
      }
    } catch {
      showToast(false, "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleAscDesc = () => {
   setSortOrder(!sortOrder)
  };
const handleFilter=(t:string)=>{
  setFilter(t)
}
  const TotalUsers = Math.ceil(state?.totalUsers / state?.limit);
  const page = state.page;
  const limit = state.limit;
  const sort = state.sortOrder;

  return (
    <div className='container' style={{ height: "90vh" }}>
      <div style={{ display: "flex", justifyContent: "end" }}>
        <button
          className='btn btn-primary me-3'
          style={{ backgroundColor: "#3856F3", fontFamily: "Roboto" }}
          onClick={() => handleAscDesc()}
        >
          Filter
          {sortOrder?<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-funnel-fill ms-1" viewBox="0 0 16 16">
            <path d="M1.5 1.5A.5.5 0 0 1 2 1h12a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.128.334L10 8.692V13.5a.5.5 0 0 1-.342.474l-3 1A.5.5 0 0 1 6 14.5V8.692L1.628 3.834A.5.5 0 0 1 1.5 3.5z" />
          </svg>:<svg width="16" height="18" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M5.99999 9V1.12C5.95999 0.820002 6.05999 0.5 6.28999 0.290001C6.38251 0.197298 6.49239 0.123751 6.61337 0.0735683C6.73434 0.023386 6.86402 -0.00244331 6.99499 -0.00244331C7.12596 -0.00244331 7.25564 0.023386 7.37662 0.0735683C7.49759 0.123751 7.60748 0.197298 7.69999 0.290001L9.70999 2.3C9.81899 2.40666 9.90188 2.53707 9.95218 2.68104C10.0025 2.82502 10.0188 2.97866 9.99999 3.13L9.99999 9H10.03L15.79 16.38C15.9524 16.5885 16.0257 16.8527 15.9938 17.1151C15.9619 17.3774 15.8276 17.6165 15.62 17.78C15.43 17.92 15.22 18 15 18L0.999991 18C0.779991 18 0.56999 17.92 0.379991 17.78C0.172425 17.6165 0.0380325 17.3774 0.00617886 17.1151C-0.0256748 16.8527 0.0475988 16.5885 0.209991 16.38L5.96999 9H5.99999Z" fill="white"/>
</svg>
}
        </button>

        <div className="dropdown">
          <button
            className="btn dropdown-toggle"
            style={{ color: "#FF0000", border: "1px solid #FF0000", fontFamily: "Roboto" }}
            type="button"
            id="suspendedDropdown"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            Suspended Accounts
          </button>
          <div className="dropdown-menu" aria-labelledby="suspendedDropdown">
            <a className="dropdown-item" href="#" onClick={() => handleFilter('temSuspended')}>Temporarily Suspended Accounts</a>
            <a className="dropdown-item" href="#" onClick={() => handleFilter('suspended')}>Permanently Suspended Accounts</a>
            <a className="dropdown-item" href="#" onClick={() => handleFilter('')}>Reset All</a>
          </div>
        </div>
      </div>

      {initialLoading ? (
        <Loader />
      ) : (
        <div className="tab-content table-responsive">
          {state?.data?.length > 0 ? (
            <Fragment>
              <table className="table table-borderless mt-5">
                <thead>
                  <tr>
                    <th>S.No</th>
                    <th>User Name</th>
                    <th>Account Status</th>
                    <th>Contact details</th>
                    <th>Date Added</th>
                    <th>State</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <SkeletonRows  />
                  ) : (
                    state?.data?.map((tdata, index) => (
                      <tr key={tdata._id}>
                        <td>
                        {sort === 'desc'
    ? (page - 1) * limit + index + 1
    : state.totalUsers - ((page - 1) * limit + index)}
                        </td>
                        <td onClick={() => userInfo(tdata.id)} style={{ display: 'flex' }}>
                          {tdata.image ? (
                            <img src={tdata.image} alt="avatar" className="rounded-circle me-2" width="30" height="30" />
                          ) : (
                            <img src={`https://robohash.org/${tdata.username}?size=40x40`} alt="avatar" className="rounded-circle me-2" width="30" height="30" />
                          )}
                          <div style={{ color: tdata?.suspended ? "red" : tdata.temSuspended ? 'rgb(56, 86, 243)' : 'white' }}>
                            {tdata.firstname} {tdata.lastname}
                          </div>
                        </td>
                        <td>
                          <div style={{ color: tdata?.suspended ? "red" : tdata.temSuspended ? 'rgb(56, 86, 243)' : 'white' }}>
                            {tdata.suspended ? "Inactive" : tdata.temSuspended ? 'Inactive' : tdata.verified ? "Active" : "Inactive"}
                          </div>
                        </td>
                        <td>
                          <div style={{ color: tdata?.suspended ? "red" : tdata.temSuspended ? 'rgb(56, 86, 243)' : 'white' }}>
                            {tdata.countryCode}{tdata.mobile}
                          </div>
                        </td>
                        <td>
                          <div style={{ color: tdata?.suspended ? "red" : tdata.temSuspended ? 'rgb(56, 86, 243)' : 'white' }}>
                            {moment(tdata.createdAt).format("DD/MM/YYYY")}
                          </div>
                        </td>
                        <td>
                          <div style={{ color: tdata?.suspended ? "red" : tdata.temSuspended ? 'rgb(56, 86, 243)' : 'white' }}>
                            {tdata.address ? (tdata.address.length > 10 ? `${tdata.address.substring(0, 10)}...` : tdata.address) : "India"}
                          </div>
                        </td>
                        <td className='action-btns'>
                          <div className="dropdown">
                            <button
                              className={`btn dropdown-toggle ${tdata?.suspended ? "btn-danger" : tdata.temSuspended ? 'btn-primary' : "btn-secondary"}`}
                              type="button"
                              id="dropdownMenuButton"
                              data-bs-toggle="dropdown"
                            >
                              Actions
                            </button>
                            <div
                              className="dropdown-menu"
                              aria-labelledby="dropdownMenuButton"
                              style={{
                                pointerEvents: value ? 'none' : 'auto',
                                opacity: value ? 0.5 : 1,
                              }}
                            >
                              {!tdata?.temSuspended && !tdata?.suspended && (
                                <>
                                  <a className="dropdown-item" href="#" onClick={() => handleTemSuspend(tdata._id, 'TemporarySuspended')}>Temporary Suspend</a>
                                  <a className="dropdown-item" href="#" onClick={() => handleTemSuspend(tdata._id, 'Suspended')}>Permanent Suspend</a>
                                </>
                              )}
                              {tdata?.temSuspended && (
                                <a className="dropdown-item" href="#" onClick={() => handleTemSuspend(tdata._id, 'ResetTemporarySuspension')}>Reset Temporary Suspension</a>
                              )}
                              {tdata?.suspended && (
                                <a className="dropdown-item" href="#" onClick={() => handleTemSuspend(tdata._id, 'ResetPermanentSuspension')}>Reset Permanent Suspension</a>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              {!loading && (
                <Pagination currentPage={currentPage} totalPages={TotalUsers} setPage={setCurrentPage} />
              )}
            </Fragment>
          ) : (
            <div className="nodata">
              <p className="content">No data found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Usermanagement;
