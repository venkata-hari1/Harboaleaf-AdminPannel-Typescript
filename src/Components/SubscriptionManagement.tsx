import React, { useEffect, useState, useRef } from 'react';
import '../Styles/Gstusermanagement.css'; // Ensure correct path
import Pagination from './Pagination'; // Ensure correct path
import Loader from '../../Utils/Loader'; // Ensure correct path
import { showToast } from '../../Utils/Validation'; // Ensure correct path

const SubscriptionManagement = () => {
  // State for pagination, filtering, loading status and records
  const [currentPage, setCurrentPage] = useState(1);
  // `null` for accountType means "show all accounts"
  const [accountType, setAccountType] = useState(null);
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  // Number of records per page
  const recordsPerPage = 5;

  // Ref for detecting clicks outside the filter dropdown
  const filterDropdownRef:any = useRef(null);

  // Effect to handle closing the dropdown when clicking outside of it
  useEffect(() => {
    function handleClickOutside(event) {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target)) {
        setShowFilterDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
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
      return dateString;
    }
  };

  // Fetch data from the API whenever currentPage or accountType changes
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Build the URL with the page, limit, and (if applicable) accountType query parameters.
        const url = new URL("http://34.234.64.81/api/admin/subscription");
        url.searchParams.append("page", String(currentPage));
        url.searchParams.append("limit", String(recordsPerPage));
        if (accountType) {
          url.searchParams.append("accountType", accountType);
        }

        const response = await fetch(url.toString(), {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            token: localStorage.getItem("token") || "",
          },
        });

        const result = await response.json();
        if (result?.status) {
          // Set the records from the API response
          setRecords(result.data || []);
          // Attempt to update totalCount – if the API sends a totalCount, use it.
          setTotalCount(result.totalCount || (result.data ? result.data.length : 0));
        } else {
          showToast(false, result?.message || "Failed to load subscriptions");
          setRecords([]);
          setTotalCount(0);
        }
      } catch (error) {
        console.error("Error fetching subscription data:", error);
        showToast(false, "Something went wrong while fetching data");
        setRecords([]);
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentPage, accountType]);

  // Handle filter selection from dropdown
  const handleFilterSelect = (type) => {
    setAccountType(type); // e.g. 'CreatorAccount' or 'PremiumAccount'
    setCurrentPage(1); // Reset to the first page
    setShowFilterDropdown(false);
  };

  // Calculate total pages for the pagination component
  const totalPages = Math.ceil(totalCount / recordsPerPage);
  // If API is paginated already, the records are those for the current page.
  // Otherwise, if API returns all records, you would slice them locally.
  const displayedRecords = records;

  return (
    <div className='container'>
      {loading && <Loader />} {/* Display a loader during the fetch */}

      <div className='d-flex justify-content-end mt-4 position-relative'>
        {/* Filter Button */}
        <button
          className='btn btn-primary me-3'
          style={{ backgroundColor: "#3856F3", fontFamily: "Roboto" }}
          onClick={() => setShowFilterDropdown(!showFilterDropdown)}
        >
          Filter
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" 
               className="bi bi-funnel-fill ms-2" viewBox="0 0 16 16">
            <path d="M1.5 1.5A.5.5 0 0 1 2 1h12a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.128.334L10 8.692V13.5a.5.5 0 0 1-.342.474l-3 1A.5.5 0 0 1 6 14.5V8.692L1.628 3.834A.5.5 0 0 1 1.5 3.5z"/>
          </svg>
        </button>

        {/* Filter Dropdown */}
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

      {/* Subscription Table */}
      <div className="tab-content table-responsive mt-4">
        <table className="table table-borderless">
          <thead>
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
          <tbody>
            {displayedRecords && displayedRecords.length > 0 ? (
              displayedRecords.map((item:any, index) => {
                // In this example, if the record has data for a CreatorAccount subscription,
                // we use the first element from that array.
                let subscriptionDetail:any = null;
                let subscriptionType = "N/A";
                if (item.CreatorAccount && item.CreatorAccount.length > 0) {
                  subscriptionDetail = item.CreatorAccount[0];
                  subscriptionType = "Creator";
                }
                // (Extend this logic if your API returns arrays for PremiumAccount, BusinessAccount, etc.)

                return (
                  <tr key={item._id || index}>
                    <td>{((currentPage - 1) * recordsPerPage) + index + 1}</td>
                    <td>{item.firstname} {item.lastname}</td>
                    <td>{subscriptionType}</td>
                    <td>{subscriptionDetail ? formatDate(subscriptionDetail.SubscribedOn) : 'N/A'}</td>
                    <td>{subscriptionDetail ? formatDate(subscriptionDetail.NextBillingDate) : 'N/A'}</td>
                    <td>{subscriptionDetail ? subscriptionDetail.AmountPaid : 'N/A'}</td>
                    <td>{'N/A'}</td> {/* Replace with actual state if available */}
                  </tr>
                );
              })
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
