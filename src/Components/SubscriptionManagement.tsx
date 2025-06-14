// SubscriptionManagement.tsx

import React, { useEffect, useState, useRef, useMemo } from 'react';
import '../Styles/Gstusermanagement.css'; // Adjust this path as needed
import Pagination from './Pagination'; // Adjust this path as needed
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../Redux/store/Store'; // Adjust this path as needed
import { Subscription } from '../Redux/Reducers/UserMangement'; // Adjust this path as needed
import Loader from '../../Utils/Loader'; // Adjust this path as needed
import { showToast } from '../../Utils/Validation'; // Adjust this path as needed

// Define a constant for items per page. This is the 'limit' sent to your API.
const ITEMS_PER_PAGE = 5;

// Helper function to format dates for display.
const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        // Check if the date object is valid after parsing
        if (isNaN(date.getTime())) {
            // If not a valid date, return the original string or 'N/A'
            return dateString;
        }
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    } catch (error) {
        console.error("Error formatting date:", dateString, error);
        return dateString; // Fallback on error
    }
};

const SubscriptionManagement = () => {
    const dispatch = useDispatch<AppDispatch>();

    // Local state for pagination and filtering
    const [currentPage, setCurrentPage] = useState<number>(1);
    // `accountType` will be one of the filter options or null for 'All Accounts'
    const [accountType, setAccountType] = useState<string | null>(null);
    const [showFilterDropdown, setShowFilterDropdown] = useState(false); // Controls filter dropdown visibility

    const filterDropdownRef = useRef<HTMLDivElement>(null); // Ref for closing dropdown on outside click

    // Selectors to get data from Redux store
    // `subscriptionResponse` holds the raw API response like { status: true, page: 1, totalCount: 6, data: [...] }
    const subscriptionResponse = useSelector((state: RootState) => state.UserMangment.subscription);
    const loading = useSelector((state: RootState) => state.UserMangment.loading); // Redux loading state
    const error = useSelector((state: RootState) => state.UserMangment.error);

    // Extract the `data` array and pagination details from the raw API response.
    // Provide empty array/default values for safety.
    const apiUsersData = subscriptionResponse?.data || [];
    const totalCount = subscriptionResponse?.totalCount || 0;
    // Calculate total pages based on the total count of users returned by the API and our fixed ITEMS_PER_PAGE.
    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE) || 1;

    // --- Data Transformation Logic (more robust with defensive checks) ---
    const transformedRecords = useMemo(() => {
        const flattenedRecords = apiUsersData.flatMap(user => {
            // Ensure user and its properties exist before accessing
            const userId = user?._id;
            const firstName = user?.firstname || '';
            const lastName = user?.lastname || '';
            const userName = `${firstName} ${lastName}`.trim();
            const userUniqueName = user?.username || userId || 'N/A'; // Use _id as fallback for unique name
            const userSubscriptionType = user?.subscriptionType || 'N/A'; // User's overall subscription type
            const userAvatar = user?.avatar || ''; // Assuming avatar might be a direct property on the user object

            // Handle cases where subscriptionData might be missing or empty for a user
            if (!user?.subscriptionData || user.subscriptionData.length === 0) {
                // Return a single record representing the user with no active subscription details
                return [{
                    id: userId ? `${userId}_no_sub` : `no_id_${Math.random()}`, // Create a unique ID for users without subscriptions
                    username: userName || 'N/A',
                    avatar: userAvatar,
                    uniquename: userUniqueName,
                    subscriptionType: userSubscriptionType, // Keep user's overall type even if no specific sub record
                    ssdate: 'N/A',
                    sedate: 'N/A',
                    state: 'No Subscription', // Default state for users without active subscriptions
                    amount: 'N/A',
                }];
            }

            // If user has subscriptionData, map each subscription item to a record
            return user.subscriptionData.map((sub: any) => { // Added type 'any' for sub to avoid ts errors for now
                const subId = sub?._id;
                const amount = parseFloat(sub?.AmountPaid) || 0; // Ensure amount is a number, default to 0 if invalid

                return {
                    id: subId ? subId : `no_sub_id_${Math.random()}`, // Use subscription _id, or generate a random one
                    username: userName,
                    avatar: userAvatar,
                    uniquename: userUniqueName,
                    subscriptionType: userSubscriptionType, // Use the user's overall subscription type
                    ssdate: sub?.SubscribedOn,
                    sedate: sub?.NextBillingDate,
                    state: 'Active', // Default state (adjust if your API provides this for each sub)
                    amount: amount,
                };
            });
        });

        return flattenedRecords;
    }, [apiUsersData]); // Recalculate only when apiUsersData from Redux changes

    // Effect to close the filter dropdown when clicking outside
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

    // Effect to dispatch the API call when currentPage or accountType changes
    // This is the core logic for fetching data with pagination and filters.
    useEffect(() => {
        dispatch(Subscription({ page: currentPage, limit: ITEMS_PER_PAGE, accountType }));
    }, [dispatch, currentPage, accountType]); // Dependencies are stable and control fetching

    // Effect to show toast messages for errors from Redux state
    useEffect(() => {
        if (error) {
            showToast(false, error);
        }
    }, [error]);

    // Handles filter button clicks: updates `accountType` state and resets `currentPage` to 1
    const handleFilterSelect = (type: string | null) => {
        setAccountType(type); // This will trigger the useEffect because `accountType` is a dependency
        setCurrentPage(1); // Always reset to the first page when applying a new filter
        setShowFilterDropdown(false); // Close the dropdown after selection
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

            <div className="tab-content table-responsive mt-4" style={{ position: 'relative', minHeight: '300px' }}> {/* Added minHeight and position:relative */}
                {loading && (
                    // Display the Loader component centrally when loading
                    <div style={{
                        position: 'absolute',
                        top: '0',
                        left: '0',
                        right: '0',
                        bottom: '0',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: 'rgba(0,0,0,0.5)', // Semi-transparent overlay
                        zIndex: 999 // Ensure it's above the table
                    }}>
                        <Loader /> {/* Your loading ring/spinner */}
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
                        {/* Only render actual data rows if not loading AND there's data */}
                        {!loading && transformedRecords.length > 0 ? (
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
                                                e.currentTarget.src = "https://via.placeholder.com/35"; // Generic placeholder
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
                            // Show "No subscriptions found" only if not loading AND no records
                            !loading && <tr>
                                <td colSpan={8} className="text-center">No subscriptions found</td>
                            </tr>
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