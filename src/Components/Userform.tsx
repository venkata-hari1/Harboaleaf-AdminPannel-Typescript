import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../Redux/store/Store';
import { createAdCampaign } from '../Redux/Reducers/UserMangement';
import Loader from '../../Utils/Loader';
import { showToast } from '../../Utils/Validation';
import { baseURL } from '../../Utils/Config'; // Ensure baseURL is correctly imported

import '../Styles/Userform.css';
import PreviewPopUp from './PreviewPopUp';

// Define the shape of your form data state
// Keep types consistent with input elements (mostly string for direct input values)
interface FormState {
    title: string;
    description: string;
    callToAction: string;
    link: string;
    location: string;
    allIndia: boolean;
    ageFrom: string; // Stored as string from input, converted to number for payload
    ageTo: string;   // Stored as string from input, converted to number for payload
    gender: string;
    dailyBudget: string; // Stored as string from input, converted to number for payload
    startDate: string;
    endDate: string;
    estimatedBudget: string; // Stored as string from input, converted to number for payload
    placing: string[];
    file: File | null; // This will be uploaded directly to the backend
}

const Userform: React.FC = () => {
    const [state, setState] = useState<boolean>(false); // For PreviewPopUp visibility
    const [form, setForm] = useState<FormState>({
        title: '',
        description: '',
        callToAction: '',
        link: '',
        location: '',
        allIndia: false,
        ageFrom: '',
        ageTo: '',
        gender: '',
        dailyBudget: '',
        startDate: '',
        endDate: '',
        estimatedBudget: '',
        placing: [],
        file: null,
    });

    const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
    const [touched, setTouched] = useState<Partial<Record<keyof FormState, boolean>>>({});
    // uploadProgress will no longer be relevant for frontend S3 direct upload,
    // as file is sent directly to backend. You might remove this state.
    const [uploadProgress, setUploadProgress] = useState<number>(0); 

    const dispatch = useDispatch<AppDispatch>();
    const reduxLoading = useSelector((state: RootState) => state.UserMangment.loading);
    const reduxError = useSelector((state: RootState) => state.UserMangment.error);

    const handlePopup = () => setState(prev => !prev);

    // Helper to get ISO string for dates (e.g., "2025-06-12T00:00:00.000Z")
    const getISODateString = (dateString: string): string => {
        if (!dateString) return '';
        const [year, month, day] = dateString.split('-').map(Number);
        return new Date(Date.UTC(year, month - 1, day, 0, 0, 0)).toISOString();
    };

    // Removed the uploadFileToS3 function as it's no longer used in this workflow.
    // If other parts of your app use it, keep it. Otherwise, delete it.


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
            case 'location':
                if (!currentForm.allIndia && !value) error = 'Location is required if not "All over India"';
                break;
            case 'dailyBudget':
                if (isNaN(Number(value)) || Number(value) <= 0) error = 'Budget must be greater than 0';
                break;
            case 'estimatedBudget':
                if (value && (isNaN(Number(value)) || Number(value) < 0)) error = 'Cannot be negative'; // Estimated budget is optional, but if entered, must be non-negative
                break;
            case 'ageFrom':
            case 'ageTo':
                const numAgeFrom = Number(currentForm.ageFrom);
                const numAgeTo = Number(currentForm.ageTo);

                if (value && (isNaN(Number(value)) || Number(value) < 0)) {
                    error = 'Age must be a positive number';
                } else if (name === 'ageTo' && numAgeFrom && value && numAgeTo < numAgeFrom) {
                    error = 'Max age must be greater than min age';
                }
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
            case 'gender':
                if (!value) error = 'Gender is required';
                break;
            case 'placing':
                if (value.length === 0) error = 'Placing option is required';
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
        } else if (type === 'radio' && name === 'placingRadio') {
            newVal = [value]; // Ensure placing is always an array, even for single selection
            setForm(prev => ({ ...prev, placing: newVal }));
            const placingError = validate('placing', newVal, { ...form, placing: newVal });
            setErrors(prev => ({ ...prev, placing: placingError }));
            setTouched(prev => ({ ...prev, placing: true }));
            return; // Skip default setForm and validation for placing
        }

        setForm(prev => {
            const updatedForm = { ...prev, [name]: newVal };
            const error = validate(name as keyof FormState, newVal, updatedForm);
            setErrors(currentErrors => ({ ...currentErrors, [name]: error }));
            return updatedForm;
        });
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name } = e.target;
        setTouched(prev => ({ ...prev, [name]: true }));

        setErrors(prevErrors => {
            const newErrors = { ...prevErrors };
            const fieldName = name as keyof FormState;
            newErrors[fieldName] = validate(fieldName, form[fieldName], form); // Validate current field

            // Re-validate interdependent fields on blur
            if (fieldName === 'startDate' || fieldName === 'endDate') {
                newErrors.startDate = validate('startDate', form.startDate, form);
                newErrors.endDate = validate('endDate', form.endDate, form);
            }
            if (fieldName === 'ageFrom' || fieldName === 'ageTo') {
                newErrors.ageFrom = validate('ageFrom', form.ageFrom, form);
                newErrors.ageTo = validate('ageTo', form.ageTo, form);
            }
            if (fieldName === 'location' || fieldName === 'allIndia') {
                newErrors.location = validate('location', form.location, form);
            }
            return newErrors;
        });
    };

    const handleAllIndiaChange = () => {
        setForm(prev => {
            const newAllIndia = !prev.allIndia;
            const newLocation = newAllIndia ? '' : prev.location; // Clear location if allIndia is checked
            const updatedForm = {
                ...prev,
                allIndia: newAllIndia,
                location: newLocation,
            };

            setTouched(current => ({ ...current, location: true })); // Mark location as touched to show validation
            setErrors(currentErrors => ({
                ...currentErrors,
                location: validate('location', newLocation, updatedForm), // Re-validate location
            }));
            return updatedForm;
        });
    };

    const getHelperMessage = (name: keyof FormState): string => {
        const emptyMsgs: Record<keyof FormState, string> = {
            title: 'Enter at least 4 characters',
            description: 'Enter at least 10 characters',
            callToAction: 'Example: Learn More',
            link: 'e.g., https://yourwebsite.com',
            location: 'Select a state',
            allIndia: '', // No helper for checkbox
            ageFrom: 'Min age (e.g., 18)',
            ageTo: 'Max age (e.g., 65)',
            gender: 'Select target gender',
            dailyBudget: 'Enter a number > 0',
            startDate: 'Select start date',
            endDate: 'Must be after start date',
            estimatedBudget: 'Optional: Cannot be negative',
            placing: 'Select placement option (Top/Bottom)',
            file: 'Upload image (<1MB) or video (<2MB)',
        };

        // Prioritize error messages if field is touched and has an error
        if (touched[name] && errors[name]) {
            // Special handling for interdependent age fields
            if (name === 'ageFrom' || name === 'ageTo') {
                return errors.ageFrom || errors.ageTo || '';
            }
            return errors[name] || '';
        }
        // Show info messages if no error or not touched yet
        if (name === 'ageFrom' || name === 'ageTo') {
            return emptyMsgs.ageFrom; // Show helper for ageFrom as a general age helper
        }
        return emptyMsgs[name];
    };

    const getInputClass = (name: keyof FormState): string => {
        const baseClass = 'form-textbox';
        // Special handling for interdependent age fields
        if ((name === 'ageFrom' || name === 'ageTo') && ((touched.ageFrom || touched.ageTo) && (errors.ageFrom || errors.ageTo))) {
            return `${baseClass} has-error`;
        }
        if (touched[name] && errors[name]) return `${baseClass} has-error`;
        return baseClass;
    };

    // --- Redux Error Feedback ---
    useEffect(() => {
        if (reduxError) {
            showToast(false, reduxError);
        }
    }, [reduxError]);

    // --- Re-run validation for interdependent fields (on form state changes) ---
    useEffect(() => {
        setErrors(prev => ({
            ...prev,
            endDate: validate('endDate', form.endDate, form),
            startDate: validate('startDate', form.startDate, form),
        }));
    }, [form.startDate, form.endDate]);

    useEffect(() => {
        const ageFromError = validate('ageFrom', form.ageFrom, form);
        const ageToError = validate('ageTo', form.ageTo, form);
        setErrors(prev => ({ ...prev, ageFrom: ageFromError, ageTo: ageToError }));
    }, [form.ageFrom, form.ageTo]);

    useEffect(() => {
        setErrors(prev => ({ ...prev, location: validate('location', form.location, form) }));
    }, [form.location, form.allIndia]);

    useEffect(() => {
        setErrors(prev => ({
            ...prev,
            gender: validate('gender', form.gender, form),
            placing: validate('placing', form.placing, form),
            file: validate('file', form.file, form),
        }));
    }, [form.gender, form.placing, form.file]);

    // --- Form Validity Check ---
    const isFormValid = (): boolean => {
        const allFormFields: Array<keyof FormState> = Object.keys(form) as Array<keyof FormState>;
        let currentValidationErrors: Partial<Record<keyof FormState, string>> = {};

        // Run validation for all fields
        allFormFields.forEach(field => {
            currentValidationErrors[field] = validate(field, form[field], form);
        });

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
            form.gender.trim() !== '' &&
            form.placing.length > 0 &&
            form.file !== null && // Ensure a file is selected
            (form.allIndia || form.location.trim() !== '') && // Location OR All India
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

        // 2. Perform a full validation pass to update `errors` state
        let fullFormErrors: Partial<Record<keyof FormState, string>> = {};
        (Object.keys(form) as Array<keyof FormState>).forEach(key => {
            fullFormErrors[key] = validate(key, form[key], form);
        });
        setErrors(fullFormErrors);

        // 3. Check validity based on the *latest* errors state and explicit checks
        if (!isFormValid()) {
            showToast(false, "Please correct the errors in the form before submitting.");
            return; // Stop if form is not valid
        }

        try {
            // Build the FormData with all fields, including the file directly
            const campaignFormData = new FormData();

            campaignFormData.append('title', form.title);
            campaignFormData.append('description', form.description);
            campaignFormData.append('callToAction', form.callToAction);
            campaignFormData.append('link', form.link);
            campaignFormData.append('dailyBudget', form.dailyBudget);
            campaignFormData.append('estimatedBudget', form.estimatedBudget);

            // Directly append the File object to FormData under the key 'file' as shown in Postman
            if (form.file) {
                campaignFormData.append('file', form.file); // Append the actual File object
            } else {
                // This case should ideally be caught by `isFormValid()`, but good for safety
                showToast(false, 'Ad media file is required.');
                return;
            }

            campaignFormData.append('adDuration[startDate]', getISODateString(form.startDate));
            campaignFormData.append('adDuration[endDate]', getISODateString(form.endDate));

            // Handle 'targetAudience' as a JSON string
            campaignFormData.append('targetAudience', JSON.stringify({
                location: form.allIndia ? 'all over india' : form.location, // Dynamic location based on allIndia
                allIndia: form.allIndia,
                gender: form.gender,
                ageRange: {
                    min: Number(form.ageFrom), // Convert to number
                    max: Number(form.ageTo)    // Convert to number
                }
            }));

         
            form.placing.forEach(p => campaignFormData.append('placing', p));

           
            console.log("Userform.tsx: Sending FormData contents to createAdCampaign API:");
            for (const pair of campaignFormData.entries()) {
                console.log(`${pair[0]}:`, pair[1] instanceof File ? `File: ${pair[1].name} (${pair[1].type})` : pair[1]);
            }

            await dispatch(createAdCampaign(campaignFormData)).unwrap();
            showToast(true, "Ad Campaign Created Successfully!");
      
            setForm({
                title: '', description: '', callToAction: '', link: '',
                location: '', allIndia: false, ageFrom: '', ageTo: '',
                gender: '', dailyBudget: '', startDate: '', endDate: '',
                estimatedBudget: '', placing: [], file: null,
            });
            setErrors({}); // Clear all errors
            setTouched({}); // Reset all touched states
            
        } catch (err: any) {
            console.error("Userform.tsx: Failed to create ad campaign (caught in component):", err);
            
        }
    };


    return (
        <div className="form-container" style={{ position: 'relative' }}>
            {state && (
                <PreviewPopUp
                    handlePopup={handlePopup}
                    formData={{
                        file: form.file,
                        placing: form.placing,
                        title: form.title,
                        description: form.description,
                        callToAction: form.callToAction,
                    }}
                />
            )}

            {reduxLoading && <Loader />} {/* Show loader if Redux is loading */}

            <div className="form-wrapper">
                {/* Title Input */}
                <div className='title-box1'>
                    <label htmlFor="title">Add Title</label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        className={getInputClass('title')}
                        value={form.title}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        disabled={reduxLoading} // Disable during submission
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
                            name="file"
                            className='file-box'
                            onChange={handleChange}
                            onBlur={handleBlur}
                            accept="image/*,video/*"
                            disabled={reduxLoading} // Disable during submission
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
                                    }}
                                    aria-label="Remove file"
                                    disabled={reduxLoading} // Disable during submission
                                >
                                    &times;
                                </button>
                            </div>
                        )}
                    </div>
                    <span className={`input-message ${touched.file && errors.file ? 'error' : 'info'}`}>
                        {getHelperMessage('file')}
                    </span>
                    {/* Removed upload progress display as it's no longer a direct S3 upload from frontend */}
                </div>

                {/* Description Input */}
                <div className='desc-box'>
                    <label htmlFor="description">Add Description</label>
                    <textarea
                        id="description"
                        name="description"
                        className={getInputClass('description')}
                        value={form.description}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        disabled={reduxLoading} // Disable during submission
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
                        disabled={reduxLoading} // Disable during submission
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
                        disabled={reduxLoading} // Disable during submission
                    />
                    <span className={`input-message ${touched.link && errors.link ? 'error' : 'info'}`}>
                        {getHelperMessage('link')}
                    </span>
                </div>

                {/* Target Location Select + All Over India Checkbox */}
                <div className='taget-box'>
                    <label htmlFor="location">Target Location</label>
                    <div className="location-selection-group">
                        <select
                            id="location"
                            name="location"
                            value={form.location}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={getInputClass('location')}
                            disabled={form.allIndia || reduxLoading} // Disable if allIndia or submitting
                        >
                            <option value="">Select State</option>
                            <option value="Andhra Pradesh">Andhra Pradesh</option>
                            <option value="Maharashtra">Maharashtra</option>
                            {/* Add more states as needed */}
                        </select>
                        <label
                            className={`custom-checkbox-container all-india-checkbox-label`}
                        >
                            <input
                                type="checkbox"
                                name="allIndia"
                                checked={form.allIndia}
                                onChange={handleAllIndiaChange}
                                disabled={reduxLoading} // Disable during submission
                            />
                            <span className="checkmark"></span>
                            All over India
                        </label>
                    </div>
                    <span className={`input-message ${touched.location && errors.location ? 'error' : 'info'}`}>
                        {getHelperMessage('location')}
                    </span>
                </div>

                {/* Target Age Range */}
                <div className='target-num'>
                    <label>Target Age Range</label>
                    <div className="d-flex align-items-center">
                        <input
                            type="number"
                            name="ageFrom"
                            placeholder={getHelperMessage('ageFrom')}
                            value={form.ageFrom}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={getInputClass('ageFrom')}
                            min="0"
                            disabled={reduxLoading} // Disable during submission
                        />
                        <span className='mx-2'>Age&nbsp;to</span>
                        <input
                            type="number"
                            name="ageTo"
                            placeholder={getHelperMessage('ageTo')}
                            value={form.ageTo}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={getInputClass('ageTo')}
                            min={form.ageFrom ? String(Number(form.ageFrom)) : "0"}
                            disabled={reduxLoading} // Disable during submission
                        />
                    </div>
                    <span className={`input-message ${
                        (touched.ageFrom || touched.ageTo) && (errors.ageFrom || errors.ageTo) ? 'error' : 'info'
                    }`}>
                        {getHelperMessage('ageFrom')}
                    </span>
                </div>

                {/* Gender Radio Buttons */}
                <div className='gender-box'>
                    <label>Gender</label>
                    <div className="d-flex gender-options">
                        <label className="me-3"><input type='radio' name="gender" value="male" checked={form.gender === 'male'} onChange={handleChange} onBlur={handleBlur} disabled={reduxLoading} /> Male</label>
                        <label className="me-3"><input type='radio' name="gender" value="female" checked={form.gender === 'female'} onChange={handleChange} onBlur={handleBlur} disabled={reduxLoading} /> Female</label>
                        <label><input type='radio' name="gender" value="all" checked={form.gender === 'all'} onChange={handleChange} onBlur={handleBlur} disabled={reduxLoading} /> All</label>
                    </div>
                    <span className={`input-message ${touched.gender && errors.gender ? 'error' : 'info'}`}>
                        {getHelperMessage('gender')}
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
                            disabled={reduxLoading} // Disable during submission
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
                            min={new Date().toISOString().split('T')[0]}
                            disabled={reduxLoading} // Disable during submission
                        />
                        <span className='mx-2'>to</span>
                        <input
                            type="date"
                            name="endDate"
                            className={getInputClass('endDate')}
                            value={form.endDate}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            min={form.startDate || new Date().toISOString().split('T')[0]}
                            disabled={reduxLoading} // Disable during submission
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
                            disabled={reduxLoading} // Disable during submission
                        />
                    </div>
                    <span className={`input-message ${touched.estimatedBudget && errors.estimatedBudget ? 'error' : 'info'}`}>
                        {getHelperMessage('estimatedBudget')}
                    </span>
                </div>

                {/* Placing Radio Buttons */}
                <div className='placing-box'>
                    <label>Placing</label>
                    <div className="placing-options d-flex">
                        <label className="placing-option me-3">
                            <input
                                type="radio"
                                name="placingRadio"
                                value="top"
                                checked={form.placing.includes('top')}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                disabled={reduxLoading} // Disable during submission
                            />
                            Top
                        </label>

                        <label className="placing-option">
                            <input
                                type="radio"
                                name="placingRadio"
                                value="bottom"
                                checked={form.placing.includes('bottom')}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                disabled={reduxLoading} // Disable during submission
                            />
                            Bottom
                        </label>
                    </div>
                    <span className={`input-message ${touched.placing && errors.placing ? 'error' : 'info'}`}>
                        {getHelperMessage('placing')}
                    </span>
                </div>

                {/* Preview Button */}
                <div className='preview-box'>
                    <label>Preview</label>
                    <button
                        className='preview-button'
                        onClick={handlePopup}
                        aria-label="Preview Ad"
                        type="button"
                        disabled={reduxLoading} // Disable during submission
                    >
                        <i className="bi bi-eye-fill"></i>
                    </button>
                </div>

                {/* Submit & Discard */}
                <div className='buttons-ds'>
                    <button
                        className='discard-button'
                        type="button"
                        onClick={() => {
                            setForm({
                                title: '', description: '', callToAction: '', link: '',
                                location: '', allIndia: false, ageFrom: '', ageTo: '',
                                gender: '', dailyBudget: '', startDate: '', endDate: '',
                                estimatedBudget: '', placing: [], file: null,
                            });
                            setErrors({});
                            setTouched({});
                            setUploadProgress(0); // Reset upload progress on discard
                        }}
                        disabled={reduxLoading} // Disable during submission
                    >
                        Discard
                    </button>
                    <button
                        className='submit-button'
                        type="button"
                        disabled={!isFormValid() || reduxLoading} // Disable if invalid or loading
                        style={{
                            opacity: (!isFormValid() || reduxLoading) ? 0.5 : 1,
                            cursor: (!isFormValid() || reduxLoading) ? 'not-allowed' : 'pointer'
                        }}
                        onClick={handleSubmit}
                    >
                        {reduxLoading ? 'Submitting...' : 'Submit'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Userform;