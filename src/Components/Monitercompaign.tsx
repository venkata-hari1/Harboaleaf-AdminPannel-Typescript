import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Pagination from './Pagination';
import Actions from './ActionBtns/Actions';
import Loader from '../../Utils/Loader';
import { showToast } from '../../Utils/Validation';
import { endpoints, baseURL } from '../../Utils/Config'; // Ensure baseURL and endpoints are correctly imported

// --- Common Fetch Handler - BROUGHT DIRECTLY INTO THIS FILE ---
// This function performs the actual API call and handles common logic like headers and error parsing.
// Defined outside the component to be accessible by useCallback without being redefined on every render.
interface FetchResult<T = any, E = any> {
  response: T | null;
  error: {
    status?: number;
    message: string;
    data?: E;
  } | null;
}

const executeFetch = async <T = any, E = any>(
  fullUrl: string,
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  body?: FormData | object | string,
): Promise<FetchResult<T, E>> => {
  const headers: HeadersInit = { 'Accept': 'application/json' };
  const token = localStorage.getItem('token'); // Assuming token is stored in localStorage
  if (token) headers['token'] = token;

  const options: RequestInit = { method, headers };

  if (body) {
    if (body instanceof FormData) {
      options.body = body; // FormData does not require 'Content-Type' header
    } else if (typeof body === 'object') {
      options.body = JSON.stringify(body);
      headers['Content-Type'] = 'application/json';
    } else {
      options.body = body;
      headers['Content-Type'] = 'text/plain';
    }
  } else if (['POST', 'PUT', 'PATCH'].includes(method)) {
    // For POST/PUT/PATCH requests with no body, still set Content-Type if JSON is expected
    headers['Content-Type'] = 'application/json';
  }

  try {
    const res = await fetch(fullUrl, options);
    // Attempt to parse JSON response; gracefully handle non-JSON responses
    const data = await res.json().catch(() => ({ message: res.statusText || "Something went wrong" }));

    if (!res.ok) {
      // If response is not OK (e.g., 4xx, 5xx status codes)
      return {
        response: null,
        error: { status: res.status, message: data.message || `Error ${res.status}`, data },
      };
    }
    // If response is OK
    return { response: data, error: null };
  } catch (err: any) {
    // Catch network errors or issues during fetch
    return {
      response: null,
      error: { status: 0, message: err.message || "Network error or unexpected issue", data: null },
    };
  }
};
// --- END executeFetch ---


const ITEMS_PER_PAGE = 5;

// Define interfaces for the data structure expected from the API
interface AdDuration {
    startDate: string;
    endDate: string;
}

interface Campaign {
    _id: string;
    title: string;
    status: string;
    dailyBudget?: number;
    eliminatedBudget?: number;
    adDuration?: AdDuration;
    // Add other fields as per your API response for campaigns
    // impressions: number; // If API provides
    // engagementRate: number; // If API provides
}

interface MonitorCampaignsApiResponse {
    data: Campaign[];
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

const Monitercompaign = () => {
    const [id, setId] = useState<string | null>(null); // Changed to string for _id
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [campaignsData, setCampaignsData] = useState<Campaign[]>([]);
    const [totalCount, setTotalCount] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(false);
    const [apiError, setApiError] = useState<string | null>(null);

    const navigate = useNavigate();

    // Memoize the fetchData function to prevent unnecessary re-creations
    const fetchData = useCallback(async (page: number, limit: number) => {
        setLoading(true);
        setApiError(null); // Clear previous errors

        // Corrected endpoint: endpoints.moniteradvertisement
        const url = `${baseURL}${endpoints.moniteradvertisement}?page=${page}&limit=${limit}`;

        try {
            const { response, error } = await executeFetch<MonitorCampaignsApiResponse>(url, 'GET');

            if (response) {
                setCampaignsData(response.data);
                setTotalCount(response.totalCount);
                if (response.totalCount === 0) {
                    showToast(false, "No campaigns found for the current page.");
                }
            } else {
                setApiError(error?.message || "Failed to fetch campaigns.");
                showToast(false, error?.message || "Failed to fetch campaigns.");
                setCampaignsData([]); // Clear data on error
                setTotalCount(0);
            }
        } catch (err: any) {
            setApiError(err.message || "An unexpected error occurred while fetching campaigns.");
            showToast(false, err.message || "An unexpected error occurred while fetching campaigns.");
            setCampaignsData([]); // Clear data on error
            setTotalCount(0);
        } finally {
            setLoading(false);
        }
    }, []); // Empty dependency array means this function is created once

    useEffect(() => {
        fetchData(currentPage, ITEMS_PER_PAGE);
    }, [currentPage, fetchData]); // Depend on currentPage and fetchData

    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE) || 1;

    const handleOpen = (campaignId: string) => { // Changed type to string
        setId((prev) => (prev === campaignId ? null : campaignId));
    };

    const handleAdd = () => navigate('/admin/admgmt');

    return (
        <div className='container'>
            <div className='d-flex justify-content-end mt-4 gap-2'>
                <button className='btn btn-primary' style={{ backgroundColor: '#3856F3', fontFamily: 'Roboto' }}>
                    Filter
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                        className="bi bi-funnel-fill ms-2" viewBox="0 0 16 16">
                        <path d="M1.5 1.5A.5.5 0 0 1 2 1h12a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.128.334L10 
                            8.692V13.5a.5.5 0 0 1-.342.474l-3 1A.5.5 0 0 1 
                            6 14.5V8.692L1.628 3.834A.5.5 0 0 1 1.5 3.5z" />
                    </svg>
                </button>
                <button className='btn' style={{ color: '#FF0000', border: '1px solid #FF0000', fontFamily: 'Roboto' }}>
                    Suspended Accounts
                </button>
            </div>

            <div className="tab-content table-responsive" style={{ position: 'relative', minHeight: '300px' }}>
                {loading && (
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
                        {!loading && campaignsData.length > 0 ? (
                            campaignsData.map((tdata: Campaign, index: number) => (
                                <tr key={tdata._id || index}>
                                    <td>{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</td>
                                    <td>{tdata.title || 'N/A'}</td>
                                    <td>{formatDate(tdata.adDuration?.startDate)}</td>
                                    <td>{formatDate(tdata.adDuration?.endDate)}</td>
                                    <td>{tdata.status || 'N/A'}</td>
                                    <td>{'N/A'}</td> {/* Replace with actual data if API provides */}
                                    <td>{'N/A'}</td> {/* Replace with actual data if API provides */}
                                    <td>
                                        {tdata.eliminatedBudget
                                            ? `₹${tdata.eliminatedBudget.toLocaleString('en-IN')}`
                                            : tdata.dailyBudget
                                            ? `₹${tdata.dailyBudget.toLocaleString('en-IN')}`
                                            : 'N/A'}
                                    </td>
                                    <td>
                                        <button
                                            onClick={() => handleOpen(tdata._id)}
                                            className="btn dropdown-toggle border"
                                            type="button"
                                            data-bs-toggle="dropdown"
                                            aria-expanded="false"
                                        >
                                            Actions
                                        </button>
                                        {id === tdata._id && <Actions />}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            !loading && (
                                <tr>
                                    <td colSpan={9} className="text-center">No campaigns found</td>
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

            <div className='d-flex justify-content-end mt-4'>
                <button className='btn btn-success' style={{ backgroundColor: '#28a745', fontFamily: 'Roboto' }} onClick={handleAdd}>
                    Add Campaigns
                </button>
            </div>
        </div>
    );
};

export default Monitercompaign;