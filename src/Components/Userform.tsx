import React, { useState, useEffect } from 'react';
import '../Styles/Userform.css';
import PreviewPopUp from './PreviewPopUp';
import { endpoints, baseURL } from '../../Utils/Config'; // Ensure baseURL and endpoints are correctly imported

// --- Common Fetch Handler - BROUGHT DIRECTLY INTO THIS FILE ---
// This function performs the actual API call and handles common logic like headers and error parsing.
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
      error: { status: 0, message: err.message || "Network error or unexpected issue" },
    };
  }
};
// --- END executeFetch ---


// Define the shape of your form data state, aligned with Figma
interface FormState {
    title: string;
    description: string;
    callToAction: string;
    link: string;
    dailyBudget: string; // Stored as string from input, converted to number for payload
    startDate: string;
    endDate: string;
    estimatedBudget: string; // Stored as string from input, converted to number for payload
    file: File | null; // This will be uploaded directly to the backend
}

const Userform: React.FC = () => {
    const [state, setState] = useState<boolean>(false); // For PreviewPopUp visibility
    const [form, setForm] = useState<FormState>({
        title: '',
        description: '',
        callToAction: '',
        link: '',
        dailyBudget: '',
        startDate: '',
        endDate: '',
        estimatedBudget: '',
        file: null,
    });

    const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
    const [touched, setTouched] = useState<Partial<Record<keyof FormState, boolean>>>({});

    // Local state for loading, error, and success messages (replacing Redux state)
    const [loading, setLoading] = useState<boolean>(false);
    const [apiError, setApiError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);


    const handlePopup = () => setState(prev => !prev);

    // Helper to get ISO string for dates (e.g., "2025-06-12T00:00:00.000Z")
    const getISODateString = (dateString: string): string => {
        if (!dateString) return '';
        const [year, month, day] = dateString.split('-').map(Number);
        // Using UTC to avoid timezone issues when sending to backend
        return new Date(Date.UTC(year, month - 1, day, 0, 0, 0)).toISOString();
    };

    // --- Validation Logic ---
    const validate = (name: keyof FormState, value: any, currentForm: FormState = form): string => {
        let error = '';
        const urlRegex = /^(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/[a-zA-Z0-9]+\.[^\s]{2,}|[a-zA-Z0-9]+\.[^\s]{2,})$/i;

        switch (name) {
            case 'title':
                if (value.trim().length < 4) error = 'Title must be more than 3 characters';
                break;
            case 'description':
                if (value.trim().length < 10) error = 'Description must be more than 10 characters';
                break;
            case 'link':
                if (!value.trim()) {
                    error = 'Link is required';
                } else if (!urlRegex.test(value)) {
                    error = 'Please enter a valid URL (e.g., https://example.com)';
                }
                break;
            case 'dailyBudget':
                if (isNaN(Number(value)) || Number(value) <= 0) error = 'Daily Budget must be greater than 0';
                break;
            case 'estimatedBudget':
                // Estimated budget is optional, but if entered, must be non-negative
                if (value && (isNaN(Number(value)) || Number(value) < 0)) error = 'Estimated Budget cannot be negative';
                break;
            case 'startDate':
            case 'endDate':
                if (currentForm.startDate && currentForm.endDate) {
                    const start = new Date(currentForm.startDate);
                    const end = new Date(currentForm.endDate);
                    if (end <= start) {
                        error = 'End date must be after start date';
                    }
                } else if (!value.trim()) {
                    error = `${name === 'startDate' ? 'Start' : 'End'} date is required`;
                }
                break;
            case 'file':
                if (!value) {
                    error = 'Ad media file is required';
                } else {
                    const sizeMB = value.size / 1024 / 1024;
                    if (value.type.includes('image') && sizeMB > 1) error = 'Image should be less than 1MB';
                    if (value.type.includes('video') && sizeMB > 2) error = 'Video should be less than 2MB';
                }
                break;
            default:
                break;
        }
        return error;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type, files } = e.target as HTMLInputElement;
        let newVal: any = value;

        if (type === 'file') {
            newVal = files?.[0] || null;
        } else if (type === 'number') {
            newVal = value === '' ? '' : Number(value); // Keep as string for empty, convert to number otherwise
        }

        setForm(prev => {
            const updatedForm = { ...prev, [name]: newVal };
            const error = validate(name as keyof FormState, newVal, updatedForm);
            setErrors(currentErrors => ({ ...currentErrors, [name]: error }));
            return updatedForm;
        });
        // Clear success/error messages on input change
        setApiError(null);
        setSuccessMessage(null);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name } = e.target;
        setTouched(prev => ({ ...prev, [name]: true }));

        setErrors(prevErrors => {
            const newErrors = { ...prevErrors };
            const fieldName = name as keyof FormState;
            newErrors[fieldName] = validate(fieldName, form[fieldName], form); // Validate current field

            // Re-validate interdependent fields on blur (only dates remain)
            if (fieldName === 'startDate' || fieldName === 'endDate') {
                newErrors.startDate = validate('startDate', form.startDate, form);
                newErrors.endDate = validate('endDate', form.endDate, form);
            }
            return newErrors;
        });
    };

    // Removed handleAllIndiaChange as 'allIndia' and 'location' are removed

    const getHelperMessage = (name: keyof FormState): string => {
        const emptyMsgs: Record<keyof FormState, string> = {
            title: 'Enter at least 4 characters',
            description: 'Enter at least 10 characters',
            callToAction: 'Example: Learn More',
            link: 'e.g., https://yourwebsite.com',
            dailyBudget: 'Enter a number > 0',
            startDate: 'Select start date',
            endDate: 'Must be after start date',
            estimatedBudget: 'Optional: Cannot be negative',
            file: 'Upload image (<1MB) or video (<2MB)',
        };
        // Prioritize error messages if field is touched and has an error
        if (touched[name] && errors[name]) {
            return errors[name] || '';
        }
        return emptyMsgs[name];
    };

    const getInputClass = (name: keyof FormState): string => {
        const baseClass = 'form-textbox';
        if (touched[name] && errors[name]) return `${baseClass} has-error`;
        return baseClass;
    };

    // --- Re-run validation for interdependent fields (on form state changes) ---
    useEffect(() => {
        setErrors(prev => ({
            ...prev,
            endDate: validate('endDate', form.endDate, form),
            startDate: validate('startDate', form.startDate, form),
        }));
    }, [form.startDate, form.endDate]);

    // Removed useEffect for ageFrom/ageTo, location/allIndia, gender/placing as they are removed

    // --- Form Validity Check ---
    const isFormValid = (): boolean => {
        const allFormFields: Array<keyof FormState> = Object.keys(form) as Array<keyof FormState>;
        let currentValidationErrors: Partial<Record<keyof FormState, string>> = {};

        // Run validation for all fields that are part of the FormState
        allFormFields.forEach(field => {
            currentValidationErrors[field] = validate(field, form[field], form);
        });

        // Check if any field has a validation error
        const hasErrors = Object.values(currentValidationErrors).some(error => !!error);

        // Additionally check for explicitly required fields to not be empty/invalid
        const requiredFieldsExplicitlyFilled =
            form.title.trim() !== '' &&
            form.description.trim() !== '' &&
            form.callToAction.trim() !== '' &&
            form.link.trim() !== '' &&
            Number(form.dailyBudget) > 0 &&
            form.startDate.trim() !== '' &&
            form.endDate.trim() !== '' &&
            form.file !== null && // Ensure a file is selected
            (form.estimatedBudget === '' || Number(form.estimatedBudget) >= 0); // Estimated budget optional but if filled, valid

        return requiredFieldsExplicitlyFilled && !hasErrors;
    };

    // --- Handle Submit ---
    const handleSubmit = async () => {
        // 1. Mark all fields as touched to display all validation errors
        const newTouched: Partial<Record<keyof FormState, boolean>> = {};
        (Object.keys(form) as Array<keyof FormState>).forEach(key => {
            newTouched[key] = true;
        });
        setTouched(newTouched);

        // 2. Perform a full validation pass to update `errors` state based on current form
        let fullFormErrors: Partial<Record<keyof FormState, string>> = {};
        (Object.keys(form) as Array<keyof FormState>).forEach(key => {
            fullFormErrors[key] = validate(key, form[key], form);
        });
        setErrors(fullFormErrors);

        // 3. Check validity based on the *latest* errors state and explicit checks
        if (!isFormValid()) {
            alert("Please correct the errors in the form before submitting.");
            return; // Stop if form is not valid
        }

        setLoading(true); // Start loading
        setApiError(null); // Clear previous API errors
        setSuccessMessage(null); // Clear previous success messages

        try {
            // Build the FormData with all fields
            const campaignFormData = new FormData();

            campaignFormData.append('title', form.title);
            campaignFormData.append('description', form.description);
            campaignFormData.append('callToAction', form.callToAction);
            campaignFormData.append('link', form.link);
            campaignFormData.append('dailyBudget', form.dailyBudget);
            campaignFormData.append('estimatedBudget', form.estimatedBudget);

            // Append the File object directly
            if (form.file) {
                campaignFormData.append('file', form.file);
            } else {
                // This case should be caught by isFormValid(), but as a fallback
                alert('Ad media file is required.');
                setLoading(false);
                return;
            }

            campaignFormData.append('adDuration[startDate]', getISODateString(form.startDate));
            campaignFormData.append('adDuration[endDate]', getISODateString(form.endDate));

            console.log("Userform.tsx: Sending FormData contents to API:");
            for (const pair of campaignFormData.entries()) {
                console.log(`${pair[0]}:`, pair[1] instanceof File ? `File: ${pair[1].name} (${pair[1].type})` : pair[1]);
            }

            // Directly call executeFetch
            const { response, error } = await executeFetch(
                `${baseURL}${endpoints.advertisement}`,
                "POST",
                campaignFormData
            );

            if (response) {
                setSuccessMessage("Ad Campaign Created Successfully!");
                // Reset form on successful submission
                setForm({
                    title: '', description: '', callToAction: '', link: '',
                    dailyBudget: '', startDate: '', endDate: '',
                    estimatedBudget: '', file: null,
                });
                setErrors({}); // Clear all validation errors
                setTouched({}); // Reset all touched states
                // Manually clear file input element
                const fileInput = document.getElementById('file1') as HTMLInputElement;
                if (fileInput) fileInput.value = '';
            } else {
                // Handle API error
                setApiError(error?.message || "Failed to create ad campaign.");
            }
        } catch (err: any) {
            // Handle unexpected errors (e.g., network issues)
            setApiError(err.message || "An unexpected error occurred during submission.");
        } finally {
            setLoading(false); // Stop loading regardless of success or failure
        }
    };

    const handleDiscard = () => {
        // Reset all form fields
        setForm({
            title: '', description: '', callToAction: '', link: '',
            dailyBudget: '', startDate: '', endDate: '',
            estimatedBudget: '', file: null,
        });
        setErrors({}); // Clear all errors
        setTouched({}); // Reset all touched states
        // Manually clear file input element
        const fileInput = document.getElementById('file1') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        setApiError(null); // Clear any API errors
        setSuccessMessage(null); // Clear any success messages
        setLoading(false); // Ensure loading is false
    };

    // Determine if the publish button should be disabled
    const isPublishDisabled = loading || !isFormValid();

    return (
        <div className="form-container" style={{ position: 'relative' }}>
            {state && (
                <PreviewPopUp
                    handlePopup={handlePopup}
                    formData={{
                        file: form.file,
                        title: form.title,
                        description: form.description,
                        callToAction: form.callToAction,
                        link: form.link, // Pass link to preview
                    } as any}
                />
            )}

            {loading && <p style={{ color: 'white', textAlign: 'center', margin: '10px 0' }}>Processing...</p>}

            <div className="form-wrapper">
                {/* Ad Title Input */}
                <div className='title-box1'>
                    <label htmlFor="title">Ad Title</label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        className={getInputClass('title')}
                        value={form.title}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        disabled={loading} // Disable during submission
                    />
                    <span className={`input-message ${touched.title && errors.title ? 'error' : 'info'}`}>
                        {getHelperMessage('title')}
                    </span>
                </div>

                {/* Ad Media File Upload */}
                <div className='admedia-box'>
                    <label>Ad Media</label>
                    <div className="file-upload-container-inline">
                        <label htmlFor="file1" className='file1-class'>
                            Attach <i className="bi bi-paperclip"></i>
                        </label>
                        <input
                            type="file"
                            id="file1"
                            name="file" // Name corresponds to form state key
                            className='file-box'
                            onChange={handleChange}
                            onBlur={handleBlur}
                            accept="image/*,video/*"
                            disabled={loading} // Disable during submission
                        />
                        {form.file && (
                            <div className="file-info-inline">
                                <span className="file-name">{form.file.name}</span>
                                <button
                                    type="button"
                                    className="file-remove"
                                    onClick={() => {
                                        setForm(prev => ({ ...prev, file: null }));
                                        setErrors(prev => ({ ...prev, file: validate('file', null) }));
                                        setTouched(prev => ({ ...prev, file: true }));
                                        // Manually clear file input
                                        const fileInput = document.getElementById('file1') as HTMLInputElement;
                                        if (fileInput) fileInput.value = '';
                                    }}
                                    aria-label="Remove file"
                                    disabled={loading} // Disable during submission
                                >
                                    &times;
                                </button>
                            </div>
                        )}
                    </div>
                    <span className={`input-message ${touched.file && errors.file ? 'error' : 'info'}`}>
                        {getHelperMessage('file')}
                    </span>
                </div>

                {/* Description Input */}
                <div className='desc-box'>
                    <label htmlFor="description">Ad Description</label>
                    <textarea
                        id="description"
                        name="description"
                        className={getInputClass('description')}
                        value={form.description}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        disabled={loading} // Disable during submission
                    ></textarea>
                    <span className={`input-message ${touched.description && errors.description ? 'error' : 'info'}`}>
                        {getHelperMessage('description')}
                    </span>
                </div>

                {/* Call To Action Input */}
                <div className='call-action'>
                    <label htmlFor="callToAction">Call To Action (Button)</label>
                    <input
                        type="text"
                        id="callToAction"
                        name="callToAction"
                        className={getInputClass('callToAction')}
                        value={form.callToAction}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        disabled={loading} // Disable during submission
                    />
                    <span className={`input-message ${touched.callToAction && errors.callToAction ? 'error' : 'info'}`}>
                        {getHelperMessage('callToAction')}
                    </span>
                </div>

                {/* Link Input */}
                <div className='link-box'>
                    <label htmlFor="link">Link</label>
                    <input
                        type="text"
                        id="link"
                        name="link"
                        className={getInputClass('link')}
                        value={form.link}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        disabled={loading} // Disable during submission
                    />
                    <span className={`input-message ${touched.link && errors.link ? 'error' : 'info'}`}>
                        {getHelperMessage('link')}
                    </span>
                </div>

                {/* Daily Budget Input */}
                <div className='budget-box'>
                    <label htmlFor="dailyBudget">Daily Budget</label>
                    <div className="daily-budget-input-group">
                        <span className="currency-prefix">Rs.</span>
                        <input
                            type="number"
                            id="dailyBudget"
                            name="dailyBudget"
                            className={getInputClass('dailyBudget')}
                            value={form.dailyBudget}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            min="1"
                            disabled={loading} // Disable during submission
                            onWheel={(e) => e.currentTarget.blur()} // Prevent scroll effect
                        />
                    </div>
                    <span className={`input-message ${touched.dailyBudget && errors.dailyBudget ? 'error' : 'info'}`}>
                        {getHelperMessage('dailyBudget')}
                    </span>
                </div>

                {/* Ad Duration Dates */}
                <div className='date-box'>
                    <label>Ad Duration</label>
                    <div className='date-pick d-flex align-items-center'>
                        <input
                            type="date"
                            name="startDate"
                            className={getInputClass('startDate')}
                            value={form.startDate}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            min={new Date().toISOString().split('T')[0]} // Min date is today
                            disabled={loading} // Disable during submission
                        />
                        <span className='mx-2'>to</span>
                        <input
                            type="date"
                            name="endDate"
                            className={getInputClass('endDate')}
                            value={form.endDate}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            min={form.startDate || new Date().toISOString().split('T')[0]} // Min date is start date or today
                            disabled={loading} // Disable during submission
                        />
                    </div>
                    <span className={`input-message ${touched.endDate && errors.endDate ? 'error' : 'info'}`}>
                        {getHelperMessage('endDate')}
                    </span>
                </div>

                {/* Estimated Budget Input */}
                <div className='budget-box'>
                    <label htmlFor="estimatedBudget">Estimated Budget</label>
                    <div className="daily-budget-input-group">
                        <span className="currency-prefix">Rs.</span>
                        <input
                            type="number"
                            id="estimatedBudget"
                            name="estimatedBudget"
                            className={getInputClass('estimatedBudget')}
                            value={form.estimatedBudget}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            min="0"
                            disabled={loading} // Disable during submission
                            onWheel={(e) => e.currentTarget.blur()} // Prevent scroll effect
                        />
                    </div>
                    <span className={`input-message ${touched.estimatedBudget && errors.estimatedBudget ? 'error' : 'info'}`}>
                        {getHelperMessage('estimatedBudget')}
                    </span>
                </div>

                {/* Removed 'Placing' section */}

                {/* Preview Button */}
                <div className='preview-box'>
                    <label>Preview</label>
                    <button
                        className='preview-button'
                        onClick={handlePopup}
                        aria-label="View Preview"
                        type="button"
                        disabled={loading} // Disable during submission
                    >
                        View Preview<i className="bi bi-eye-fill ms-2"></i>
                    </button>
                </div>

                {/* Submit & Discard */}
                <div className='buttons-ds'>
                    <button
                        className='discard-button'
                        type="button"
                        onClick={handleDiscard}
                        disabled={loading} // Disable during submission
                    >
                        Discard
                    </button>
                    <button
                        className='submit-button'
                        type="button"
                        disabled={isPublishDisabled} // Disable if invalid or loading
                        style={{
                            opacity: isPublishDisabled ? 0.5 : 1,
                            cursor: isPublishDisabled ? 'not-allowed' : 'pointer'
                        }}
                        onClick={handleSubmit}
                    >
                        {loading ? 'Publishing...' : 'Publish'} {/* Text changed to 'Publish' */}
                    </button>
                </div>

                {/* Local API Call Feedback */}
                {apiError && <p style={{ color: 'red', marginTop: '15px', textAlign: 'center' }}>Error: {apiError}</p>}
                {successMessage && <p style={{ color: 'green', marginTop: '15px', textAlign: 'center' }}>{successMessage}</p>}

            </div>
        </div>
    );
};

export default Userform;
