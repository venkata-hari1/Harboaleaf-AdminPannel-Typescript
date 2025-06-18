import React, { useEffect, useState, useCallback, useRef } from 'react';
import ReactDOM from 'react-dom';
import { useNavigate } from 'react-router-dom';
import Pagination from './Pagination';
import Loader from '../../Utils/Loader';
// import { showToast } from '../../Utils/Validation'; // Removed
import { endpoints, baseURL } from '../../Utils/Config';
import DeleteConfirmationModal from './DeleteConfirmationModal';

const ITEMS_PER_PAGE = 5;

// Interface for the summary data displayed in the table
interface CampaignSummary {
    _id: string; // Used as the identifier
    title: string;
    description?: string;
    callToAction?: string;
    link?: string;
    file?: string; // Expecting URL from backend for display (optional)
    status: string;
    dailyBudget?: number;
    eliminatedBudget?: number; // Backend might send this for total budget
    adDuration?: {
        startDate: string;
        endDate: string;
    };
    // Add impressions and engagementRate if your API returns them
    impressions?: number;
    engagementRate?: number; // Could be a percentage
}

// Interface for the detailed data returned by GET /advertisement/{id}
// This needs to match exactly what Userform expects as FormState
interface FullCampaignDetails {
    _id: string; // Crucial for editing
    title: string;
    description: string;
    callToAction: string;
    link: string;
    dailyBudget: number; // Expect number from API, will convert to string in Userform
    estimatedBudget?: number; // Optional, convert to string in Userform
    adDuration: {
        startDate: string; // ISO string from API
        endDate: string; // ISO string from API
    };
    adMedia?: { // Assuming your backend nests media info
        url: string; // The URL of the actual media file
        // other media properties if any
    };
    file?: string; // If your backend directly returns the file URL at the top level
    status: string;
    // ... any other fields returned by the GET /advertisement/{id} API
}

interface MonitorCampaignsApiResponse {
    data: CampaignSummary[];
    totalCount: number;
    message: string;
}

const formatDate = (dateString: string | null | undefined) => {
    if (!dateString || dateString === 'N/A') return 'N/A';
    const date = new Date(dateString);
    return isNaN(date.getTime())
        ? dateString
        : date.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
          });
};

// --- Skeleton Loader Component ---
const SkeletonRow = ({ columns }: { columns: number }) => (
    <tr>
        {Array.from({ length: columns }).map((_, i) => (
            <td key={i}>
                <div style={{
                    height: '20px',
                    backgroundColor: '#e0e0e0',
                    borderRadius: '4px',
                    width: i === 1 ? '70%' : '90%', // Vary width for visual appeal
                    animation: 'pulse 1.5s infinite ease-in-out',
                }} />
            </td>
        ))}
    </tr>
);

// Add this to your CSS file (e.g., Styles/Gstusermanagement.css)
/*
@keyframes pulse {
    0% { background-color: #e0e0e0; }
    50% { background-color: #f0f0f0; }
    100% { background-color: #e0e0e0; }
}
*/

