import React, { useState, useEffect } from 'react';
import '../Styles/Userform.css';
import PreviewPopUp from './PreviewPopUp'; // Ensure this path is correct
import { endpoints, baseURL } from '../../Utils/Config'; // Ensure baseURL and endpoints are correctly imported

// Define the shape of your form data state, aligned with Figma
interface FormState {
    title: string;
    description: string;
    callToAction: string;
    link: string;
    dailyBudget: string; 
    startDate: string;
    endDate: string;
    estimatedBudget: string; 
    file: File | null; // This will be uploaded directly to the backend
}

const Userform: React.FC = () => {
    const [state, setState] = useState<boolean>(false); // For PreviewPopUp visibility
    const [form, setForm] = useState<FormState>({
        title: '',
        description: '',
        callToAction: '',
        link: '', // Initialize link
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

    // Helper function to check if a field is considered 'required' for visual valid feedback
    const isFieldRequired = (name: keyof FormState): boolean => {
        switch (name) {
            case 'title':
            case 'description':
            case 'callToAction':
            case 'link': // Link is required
            case 'dailyBudget':
            case 'startDate':
            case 'endDate':
            case 'file':
                return true;
            case 'estimatedBudget':
                return false; // Estimated budget is optional
            default:
                return true; // Default to true for safety
        }
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
                // For dates, always validate both if either has a value to catch start > end issues
                if (currentForm.startDate && currentForm.endDate) {
                    const start = new Date(currentForm.startDate);
                    const end = new Date(currentForm.endDate);
                    if (end <= start) {
                        error = 'End date must be after start date';
                    }
                }
                // Also check if required date fields are empty
                if (!value.trim()) {
                    // Only show "required" error if the field itself is empty
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
            newVal = value === '' ? '' : value; // Keep as string; validation handles parsing
        }

        setForm(prev => {
            const updatedForm = { ...prev, [name]: newVal };
            // Validate the current field immediately to update errors for display
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

        // Re-validate the field on blur
        setErrors(prevErrors => {
            const newErrors = { ...prevErrors };
            const fieldName = name as keyof FormState;
            newErrors[fieldName] = validate(fieldName, form[fieldName], form);

            // Re-validate interdependent fields on blur (only dates remain)
            if (fieldName === 'startDate' || fieldName === 'endDate') {
                // We need to re-evaluate both dates because changing one affects the other's validity
                newErrors.startDate = validate('startDate', form.startDate, form);
                newErrors.endDate = validate('endDate', form.endDate, form);
            }
            return newErrors;
        });
    };

    const getHelperMessage = (name: keyof FormState): string => {
        const emptyMsgs: Record<keyof FormState, string> = {
            title: 'Enter at least 4 characters',
            description: 'Enter at least 10 characters',
            callToAction: 'Example: Learn More',
            link: 'e.g., https://yourwebsite.com',
            dailyBudget: 'Enter a number > 0',
            startDate: 'Select start date',
            endDate: 'Must be after start date', // This will be the initial hint
            estimatedBudget: 'Optional: Cannot be negative',
            file: 'Upload image (<1MB) or video (<2MB)',
        };
        // Display specific error message if the field has been touched AND has an error
        if (touched[name] && errors[name]) {
            return errors[name] || '';
        }
        // Otherwise, display the initial helper message
        return emptyMsgs[name];
    };

    const getInputClass = (name: keyof FormState): string => {
        const baseClass = 'form-textbox';
        // If touched AND has an error, apply 'has-error'
        if (touched[name] && errors[name]) {
            return `${baseClass} has-error`;
        }

        // Check if the field has a value (if it's a string, trim it) or is not null for files
        const fieldValue = form[name];
        const hasValue = (typeof fieldValue === 'string' && fieldValue.trim() !== '') || (fieldValue !== null && fieldValue !== undefined);

        // If touched, no error, AND (has a value OR is an optional field), apply 'has-valid'
        if (touched[name] && !errors[name] && (hasValue || !isFieldRequired(name))) {
            // Special handling for file input: it might be touched and have no error, but still no file selected
            if (name === 'file' && form.file === null) {
                return baseClass; // Don't mark as valid if file is still null
            }
            return `${baseClass} has-valid`;
        }

        // Default case
        return baseClass;
    };

    // --- Re-run validation for interdependent fields (on form state changes) ---
    // This useEffect ensures that if you change startDate, endDate error updates without blur, and vice-versa.
    useEffect(() => {
        setErrors(prev => ({
            ...prev,
            endDate: validate('endDate', form.endDate, form),
            startDate: validate('startDate', form.startDate, form),
        }));
    }, [form.startDate, form.endDate]);

    // --- Form Validity Check ---
    const isFormValid = (): boolean => {
        const allFormFields: Array<keyof FormState> = Object.keys(form) as Array<keyof FormState>;
        let currentValidationErrors: Partial<Record<keyof FormState, string>> = {};

        // Run validation for all fields that are part of the FormState to get all potential errors
        allFormFields.forEach(field => {
            currentValidationErrors[field] = validate(field, form[field], form);
        });

        // Check if any field has a validation error
        const hasAnyErrors = Object.values(currentValidationErrors).some(error => !!error);

        return !hasAnyErrors; // Form is valid if no errors are found across all fields
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
        setErrors(fullFormErrors); // Update errors state before checking validity

        // 3. Check validity based on the *latest* errors state
        const tempHasErrors = Object.values(fullFormErrors).some(error => !!error);
        if (tempHasErrors) {
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
            // Append estimatedBudget only if it has a value, otherwise backend might expect a number
            if (form.estimatedBudget !== '') {
                campaignFormData.append('estimatedBudget', form.estimatedBudget);
            }

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

            // Directly using native fetch API
            const url = `${baseURL}${endpoints.advertisement}`;
            const headers: HeadersInit = { 'Accept': 'application/json' };
            const token = localStorage.getItem('token');
            if (token) headers['token'] = token;

            const options: RequestInit = {
                method: "POST",
                headers: headers, // Headers explicitly set, but FormData doesn't need Content-Type set manually
                body: campaignFormData,
            };

            const res = await fetch(url, options);
            const data = await res.json().catch(() => ({ message: res.statusText || "Something went wrong" }));

            if (!res.ok) {
                const errorMessage = data.message || `Error ${res.status}: Failed to create ad campaign.`;
                setApiError(errorMessage);
                // showToast(false, errorMessage); // Assuming showToast is available globally or imported
            } else {
                setSuccessMessage("Ad Campaign Created Successfully!");
                // showToast(true, "Ad Campaign Created Successfully!"); // Assuming showToast is available
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
            }
        } catch (err: any) {
            setApiError(err.message || "An unexpected error occurred during submission.");
            // showToast(false, err.message || "An unexpected error occurred during submission.");
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
    // The button should be disabled if loading OR if the form is not completely valid
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
                        link: form.link, // <--- IMPORTANT: Link is now passed to PreviewPopUp
                    }}
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
                                        // When file is removed, ensure the error state is re-evaluated immediately
                                        // Mark as touched to show error immediately if file is required
                                        setTouched(prev => ({ ...prev, file: true }));
                                        setErrors(prev => ({ ...prev, file: validate('file', null, form) }));
                                        // Manually clear file input element
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
                    {/* Applying getInputClass to the file input itself for border, but message for text */}
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
                        disabled={loading} // Disable during submission
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
                        disabled={loading} // Disable during submission
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
                        className={getInputClass('link')} // This now includes has-valid or has-error
                        value={form.link}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        disabled={loading} // Disable during submission
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
                            disabled={loading} // Disable during submission
                            onWheel={(e) => e.currentTarget.blur()} // Prevent scroll effect
                        />
                    </div>
                    <span className={`input-message ${touched.dailyBudget && errors.dailyBudget ? 'error' : ''}`}>
                        {getHelperMessage('dailyBudget')}
                    </span>
                </div>

                {/* Ad Duration Dates */}
                <div className='date-box'>
                    <label>Ad Duration</label>
                    <div className='date-fields-container'> {/* Container for two date inputs */}
                        <div className='date-input-wrap'> {/* Wrap for Start Date */}
                            <label htmlFor="startDate" className='date-sub-label'>Start Date</label>
                            <input
                                type="date"
                                id="startDate"
                                name="startDate"
                                className={getInputClass('startDate')}
                                value={form.startDate} // Ensure value is bound
                                onChange={handleChange}
                                onBlur={handleBlur}
                                min={new Date().toISOString().split('T')[0]} // Min date is today
                                disabled={loading} // Disable during submission
                            />
                        </div>
                        <div className='date-input-wrap'> {/* Wrap for End Date */}
                            <label htmlFor="endDate" className='date-sub-label'>End Date</label>
                            <input
                                type="date"
                                id="endDate"
                                name="endDate"
                                className={getInputClass('endDate')}
                                value={form.endDate} // Ensure value is bound
                                onChange={handleChange}
                                onBlur={handleBlur}
                                min={form.startDate || new Date().toISOString().split('T')[0]} // Min date is start date or today
                                disabled={loading} // Disable during submission
                            />
                        </div>
                        {/* Error message for dates, will position this below the two inputs */}
                        <span className={`input-message ${touched.endDate && errors.endDate ? 'error' : ''} date-error-message`}>
                            {getHelperMessage('endDate')}
                        </span>
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
                            disabled={loading} // Disable during submission
                            onWheel={(e) => e.currentTarget.blur()} // Prevent scroll effect
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
                        disabled={loading} 
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
                        disabled={loading} 
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

             
                {apiError && <p style={{ color: 'red', marginTop: '15px', textAlign: 'center' }}>Error: {apiError}</p>}
                {successMessage && <p style={{ color: 'green', marginTop: '15px', textAlign: 'center' }}>{successMessage}</p>}

            </div>
        </div>
    );
};

export default Userform;