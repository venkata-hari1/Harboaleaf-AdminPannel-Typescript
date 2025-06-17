import React, { Fragment, useEffect, useState } from 'react';
import Pagination from './Pagination';
import Actions from './ActionBtns/Actions';
import UserPopUp from './PopUps/UserPopUp';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../Redux/store/Store';
import SkeletonRows from '../../Utils/Skeleton';
import { UserReports, UserSuspended } from '../Redux/Reducers/UserMangement';
import Loader from '../../Utils/Loader';
import { showToast } from '../../Utils/Validation';
import { useLocation } from 'react-router-dom';

const Userreports = () => {
  const [popupVisible, setPopupVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [initialLoad, setInitialLoad] = useState<boolean>(true);
  const[sortOrder,setSortOrder]=useState(true)
  const {reports,loading}:any= useSelector((state: RootState) => state.UserMangment);
  const dispatch = useDispatch<AppDispatch>();
    const [value, setValue] = useState(false);
    const[filter,setFilter]=useState('')
    const location=useLocation()
  useEffect(() => {
    const fetchData = async () => {
      if (initialLoad) {
        const data={
          page:currentPage,
          sort:sortOrder?'desc':'asc',
          filter:filter,
          state:''
        }
        localStorage.setItem('filter',filter)
        localStorage.setItem('page',currentPage.toString())
        localStorage.setItem('sort',sortOrder?'desc':'asc')
        await dispatch(UserReports({data:data}));
        setInitialLoad(false);
      } else {

        const data={
          page:currentPage,
          sort:sortOrder?'desc':'asc',
          filter:filter,
          state:''
        }
        localStorage.setItem('filter',filter)
        localStorage.setItem('page',currentPage.toString())
        localStorage.setItem('sort',sortOrder?'desc':'asc')
        await dispatch(UserReports({data:data}));

      }
    };
    fetchData();
  }, [currentPage, dispatch,,sortOrder,filter]);

  const handleClick = (tdata: any, type: string) => {
    if (type === 'post' || type === 'vibe') {
      setSelectedPost(tdata);
      setPopupVisible(true);
    }
  };

  const getSerialNumber = (index: number) => {
    return reports?.sortOrder === 'desc'
      ? (reports?.currentPage - 1) * reports?.limit + index + 1
      : reports?.totalReports - ((reports?.currentPage - 1) * reports.limit + index);
  };
  const handleAscDesc = () => {
    setSortOrder(!sortOrder)
   };
   const handleFilter=(t:string)=>{

    setFilter(t)
  
  }

    const handleTemSuspend = async (id: string, type: string) => {
      try {
        let data;
        switch (type) {
          case "TemporarySuspended":
            data = { id, temSuspended: true,location:location.pathname };
            break;
          case "Suspended":
            data = { id, suspended: true ,location:location.pathname };
            break;
          case "ResetTemporarySuspension":
            data = { id, temSuspended: false,location:location.pathname };
            break;
          case "ResetPermanentSuspension":
            data = { id, suspended: false,location:location.pathname };
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
      }
    };
    const handleClose=(t:boolean)=>{
    setPopupVisible(t)
    }
 
  return (
    <div style={{ position: 'relative' }}>
      {popupVisible && <UserPopUp post={selectedPost} handleClose={handleClose}/>}

      <div className="container">
        <div className="d-flex justify-content-end mt-4">
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

        {initialLoad ? (
          <Loader />
        ) : reports?.data?.length > 0 ? (
          <div className="tab-content table-responsive">
            <table className="table table-borderless mt-4">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>User Name</th>
                  <th>State</th>
                  <th>Contact</th>
                  <th>User Reported</th>
                  <th>Reason</th>
                  <th>Type</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <SkeletonRows count={8}/>
                ) : (
                  reports?.data?.map((tdata: any, index: number) => (
                    <Fragment key={tdata._id}>
                      <tr>
                        <td >
                          <div style={{ color: tdata?.user?.suspended ? "red" : tdata?.user?.temSuspended ? 'rgb(56, 86, 243)' : 'white' }}>
                          {getSerialNumber(index)}
                          </div>
                        </td>
                        <td onClick={() => handleClick(tdata, tdata.type)} style={{ cursor: 'pointer' }}>
                          <div className="d-flex">
                            <img
                              src={tdata?.user?.image || `https://robohash.org/${tdata?.user?.firstname || 'guest'}?size=40x40`}
                              alt="avatar"
                              className="rounded-circle me-2"
                              width="30"
                              height="30"
                              style={{ objectFit: "cover", border: '1px solid white' }}
                            />
                            <span className="text-truncate" style={{marginTop:'3px', maxWidth: '100px',color: tdata?.user?.suspended ? "red" : tdata?.user?.temSuspended ? 'rgb(56, 86, 243)' : 'white' }}>
                              {tdata?.user?.firstname} 
                            </span>
                          </div>
                        </td>
                        <td>
                          <div className="text-truncate" style={{ maxWidth: '80px',color: tdata?.user?.suspended ? "red" : tdata?.user?.temSuspended ? 'rgb(56, 86, 243)' : 'white' }}>
                          {tdata.user.state?tdata.user.state:'N/A'}
                          </div>
                        </td>
                        <td >
                          <div style={{ color: tdata?.user?.suspended ? "red" : tdata?.user?.temSuspended ? 'rgb(56, 86, 243)' : 'white' }}>
                          {tdata?.user?.countryCode}{tdata?.user?.mobile}
                          </div>
                        </td>
                        <td>
                         <div className="d-flex">
                          {tdata?.reported?.image ? (
                            <img
                              src={tdata?.reported?.image}
                              alt="avatar"
                              className="rounded-circle me-2"
                              width="30"
                              height="30"
                              style={{objectFit: "cover", border: '1px solid white' }}
                            />
                          ):<img
                              src={tdata?.user?.image || `https://robohash.org/${tdata?.user?.firstname || 'guest'}?size=40x40`}
                              alt="avatar"
                              className="rounded-circle me-2"
                              width="30"
                              height="30"
                              style={{ objectFit: "cover", border: '1px solid white' }}
                            />}
                           <span style={{marginTop:'3px',color: tdata?.user?.suspended ? "red" : tdata?.user?.temSuspended ? 'rgb(56, 86, 243)' : 'white' }}>
                           {tdata?.reported?.firstname} 
                           </span>
                           </div>
                        </td>
                        <td>
                        <div style={{ color: tdata?.user?.suspended ? "red" : tdata?.user?.temSuspended ? 'rgb(56, 86, 243)' : 'white' }}>
                          {tdata?.reason}
                          </div>
                          </td>
                        <td>
                        <div style={{ color: tdata?.user?.suspended ? "red" : tdata?.user?.temSuspended ? 'rgb(56, 86, 243)' : 'white' }}>
                          {tdata?.type}
                          </div>
                          </td>
                          <td className='action-btns'>
                          <div className="dropdown">
                            <button
                              className={`btn dropdown-toggle ${tdata?.user?.suspended ? "btn-danger" : tdata?.user?.temSuspended ? 'btn-primary' : "btn-secondary"}`}
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
                              {!tdata?.user?.temSuspended && !tdata?.user?.suspended && (
                                <>
                                  <a className="dropdown-item" href="#" onClick={() => handleTemSuspend(tdata.user._id, 'TemporarySuspended')}>Temporary Suspend</a>
                                  <a className="dropdown-item" href="#" onClick={() => handleTemSuspend(tdata.user._id, 'Suspended')}>Permanent Suspend</a>
                                </>
                              )}
                              {tdata?.user?.temSuspended && (
                                <a className="dropdown-item" href="#" onClick={() => handleTemSuspend(tdata.user._id, 'ResetTemporarySuspension')}>Reset Temporary Suspension</a>
                              )}
                              {tdata?.user?.suspended && (
                                <a className="dropdown-item" href="#" onClick={() => handleTemSuspend(tdata.user._id, 'ResetPermanentSuspension')}>Reset Permanent Suspension</a>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    </Fragment>
                  ))
                )}
              </tbody>
            </table>
            {!loading && (
              <Pagination
                currentPage={currentPage}
                totalPages={reports?.totalPages}
                setPage={setCurrentPage}
              />
            )}
          </div>
        ) : (
          <div className="nodata">
           <p className="content">No <span style={{textTransform:'capitalize'}}>{filter}</span> data found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Userreports;