const Monitercompaign: React.FC = () => {
    const [openActionId, setOpenActionId] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [campaignsData, setCampaignsData] = useState<CampaignSummary[]>([]);
    const [totalCount, setTotalCount] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(false);
    const [apiError, setApiError] = useState<string | null>(null);
    const [initialLoading, setInitialLoading] = useState<boolean>(true); // Keep this true initially

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [campaignToDeleteId, setCampaignToDeleteId] = useState<string | null>(null);

    const [campaignStatus, setCampaignStatus] = useState<string | null>(null);
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);

    const navigate = useNavigate();

    const actionButtonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});
    const dropdownRef = useRef<HTMLUListElement>(null);
    const filterDropdownRef = useRef<HTMLDivElement>(null);

    const fetchData = useCallback(async (page: number, limit: number, statusFilter: string | null) => {
        setLoading(true); // Always set loading to true when fetching data
        setApiError(null);

        let url = `${baseURL}${endpoints.moniteradvertisement}?page=${page}&limit=${limit}`;
        if (statusFilter) {
            url += `&status=${statusFilter}`;
        }

        const headers: HeadersInit = { 'Accept': 'application/json' };
        const token = localStorage.getItem('token');
        if (token) headers['token'] = token;
        const options: RequestInit = { method: 'GET', headers };

        try {
            const res = await fetch(url, options);
            const data: MonitorCampaignsApiResponse = await res.json().catch(() => ({
                data: [],
                totalCount: 0,
                message: res.statusText || "Something went wrong parsing response"
            }));

            if (!res.ok) {
                const errorMessage = data.message || `Error ${res.status}: Failed to fetch campaigns.`;
                setApiError(errorMessage);
                setCampaignsData([]);
                setTotalCount(0);
            } else {
                setCampaignsData(data.data);
                setTotalCount(data.totalCount);
            }
        } catch (err: any) {
            const errorMessage = err.message || "An unexpected network error occurred while fetching campaigns.";
            setApiError(errorMessage);
            setCampaignsData([]);
            setTotalCount(0);
        } finally {
            setLoading(false);
            // This is the crucial part: set initialLoading to false *only after the very first fetch completes*.
            if (initialLoading) { // Check if it was indeed the initial load
                setInitialLoading(false);
            }
        }
    }, [endpoints.moniteradvertisement, baseURL, initialLoading]); // Depend on initialLoading to ensure logic runs correctly

    useEffect(() => {
        fetchData(currentPage, ITEMS_PER_PAGE, campaignStatus);
    }, [currentPage, campaignStatus, fetchData]);

    const handleEditCampaign = useCallback(async (campaignId: string) => {
        setLoading(true); // Show full-page loader for edit fetch
        setApiError(null);
        setOpenActionId(null);

        const url = `${baseURL}${endpoints.getad}/${campaignId}`;
        const headers: HeadersInit = { 'Accept': 'application/json' };
        const token = localStorage.getItem('token');
        if (token) headers['token'] = token;
        const options: RequestInit = { method: 'GET', headers };

        try {
            const res = await fetch(url, options);
            const data: { data: FullCampaignDetails; message: string } = await res.json();

            if (!res.ok) {
                const errorMessage = data.message || `Error ${res.status}: Failed to fetch campaign for edit.`;
                // showToast(false, errorMessage); // Removed
            } else {
                navigate('/admin/admgmt/userform', { state: { campaignData: data.data } });
            }
        } catch (err: any) {
            const errorMessage = err.message || "Network error while fetching campaign for edit.";
            // showToast(false, errorMessage); // Removed
        } finally {
            setLoading(false);
        }
    }, [navigate, endpoints.getad, baseURL]);

    
    const handleDeleteClick = useCallback((campaignId: string) => {
        setCampaignToDeleteId(campaignId);
        setShowDeleteConfirm(true);
        setOpenActionId(null);
    }, []);

    const confirmDelete = useCallback(async () => {
        if (!campaignToDeleteId) return;

        setLoading(true); // Show full-page loader for delete operation
        setShowDeleteConfirm(false);
        setApiError(null);

        const url = `${baseURL}${endpoints.deletead}/${campaignToDeleteId}`;
        const headers: HeadersInit = { 'Accept': 'application/json' };
        const token = localStorage.getItem('token');
        if (token) headers['token'] = token;
        const options: RequestInit = { method: 'DELETE', headers };

        try {
            const res = await fetch(url, options);
            const data = await res.json().catch(() => ({ message: res.statusText || "Something went wrong" }));

            if (!res.ok) {
                const errorMessage = data.message || `Error ${res.status}: Failed to delete campaign.`;
                // showToast(false, errorMessage); // Removed
            } else {
                // showToast(true, data.message || "Campaign deleted successfully!"); // Removed
                fetchData(currentPage, ITEMS_PER_PAGE, campaignStatus);
            }
        } catch (err: any) {
            const errorMessage = err.message || "Network error while deleting campaign.";
            // showToast(false, errorMessage); // Removed
        } finally {
            setLoading(false);
            setCampaignToDeleteId(null);
        }
    }, [campaignToDeleteId, currentPage, campaignStatus, fetchData, endpoints.deletead, baseURL]);

    const cancelDelete = useCallback(() => {
        setShowDeleteConfirm(false);
        setCampaignToDeleteId(null);
    }, []);

    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE) || 1;

    const handleToggleActions = (campaignId: string) => {
        setOpenActionId((prev) => (prev === campaignId ? null : campaignId));
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const clickedButton = openActionId ? actionButtonRefs.current[openActionId] : null;
            if (openActionId && dropdownRef.current && clickedButton) {
                if (!dropdownRef.current.contains(event.target as Node) && !clickedButton.contains(event.target as Node)) {
                    setOpenActionId(null);
                }
            }
        };

        const timer = setTimeout(() => {
            document.addEventListener('mousedown', handleClickOutside);
        }, 0);

        return () => {
            clearTimeout(timer);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [openActionId]);

    useEffect(() => {
        const handleClickOutsideFilter = (event: MouseEvent) => {
            if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target as Node)) {
                setShowFilterDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutsideFilter);
        return () => {
            document.removeEventListener("mousedown", handleClickOutsideFilter);
        };
    }, []);

    const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number } | null>(null);

    useEffect(() => {
        if (openActionId && actionButtonRefs.current[openActionId]) {
            const button = actionButtonRefs.current[openActionId];
            if (button) {
                const rect = button.getBoundingClientRect();
                setDropdownPosition({
                    top: rect.bottom + window.scrollY + 5,
                    left: rect.left + window.scrollX,
                });
            }
        } else {
            setDropdownPosition(null);
        }
    }, [openActionId]);

    const handleFilterSelect = (status: string | null) => {
        setCampaignStatus(status);
        setCurrentPage(1);
        setShowFilterDropdown(false);
    };

    return (
        <div className='container'>
            <div className='d-flex justify-content-end mt-4 gap-2'>
                {/* Create New Campaign Button */}
                
                {/* Filter Dropdown Button */}
                <div className="position-relative">
                    <button
                        className='btn btn-primary'
                        style={{ backgroundColor: '#3856F3', fontFamily: 'Roboto' }}
                        onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                        disabled={loading}
                    >
                        Filter
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                            className="bi bi-funnel-fill ms-2" viewBox="0 0 16 16">
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
                                right: '0',
                                zIndex: 1000,
                                minWidth: '150px',
                                marginTop: '5px'
                            }}
                        >
                            <button className="dropdown-item" onClick={() => handleFilterSelect(null)}>All Campaigns</button>
                            <button className="dropdown-item" onClick={() => handleFilterSelect('Active')}>Active</button>
                            <button className="dropdown-item" onClick={() => handleFilterSelect('Inactive')}>Inactive</button>
                        </div>
                    )}
                </div>
            </div>

            <div className="tab-content table-responsive" style={{ position: 'relative', minHeight: '300px' }}>
                {/* Initial Full Page Loader (Ring Loader) */}
                {initialLoading && loading && (
                    <div style={{
                        position: 'fixed',
                        top: 0, left: 0, right: 0, bottom: 0,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        zIndex: 9999,
                    }}>
                        <Loader />
                    </div>
                )}

                {/* Display API Error Message */}
                {apiError && !initialLoading && (
                    <p className="text-center text-danger mt-4">{apiError}</p>
                )}

                {/* Conditional rendering for the entire table */}
                {/* Table shows if there is data OR if we are loading subsequent data (not initial load) and no API error */}
                {(!initialLoading && loading && !apiError) || (!initialLoading && !loading && campaignsData.length > 0 && !apiError) ? (
                    <table className="table table-borderless mt-4">
                        <thead>
                            <tr>
                                <th>S.No</th>
                                <th>Advertisement Name</th>
                                <th>Start Date</th>
                                <th>End Date</th>
                                <th>Status</th>
                                <th>Impressions</th>
                                <th>Engagement Rate</th>
                                <th>Budget</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading && !initialLoading ? ( // Show skeleton rows when loading *and* not in initialLoading phase
                                Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
                                    <SkeletonRow key={i} columns={9} />
                                ))
                            ) : (
                                // Show actual data if not loading and initial loading is done, AND data exists
                                campaignsData.map((tdata: CampaignSummary, index: number) => (
                                    <tr key={tdata._id}>
                                        <td>{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</td>
                                        <td>{tdata.title || 'N/A'}</td>
                                        <td>{formatDate(tdata.adDuration?.startDate)}</td>
                                        <td>{formatDate(tdata.adDuration?.endDate)}</td>
                                        <td>{tdata.status || 'N/A'}</td>
                                        <td>{tdata.impressions !== undefined ? tdata.impressions.toLocaleString() : 'N/A'}</td>
                                        <td>{tdata.engagementRate !== undefined ? `${tdata.engagementRate}%` : 'N/A'}</td>
                                        <td>
                                            {tdata.eliminatedBudget
                                                ? `₹${tdata.eliminatedBudget.toLocaleString('en-IN')}`
                                                : tdata.dailyBudget
                                                    ? `₹${tdata.dailyBudget.toLocaleString('en-IN')}`
                                                    : 'N/A'}
                                        </td>
                                        <td className="position-relative">
                                            <button
                                                ref={el => actionButtonRefs.current[tdata._id] = el}
                                                onClick={() => handleToggleActions(tdata._id)}
                                                className="btn dropdown-toggle border"
                                                type="button"
                                                aria-expanded={openActionId === tdata._id}
                                                disabled={loading}
                                            >
                                                Actions
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                ) : (
                    // Show "No campaigns found" only if not loading, not initial loading, no apiError, and no records found
                    !loading && !initialLoading && campaignsData.length === 0 && !apiError && (
                        <p className="text-center mt-4">No campaigns found</p>
                    )
                )}
            </div>

            {/* Pagination only shows when not initial loading and not just loading subsequent data, and there's data */}
            {!initialLoading && !loading && totalCount > 0 && !apiError && (
                <Pagination
                    totalPages={totalPages}
                    currentPage={currentPage}
                    setPage={setCurrentPage}
                />
            )}

            {/* Portal for dropdown (remains the same) */}
            {openActionId && dropdownPosition && ReactDOM.createPortal(
                <ul
                    ref={dropdownRef}
                    className="action-dropdown-menu show"
                    style={{
                        position: 'absolute',
                        top: dropdownPosition.top,
                        left: dropdownPosition.left,
                        minWidth: '120px',
                        padding: '5px 0',
                        margin: '0',
                        fontSize: '1rem',
                        color: '#212529',
                        textAlign: 'left',
                        listStyle: 'none',
                        backgroundColor: '#fff',
                        backgroundClip: 'padding-box',
                        border: '1px solid rgba(0, 0, 0, 0.15)',
                        borderRadius: '.25rem',
                        zIndex: 2000,
                        boxShadow: '0 0.5rem 1rem rgba(0, 0, 0, 0.175)',
                    }}
                >
                    <li>
                        <button
                            className="dropdown-item"
                            onClick={(e) => { e.stopPropagation(); handleEditCampaign(openActionId); }}
                        >
                            Edit
                        </button>
                    </li>
                    <li>
                        <button
                            className="dropdown-item"
                            onClick={(e) => { e.stopPropagation(); handleDeleteClick(openActionId); }}
                        >
                            Delete
                        </button>
                    </li>
                </ul>,
                document.body
            )}

            {showDeleteConfirm && (
                <DeleteConfirmationModal
                    onConfirm={confirmDelete}
                    onCancel={cancelDelete}
                    itemName={campaignsData.find(c => c._id === campaignToDeleteId)?.title || "this advertisement"}
                />
            )}
        </div>
    );
};

export default Monitercompaign;