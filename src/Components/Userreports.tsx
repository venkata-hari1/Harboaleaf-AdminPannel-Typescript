import React, { Fragment } from 'react'
import Pagination from './Pagination'
import Actions from './ActionBtns/Actions';
import UserPopUp from './PopUps/UserPopUp';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../Redux/store/Store';
import moment from 'moment';
import Loader from '../../Utils/Loader';
import { UserReports } from '../Redux/Reducers/UserMangement';
const Userreports = () => {
  const [state, setState] = React.useState(false)
  const [id, setId] = React.useState(null)
  const [currentPage, setCurrentPage] = React.useState<number | string>(1);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [post, setPost] = React.useState([])
  const [isPending, startTransition] = React.useTransition();
  const data: any = useSelector((state: RootState) => state.UserMangment.reports);
  const dispatch = useDispatch<AppDispatch>()
  React.useEffect(() => {
    async function getData() {
      setLoading(true);
      await dispatch(UserReports(currentPage));
      setLoading(false);
    }
    getData();
  }, [dispatch, currentPage, post]);
  const handleOpen = (id) => {
    setId((prev) => (prev === id ? null : id))
  }

  const handleClick = (tdata: any) => {
    setPost(tdata)
    setState(!state)
  }


  return (
    <div style={{ position: 'relative' }}>
      {state && <UserPopUp post={post} />}
      <div className='container'>

        <div className='d-flex justify-content-end mt-4'>
          <button className='btn btn-primary me-3' style={{ backgroundColor: "#3856F3", fontFamily: "Roboto" }}>Filter <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-funnel-fill ms-1" viewBox="0 0 16 16">
            <path d="M1.5 1.5A.5.5 0 0 1 2 1h12a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.128.334L10 8.692V13.5a.5.5 0 0 1-.342.474l-3 1A.5.5 0 0 1 6 14.5V8.692L1.628 3.834A.5.5 0 0 1 1.5 3.5z" />
          </svg></button>
          <button className='btn' style={{ color: "#FF0000", border: "1px solid #FF0000", fontFamily: "Roboto" }}> Suspended Accounts</button>
        </div>
        {loading ? (
          <Loader />
        ) :
        <Fragment>
          {data?.data?.length>0?
          <div className="tab-content table-responsive">      
            <table className="table table-borderless mt-4 ">
              <thead >
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
              </thead><br />
              <tbody >
          
                 {data?.data?.map((tdata, index) => {
                    return (
                      <Fragment>
                        {tdata.type === "account" ?
                          <Fragment>
                            <tr key={tdata._id}>
                              <td>{index + 1}</td>
                              <td>
                                {tdata.user?.image ? <img
                                  src={tdata.user?.image}
                                  alt="avatar"
                                  className="rounded-circle me-2"
                                  width="30"
                                  height="30"
                                  style={{ objectFit: "cover", border: '1px solid white', marginBottom: '2px' }}
                                /> :
                                  <img
                                    src={`https://robohash.org/${tdata.username}?size=40x40`}
                                    alt="avatar"
                                    className="rounded-circle me-2"
                                    width="30"
                                    height="30"
                                    style={{ objectFit: "cover", border: '1px solid white', marginBottom: '2px' }}
                                  />}
                                {tdata.user?.[0].firstname}{tdata.user?.[0].lastname}</td>
                              <td>
                                {tdata.user?.[0].address ? (tdata.user?.[0].address.length > 10 ? `${tdata.user?.[0].address.substring(0, 10)}...` : tdata.user?.[0].address) : "India"}
                              </td>
                              <td>{tdata.user?.[0].countryCode}{tdata.user?.[0].mobile}</td>
                              <td>
                                {tdata.report?.[0]?.image ? <img
                                  src={tdata.report?.[0]?.image}
                                  alt="avatar"
                                  className="rounded-circle me-2"
                                  width="30"
                                  height="30"
                                  style={{ objectFit: "cover", border: '1px solid white', marginBottom: '2px' }}
                                /> : null}
                                {tdata.report?.[0]?.firstname}{tdata.report?.[0]?.lastname}</td>
                              <td>{tdata.reason}</td>
                              <td>{tdata.type}</td>
                              <td className='action-btns' >
                                <div className="dropdown">
                                  <button className="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                    Actions
                                  </button>
                                  <Actions />
                                </div>

                              </td>
                            </tr>
                          </Fragment> :
                          tdata.type === "post" ?
                            <tr key={tdata._id}>
                              <td>{index + 1}</td>
                              <td onClick={() => handleClick(tdata)} className="modal-body">
                                {tdata.post?.[0].user?.image ? <img
                                  src={tdata.post?.[0].user?.image}
                                  alt="avatar"
                                  className="rounded-circle me-2"
                                  width="30"
                                  height="30"
                                  style={{ objectFit: "cover", border: '1px solid white', marginBottom: '2px' }}
                                /> :
                                  <img
                                    src={`https://robohash.org/${tdata.username}?size=40x40`}
                                    alt="avatar"
                                    className="rounded-circle me-2"
                                    width="30"
                                    height="30"
                                    style={{ objectFit: "cover", border: '1px solid white', marginBottom: '2px' }}
                                  />}
                                {tdata.post?.[0].user?.firstname}{tdata.post?.[0].user?.lastname}</td>
                              <td>
                                {tdata.post?.[0].user?.address ? (tdata.post?.[0].user?.address.length > 10 ? `${tdata.post?.[0].user?.address.substring(0, 10)}...` : tdata.post?.[0].user?.address) : "India"}
                              </td>
                              <td>{tdata.post?.[0].user?.countryCode}{tdata.post?.[0].user?.mobile}</td>
                              <td>
                                {tdata.report?.[0]?.image ? <img
                                  src={tdata.report?.[0]?.image}
                                  alt="avatar"
                                  className="rounded-circle me-2"
                                  width="30"
                                  height="30"
                                  style={{ objectFit: "cover", border: '1px solid white', marginBottom: '2px' }}
                                /> : null}

                                {tdata.report?.[0]?.firstname}{tdata.report?.[0]?.lastname}</td>
                              <td>{tdata.reason}</td>
                              <td>{tdata.type}</td>
                              <td className='action-btns' >
                                <div className="dropdown">
                                  <button className="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                    Actions
                                  </button>
                                  <Actions />
                                </div>

                              </td>
                            </tr> :
                            <tr key={tdata._id}>
                              <td>{index + 1}</td>
                              <td onClick={() => handleClick(tdata)}>
                                {data.story?.[0].user?.image ? <img
                                  src={data.story?.[0].user?.image}
                                  alt="avatar"
                                  className="rounded-circle me-2"
                                  width="30"
                                  height="30"
                                  style={{ objectFit: "cover", border: '1px solid white', marginBottom: '2px' }}
                                /> :
                                  <img
                                    src={`https://robohash.org/${tdata.username}?size=40x40`}
                                    alt="avatar"
                                    className="rounded-circle me-2"
                                    width="30"
                                    height="30"
                                    style={{ objectFit: "cover", border: '1px solid white', marginBottom: '2px' }}
                                  />}
                                {tdata.story?.[0].user?.firstname}{tdata.story?.[0].user?.lastname}</td>
                              <td>
                                {tdata.story?.[0].user?.address ? (tdata.story?.[0].user?.address.length > 10 ? `${tdata.post?.[0].user?.address.substring(0, 10)}...` : tdata.post?.[0].user?.address) : "India"}
                              </td>
                              <td>{tdata.story?.[0].user?.countryCode}{tdata.story?.[0].user?.mobile}</td>
                              <td>{tdata.report?.[0]?.firstname}{tdata.report?.[0]?.lastname}</td>
                              <td>{tdata.reason}</td>
                              <td>{tdata.type}</td>
                              <td className='action-btns' >
                                <div className="dropdown">
                                  <button className="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                    Actions
                                  </button>
                                  <Actions />
                                </div>
                              </td>
                            </tr>
                        }

                      </Fragment>
                    )
                  })
                }
  
              </tbody>
            </table>
            <Pagination currentPage={currentPage} totalPages={data.totalPages} setPage={setCurrentPage} />
          </div>:<div className='nodata'>
            <p className='content'> No data found</p>
            </div>}
          </Fragment>
          }
      
      </div>
    </div>

  )
}

export default Userreports
