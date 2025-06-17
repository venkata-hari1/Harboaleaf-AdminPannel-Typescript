import React, { Fragment, useEffect, useRef, useState } from 'react';
import '../Styles/Gstusermanagement.css';
import Pagination from './Pagination';
import Loader from '../../Utils/Loader';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../Redux/store/Store';
import { Subscription } from '../Redux/Reducers/UserMangement';
import SkeletonRows from '../../Utils/Skeleton';



const SubscriptionManagement = () => {
  const { subscription, loading }: any = useSelector((state: RootState) => state.UserMangment);

  const [currentPage, setCurrentPage] = useState<number>(1);

  const [initialLoading, setInitialLoading] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [type, setType] = useState('');
  const firstLoad = useRef(true);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const fetchData = async () => {
      if (firstLoad.current) {
        setInitialLoading(true);
        firstLoad.current = false;
      }

      try {
        const data = {
          page: currentPage,
          filter: type,
          state: ''
        };
        await dispatch(Subscription({ data }));
      } catch (error) {
        console.error(error);
      } finally {
        setInitialLoading(false);

      }
    };

    fetchData();
  }, [type, currentPage]);

  const handleFilterSelect = (type: string) => {
    setType(type);
    setCurrentPage(1);
    setShowFilterDropdown(false);
  };


  const totalPages = Math.ceil(subscription?.totalCount / subscription?.limit);

  return (
    <div className='container'>
      <div className='d-flex justify-content-end mt-4 position-relative'>
        <button
          className='btn btn-primary me-3'
          style={{ backgroundColor: '#3856F3', fontFamily: 'Roboto' }}
          onClick={() => setShowFilterDropdown(!showFilterDropdown)}
        >
          Filter
          <svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='currentColor'
            className='bi bi-funnel-fill ms-2' viewBox='0 0 16 16'>
            <path d='M1.5 1.5A.5.5 0 0 1 2 1h12a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.128.334L10 8.692V13.5a.5.5 0 0 1-.342.474l-3 1A.5.5 0 0 1 6 14.5V8.692L1.628 3.834A.5.5 0 0 1 1.5 3.5z' />
          </svg>
        </button>

        {showFilterDropdown && (
          <div className='dropdown-menu show' style={{ position: 'absolute', top: '100%', right: '15px', zIndex: 1000, minWidth: '150px' }}>
            <button className='dropdown-item' onClick={() => handleFilterSelect('')}>All Accounts</button>
            <button className='dropdown-item' onClick={() => handleFilterSelect('PremiumAccount')}>Premium</button>
            <button className='dropdown-item' onClick={() => handleFilterSelect('BusinessAccount')}>Business</button>
            <button className='dropdown-item' onClick={() => handleFilterSelect('CreatorAccount')}>Creator</button>
          </div>
        )}
      </div>

      {initialLoading ? (
        <Loader />
      ) : (
        <Fragment>
       {subscription?.data?.length>0? <div className='tab-content table-responsive mt-4'>
          <table className='table table-borderless' style={{ color: 'red' }}>
            <thead style={{ backgroundColor: '#f1f1f1' }}>
              <tr>
                <th>S.No</th>
                <th>User</th>
                <th>Subscription Type</th>
                <th>Subscribed On</th>
                <th>Next Billing Date</th>
                <th>Amount Paid</th>
                <th>State</th>
              </tr>
            </thead>
            <tbody style={{ backgroundColor: '#fffaf0' }}>
              {loading ? (
                <SkeletonRows count={7} />
              ) : (
                subscription?.data?.map((tdata, index) => (
                  <tr key={index}>
                    <td className='text-center'>
                      {subscription?.sortOrder === 'desc'
                        ? (subscription?.page - 1) * subscription?.limit + index + 1
                        : subscription?.totalCount - ((subscription?.page - 1) * subscription?.limit + index)}
                    </td>
                    <td>{tdata?.firstname} </td>
                    <td>{tdata?.subscriptionType || "N/A"}</td>
                    <td>{tdata?.subscriptionData?.[0]?.SubscribedOn || "N/A"}</td>
                    <td>{tdata?.subscriptionData?.[0]?.NextBillingDate || "N/A"}</td>
                    <td>{tdata?.subscriptionData?.[0]?.AmountPaid || "N/A"}</td>
                    <td>{tdata.state ? tdata.state : 'N/A'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {!loading && !initialLoading && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              setPage={setCurrentPage}
            />
          )}
        </div>:
         <div className="nodata">
         <p className="content">No data found</p>
       </div>
        }
        </Fragment>
      )}




    </div>
  );
};

export default SubscriptionManagement;
