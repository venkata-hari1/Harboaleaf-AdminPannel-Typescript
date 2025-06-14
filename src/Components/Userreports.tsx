import React, { Fragment, useEffect, useState, useTransition } from 'react';
import Pagination from './Pagination';
import Actions from './ActionBtns/Actions';
import UserPopUp from './PopUps/UserPopUp';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../Redux/store/Store';
import SkeletonRows from '../../Utils/Skeleton';
import { UserReports } from '../Redux/Reducers/UserMangement';
import Loader from '../../Utils/Loader';

const Userreports = () => {
  const [popupVisible, setPopupVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [initialLoad, setInitialLoad] = useState<boolean>(true);

  const data: any = useSelector((state: RootState) => state.UserMangment.reports);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const fetchData = async () => {
      if (initialLoad) {
        await dispatch(UserReports(currentPage));
        setInitialLoad(false);
      } else {
        setLoading(true);
        await dispatch(UserReports(currentPage));
        setLoading(false);
      }
    };
    fetchData();
  }, [currentPage, dispatch]);

  const handleClick = (tdata: any) => {
    setSelectedPost(tdata);
    setPopupVisible(true);
  };

  const getSerialNumber = (index: number) => {
    return data?.sortOrder === 'desc'
      ? (data?.page - 1) * data?.limit + index + 1
      : data?.totalCount - ((data?.page - 1) * data?.limit + index);
  };

  return (
    <div style={{ position: 'relative' }}>
      {popupVisible && <UserPopUp post={selectedPost} />}

      <div className='container'>
        <div className='d-flex justify-content-end mt-4'>
          <button className='btn btn-primary me-3' style={{ backgroundColor: "#3856F3", fontFamily: "Roboto" }}>
            Filter
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
              className="bi bi-funnel-fill ms-1" viewBox="0 0 16 16">
              <path d="M1.5 1.5A.5.5 0 0 1 2 1h12a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.128.334L10 8.692V13.5a.5.5 0 0 1-.342.474l-3 1A.5.5 0 0 1 6 14.5V8.692L1.628 3.834A.5.5 0 0 1 1.5 3.5z" />
            </svg>
          </button>
          <button className='btn' style={{ color: "#FF0000", border: "1px solid #FF0000", fontFamily: "Roboto" }}>
            Suspended Accounts
          </button>
        </div>

        {initialLoad ? (
        <Loader/>
        ) : data?.data?.length > 0 ? (
          <div className="tab-content table-responsive">
            <table className="table table-borderless mt-4">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>User Name</th>
                  <th>States</th>
                  <th>Contact details</th>
                  <th>User Reported</th>
                  <th>Reason</th>
                  <th>Type</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <SkeletonRows />
                ) : (
                  data?.data?.map((tdata: any, index: number) => (
                    <Fragment key={tdata._id}>
                      <tr>
                        <td>{getSerialNumber(index)}</td>
                        <td onClick={() => handleClick(tdata)}>
                          {tdata.user?.image ? (
                            <img
                              src={tdata.user.image}
                              alt="avatar"
                              className="rounded-circle me-2"
                              width="30"
                              height="30"
                              style={{ objectFit: "cover", border: '1px solid white', marginBottom: '2px' }}
                            />
                          ) : (
                            <img
                              src={`https://robohash.org/${tdata.username}?size=40x40`}
                              alt="avatar"
                              className="rounded-circle me-2"
                              width="30"
                              height="30"
                              style={{ objectFit: "cover", border: '1px solid white', marginBottom: '2px' }}
                            />
                          )}
                          {tdata.user?.firstname} {tdata.user?.lastname}
                        </td>
                        <td>
                          {tdata.user?.address
                            ? tdata.user.address.length > 10
                              ? `${tdata.user.address.substring(0, 10)}...`
                              : tdata.user.address
                            : "India"}
                        </td>
                        <td>{tdata.user?.countryCode}{tdata.user?.mobile}</td>
                        <td>
                          {tdata.report?.[0]?.image && (
                            <img
                              src={tdata.report[0].image}
                              alt="avatar"
                              className="rounded-circle me-2"
                              width="30"
                              height="30"
                              style={{ objectFit: "cover", border: '1px solid white', marginBottom: '2px' }}
                            />
                          )}
                          {tdata.report?.[0]?.firstname} {tdata.report?.[0]?.lastname}
                        </td>
                        <td>{tdata.reason}</td>
                        <td>{tdata.type}</td>
                        <td className="action-btns">
                          <div className="dropdown">
                            <button className="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
                              Actions
                            </button>
                            <Actions />
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
                totalPages={data?.totalPages}
                setPage={setCurrentPage}
              />
            )}
          </div>
        ) : (
          <div className="nodata">
            <p className="content">No data found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Userreports;
