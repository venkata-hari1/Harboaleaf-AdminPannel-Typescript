import React, { useEffect, useState, useCallback, useRef } from 'react';
import ReactDOM from 'react-dom';
import { useNavigate } from 'react-router-dom';
import Pagination from './Pagination';
import Loader from '../../Utils/Loader';
import { showToast } from '../../Utils/Validation';
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
// Added for consistency and better UX during subsequent loads
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
    // New state for initial full-page loading vs. skeleton loading
    const [initialLoading, setInitialLoading] = useState<boolean>(true);

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [campaignToDeleteId, setCampaignToDeleteId] = useState<string | null>(null);

    // New state for campaign status filter
    const [campaignStatus, setCampaignStatus] = useState<string | null>(null); // 'Active', 'Inactive', or null for 'All'
    const [showFilterDropdown, setShowFilterDropdown] = useState(false); // Controls filter dropdown visibility

    const navigate = useNavigate();

    const actionButtonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});
    const dropdownRef = useRef<HTMLUListElement>(null); // Ref for action dropdown
    const filterDropdownRef = useRef<HTMLDivElement>(null); // Ref for filter dropdown

    const fetchData = useCallback(async (page: number, limit: number, statusFilter: string | null) => {
        setLoading(true);
        setApiError(null);

        // Construct the URL with optional status filter
        let url = `${baseURL}${endpoints.moniteradvertisement}?page=${page}&limit=${limit}`;
        if (statusFilter) {
            url += `&status=${statusFilter}`;
        }
        // If your API also supports dailyBudget filtering based on status, you'd add it here too.
        // For now, based on your provided endpoint, it looks like `status` is the key.
        // Example: `&dailybudget=${yourBudgetParam}` if needed.

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
                showToast(false, errorMessage);
                setCampaignsData([]);
                setTotalCount(0);
            } else {
                setCampaignsData(data.data);
                setTotalCount(data.totalCount);
                if (data.totalCount === 0 && page === 1) {
                    // Only show "No campaigns found" if it's the first page and truly empty
                    showToast(false, "No campaigns found.");
                }
            }
        } catch (err: any) {
            const errorMessage = err.message || "An unexpected network error occurred while fetching campaigns.";
            setApiError(errorMessage);
            showToast(false, errorMessage);
            setCampaignsData([]);
            setTotalCount(0);
        } finally {
            setLoading(false);
            setInitialLoading(false); // Set initial loading to false after the first fetch
        }
    }, [endpoints.moniteradvertisement, baseURL]);

    useEffect(() => {
        // Pass campaignStatus to fetchData
        fetchData(currentPage, ITEMS_PER_PAGE, campaignStatus);
    }, [currentPage, campaignStatus, fetchData]); // Add campaignStatus to dependencies

    const handleEditCampaign = useCallback(async (campaignId: string) => {
        setLoading(true);
        setApiError(null);
        setOpenActionId(null); // Close dropdown immediately

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
                showToast(false, errorMessage);
            } else {
                navigate('/admin/admgmt/userform', { state: { campaignData: data.data } });
            }
        } catch (err: any) {
            const errorMessage = err.message || "Network error while fetching campaign for edit.";
            showToast(false, errorMessage);
        } finally {
            setLoading(false);
        }
    }, [navigate, endpoints.getad, baseURL]);

    const handleCreateNewCampaign = useCallback(() => {
        navigate('/admin/admgmt/userform');
    }, [navigate]);

    const handleDeleteClick = useCallback((campaignId: string) => {
        setCampaignToDeleteId(campaignId);
        setShowDeleteConfirm(true);
        setOpenActionId(null);
    }, []);

    const confirmDelete = useCallback(async () => {
        if (!campaignToDeleteId) return;

        setLoading(true);
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
                showToast(false, errorMessage);
            } else {
                showToast(true, data.message || "Campaign deleted successfully!");
                fetchData(currentPage, ITEMS_PER_PAGE, campaignStatus); // Refresh data after deletion, maintain filter
            }
        } catch (err: any) {
            const errorMessage = err.message || "Network error while deleting campaign.";
            showToast(false, errorMessage);
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

    // Handle clicks outside the Action dropdown to close it
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

    // Handle clicks outside the Filter dropdown to close it
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

    // Position the Action dropdown dynamically
    const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number } | null>(null);

    useEffect(() => {
        if (openActionId && actionButtonRefs.current[openActionId]) {
            const button = actionButtonRefs.current[openActionId];
            if (button) {
                const rect = button.getBoundingClientRect();
                setDropdownPosition({
                    top: rect.bottom + window.scrollY + 5, // 5px below the button
                    left: rect.left + window.scrollX,
                });
            }
        } else {
            setDropdownPosition(null);
        }
    }, [openActionId]);

    // Handle filter selection
    const handleFilterSelect = (status: string | null) => {
        setCampaignStatus(status); // This will trigger useEffect to refetch data
        setCurrentPage(1); // Always reset to the first page when applying a new filter
        setShowFilterDropdown(false); // Close the dropdown after selection
    };

    return (
        <div className='container'>
            <div className='d-flex justify-content-end mt-4 gap-2'>
                
                {/* Filter Dropdown Button */}
                <div className="position-relative"> {/* Added position-relative for dropdown */}
                    <button
                        className='btn btn-primary'
                        style={{ backgroundColor: '#3856F3', fontFamily: 'Roboto' }}
                        onClick={() => setShowFilterDropdown(!showFilterDropdown)}
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
                                right: '0', // Position to the right of the button
                                zIndex: 1000,
                                minWidth: '150px',
                                marginTop: '5px' // Space below button
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
                        position: 'absolute',
                        top: 0, left: 0, right: 0, bottom: 0,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        zIndex: 999,
                    }}>
                        <Loader />
                    </div>
                )}

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
                        {/* Conditional rendering for skeleton rows vs. actual data */}
                        {loading && !initialLoading ? (
                            // Show skeleton rows when loading *after* the initial load (e.g., page change, filter change)
                            Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
                                <SkeletonRow key={i} columns={9} />
                            ))
                        ) : (
                            // Show actual data if not loading (or if it's the initial load and ring loader is on top)
                            campaignsData.length > 0 ? (
                                campaignsData.map((tdata: CampaignSummary, index: number) => (
                                    <tr key={tdata._id}>
                                        <td>{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</td>
                                        <td>{tdata.title || 'N/A'}</td>
                                        <td>{formatDate(tdata.adDuration?.startDate)}</td>
                                        <td>{formatDate(tdata.adDuration?.endDate)}</td>
                                        <td>{tdata.status || 'N/A'}</td>
                                        {/* Placeholders for Impressions and Engagement Rate */}
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
                            ) : (
                                // Show "No campaigns found" only if not loading (and initial loading is done) AND no records are found
                                !loading && !initialLoading && (
                                    <tr>
                                        <td colSpan={9} className="text-center">No campaigns found</td>
                                    </tr>
                                )
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

            {/* Portal for dropdown to ensure it renders on top of everything */}
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