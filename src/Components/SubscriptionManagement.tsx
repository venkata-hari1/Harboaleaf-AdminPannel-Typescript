import React, { useEffect, useState, useRef, useMemo } from 'react';
import '../Styles/Gstusermanagement.css'; // Adjust this path as needed
import Pagination from './Pagination'; // Adjust this path as needed
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../Redux/store/Store'; // Adjust this path as needed
import { Subscription } from '../Redux/Reducers/UserMangement'; // Adjust this path as needed
import Loader from '../../Utils/Loader'; // Adjust this path as needed
import { showToast } from '../../Utils/Validation'; // Adjust this path as needed


const ITEMS_PER_PAGE = 5;

const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return dateString;
        }
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    } catch (error) {
        console.error("Error formatting date:", dateString, error);
        return dateString;
    }
};

const SkeletonRow = ({ columns }: { columns: number }) => (
    <tr>
        {Array.from({ length: columns }).map((_, i) => (
            <td key={i}>
                <div style={{
                    height: '20px',
                    backgroundColor: '#e0e0e0',
                    borderRadius: '4px',
                    width: i === 1 ? '70%' : '90%',
                    animation: 'pulse 1.5s infinite ease-in-out',
                }} />
            </td>
        ))}
    </tr>
);

const SubscriptionManagement = () => {
    const dispatch = useDispatch<AppDispatch>();

    const [currentPage, setCurrentPage] = useState<number>(1);
    const [accountType, setAccountType] = useState<string | null>(null);
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);
    // This state tracks if it's the *very first* time data is being loaded for this component instance.
    const [initialLoading, setInitialLoading] = useState(true);

    const filterDropdownRef = useRef<HTMLDivElement>(null);

    const subscriptionResponse = useSelector((state: RootState) => state.UserMangment.subscription);
    // `loading` is the Redux state's general loading indicator for the subscription API call.
    const loading = useSelector((state: RootState) => state.UserMangment.loading);
    const error = useSelector((state: RootState) => state.UserMangment.error);

    const apiUsersData = subscriptionResponse?.data || [];
    const totalCount = subscriptionResponse?.totalCount || 0;
    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE) || 1;

    const transformedRecords = useMemo(() => {
        // ... (your data transformation logic, unchanged) ...
        const flattenedRecords = apiUsersData.flatMap(user => {
            const userId = user?._id;
            const firstName = user?.firstname || '';
            const lastName = user?.lastname || '';
            const userName = `${firstName} ${lastName}`.trim();
            const userUniqueName = user?.username || userId || 'N/A';
            const userSubscriptionType = user?.subscriptionType || 'N/A';
            const userAvatar = user?.avatar || '';

            if (!user?.subscriptionData || user.subscriptionData.length === 0) {
                return [{
                    id: userId ? `${userId}_no_sub` : `no_id_${Math.random()}`,
                    username: userName || 'N/A',
                    avatar: userAvatar,
                    uniquename: userUniqueName,
                    subscriptionType: userSubscriptionType,
                    ssdate: 'N/A',
                    sedate: 'N/A',
                    state: 'No Subscription',
                    amount: 'N/A',
                }];
            }

            return user.subscriptionData.map((sub: any) => {
                const subId = sub?._id;
                const amount = parseFloat(sub?.AmountPaid) || 0;

                return {
                    id: subId ? subId : `no_sub_id_${Math.random()}`,
                    username: userName,
                    avatar: userAvatar,
                    uniquename: userUniqueName,
                    subscriptionType: userSubscriptionType,
                    ssdate: sub?.SubscribedOn,
                    sedate: sub?.NextBillingDate,
                    state: 'Active',
                    amount: amount,
                };
            });
        });

        return flattenedRecords;
    }, [apiUsersData]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target as Node)) {
                setShowFilterDropdown(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // This useEffect dispatches the API call.
    // Importantly, it sets `initialLoading` to false *after* the very first call completes.
    useEffect(() => {
        dispatch(Subscription({ page: currentPage, limit: ITEMS_PER_PAGE, accountType }))
            .finally(() => {
                // This `finally` block runs once the promise returned by `dispatch(Subscription(...))` settles
                // (either resolves or rejects). This is crucial for correctly switching loading states.
                setInitialLoading(false);
            });
    }, [dispatch, currentPage, accountType]); // Dependencies ensure this runs on page/filter changes

    useEffect(() => {
        if (error) {
            showToast(false, error);
        }
    }, [error]);

    const handleFilterSelect = (type: string | null) => {
        setAccountType(type);
        setCurrentPage(1);
        setShowFilterDropdown(false);
    };

    return (
        <div className='container'>
            <div className='d-flex justify-content-end mt-4 position-relative'>
                <button
                    className='btn btn-primary me-3'
                    style={{ backgroundColor: "#3856F3", fontFamily: "Roboto" }}
                    onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                >
                    Filter
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-funnel-fill ms-2" viewBox="0 0 16 16">
                        <path d="M1.5 1.5A.5.5 0 0 1 2 1h12a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.128.334L10 8.692V13.5a.5.5 0 0 1-.342.474l-3 1A.5.5 0 0 1 6 14.5V8.692L1.628 3.834A.5.5 0 0 1 1.5 3.5z" />
                    </svg>
                </button>

                {showFilterDropdown && (
                    <div
                        ref={filterDropdownRef}
                        className="dropdown-menu show"
                        style={{
                            position: 'absolute',
                            top: '100%',
                            right: '15px',
                            zIndex: 1000,
                            minWidth: '150px',
                        }}
                    >
                        <button className="dropdown-item" onClick={() => handleFilterSelect(null)}>All Accounts</button>
                        <button className="dropdown-item" onClick={() => handleFilterSelect('PremiumAccount')}>Premium</button>
                        <button className="dropdown-item" onClick={() => handleFilterSelect('BusinessAccount')}>Business</button>
                        <button className="dropdown-item" onClick={() => handleFilterSelect('CreatorAccount')}>Creator</button>
                    </div>
                )}
            </div>

            <div className="tab-content table-responsive mt-4" style={{ position: 'relative', minHeight: '300px' }}>
                {/* RING LOADER LOGIC:
                    It shows ONLY when `initialLoading` is true AND `loading` (from Redux) is true.
                    `initialLoading` becomes false *after* the very first data fetch completes.
                    So, this div will disappear after the first load.
                */}
                {initialLoading && loading && (
                    <div style={{
                        position: 'absolute',
                        top: '0',
                        left: '0',
                        right: '0',
                        bottom: '0',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        zIndex: 999
                    }}>
                        <Loader />
                    </div>
                )}

                <table className="table table-borderless">
                    <thead>
                        <tr>
                            <th>S.No</th>
                            <th>User</th>
                            <th>Unique Name</th>
                            <th>Subscription Type</th>
                            <th>Subscription Start</th>
                            <th>Subscription End</th>
                            <th>State</th>
                            <th>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* SKELETON LOADER / NO DATA / ACTUAL DATA LOGIC:
                            1. SKELETONS: Show when `loading` is true BUT `initialLoading` is false.
                                This means a subsequent load (page change, filter change) is happening.
                            2. NO DATA: Show when `loading` is false (data fetch complete) AND `transformedRecords` is empty.
                            3. ACTUAL DATA: Show when `loading` is false AND `transformedRecords` has data.
                        */}
                        {loading && !initialLoading ? (
                            // Display skeleton rows if a subsequent load is active
                            Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
                                <SkeletonRow key={i} columns={8} />
                            ))
                        ) : (
                            // Once loading is complete (or if initialLoading is true and the first data hasn't arrived yet but the overlay is on top)
                            // check if there's data to display
                            transformedRecords.length > 0 ? (
                                transformedRecords.map((item, index) => (
                                    <tr key={item.id}>
                                        <td>{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</td>
                                        <td className="d-flex align-items-center">
                                            <img
                                                src={item.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${item.username || 'User'}&radius=50`}
                                                alt={item.username || 'User Avatar'}
                                                style={{
                                                    width: '35px',
                                                    height: '35px',
                                                    borderRadius: '50%',
                                                    marginRight: '10px',
                                                    objectFit: 'cover',
                                                }}
                                                onError={(e) => {
                                                    e.currentTarget.onerror = null;
                                                    e.currentTarget.src = "https://via.placeholder.com/35";
                                                }}
                                            />
                                            {item.username}
                                        </td>
                                        <td>{item.uniquename}</td>
                                        <td>{item.subscriptionType}</td>
                                        <td>{formatDate(item.ssdate)}</td>
                                        <td>{formatDate(item.sedate)}</td>
                                        <td>{item.state}</td>
                                        <td>{item.amount !== 'N/A' ? `$${item.amount.toFixed(2)}` : 'N/A'}</td>
                                    </tr>
                                ))
                            ) : (
                                // Show "No subscriptions found" only if not currently loading (and initial loading is done) AND no records are found
                                !loading && !initialLoading && <tr>
                                    <td colSpan={8} className="text-center">No subscriptions found</td>
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
        </div>
    );
};

export default SubscriptionManagement;