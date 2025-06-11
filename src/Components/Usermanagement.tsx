import React, { Fragment, useEffect, useState } from 'react';
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
const Usermanagement = () => {
  const [id, setId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState<number | string>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [value, setValue] = useState(false)
  const state: any = useSelector((state: RootState) => state.UserMangment.data);
  const dispatch = useDispatch<AppDispatch>();

  const navigate = useNavigate();
  useEffect(() => {
    async function getData() {
      setLoading(true);
      setValue(true);
      await dispatch(Users(currentPage));
      setLoading(false);
      setValue(false);
    }
    getData();
  }, [dispatch, currentPage]);

  const userInfo = (id: number) => {
    navigate(`profile-info/${id}`);
  };
  const handleTemSuspend = async (id: string, t: string) => {
    try {
      setValue(true);

      let data;

      switch (t) {
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
          // If action not recognized, don't dispatch
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
    } catch (error) {
      showToast(false, "Something went wrong");
    } finally {
      setValue(false);
    }
  };
  const handleAscDesc=()=>{

  }
 const TotalUsers=state.totalUsers
 const page=state.page
 const limit=state.limit
const sort=state.sortOrder
  return (
    <div className='container' style={{ height: "90vh" }}>
      <div style={{ display: "flex", justifyContent: "end" }}>
        <button className='btn btn-primary me-3' style={{ backgroundColor: "#3856F3", fontFamily: "Roboto" }} onClick={()=>handleAscDesc()}>
          Filter <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-funnel-fill ms-1" viewBox="0 0 16 16">
            <path d="M1.5 1.5A.5.5 0 0 1 2 1h12a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.128.334L10 8.692V13.5a.5.5 0 0 1-.342.474l-3 1A.5.5 0 0 1 6 14.5V8.692L1.628 3.834A.5.5 0 0 1 1.5 3.5z" />
          </svg>
        </button>
        <div className="dropdown">
  <button
    className="btn dropdown-toggle"
    style={{
      color: "#FF0000",
      border: "1px solid #FF0000",
      fontFamily: "Roboto",
    }}
    type="button"
    id="suspendedDropdown"
    data-bs-toggle="dropdown"
    aria-expanded="false"
  >
    Suspended Accounts
  </button>

  <div className="dropdown-menu" aria-labelledby="suspendedDropdown">
    <a
      className="dropdown-item"
      href="#"
   
    >
      Temporarily Suspended Accounts
    </a>

    <a
      className="dropdown-item"
      href="#"
     
    >
      Permanently Suspended Accounts
    </a>

    <a
      className="dropdown-item"
      href="#"
     
    >
      Reset All
    </a>
  </div>
</div>

      </div>

      {loading ? (
        <Loader />
      ) : (
        <div className="tab-content table-responsive">
          {value && <Loader />}
          {state?.data?.length > 0 ? <Fragment>
            <table className="table table-borderless mt-5 ">
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
                {state?.data?.map((tdata, index) => (
                  <tr key={tdata._id}>
                    <th>
                    {sort === 'desc'
                         ?(page - 1) * limit + index + 1: TotalUsers - ((page - 1) * limit + index)
                         }
                    </th>
                    <td onClick={() => userInfo(tdata.id)} style={{ display: 'flex' }}>
                      {tdata.image ? (
                        <img src={tdata.image} alt="avatar" className="rounded-circle me-2" width="30" height="30" style={{ objectFit: "cover", border: '1px solid white', marginBottom: '2px' }} />
                      ) : (
                        <img src={`https://robohash.org/${tdata.username}?size=40x40`} alt="avatar" className="rounded-circle me-2" width="30" height="30" style={{ objectFit: "cover", border: '1px solid white', marginBottom: '2px' }} />
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
                      <div style={{ color: tdata?.suspended ? "red" : tdata.temSuspended ? 'rgb(56, 86, 243)' : 'white' }}>{moment(tdata.createdAt).format("DD/MM/YYYY")}</div></td>
                    <td>
                      <div style={{ color: tdata?.suspended ? "red" : tdata.temSuspended ? 'rgb(56, 86, 243)' : 'white' }}>
                        {tdata.address ? (tdata.address.length > 10 ? `${tdata.address.substring(0, 10)}...` : tdata.address) : "India"}
                      </div>

                    </td>
                    <td className='action-btns' >
                      <div className="dropdown">
                        <button
                          className={`btn dropdown-toggle ${tdata?.suspended ? "btn-danger" : tdata.temSuspended ? 'btn-primary' : "btn-secondary"}`}
                          type="button"
                          id="dropdownMenuButton"
                          data-bs-toggle="dropdown"
                          aria-haspopup="true"
                          aria-expanded="false"
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
  {/* Show all actions if both are false */}
  {(!tdata?.temSuspended && !tdata?.suspended) && (
    <Fragment>
      <a
        className="dropdown-item"
        href="#"
        onClick={() => handleTemSuspend(tdata._id, 'TemporarySuspended')}
      >
        Temporary Suspend
      </a>
      <a
        className="dropdown-item"
        href="#"
        onClick={() => handleTemSuspend(tdata._id, 'Suspended')}
      >
        Permanent Suspend
      </a>
    </Fragment>
  )}

  {/* If temporarily suspended, show reset and avoid duplicate suspend */}
  {tdata?.temSuspended && (
    <Fragment>
      <a
        className="dropdown-item"
        href="#"
        onClick={() => handleTemSuspend(tdata._id, 'ResetTemporarySuspension')}
      >
        Reset Temporary Suspension
      </a>
    </Fragment>
  )}

  {/* If permanently suspended, show reset and avoid duplicate suspend */}
  {tdata?.suspended && (
    <Fragment>
      <a
        className="dropdown-item"
        href="#"
        onClick={() => handleTemSuspend(tdata._id, 'ResetPermanentSuspension')}
      >
        Reset Permanent Suspension
      </a>
    </Fragment>
  )}
</div>

                      </div>

                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination currentPage={currentPage} totalPages={state.totalPages} setPage={setCurrentPage} />
          </Fragment> :
            <div className='nodata'>
              <p className='content'> No data found</p>
            </div>
          }
        </div>
      )}
    </div>
  );
};

export default Usermanagement;
