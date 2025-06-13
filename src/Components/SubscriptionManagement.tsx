import React, { useEffect, useState, useRef } from 'react';
import '../Styles/Gstusermanagement.css'; // Make sure this path is correct
import Pagination from './Pagination'; // Make sure this path is correct
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../Redux/store/Store'; // Make sure this path is correct
import { Subscription } from '../Redux/Reducers/UserMangement'; // Make sure this path is correct
import Loader from '../../Utils/Loader'; // Make sure this path is correct
import { showToast } from '../../Utils/Validation'; // Make sure this path is correct

const SubscriptionManagement = () => {
  const dispatch = useDispatch();
  const [currentPage, setCurrentPage] = useState(1);
  // `null` for accountType means "show all accounts"
  const [accountType, setAccountType] = useState(null);
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState([]);
  const [totalCount, setTotalCount] = useState(0); // This will now represent the total count of filtered subscriptions
  const [showFilterDropdown, setShowFilterDropdown] = useState(false); // Controls dropdown visibility

  const recordsPerPage = 5;

  const filterDropdownRef = useRef(null); // Ref to detect clicks outside the dropdown

  // Effect to handle clicks outside the filter dropdown, closing it
  useEffect(() => {
    function handleClickOutside(event) {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target)) {
        setShowFilterDropdown(false);
      }
    }
    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on component cleanup
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Helper function to format dates
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (error) {
      console.error("Error formatting date:", dateString, error);
      return dateString; // Return original if formatting fails
    }
  };

  // Effect to fetch data whenever currentPage or accountType changes
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Dispatch the Redux action to fetch subscription data.
        // The `accountType` parameter will be `null` for "All Accounts" or
        // a specific type like "PremiumAccount".
        const response = await dispatch(Subscription({ page: currentPage, accountType }));
        const result = response.payload;

        if (result?.status) {
          let transformedData = [];

          if (accountType) {
            // If a specific account type is selected, filter data for that type
            transformedData = result.data
              .filter((user) => user[accountType]?.length > 0)
              .flatMap((user) =>
                user[accountType].map((sub) => ({
                  id: sub._id,
                  username: `${user.firstname || ''} ${user.lastname || ''}`.trim(),
                  avatar: user.profilePicture || 'https://via.placeholder.com/35', // Placeholder if no profile picture
                  uniquename: user.username || `${user.firstname || ''} ${user.lastname || ''}`.trim(), // Assuming user.username for unique name, or fallback
                  subscriptionType: accountType.replace('Account', ''), // E.g., "Premium", "Business"
                  ssdate: formatDate(sub.SubscribedOn),
                  sedate: formatDate(sub.NextBillingDate),
                  state: sub.status || 'Active', // Assuming 'status' field exists in sub or default to 'Active'
                  amount: sub.AmountPaid, // AmountPaid from the subscription object
                }))
              );
          } else {
            // If `accountType` is null, combine all subscription types from all users
            transformedData = result.data.flatMap((user) => {
              const userSubscriptions = [];

              // Add Premium Accounts if they exist
              if (user.PremiumAccount && user.PremiumAccount.length > 0) {
                userSubscriptions.push(
                  ...user.PremiumAccount.map((sub) => ({
                    id: sub._id,
                    username: `${user.firstname || ''} ${user.lastname || ''}`.trim(),
                    avatar: user.profilePicture || 'https://via.placeholder.com/35',
                    uniquename: user.username || `${user.firstname || ''} ${user.lastname || ''}`.trim(),
                    subscriptionType: 'Premium',
                    ssdate: formatDate(sub.SubscribedOn),
                    sedate: formatDate(sub.NextBillingDate),
                    state: sub.status || 'Active',
                    amount: sub.AmountPaid,
                  }))
                );
              }
              // Add Business Accounts if they exist
              if (user.BusinessAccount && user.BusinessAccount.length > 0) {
                userSubscriptions.push(
                  ...user.BusinessAccount.map((sub) => ({
                    id: sub._id,
                    username: `${user.firstname || ''} ${user.lastname || ''}`.trim(),
                    avatar: user.profilePicture || 'https://via.placeholder.com/35',
                    uniquename: user.username || `${user.firstname || ''} ${user.lastname || ''}`.trim(),
                    subscriptionType: 'Business',
                    ssdate: formatDate(sub.SubscribedOn),
                    sedate: formatDate(sub.NextBillingDate),
                    state: sub.status || 'Active',
                    amount: sub.AmountPaid,
                  }))
                );
              }
              // Add Creator Accounts if they exist
              if (user.CreatorAccount && user.CreatorAccount.length > 0) {
                userSubscriptions.push(
                  ...user.CreatorAccount.map((sub) => ({
                    id: sub._id,
                    username: `${user.firstname || ''} ${user.lastname || ''}`.trim(),
                    avatar: user.profilePicture || 'https://via.placeholder.com/35',
                    uniquename: user.username || `${user.firstname || ''} ${user.lastname || ''}`.trim(),
                    subscriptionType: 'Creator',
                    ssdate: formatDate(sub.SubscribedOn),
                    sedate: formatDate(sub.NextBillingDate),
                    state: sub.status || 'Active',
                    amount: sub.AmountPaid,
                  }))
                );
              }
              return userSubscriptions;
            });
          }

          setRecords(transformedData);
          setTotalCount(transformedData.length); // Update totalCount based on filtered data
        } else {
          showToast(false, result?.message || 'Failed to load subscriptions');
          setRecords([]); // Clear records on failure
          setTotalCount(0); // Reset total count
        }
      } catch (err) {
        console.error("Error fetching subscription data:", err);
        showToast(false, 'Something went wrong while fetching data');
        setRecords([]); // Clear records on error
        setTotalCount(0); // Reset total count
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentPage, accountType, dispatch]); // Dependencies for useEffect

  // Handles filter selection from the dropdown
  const handleFilterSelect = (type) => {
    setAccountType(type); // Set the selected account type (or null for all)
    setCurrentPage(1); // Reset pagination to the first page
    setShowFilterDropdown(false); // Close the dropdown after selection
  };

  // Calculate total pages and records for the current page
  const totalPages = Math.ceil(totalCount / recordsPerPage);
  // Slice `records` after filtering, not before, for correct pagination
  const paginatedRecords = records.slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage);

  return (
    <div className='container'>
      {loading && <Loader />} {/* Show loader when data is being fetched */}

      <div className='d-flex justify-content-end mt-4 position-relative'>
        {/* Filter Button */}
        <button
          className='btn btn-primary me-3'
          style={{ backgroundColor: "#3856F3", fontFamily: "Roboto" }}
          onClick={() => setShowFilterDropdown(!showFilterDropdown)} // Toggle dropdown visibility
        >
          Filter
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-funnel-fill ms-2" viewBox="0 0 16 16">
            <path d="M1.5 1.5A.5.5 0 0 1 2 1h12a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.128.334L10 8.692V13.5a.5.5 0 0 1-.342.474l-3 1A.5.5 0 0 1 6 14.5V8.692L1.628 3.834A.5.5 0 0 1 1.5 3.5z" />
          </svg>
        </button>

        {/* Filter Dropdown (conditionally rendered) */}
        {showFilterDropdown && (
          <div
            ref={filterDropdownRef}
            className="dropdown-menu show" // Bootstrap 'show' class to display
            style={{
              position: 'absolute',
              top: '100%', // Position directly below the button
              right: '15px', // Align with the button's right edge
              zIndex: 1000, // Ensure it appears above other content
              minWidth: '150px',
            }}
          >
            {/* Dropdown options */}
            <button className="dropdown-item" onClick={() => handleFilterSelect(null)}>All Accounts</button>
            <button className="dropdown-item" onClick={() => handleFilterSelect('PremiumAccount')}>Premium</button>
            <button className="dropdown-item" onClick={() => handleFilterSelect('BusinessAccount')}>Business</button>
            <button className="dropdown-item" onClick={() => handleFilterSelect('CreatorAccount')}>Creator</button>
          </div>
        )}
      </div>

      {/* Subscription Table */}
      <div className="tab-content table-responsive mt-4">
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
            </tr>
          </thead>
          <tbody>
            {paginatedRecords.length > 0 ? (
              paginatedRecords.map((item, index) => (
                <tr key={item.id}> {/* Added key prop here */}
                  <td>{(currentPage - 1) * recordsPerPage + index + 1}</td>
                  <td className="d-flex align-items-center">
                    <img
                      src={item.avatar}
                      alt={item.username}
                      style={{
                        width: '35px',
                        height: '35px',
                        borderRadius: '50%',
                        marginRight: '10px',
                        objectFit: 'cover',
                      }}
                      onError={(e) => { e.target.onerror = null; e.target.src="https://via.placeholder.com/35" }} // Fallback for broken image
                    />
                    {item.username}
                  </td>
                  <td>{item.uniquename}</td>
                  <td>{item.subscriptionType}</td>
                  <td>{item.ssdate}</td>
                  <td>{item.sedate}</td>
                  <td>{item.state}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="text-center">No subscriptions found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Component */}
      <Pagination
        totalPages={totalPages}
        currentPage={currentPage}
        setPage={setCurrentPage}
      />
    </div>
  );
};

export default SubscriptionManagement;