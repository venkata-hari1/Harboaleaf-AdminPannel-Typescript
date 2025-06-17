import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../Styles/Userform.css'; // Adjust path
import PreviewPopUp from './PreviewPopUp'; // Adjust path
// Import your provided endpoints and baseURL (no changes to these in this file)
import { endpoints, baseURL } from '../../Utils/Config';
import { showToast } from '../../Utils/Validation'; // Adjust path

interface FormState {
    id?: string; // Optional ID for edit mode (will be _id from backend)
    title: string;
    description: string;
    callToAction: string;
    link: string;
    dailyBudget: string; // Stored as string for input compatibility
    startDate: string;   //YYYY-MM-DD for date input
    endDate: string;     //YYYY-MM-DD for date input
    estimatedBudget: string; // Stored as string for input compatibility
    file: File | null;       // For new file uploads (actual File object)
    mediaUrl?: string;       // To store the URL of an existing media file from the backend
}

interface UserformProps {
    onSubmissionSuccess?: () => void; // Callback after successful form submission (create/edit)
}

const Userform: React.FC<UserformProps> = ({ onSubmissionSuccess }) => {
    const location = useLocation(); // Hook to access URL state
    const navigate = useNavigate(); // Hook to navigate programmatically
    const { campaignData } = location.state || {}; // Destructure campaignData from location.state

    const [state, setState] = useState<boolean>(false); // For PreviewPopUp visibility
    const [form, setForm] = useState<FormState>(() => {
        // Initialize form based on campaignData from location state, or empty for new
        if (campaignData) {
            
            const mappedData: FormState = {
                id: campaignData._id, // Use _id from backend as the form's ID
                title: campaignData.title || '',
                description: campaignData.description || '',
                callToAction: campaignData.callToAction || '',
                link: campaignData.link || '',
                dailyBudget: String(campaignData.dailyBudget || ''), // Convert number to string
                startDate: campaignData.adDuration?.startDate ? new Date(campaignData.adDuration.startDate).toISOString().split('T')[0] : '',
                endDate: campaignData.adDuration?.endDate ? new Date(campaignData.adDuration.endDate).toISOString().split('T')[0] : '',
                // Prioritize 'eliminatedBudget' if it's meant to be the main budget field on backend
                estimatedBudget: String(campaignData.eliminatedBudget || campaignData.estimatedBudget || ''),
                file: null, // Initial file input is empty, mediaUrl holds existing reference
                // Check adMedia.url first, then fallback to top-level 'file' if your API sends it that way
                mediaUrl: campaignData.adMedia?.url || campaignData.file, 
            };
            return mappedData;
        }
        // Default empty form for new creation
        return {
            title: '', description: '', callToAction: '', link: '',
            dailyBudget: '', startDate: '', endDate: '',
            estimatedBudget: '', file: null, mediaUrl: undefined,
        };
    });

    const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
    const [touched, setTouched] = useState<Partial<Record<keyof FormState, boolean>>>({});

    const [loading, setLoading] = useState<boolean>(false);
    const [apiMessage, setApiMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Determine if we are in edit mode based on campaignData from location state having an ID
    const isEditMode = !!campaignData && !!campaignData._id;

    // --- Core Logic Functions (defined before use in useEffects) ---

    const handlePopup = useCallback(() => setState(prev => !prev), []);

    const getISODateString = useCallback((dateString: string): string => {
        if (!dateString) return '';
        const [year, month, day] = dateString.split('-').map(Number);
        return new Date(Date.UTC(year, month - 1, day, 0, 0, 0)).toISOString();
    }, []);

    const isFieldRequired = useCallback((name: keyof FormState): boolean => {
        switch (name) {
            case 'title':
            case 'description':
            case 'callToAction':
            case 'link':
            case 'dailyBudget':
            case 'startDate':
            case 'endDate':
                return true; // These fields are always required
            case 'file':
                return false; 
            case 'estimatedBudget':
                return false; // This is an optional field
            default:
                return true; // Default to true for any new fields for safety
        }
    }, []); 


    // validate: Contains the core validation logic for each form field.
    const validate = useCallback((name: keyof FormState, value: any, currentForm: FormState): string => {
        let error = '';
        const urlRegex = /^(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/[a-zA-Z0-9]+\.[^\s]{2,}|[a-zA-Z0-9]+\.[^\s]{2,})$/i;

        const hasActualValue = (typeof value === 'string' && value.trim() !== '') || (value !== null && value !== undefined && !(value instanceof File && value.size === 0));
        const shouldValidate = isFieldRequired(name) || hasActualValue;

        if (!shouldValidate) return ''; // If not required and no value, or if it's the 'file' field (which is never required now), return no error.

        switch (name) {
            case 'title':
                if (!value.trim()) error = 'Title is required';
                else if (value.trim().length < 4) error = 'Title must be more than 3 characters';
                break;
            case 'description':
                if (!value.trim()) error = 'Description is required';
                else if (value.trim().length < 10) error = 'Description must be more than 10 characters';
                break;
            case 'callToAction':
                if (!value.trim()) error = 'Call to Action is required';
                break;
            case 'link':
                if (!value.trim()) {
                    error = 'Link is required';
                } else if (!urlRegex.test(value)) { // Only test regex if value exists
                    error = 'Please enter a valid URL (e.g., https://example.com)';
                }
                break;
            case 'dailyBudget':
                if (value.trim() === '' || isNaN(Number(value))) error = 'Daily Budget is required';
                else if (Number(value) <= 0) error = 'Daily Budget must be a number greater than 0';
                break;
            case 'estimatedBudget':
                // Optional field: only validate if a value is entered
                if (value !== '' && (isNaN(Number(value)) || Number(value) < 0)) error = 'Estimated Budget cannot be negative';
                break;
            case 'startDate':
            case 'endDate':
                if (!value.trim()) {
                    error = `${name === 'startDate' ? 'Start' : 'End'} date is required`;
                } else if (currentForm.startDate && currentForm.endDate) {
                    const start = new Date(currentForm.startDate);
                    const end = new Date(currentForm.endDate);
                    const utcStart = new Date(Date.UTC(start.getFullYear(), start.getMonth(), start.getDate()));
                    const utcEnd = new Date(Date.UTC(end.getFullYear(), end.getMonth(), end.getDate()));

                    if (name === 'endDate' && utcEnd <= utcStart) {
                        error = 'End date must be after start date';
                    } else if (name === 'startDate' && utcEnd <= utcStart) {
                        error = 'Start date must be before end date';
                    }
                }
                break;
            case 'file':
                
                if (value) { 
                    const sizeMB = (value.size / 1024 / 1024);
                    if (value.type.includes('image') && sizeMB > 1) error = 'Image should be less than 1MB';
                    if (value.type.includes('video') && sizeMB > 2) error = 'Video should be less than 2MB';
                }
                break;
            default:
                break;
        }
        return error;
    }, [isFieldRequired]); 

    const isFormValid = useCallback((): boolean => {
        
        if (isEditMode) {
            return true;
        }

        // For new campaign creation (not in edit mode), perform full validation:
        const allFormFields: Array<keyof FormState> = Object.keys(form) as Array<keyof FormState>;
        let currentValidationErrors: Partial<Record<keyof FormState, string>> = {};

        // Run validation for all fields to populate currentValidationErrors
        allFormFields.forEach(field => {
            currentValidationErrors[field] = validate(field, form[field], form);
        });

        // Check if any of the REQUIRED fields have errors
        const hasRequiredErrors = allFormFields.some(field => {
            return isFieldRequired(field) && !!currentValidationErrors[field];
        });

        // Also check if any OPTIONAL fields that *have* a value have errors (e.g., invalid estimatedBudget if entered)
        const hasOptionalValueErrors = allFormFields.some(field => {
            const fieldValue = form[field];
            const hasValue = (typeof fieldValue === 'string' && fieldValue.trim() !== '') || (fieldValue !== null && fieldValue !== undefined && !(fieldValue instanceof File && fieldValue.size === 0));
            return !isFieldRequired(field) && hasValue && !!currentValidationErrors[field];
        });

        return !(hasRequiredErrors || hasOptionalValueErrors);
    }, [form, validate, isFieldRequired, isEditMode]);

    useEffect(() => {
        if (campaignData) {
            const mappedData: FormState = {
                id: campaignData._id,
                title: campaignData.title || '',
                description: campaignData.description || '',
                callToAction: campaignData.callToAction || '',
                link: campaignData.link || '',
                dailyBudget: String(campaignData.dailyBudget || ''),
                startDate: campaignData.adDuration?.startDate ? new Date(campaignData.adDuration.startDate).toISOString().split('T')[0] : '',
                endDate: campaignData.adDuration?.endDate ? new Date(campaignData.adDuration.endDate).toISOString().split('T')[0] : '',
                estimatedBudget: String(campaignData.eliminatedBudget || campaignData.estimatedBudget || ''),
                file: null, // Clear for re-upload possibility
                mediaUrl: campaignData.adMedia?.url || campaignData.file, // Set existing media URL
            };
            setForm(mappedData);
        } else {
            // Reset form for new creation
            setForm({
                title: '', description: '', callToAction: '', link: '',
                dailyBudget: '', startDate: '', endDate: '',
                estimatedBudget: '', file: null, mediaUrl: undefined,
            });
        }
        setErrors({});
        setTouched({});
        setApiMessage(null);
    }, [campaignData]); 
    useEffect(() => {
        console.log('--- Userform State Update ---');
        console.log('Form:', form);
        console.log('Errors:', errors);
        console.log('Touched:', touched);
        console.log('isEditMode:', isEditMode);
        console.log('isFormValid (computed):', isFormValid()); // Logs the current validity state
        console.log('isPublishDisabled (computed):', loading || !isFormValid()); // Logs if the button will be disabled
        console.log('isFieldRequired(file):', isFieldRequired('file')); // Crucial for file validation
        console.log('form.mediaUrl:', form.mediaUrl); // Check if existing media URL is present
        console.log('form.file (newly selected):', form.file); // Check if a new file is chosen
        console.log('-----------------------------');
    }, [form, errors, touched, isEditMode, isFormValid, loading, isFieldRequired]);
    // --- END DEBUG LOGGING ---

    // Effect to re-validate interdependent date fields whenever their values change
    useEffect(() => {
        setErrors(prev => ({
            ...prev,
            startDate: validate('startDate', form.startDate, form),
            endDate: validate('endDate', form.endDate, form),
        }));
    }, [form.startDate, form.endDate, validate]);


    // handleChange: Updates form state and performs instant validation for visual feedback.
    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type, files } = e.target as HTMLInputElement;
        let newVal: any = value;

        setForm(prev => {
            const updatedForm = { ...prev };
            if (type === 'file') {
                newVal = files?.[0] || null;
                // If a new file is selected, ensure mediaUrl is cleared.
                // This means the user intends to replace the existing media.
                if (newVal) {
                    updatedForm.mediaUrl = undefined;
                }
                updatedForm.file = newVal;
                // IMMEDIATELY MARK FILE AS TOUCHED ON CHANGE FOR INSTANT ERROR FEEDBACK
                setTouched(currentTouched => ({ ...currentTouched, file: true }));
            } else {
                updatedForm[name as keyof FormState] = newVal;
            }

            const error = validate(name as keyof FormState, newVal, updatedForm);
            setErrors(currentErrors => ({ ...currentErrors, [name]: error }));
            return updatedForm;
        });
        setApiMessage(null); // Clear any previous API message on user input
    }, [validate]);

    // handleBlur: Marks a field as 'touched' and re-validates it to show errors on losing focus.
    const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name } = e.target;
        setTouched(prev => ({ ...prev, [name]: true }));

        setErrors(prevErrors => {
            const newErrors = { ...prevErrors };
            const fieldName = name as keyof FormState;
            newErrors[fieldName] = validate(fieldName, form[fieldName], form);

            // Re-validate related date fields if one of them changes to ensure consistency
            if (fieldName === 'startDate' || fieldName === 'endDate') {
                newErrors.startDate = validate('startDate', form.startDate, form);
                newErrors.endDate = validate('endDate', form.endDate, form);
            }
            return newErrors;
        });
    }, [form, validate]);

    // getHelperMessage: Provides dynamic helper text or error messages based on validation state.
    const getHelperMessage = useCallback((name: keyof FormState): string => {
        const emptyMsgs: Record<keyof FormState, string> = {
            title: 'Enter at least 4 characters',
            description: 'Enter at least 10 characters',
            callToAction: 'Example: Learn More',
            link: 'e.g., https://yourwebsite.com',
            dailyBudget: 'Enter a number greater than 0',
            startDate: 'Select start date',
            endDate: 'Must be after start date',
            estimatedBudget: 'Optional: Cannot be negative',
            // Custom message for file. No longer says it's "required".
            file: isEditMode && form.mediaUrl ? 'Upload new image (<1MB) or video (<2MB) to replace existing' : 'Upload image (<1MB) or video (<2MB) (Optional)',
        };
        // If the field has been touched and has an error (e.g., size error if new file uploaded), show the specific error message
        if (touched[name] && errors[name]) {
            return errors[name] || '';
        }
        // Otherwise, show the general helper message
        return emptyMsgs[name];
    }, [touched, errors, isEditMode, form.mediaUrl]);

    // getInputClass: Determines CSS class for input elements (e.g., 'has-error', 'has-valid').
    const getInputClass = useCallback((name: keyof FormState): string => {
        const baseClass = 'form-textbox';
        // First, always check for a specific error for the field
        if (touched[name] && errors[name]) {
            return `${baseClass} has-error`;
        }

        // Special handling for file input validity class
        if (name === 'file') {
            
            const isFileStylisticallyPresentAndValid = (!!form.file || !!form.mediaUrl);

            if (touched.file && isFileStylisticallyPresentAndValid) {
                 return `${baseClass} has-valid`;
            }
            // If it's touched, but no file is selected and no existing media,
            // or if there are errors (which are caught by the first `if`),
            // then just return the base class.
            return baseClass; 
        }

        // General logic for other input types: check if it has a value AND no error
        const fieldValue = form[name];
        const hasValue = (typeof fieldValue === 'string' && fieldValue.trim() !== '') ||
                         (fieldValue !== null && fieldValue !== undefined && !(fieldValue instanceof File && fieldValue.size === 0));

        if (touched[name] && !errors[name] && (hasValue || !isFieldRequired(name))) {
            return `${baseClass} has-valid`;
        }
        return baseClass;
    }, [form, touched, errors, isFieldRequired]);

    // handleSubmit: Handles form submission (create or update) to the backend.
    const handleSubmit = async () => {
        const newTouched: Partial<Record<keyof FormState, boolean>> = {};
        (Object.keys(form) as Array<keyof FormState>).forEach(key => {
            newTouched[key] = true;
        });
        setTouched(newTouched);
        let fullFormErrors: Partial<Record<keyof FormState, string>> = {};
        (Object.keys(form) as Array<keyof FormState>).forEach(key => {
            fullFormErrors[key] = validate(key, form[key], form);
        });
        setErrors(fullFormErrors);
        if (!isEditMode && !isFormValid()) {
            setApiMessage({ type: 'error', text: "Please correct the errors in the form before submitting." });
            showToast(false, "Please correct the errors in the form before submitting.");
            return;
        }

        setLoading(true); // Start loading indicator
        setApiMessage(null); // Clear previous API messages

        try {
            const campaignFormData = new FormData(); 
            campaignFormData.append('title', form.title);
            campaignFormData.append('description', form.description);
            campaignFormData.append('callToAction', form.callToAction);
            campaignFormData.append('link', form.link);
            campaignFormData.append('dailyBudget', form.dailyBudget);

            if (form.estimatedBudget !== '') {
                campaignFormData.append('estimatedBudget', form.estimatedBudget);
            }

            if (form.file) { 
                campaignFormData.append('file', form.file);
            }
            
            campaignFormData.append('adDuration[startDate]', getISODateString(form.startDate));
            campaignFormData.append('adDuration[endDate]', getISODateString(form.endDate));

            console.log("Userform.tsx: Preparing to send FormData contents to API:");
            for (const pair of campaignFormData.entries()) {
                console.log(`${pair[0]}:`, pair[1] instanceof File ? `File: ${pair[1].name} (${pair[1].type})` : pair[1]);
            }

            // Determine API URL and HTTP method based on edit mode and the provided endpoints
            const url = isEditMode ? `${baseURL}${endpoints.updatead}/${form.id}` : `${baseURL}${endpoints.advertisement}`;
            const method = isEditMode ? "PATCH" : "POST"; // Correctly set to PATCH for updates!

            const headers: HeadersInit = { 'Accept': 'application/json' };
            const token = localStorage.getItem('token');
            if (token) headers['token'] = token;
            

            const options: RequestInit = {
                method: method,
                headers: headers, // Only manual headers like 'token' are needed
                body: campaignFormData, // FormData object as the body
            };

            const res = await fetch(url, options);
            
            const data = await res.json().catch(() => ({ message: res.statusText || "Something went wrong" }));

            if (!res.ok) {
                const errorMessage = data.message || `Error ${res.status}: Failed to ${isEditMode ? 'update' : 'create'} ad campaign.`;
                setApiMessage({ type: 'error', text: errorMessage });
                showToast(false, errorMessage);
            } else {
                setApiMessage({ type: 'success', text: `Ad Campaign ${isEditMode ? 'Updated' : 'Created'} Successfully!` });
                showToast(true, `Ad Campaign ${isEditMode ? 'Updated' : 'Created'} Successfully!`);

                // Call the success callback to notify parent (Monitercompaign)
                onSubmissionSuccess?.();

                // Reset form only if it was a new creation (to clear fields for next entry)
                if (!isEditMode) {
                    setForm({
                        title: '', description: '', callToAction: '', link: '',
                        dailyBudget: '', startDate: '', endDate: '',
                        estimatedBudget: '', file: null, mediaUrl: undefined,
                    });
                    setErrors({}); // Clear validation errors
                    setTouched({}); // Reset touched states
                    const fileInput = document.getElementById('file1') as HTMLInputElement;
                    if (fileInput) fileInput.value = ''; // Manually clear file input visual
                }
               
            }
        } catch (err: any) {
            setApiMessage({ type: 'error', text: err.message || "An unexpected error occurred during submission." });
            showToast(false, err.message || "An unexpected error occurred during submission.");
        } finally {
            setLoading(false); // Stop loading regardless of success or failure
        }
    };

    // handleDiscard: Resets the form to its initial state (either blank or pre-filled edit data)
    const handleDiscard = useCallback(() => {
        if (campaignData) {
            // Revert to the original campaignData if in edit mode
            const mappedData: FormState = {
                id: campaignData._id,
                title: campaignData.title || '',
                description: campaignData.description || '',
                callToAction: campaignData.callToAction || '',
                link: campaignData.link || '',
                dailyBudget: String(campaignData.dailyBudget || ''),
                startDate: campaignData.adDuration?.startDate ? new Date(campaignData.adDuration.startDate).toISOString().split('T')[0] : '',
                endDate: campaignData.adDuration?.endDate ? new Date(campaignData.adDuration.endDate).toISOString().split('T')[0] : '',
                estimatedBudget: String(campaignData.eliminatedBudget || campaignData.estimatedBudget || ''),
                file: null, // Discard any newly selected file
                mediaUrl: campaignData.adMedia?.url || campaignData.file, // Revert to original media URL
            };
            setForm(mappedData);
        } else {
            // Clear the form completely for new creation mode
            setForm({
                title: '', description: '', callToAction: '', link: '',
                dailyBudget: '', startDate: '', endDate: '',
                estimatedBudget: '', file: null, mediaUrl: undefined,
            });
        }
        setErrors({}); // Clear validation errors
        setTouched({}); // Reset touched states
        const fileInput = document.getElementById('file1') as HTMLInputElement;
        if (fileInput) fileInput.value = ''; // Manually clear file input visually
        setApiMessage(null); // Clear any API messages
        setLoading(false); // Ensure loading state is reset
    }, [campaignData]); // `campaignData` is a dependency to ensure proper reset based on context

    const isPublishDisabled = loading || (!isEditMode && !isFormValid());

    const isPreviewDisabled = loading ||
                              !form.title ||
                              !form.description ||
                              !form.callToAction ||
                              !form.link ||
                              (!form.file && !form.mediaUrl); // Needs either a new file or an existing media URL


    return (
        <div className="form-container" style={{ position: 'relative' }}>
            {state && (
                <PreviewPopUp
                    handlePopup={handlePopup}
                    formData={{
                        file: form.file, // Pass the new File object for preview
                        title: form.title,
                        description: form.description,
                        callToAction: form.callToAction,
                        link: form.link,
                        mediaUrl: form.mediaUrl // Pass the existing media URL for preview fallback
                    }}
                />
            )}

            {/* General processing loader message */}
            {loading && <p style={{ color: 'white', textAlign: 'center', margin: '10px 0' }}>Processing...</p>}

            <div className="form-wrapper">
                {/* Dynamic Heading based on mode */}
                <h2>{isEditMode ? 'Edit Ad Campaign' : 'Create New Ad Campaign'}</h2>
                
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
                        disabled={loading} // Disable input during API call
                    />
                    <span className={`input-message ${touched.title && errors.title ? 'error' : ''}`}>
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
                            name="file"
                            className='file-box'
                            onChange={handleChange}
                            onBlur={handleBlur}
                            accept="image/*,video/*"
                            disabled={loading} // Disable input during API call
                        />
                        {/* Display existing media URL or new file name if available */}
                        {(form.file || form.mediaUrl) && (
                            <div className="file-info-inline">
                                <span className="file-name">
                                    {form.file ? form.file.name : (form.mediaUrl ? new URL(form.mediaUrl).pathname.split('/').pop() || 'Existing File' : 'No file selected')}
                                </span>
                                <button
                                    type="button"
                                    className="file-remove"
                                    onClick={() => {
                                        // Clear both file (new upload) and mediaUrl (existing reference)
                                        setForm(prev => ({ ...prev, file: null, mediaUrl: undefined }));
                                        // Mark as touched and trigger validation for the file field (only size/type errors will apply if new file is selected later)
                                        setTouched(prev => ({ ...prev, file: true }));
                                        // Pass the updated form state to validate to ensure it uses the latest values
                                        setErrors(prev => ({ ...prev, file: validate('file', null, { ...form, file: null, mediaUrl: undefined }) }));
                                        const fileInput = document.getElementById('file1') as HTMLInputElement;
                                        if (fileInput) fileInput.value = ''; // Manually clear file input visual
                                    }}
                                    aria-label="Remove file"
                                    disabled={loading} // Disable button during API call
                                >
                                    &times;
                                </button>
                            </div>
                        )}
                    </div>
                    <span className={`input-message ${touched.file && errors.file ? 'error' : ''}`}>
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
                        disabled={loading}
                    ></textarea>
                    <span className={`input-message ${touched.description && errors.description ? 'error' : ''}`}>
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
                        disabled={loading}
                    />
                    <span className={`input-message ${touched.callToAction && errors.callToAction ? 'error' : ''}`}>
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
                        disabled={loading}
                    />
                    <span className={`input-message ${touched.link && errors.link ? 'error' : ''}`}>
                        {getHelperMessage('link')}
                    </span>
                </div>

                {/* Daily Budget Input */}
                <div className='budget-box'>
                    <label htmlFor="dailyBudget">Daily Budget</label>
                    <div className={`daily-budget-input-group ${getInputClass('dailyBudget').includes('has-error') ? 'has-error' : ''} ${getInputClass('dailyBudget').includes('has-valid') ? 'has-valid' : ''}`}>
                        <span className="currency-prefix">Rs.</span>
                        <input
                            type="number"
                            id="dailyBudget"
                            name="dailyBudget"
                            className="form-textbox"
                            value={form.dailyBudget}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            min="1"
                            disabled={loading}
                            onWheel={(e) => e.currentTarget.blur()}
                        />
                    </div>
                    <span className={`input-message ${touched.dailyBudget && errors.dailyBudget ? 'error' : ''}`}>
                        {getHelperMessage('dailyBudget')}
                    </span>
                </div>

                {/* Ad Duration Dates */}
                <div className='date-box'>
                    <label>Ad Duration</label>
                    <div className='date-fields-container'>
                        <div className='date-input-wrap'>
                            <label htmlFor="startDate" className='date-sub-label'>Start Date</label>
                            <input
                                type="date"
                                id="startDate"
                                name="startDate"
                                className={getInputClass('startDate')}
                                value={form.startDate}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                min={new Date().toISOString().split('T')[0]} // Min date is today
                                disabled={loading}
                            />
                        </div>
                        <div className='date-input-wrap'>
                            <label htmlFor="endDate" className='date-sub-label'>End Date</label>
                            <input
                                type="date"
                                id="endDate"
                                name="endDate"
                                className={getInputClass('endDate')}
                                value={form.endDate}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                min={form.startDate || new Date().toISOString().split('T')[0]} // End date cannot be before start date (or today)
                                disabled={loading}
                            />
                        </div>
                        {(touched.startDate && errors.startDate) || (touched.endDate && errors.endDate) ? (
                            <span className={`input-message error date-error-message`}>
                                {errors.startDate || errors.endDate}
                            </span>
                        ) : (
                            <span className={`input-message date-helper-message`}>
                                {getHelperMessage('endDate')}
                            </span>
                        )}
                    </div>
                </div>

                {/* Estimated Budget Input */}
                <div className='budget-box'>
                    <label htmlFor="estimatedBudget">Estimated Budget</label>
                    <div className={`daily-budget-input-group ${getInputClass('estimatedBudget').includes('has-error') ? 'has-error' : ''} ${getInputClass('estimatedBudget').includes('has-valid') ? 'has-valid' : ''}`}>
                        <span className="currency-prefix">Rs.</span>
                        <input
                            type="number"
                            id="estimatedBudget"
                            name="estimatedBudget"
                            className="form-textbox"
                            value={form.estimatedBudget}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            min="0"
                            disabled={loading}
                            onWheel={(e) => e.currentTarget.blur()}
                        />
                    </div>
                    <span className={`input-message ${touched.estimatedBudget && errors.estimatedBudget ? 'error' : ''}`}>
                        {getHelperMessage('estimatedBudget')}
                    </span>
                </div>

                {/* Preview Button */}
                <div className='preview-box'>
                    <label>Preview</label>
                    <button
                        className='preview-button'
                        onClick={handlePopup}
                        aria-label="View Preview"
                        type="button"
                        disabled={isPreviewDisabled}
                        style={{
                            opacity: isPreviewDisabled ? 0.5 : 1,
                            cursor: isPreviewDisabled ? 'not-allowed' : 'pointer'
                        }}
                    >
                        View Preview<i className="bi bi-eye-fill ms-2"></i>
                    </button>
                </div>

                {/* Submit & Discard Buttons */}
                <div className='buttons-ds'>
                    <button
                        className='discard-button'
                        type="button"
                        onClick={handleDiscard}
                        disabled={loading}
                    >
                        Discard
                    </button>
                    <button
                        className='submit-button'
                        type="button"
                        disabled={isPublishDisabled}
                        style={{
                            opacity: isPublishDisabled ? 0.5 : 1,
                            cursor: isPublishDisabled ? 'not-allowed' : 'pointer'
                        }}
                        onClick={handleSubmit}
                    >
                        {loading ? 'Processing...' : (isEditMode ? 'Update Campaign' : 'Publish Campaign')}
                    </button>
                </div>

                {apiMessage && (
                    <p style={{ color: apiMessage.type === 'error' ? 'red' : 'green', marginTop: '15px', textAlign: 'center' }}>
                        {apiMessage.text}
                    </p>
                )}
            </div>
        </div>
    );
};

export default Userform;