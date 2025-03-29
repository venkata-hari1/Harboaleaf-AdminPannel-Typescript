import React, { useEffect, useState } from 'react';
import "../Styles/Usermanagement.css";
import Pagination from './Pagination';
import '../Styles/Pagination.css';
import { useNavigate } from 'react-router-dom';
import Actions from './ActionBtns/Actions';
import { useDispatch, useSelector } from 'react-redux';
import { Users } from '../Redux/Reducers/UserMangement';
import { AppDispatch, RootState } from '../Redux/store/Store';
import moment from 'moment';
import Loader from '../../Utils/Loader';
const Usermanagement = () => {
  const [id, setId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState<number | string>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const state: any = useSelector((state: RootState) => state.UserMangment.data);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  useEffect(() => {
    async function getData() {
      setLoading(true);
      await dispatch(Users(currentPage));
      setLoading(false);
    }
    getData();
  }, [dispatch, currentPage]);

  const userInfo = (id: number) => {
    navigate(`profile-info/${id}`);
  };
  const handleOpen = (id: number) => {
    setId((prev) => (prev === id ? null : id));
  };
  return (
    <div className='container' style={{ height: "90vh" }}>
      <div style={{ display: "flex", justifyContent: "end" }}>
        <button className='btn btn-primary me-3' style={{ backgroundColor: "#3856F3", fontFamily: "Roboto" }}>
          Filter <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-funnel-fill ms-1" viewBox="0 0 16 16">
            <path d="M1.5 1.5A.5.5 0 0 1 2 1h12a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.128.334L10 8.692V13.5a.5.5 0 0 1-.342.474l-3 1A.5.5 0 0 1 6 14.5V8.692L1.628 3.834A.5.5 0 0 1 1.5 3.5z" />
          </svg>
        </button>
        <button className='btn' style={{ color: "#FF0000", border: "1px solid #FF0000", fontFamily: "Roboto" }}> Suspended Accounts</button>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <div className="tab-content table-responsive">
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
                  <th>{index + 1}</th>
                  <td onClick={() => userInfo(tdata.id)}>
                    {tdata.image ? (
                      <img src={tdata.image} alt="avatar" className="rounded-circle me-2" width="30" height="30" style={{ objectFit: "cover", border: '1px solid white', marginBottom: '2px' }} />
                    ) : (
                      <img src={`https://robohash.org/${tdata.username}?size=40x40`} alt="avatar" className="rounded-circle me-2" width="30" height="30" style={{ objectFit: "cover", border: '1px solid white', marginBottom: '2px' }} />
                    )}
                    {tdata.firstname} {tdata.lastname}
                  </td>
                  <td>{tdata.verified ? "Active" : "Inactive"}</td>
                  <td>{tdata.countryCode}{tdata.mobile}</td>
                  <td>{moment(tdata.createdAt).format("DD/MM/YYYY")}</td>
                  <td>
                    {tdata.address ? (tdata.address.length > 10 ? `${tdata.address.substring(0, 10)}...` : tdata.address) : "India"}
                  </td>
                  <td className='action-btns' >
                    <div className="dropdown">
                      <button className="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        Actions
                      </button>
                      <Actions />
                    </div>

                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination currentPage={currentPage} totalPages={state.totalPages} setPage={setCurrentPage} />
    </div>
  );
};

export default Usermanagement;
