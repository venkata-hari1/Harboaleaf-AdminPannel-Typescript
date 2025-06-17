

import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../Styles/Userform.css'; // Adjust path
import PreviewPopUp from './PreviewPopUp'; // Adjust path
// Import your provided endpoints and baseURL (no changes to these in this file)
import { endpoints, baseURL } from '../../Utils/Config';
import { showToast } from '../../Utils/Validation'; // Adjust path

// Define the FormState interface to match the data structure that Userform uses internally
// This must align with how data is passed from Monitercompaign's `FullCampaignDetails`
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
    const navigate = useNavigate(); // Hook for navigation

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
        mediaUrl: undefined,
    });

    const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
    const [touched, setTouched] = useState<Partial<Record<keyof FormState, boolean>>>({});
    const [loading, setLoading] = useState<boolean>(false);
    const [apiMessage, setApiMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
    const [showPreview, setShowPreview] = useState<boolean>(false);

    const isEditMode = location.pathname.includes('/edit-campaign');

    // Function to check if a field is required
    // NOTE: `file` is now optional (not required)
    const isFieldRequired = useCallback((name: keyof FormState): boolean => {
        const requiredFields: Array<keyof FormState> = ['title', 'description', 'callToAction', 'link', 'dailyBudget', 'startDate', 'endDate'];
        return requiredFields.includes(name);
    }, []);

    // Validation logic for all fields
    const validate = useCallback((name: keyof FormState, value: any, currentForm: FormState): string => {
        let error = '';

        if (isFieldRequired(name) && (value === null || value === undefined || (typeof value === 'string' && value.trim() === '') || (value instanceof File && value.size === 0))) {
            return 'This field is required';
        }

        switch (name) {
            case 'title':
                if (value && value.length < 4) error = 'Enter at least 4 characters';
                break;
            case 'description':
                if (value && value.length < 10) error = 'Enter at least 10 characters';
                break;
            case 'link':
                if (value && !/^https?:\/\/[^\s$.?#].[^\s]*$/i.test(value)) error = 'Enter a valid URL (e.g., https://yourwebsite.com)';
                break;
            case 'dailyBudget':
                if (value && (isNaN(Number(value)) || Number(value) <= 0)) error = 'Enter a number greater than 0';
                break;
            case 'startDate':
                if (currentForm.endDate && value > currentForm.endDate) error = 'Must be before end date';
                break;
            case 'endDate':
                if (currentForm.startDate && value < currentForm.startDate) error = 'Must be after start date';
                break;
            case 'estimatedBudget':
                if (value && (isNaN(Number(value)) || Number(value) < 0)) error = 'Cannot be negative';
                break;
            case 'file':
                // Completely removed the error for missing file.
                // Now, it only validates size/type if a new file is actually provided (value will be a File object).
                if (value) {
                    const sizeMB = value.size / 1024 / 1024;
                    if (value.type.includes('image') && sizeMB > 1) error = 'Image should be less than 1MB';
                    if (value.type.includes('video') && sizeMB > 2) error = 'Video should be less than 2MB';
                }
                break;
            default:
                break;
        }
        return error;
    }, [isFieldRequired]); // Added isFieldRequired to the dependency array

    // Handler for input changes (text, number, date, file)
    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, files } = e.target;
        let newFormState = { ...form };

        if (files && files.length > 0) {
            const file = files[0];
            newFormState = { ...newFormState, file: file, mediaUrl: undefined }; // Clear mediaUrl when a new file is uploaded
        } else {
            newFormState = { ...newFormState, [name]: value };
        }

        setForm(newFormState);
        setTouched(prev => ({ ...prev, [name]: true })); // Mark as touched on change
        setErrors(prev => ({ ...prev, [name]: validate(name as keyof FormState, (files && files.length > 0) ? files[0] : value, newFormState) })); // Validate on change
    }, [form, validate]);

    // Handler for input blur (losing focus)
    const handleBlur = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, files } = e.target;
        setTouched(prev => ({ ...prev, [name]: true })); // Mark as touched on blur
        setErrors(prev => ({ ...prev, [name]: validate(name as keyof FormState, (files && files.length > 0) ? files[0] : value, form) })); // Validate on blur
    }, [form, validate]);

    // Derived state to check overall form validity
    const isFormValid = useCallback(() => {
        // Check all required fields first
        const requiredFieldsValid = ['title', 'description', 'callToAction', 'link', 'dailyBudget', 'startDate', 'endDate'].every(fieldName => {
            const field = fieldName as keyof FormState;
            // A required field is valid if it has a value AND no error
            return form[field] && !errors[field];
        });

        // Check file validity: if a file is present, it must not have an error
        const fileValid = !form.file || !errors.file;

        // Check estimated budget if it has a value, it must not have an error
        const estimatedBudgetValid = !form.estimatedBudget || !errors.estimatedBudget;

        return requiredFieldsValid && fileValid && estimatedBudgetValid;
    }, [form, errors]);

    // Determine if the publish/update button should be disabled
    const isPublishDisabled = !isFormValid() || loading || Object.values(touched).every(val => val === false); // All fields untouched also disables

    // Populate form if in edit mode
    useEffect(() => {
        if (isEditMode && location.state?.campaign) {
            const campaign = location.state.campaign;
            setForm({
                id: campaign._id, // Set the ID for update operations
                title: campaign.title || '',
                description: campaign.description || '',
                callToAction: campaign.callToAction || '',
                link: campaign.link || '',
                dailyBudget: campaign.dailyBudget !== undefined ? String(campaign.dailyBudget) : '',
                startDate: campaign.startDate ? campaign.startDate.split('T')[0] : '', // Format YYYY-MM-DD
                endDate: campaign.endDate ? campaign.endDate.split('T')[0] : '',     // Format YYYY-MM-DD
                estimatedBudget: campaign.estimatedBudget !== undefined ? String(campaign.estimatedBudget) : '',
                file: null, // No file object initially for edit mode
                mediaUrl: campaign.mediaUrl || undefined, // Store existing media URL
            });
            // Mark all fields as touched for immediate validation feedback in edit mode
            const initialTouched: Partial<Record<keyof FormState, boolean>> = {};
            for (const key in form) {
                if (Object.prototype.hasOwnProperty.call(form, key)) {
                    initialTouched[key as keyof FormState] = true;
                }
            }
            setTouched(initialTouched);
        }
    }, [isEditMode, location.state]);


    // Effect to re-validate form whenever form state changes (especially for interdependent fields like dates)
    useEffect(() => {
        // Only re-validate if any field has been touched
        if (Object.values(touched).some(val => val === true)) {
            const newErrors: Partial<Record<keyof FormState, string>> = {};
            (Object.keys(form) as Array<keyof FormState>).forEach(name => {
                newErrors[name] = validate(name, form[name], form);
            });
            setErrors(newErrors);
        }
    }, [form, touched, validate]);

    const handleSubmit = async () => {
        setLoading(true);
        setApiMessage(null);

        // Mark all fields as touched on submit attempt
        const allTouched: Partial<Record<keyof FormState, boolean>> = {};
        (Object.keys(form) as Array<keyof FormState>).forEach(key => {
            allTouched[key] = true;
        });
        setTouched(allTouched);

        // Re-validate all fields just before submission
        const newErrors: Partial<Record<keyof FormState, string>> = {};
        (Object.keys(form) as Array<keyof FormState>).forEach(name => {
            newErrors[name] = validate(name, form[name], form);
        });
        setErrors(newErrors);

        const currentFormValid = Object.values(newErrors).every(error => !error) &&
                                 ['title', 'description', 'callToAction', 'link', 'dailyBudget', 'startDate', 'endDate'].every(fieldName => {
                                     const field = fieldName as keyof FormState;
                                     return form[field] && form[field] !== ''; // Ensure required fields are not empty strings
                                 });

        if (!currentFormValid) {
            setApiMessage({ text: 'Please correct the errors in the form.', type: 'error' });
            setLoading(false);
            return;
        }

        const formData = new FormData();
        // Append all text/number fields
        Object.keys(form).forEach(key => {
            if (key !== 'file' && key !== 'mediaUrl' && form[key as keyof FormState] !== undefined && form[key as keyof FormState] !== null) {
                formData.append(key, String(form[key as keyof FormState]));
            }
        });

        // Append file if a new one is selected
        if (form.file) {
            formData.append('file', form.file);
        } else if (form.mediaUrl) {
            // If in edit mode and no new file, but there was an existing mediaUrl, retain it
            formData.append('mediaUrl', form.mediaUrl);
        }

        const url = isEditMode ? `${baseURL}${endpoints.updateCampaign}/${form.id}` : `${baseURL}${endpoints.createCampaign}`;
        const method = isEditMode ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method: method,
                body: formData,
                // No 'Content-Type' header needed for FormData; browser sets it automatically
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Something went wrong!');
            }

            const result = await response.json();
            setApiMessage({ text: result.message || 'Operation successful!', type: 'success' });
            showToast(result.message || 'Operation successful!', 'success');
            if (onSubmissionSuccess) {
                onSubmissionSuccess(); // Callback for parent component
            }
            navigate('/monitor-campaigns'); // Navigate back to monitor page
        } catch (error: any) {
            console.error('Submission error:', error);
            setApiMessage({ text: error.message || 'An unexpected error occurred.', type: 'error' });
            showToast(error.message || 'An unexpected error occurred.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDiscard = () => {
        navigate('/monitor-campaigns'); // Go back to monitor campaigns page
    };

    // Helper for input class (applying validation styling)
    const getInputClass = useCallback((name: keyof FormState): string => {
        const baseClass = 'form-textbox';
        if (touched[name] && errors[name]) {
            return `${baseClass} has-error`;
        }

        // Special handling for file input validity class
        if (name === 'file') {
            const isFileStylisticallyValid = (!!form.file || !!form.mediaUrl);

            // If touched and stylistically valid, AND no validation error (only size/type can be an error now)
            if (touched.file && isFileStylisticallyValid && !errors.file) {
                 return `${baseClass} has-valid`;
            }
            // If there is an error for the file (which would be a size/type error now),
            // the first `if` block (`if (touched[name] && errors[name])`) will catch it.
            // So, for the file field, if it's not an error and not stylistically valid (e.g., no file chosen yet),
            // it should just return the baseClass.
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
    }, [form, touched, errors, isFieldRequired, isEditMode]);


    // Helper for displaying messages below inputs
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
            file: isEditMode && form.mediaUrl ? 'Upload new image (<1MB) or video (<2MB) to replace existing' : 'Upload image (<1MB) or video (<2MB) (Optional)',
        };
        // If the field has been touched and has an error, show the specific error message
        // This applies to 'file' field as well for size/type errors
        if (touched[name] && errors[name]) {
            return errors[name] || '';
        }
        // Otherwise, show the general helper message
        return emptyMsgs[name];
    }, [touched, errors, isEditMode, form.mediaUrl]);


    return (
        <div className="form-container">
            <div className="form-wrapper">
                <div className="ad-management-header">
                    <h2>{isEditMode ? 'Edit Campaign' : 'Create New Campaign'}</h2>
                </div>

                {/* Title */}
                <div className='title-box1'>
                    <label htmlFor="title">Campaign Title</label>
                    <div>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            className={getInputClass('title')}
                            placeholder="Enter campaign title"
                            value={form.title}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            maxLength={50}
                            disabled={loading}
                        />
                        <span className={`input-message ${touched.title && errors.title ? 'error' : ''}`}>
                            {getHelperMessage('title')}
                        </span>
                    </div>
                </div>

                {/* Description */}
                <div className='desc-box'>
                    <label htmlFor="description">Description</label>
                    <div>
                        <textarea
                            id="description"
                            name="description"
                            className={getInputClass('description')}
                            placeholder="Describe your campaign"
                            value={form.description}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            maxLength={200}
                            disabled={loading}
                        />
                        <span className={`input-message ${touched.description && errors.description ? 'error' : ''}`}>
                            {getHelperMessage('description')}
                        </span>
                    </div>
                </div>

                {/* Call to Action */}
                <div className='call-action'>
                    <label htmlFor="callToAction">Call to Action</label>
                    <div>
                        <input
                            type="text"
                            id="callToAction"
                            name="callToAction"
                            className={getInputClass('callToAction')}
                            placeholder="e.g., Shop Now, Learn More"
                            value={form.callToAction}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            maxLength={20}
                            disabled={loading}
                        />
                        <span className={`input-message ${touched.callToAction && errors.callToAction ? 'error' : ''}`}>
                            {getHelperMessage('callToAction')}
                        </span>
                    </div>
                </div>

                {/* Link */}
                <div className='link-box'>
                    <label htmlFor="link">Link</label>
                    <div>
                        <input
                            type="url"
                            id="link"
                            name="link"
                            className={getInputClass('link')}
                            placeholder="e.g., https://yourwebsite.com"
                            value={form.link}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            maxLength={100}
                            disabled={loading}
                        />
                        <span className={`input-message ${touched.link && errors.link ? 'error' : ''}`}>
                            {getHelperMessage('link')}
                        </span>
                    </div>
                </div>

                {/* Daily Budget */}
                <div className='budget-box'>
                    <label htmlFor="dailyBudget">Daily Budget</label>
                    <div>
                        <div className={`daily-budget-input-group ${getInputClass('dailyBudget').includes('has-error') ? 'has-error' : ''} ${getInputClass('dailyBudget').includes('has-valid') ? 'has-valid' : ''}`}>
                            <span className="currency-prefix">Rs.</span>
                            <input
                                type="number"
                                id="dailyBudget"
                                name="dailyBudget"
                                className="form-textbox" // Inner input does not get validation class, group does
                                value={form.dailyBudget}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                min="1"
                                disabled={loading}
                            />
                        </div>
                        <span className={`input-message ${touched.dailyBudget && errors.dailyBudget ? 'error' : ''}`}>
                            {getHelperMessage('dailyBudget')}
                        </span>
                    </div>
                </div>

                {/* Ad Media File Upload */}
                <div className='admedia-box'>
                    <label>Ad Media</label>
                    <div className={`file-upload-container-inline ${getInputClass('file').includes('has-error') ? 'has-error-visual' : ''} ${getInputClass('file').includes('has-valid') ? 'has-valid-visual' : ''}`}>
                        <label htmlFor="file1" className='file1-class'>
                            Attach <i className="bi bi-paperclip"></i>
                        </label>
                        <input
                            type="file"
                            id="file1"
                            name="file"
                            className='file-box' // This input itself gets the has-error/valid class via getInputClass, but it's hidden
                            onChange={handleChange}
                            onBlur={handleBlur}
                            accept="image/*,video/*"
                            disabled={loading}
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
                                        setForm(prev => ({ ...prev, file: null, mediaUrl: undefined }));
                                        setTouched(prev => ({ ...prev, file: true }));
                                        // Pass the updated form state to validate to ensure it uses the latest values
                                        setErrors(prev => ({ ...prev, file: validate('file', null, { ...form, file: null, mediaUrl: undefined }) }));
                                        const fileInput = document.getElementById('file1') as HTMLInputElement;
                                        if (fileInput) fileInput.value = ''; // Manually clear file input visual
                                    }}
                                    aria-label="Remove file"
                                    disabled={loading}
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

                {/* Ad Duration */}
                <div className='date-box'>
                    <label>Ad Duration</label>
                    <div className='date-fields-container'>
                        <div className="date-input-wrap">
                            <label htmlFor="startDate" className="date-sub-label">Start Date</label>
                            <input
                                type="date"
                                id="startDate"
                                name="startDate"
                                className={getInputClass('startDate')}
                                value={form.startDate}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                disabled={loading}
                            />
                            <span className={`input-message date-error-message ${touched.startDate && errors.startDate ? 'error' : ''}`}>
                                {getHelperMessage('startDate')}
                            </span>
                        </div>
                        <div className="date-input-wrap">
                            <label htmlFor="endDate" className="date-sub-label">End Date</label>
                            <input
                                type="date"
                                id="endDate"
                                name="endDate"
                                className={getInputClass('endDate')}
                                value={form.endDate}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                disabled={loading}
                            />
                            <span className={`input-message date-error-message ${touched.endDate && errors.endDate ? 'error' : ''}`}>
                                {getHelperMessage('endDate')}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Estimated Budget (Optional) */}
                <div className='budget-box elimination-box'>
                    <label htmlFor="estimatedBudget">Estimated Budget (Optional)</label>
                    <div>
                        <div className={`daily-budget-input-group ${getInputClass('estimatedBudget').includes('has-error') ? 'has-error' : ''} ${getInputClass('estimatedBudget').includes('has-valid') ? 'has-valid' : ''}`}>
                            <span className="currency-prefix">Rs.</span>
                            <input
                                type="number"
                                id="estimatedBudget"
                                name="estimatedBudget"
                                className="form-textbox" // Inner input does not get validation class, group does
                                value={form.estimatedBudget}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                min="0"
                                disabled={loading}
                            />
                        </div>
                        <span className={`input-message ${touched.estimatedBudget && errors.estimatedBudget ? 'error' : ''}`}>
                            {getHelperMessage('estimatedBudget')}
                        </span>
                    </div>
                </div>

                {/* Preview Button */}
                <div className='preview-box'>
                    <label>Preview Ad</label>
                    <button
                        className='preview-button'
                        type="button"
                        onClick={() => setShowPreview(true)}
                        disabled={loading || !isFormValid()} // Disable preview if form is invalid or loading
                        style={{
                            opacity: (!isFormValid() || loading) ? 0.5 : 1,
                            cursor: (!isFormValid() || loading) ? 'not-allowed' : 'pointer'
                        }}
                    >
                        View Preview<i className="bi bi-eye-fill ms-2"></i>
                    </button>
                </div>

                {/* Preview PopUp */}
                {showPreview && (
                    <PreviewPopUp
                        form={form}
                        onClose={() => setShowPreview(false)}
                    />
                )}

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