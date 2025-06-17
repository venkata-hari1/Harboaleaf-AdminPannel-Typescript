import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../Styles/Userform.css'; // Adjust path as per your project structure
import PreviewPopUp from './PreviewPopUp'; // Adjust path as per your project structure
import { endpoints, baseURL } from '../../Utils/Config'; // Adjust path as per your project structure
import { showToast } from '../../Utils/Validation'; // Adjust path as per your project structure
import Loader from '../../Utils/Loader';
interface FormState {
    id?: string;
    title: string;
    description: string;
    callToAction: string;
    link: string;
    dailyBudget: string;
    endDate: string;
    estimatedBudget: string;
    file: File | null;
    mediaUrl?: string;
    startDate: string;
}

interface UserformProps {
    onSubmissionSuccess?: () => void;
}

const Userform: React.FC<UserformProps> = ({ onSubmissionSuccess }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { campaignData } = location.state || {};

    const [state, setState] = useState<boolean>(false); // For preview popup visibility
    const [form, setForm] = useState<FormState>(() => {
        // Initialize form state based on campaignData (if in edit mode) or default empty values
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
                // Use 'eliminatedBudget' from API, but store as 'estimatedBudget' in form state
                estimatedBudget: String(campaignData.eliminatedBudget || campaignData.estimatedBudget || ''),
                file: null, // File input is always null initially; user uploads new file
                mediaUrl: campaignData.adMedia?.url || campaignData.file, // Existing media URL
            };
            return mappedData;
        }
        return {
            title: '', description: '', callToAction: '', link: '',
            dailyBudget: '', startDate: '', endDate: '',
            estimatedBudget: '', file: null, mediaUrl: undefined,
        };
    });

    const [loading, setLoading] = useState<boolean>(false);
    const [apiMessage, setApiMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Validation States for each field
    const [titleError, setTitleError] = useState<string | null>(null);
    const [titleTouched, setTitleTouched] = useState<boolean>(false);

    const [fileError, setFileError] = useState<string | null>(null);
    const [fileTouched, setFileTouched] = useState<boolean>(false);

    const [descriptionError, setDescriptionError] = useState<string | null>(null);
    const [descriptionTouched, setDescriptionTouched] = useState<boolean>(false);

    const [callToActionError, setCallToActionError] = useState<string | null>(null);
    const [callToActionTouched, setCallToActionTouched] = useState<boolean>(false);

    const [linkError, setLinkError] = useState<string | null>(null);
    const [linkTouched, setLinkTouched] = useState<boolean>(false);

    const [dailyBudgetError, setDailyBudgetError] = useState<string | null>(null);
    const [dailyBudgetTouched, setDailyBudgetTouched] = useState<boolean>(false);

    const [startDateError, setStartDateError] = useState<string | null>(null);
    const [startDateTouched, setStartDateTouched] = useState<boolean>(false);

    const [endDateError, setEndDateError] = useState<string | null>(null);
    const [endDateTouched, setEndDateTouched] = useState<boolean>(false);

    const [estimatedBudgetError, setEstimatedBudgetError] = useState<string | null>(null);
    const [estimatedBudgetTouched, setEstimatedBudgetTouched] = useState<boolean>(false);


    const isEditMode = !!campaignData && !!campaignData._id;

    // Callback for preview popup toggle
    const handlePopup = useCallback(() => setState(prev => !prev), []);

    // Helper to format date for API
    const getISODateString = useCallback((dateString: string): string => {
        if (!dateString) return '';
        const [year, month, day] = dateString.split('-').map(Number);
        // Using UTC to avoid timezone issues with date inputs
        return new Date(Date.UTC(year, month - 1, day, 0, 0, 0)).toISOString();
    }, []);

    // --- All Validation Functions ---

    const validateTitle = useCallback((titleValue: string): string | null => {
        if (titleValue.trim().length < 4) {
            return 'Title must be at least 4 characters.';
        }
        return null;
    }, []);

    const validateFile = useCallback((file: File | null, existingMediaUrl: string | undefined): string | null => {
        if (file) {
            const fileSizeMB = file.size / (1024 * 1024);
            if (file.type.startsWith('image/') && fileSizeMB > 1) {
                return 'Image file size must be less than 1MB.';
            } else if (file.type.startsWith('video/') && fileSizeMB > 2) {
                return 'Video file size must be less than 2MB.';
            }
        }
        // If in edit mode and there's an existing media URL, a new file isn't strictly required
        if (!isEditMode && !file) { // Only require a file for new campaigns if no existing media
            return 'Media file is required for new campaigns.';
        }
        return null;
    }, [isEditMode]);

    const validateDescription = useCallback((descriptionValue: string): string | null => {
        if (descriptionValue.trim().length < 10) {
            return 'Description must be at least 10 characters.';
        }
        return null;
    }, []);

    const validateCallToAction = useCallback((ctaValue: string): string | null => {
        if (ctaValue.trim().length === 0) {
            return 'Call to action cannot be empty.';
        }
        return null;
    }, []);

    const validateLink = useCallback((linkValue: string): string | null => {
        if (linkValue.trim().length === 0) {
            return 'Link cannot be empty.';
        }
        // Basic URL regex (can be more robust if needed)
        const urlRegex = new RegExp(
            '^(https?:\\/\\/)?' + // protocol
            '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)*[a-z\\d]([a-z\\d-]*[a-z\\d])*|' + // domain name
            '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
            '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
            '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
            '(\\#[-a-z\\d_]*)?$', // fragment locator
            'i'
        );
        if (!urlRegex.test(linkValue)) {
            return 'Please enter a valid URL (e.g., https://yourwebsite.com).';
        }
        return null;
    }, []);

    const validateDailyBudget = useCallback((budgetValue: string): string | null => {
        const budget = parseFloat(budgetValue);
        if (isNaN(budget) || budget <= 0) {
            return 'Daily budget must be a positive number.';
        }
        return null;
    }, []);

    const validateEstimatedBudget = useCallback((budgetValue: string): string | null => {
        if (budgetValue.trim() === '') {
            return null; // Optional field, no error if empty
        }
        const budget = parseFloat(budgetValue);
        if (isNaN(budget) || budget < 0) {
            return 'Estimated budget must be a non-negative number.';
        }
        return null;
    }, []);

    const validateDates = useCallback((startDate: string, endDate: string): { startDate: string | null, endDate: string | null } => {
        let startErr: string | null = null;
        let endErr: string | null = null;

        if (!startDate) {
            startErr = '';
        }
        if (!endDate) {
            endErr = '';
        }

        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Normalize to start of day for comparison

            // For new campaigns, start date can't be in past. For edit mode, it can be if it was already in the past.
            if (start < today && !isEditMode) {
                startErr = '';
            }

            if (end < start) {
                endErr = '.';
            }
        }

        return { startDate: startErr, endDate: endErr };
    }, [isEditMode]);

    // --- New Helper: Check all form errors for overall validity ---
    // This function checks the validity of all required fields based on their current values
    // It's used for enabling/disabling the submit button and for the final check before API call.
    const getAllCurrentErrors = useCallback(() => {
        const dateErrors = validateDates(form.startDate, form.endDate);

        const hasError =
            validateTitle(form.title) !== null ||
            validateDescription(form.description) !== null ||
            validateCallToAction(form.callToAction) !== null ||
            validateLink(form.link) !== null ||
            validateDailyBudget(form.dailyBudget) !== null ||
            validateEstimatedBudget(form.estimatedBudget) !== null ||
            validateFile(form.file, form.mediaUrl) !== null ||
            dateErrors.startDate !== null ||
            dateErrors.endDate !== null;

        return hasError;
    }, [
        form.title, form.description, form.callToAction, form.link,
        form.dailyBudget, form.startDate, form.endDate, form.file, form.mediaUrl, form.estimatedBudget,
        validateTitle, validateDescription, validateCallToAction, validateLink,
        validateDailyBudget, validateEstimatedBudget, validateFile, validateDates
    ]);


    // --- Effect for loading campaign data and resetting form/validation states ---
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
                file: null,
                mediaUrl: campaignData.adMedia?.url || campaignData.file,
            };
            setForm(mappedData);
        } else {
            setForm({
                title: '', description: '', callToAction: '', link: '',
                dailyBudget: '', startDate: '', endDate: '',
                estimatedBudget: '', file: null, mediaUrl: undefined,
            });
        }
        // Reset all validation states on campaign load or new form mount
        setTitleError(null); setTitleTouched(false);
        setFileError(null); setFileTouched(false);
        setDescriptionError(null); setDescriptionTouched(false);
        setCallToActionError(null); setCallToActionTouched(false);
        setLinkError(null); setLinkTouched(false);
        setDailyBudgetError(null); setDailyBudgetTouched(false);
        setStartDateError(null); setStartDateTouched(false);
        setEndDateError(null); setEndDateTouched(false);
        setEstimatedBudgetError(null); setEstimatedBudgetTouched(false);

        setApiMessage(null); // Clear any previous API messages
    }, [campaignData]);

    // --- handleChange: Updates form state and performs immediate validation ---
    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type, files } = e.target as HTMLInputElement;
        let newVal: any = value;

        setForm(prev => {
            const updatedForm = { ...prev };
            if (type === 'file') {
                newVal = files?.[0] || null;
                if (newVal) {
                    updatedForm.mediaUrl = undefined; // Clear existing media URL if new file is selected
                }
                updatedForm.file = newVal;
            } else {
                updatedForm[name as keyof FormState] = newVal;
            }
            return updatedForm;
        });

        // Validate specific fields on change for immediate feedback
        switch (name) {
            case 'title':
                setTitleError(validateTitle(newVal));
                break;
            case 'file':
                setFileTouched(true); // Mark as touched immediately for file input
                setFileError(validateFile(files?.[0] || null, form.mediaUrl));
                break;
            case 'description':
                setDescriptionError(validateDescription(newVal));
                break;
            case 'callToAction':
                setCallToActionError(validateCallToAction(newVal));
                break;
            case 'link':
                setLinkError(validateLink(newVal));
                break;
            case 'dailyBudget':
                setDailyBudgetError(validateDailyBudget(newVal));
                break;
            case 'estimatedBudget':
                setEstimatedBudgetError(validateEstimatedBudget(newVal));
                break;
            case 'startDate':
            case 'endDate':
                // For dates, validate both together as they are interdependent.
                // Use the new value for the field currently being changed, and existing state for the other.
                const currentStartDate = name === 'startDate' ? newVal : form.startDate;
                const currentEndDate = name === 'endDate' ? newVal : form.endDate;
                const { startDate: sErr, endDate: eErr } = validateDates(currentStartDate, currentEndDate);
                setStartDateError(sErr);
                setEndDateError(eErr);
                break;
            default:
                break;
        }
        setApiMessage(null); // Clear API message on user input
    }, [
        validateTitle, validateFile, validateDescription, validateCallToAction,
        validateLink, validateDailyBudget, validateEstimatedBudget, validateDates,
        form.mediaUrl, form.startDate, form.endDate
    ]);

    // --- handleBlur: Marks field as touched and re-validates on blur ---
    const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type, files } = e.target as HTMLInputElement;

        // Mark specific fields as touched and re-validate on blur
        switch (name) {
            case 'title':
                setTitleTouched(true);
                setTitleError(validateTitle(value));
                break;
            case 'file':
                setFileTouched(true);
                setFileError(validateFile(files?.[0] || form.file, form.mediaUrl));
                break;
            case 'description':
                setDescriptionTouched(true);
                setDescriptionError(validateDescription(value));
                break;
            case 'callToAction':
                setCallToActionTouched(true);
                setCallToActionError(validateCallToAction(value));
                break;
            case 'link':
                setLinkTouched(true);
                setLinkError(validateLink(value));
                break;
            case 'dailyBudget':
                setDailyBudgetTouched(true);
                setDailyBudgetError(validateDailyBudget(value));
                break;
            case 'estimatedBudget':
                setEstimatedBudgetTouched(true);
                setEstimatedBudgetError(validateEstimatedBudget(value));
                break;
            case 'startDate':
                setStartDateTouched(true);
                const { startDate: sErr1, endDate: eErr1 } = validateDates(value, form.endDate);
                setStartDateError(sErr1);
                setEndDateError(eErr1);
                break;
            case 'endDate':
                setEndDateTouched(true);
                const { startDate: sErr2, endDate: eErr2 } = validateDates(form.startDate, value);
                setStartDateError(sErr2); // Update start date error in case end date invalidates it
                setEndDateError(eErr2);
                break;
            default:
                break;
        }
    }, [
        validateTitle, validateFile, validateDescription, validateCallToAction,
        validateLink, validateDailyBudget, validateEstimatedBudget, validateDates,
        form.file, form.mediaUrl, form.startDate, form.endDate
    ]);


    // --- Helper for displaying messages based on touched and error states ---
    const getHelperMessage = useCallback((name: keyof FormState): string => {
        switch (name) {
            case 'title':
                return (titleTouched && titleError) || 'Title should be at least 4 characters.';
            case 'file':
                return (fileTouched && fileError) || `Upload media (Optional for edit, required for new). Image < 1MB, video < 2MB. ${isEditMode && form.mediaUrl ? 'Current media available.' : ''}`;
            case 'description':
                return (descriptionTouched && descriptionError) || 'Description should be at least 10 characters.';
            case 'callToAction':
                return (callToActionTouched && callToActionError) || 'e.g., Learn More, Shop Now';
            case 'link':
                return (linkTouched && linkError) || 'Link must be a valid URL (e.g., https://yourwebsite.com).';
            case 'dailyBudget':
                return (dailyBudgetTouched && dailyBudgetError) || 'Amount entered must be always greater than 0.';
            case 'startDate':
                return (startDateTouched && startDateError) || 'Select start date.';
            case 'endDate':
                // End date message should consider both its own error and if start date is invalidating it.
                if (endDateTouched && endDateError) return endDateError;
                if (startDateTouched && startDateError && !form.endDate) return "Select end date."; // If start date is bad, but end date is empty, prompt for end date.
                return 'End date should be always on or after the start date.';
            case 'estimatedBudget':
                return (estimatedBudgetTouched && estimatedBudgetError) || 'Optional: estimated total budget (non-negative).';
            default:
                return '';
        }
    }, [
        isEditMode, form.mediaUrl, form.endDate,
        titleTouched, titleError,
        fileTouched, fileError,
        descriptionTouched, descriptionError,
        callToActionTouched, callToActionError,
        linkTouched, linkError,
        dailyBudgetTouched, dailyBudgetError,
        startDateTouched, startDateError,
        endDateTouched, endDateError,
        estimatedBudgetTouched, estimatedBudgetError
    ]);

    // --- Helper for applying CSS classes based on touched and error states ---
    const getInputClass = useCallback((name: keyof FormState): string => {
        const baseClass = 'form-textbox';
        let hasError = false;

        switch (name) {
            case 'title':
                hasError = titleTouched && titleError !== null;
                break;
            case 'file':
                hasError = fileTouched && fileError !== null;
                // For file, we apply to a different class (`file1-class`) on the label, not the input itself.
                return `file1-class${hasError ? ' input-error' : ''}`;
            case 'description':
                hasError = descriptionTouched && descriptionError !== null;
                break;
            case 'callToAction':
                hasError = callToActionTouched && callToActionError !== null;
                break;
            case 'link':
                hasError = linkTouched && linkError !== null;
                break;
            case 'dailyBudget':
                hasError = dailyBudgetTouched && dailyBudgetError !== null;
                break;
            case 'startDate':
                hasError = startDateTouched && startDateError !== null;
                break;
            case 'endDate':
                hasError = endDateTouched && endDateError !== null;
                break;
            case 'estimatedBudget':
                hasError = estimatedBudgetTouched && estimatedBudgetError !== null;
                break;
            default:
                break;
        }
        return `${baseClass}${hasError ? ' input-error' : ''}`;
    }, [
        titleTouched, titleError, fileTouched, fileError,
        descriptionTouched, descriptionError, callToActionTouched, callToActionError,
        linkTouched, linkError, dailyBudgetTouched, dailyBudgetError,
        startDateTouched, startDateError, endDateTouched, endDateError,
        estimatedBudgetTouched, estimatedBudgetError
    ]);

    // --- Publish button enablement logic ---
    // The button is disabled if loading OR if any field (even untouched) has a validation error
    const isPublishDisabled = loading || getAllCurrentErrors();

    // Preview button disabled if essential fields for preview are missing
    const isPreviewDisabled = loading ||
        !form.title ||
        !form.description ||
        !form.callToAction ||
        !form.link ||
        (!form.file && !form.mediaUrl);


    // --- Form Submission Handler ---
    const handleSubmit = async () => {
        // 1. Mark ALL fields as touched to ensure all error messages are visible immediately
        //    after a submission attempt, even if fields were skipped.
        setTitleTouched(true);
        setDescriptionTouched(true);
        setCallToActionTouched(true);
        setLinkTouched(true);
        setDailyBudgetTouched(true);
        setStartDateTouched(true);
        setEndDateTouched(true);
        setFileTouched(true);
        setEstimatedBudgetTouched(true);

        // 2. Re-run all validations and update their respective error states for UI feedback.
        //    These `setXError` calls will be batched by React.
        setTitleError(validateTitle(form.title));
        setDescriptionError(validateDescription(form.description));
        setCallToActionError(validateCallToAction(form.callToAction));
        setLinkError(validateLink(form.link));
        setDailyBudgetError(validateDailyBudget(form.dailyBudget));
        setEstimatedBudgetError(validateEstimatedBudget(form.estimatedBudget));
        setFileError(validateFile(form.file, form.mediaUrl));
        const { startDate: sErr, endDate: eErr } = validateDates(form.startDate, form.endDate);
        setStartDateError(sErr);
        setEndDateError(eErr);

        // 3. Perform a final check for any errors based on the current form values.
        //    We use `getAllCurrentErrors()` here, which directly checks the form values
        //    for errors, ensuring we don't rely on potentially async state updates
        //    from the `setXError` calls in this same function execution.
        if (getAllCurrentErrors()) {
            showToast(false, "Please correct the errors in the form before submitting.");
            return; // Stop submission if there are errors
        }

        // If no errors, proceed with API call
        setLoading(true);
        setApiMessage(null);

        try {
            const campaignFormData = new FormData();

            campaignFormData.append('title', form.title);
            campaignFormData.append('description', form.description);
            campaignFormData.append('callToAction', form.callToAction);
            campaignFormData.append('link', form.link);
            campaignFormData.append('dailyBudget', form.dailyBudget);

            // Corrected API parameter name: 'eliminatedBudget'
            if (form.estimatedBudget !== '') {
                campaignFormData.append('eliminatedBudget', form.estimatedBudget);
            }

            if (form.file) {
                campaignFormData.append('file', form.file);
            } else if (isEditMode && form.mediaUrl) {
                // If in edit mode and no new file selected, but there was an existing media,
                // we might need to send a flag to keep existing media or ensure backend handles its absence.
                // For simplicity, we assume if `file` is null, and `mediaUrl` exists, backend keeps existing.
                // If backend requires an explicit signal, add: campaignFormData.append('keepExistingMedia', 'true');
            }


            campaignFormData.append('adDuration[startDate]', getISODateString(form.startDate));
            campaignFormData.append('adDuration[endDate]', getISODateString(form.endDate));

            const url = isEditMode ? `${baseURL}${endpoints.updatead}/${form.id}` : `${baseURL}${endpoints.advertisement}`;
            const method = isEditMode ? "PATCH" : "POST";

            const headers: HeadersInit = { 'Accept': 'application/json' };
            const token = localStorage.getItem('token');
            if (token) headers['token'] = token;

            const options: RequestInit = {
                method: method,
                headers: headers,
                body: campaignFormData,
            };

            // FormData sets its own Content-Type header with boundary, so we remove it explicitly.
            delete (options.headers as any)['Content-Type'];


            const res = await fetch(url, options);
            const data = await res.json().catch(() => ({ message: res.statusText || "Something went wrong" }));

            if (!res.ok) {
                const errorMessage = data.message || `Error ${res.status}: Failed to ${isEditMode ? 'update' : 'create'} ad campaign.`;
                setApiMessage({ type: 'error', text: errorMessage });
                showToast(false, errorMessage);
            } else {
                setApiMessage({ type: 'success', text: `Ad Campaign ${isEditMode ? 'Updated' : 'Created'} Successfully!` });
                showToast(true, `Ad Campaign ${isEditMode ? 'Updated' : 'Created'} Successfully!`);

                onSubmissionSuccess?.(); // Callback for parent component

                if (!isEditMode) {
                    // Reset form and validation states for new campaign creation success
                    setForm({
                        title: '', description: '', callToAction: '', link: '',
                        dailyBudget: '', startDate: '', endDate: '',
                        estimatedBudget: '', file: null, mediaUrl: undefined,
                    });
                    const fileInput = document.getElementById('file1') as HTMLInputElement;
                    if (fileInput) fileInput.value = '';
                    // Reset all specific validation states
                    setTitleError(null); setTitleTouched(false);
                    setFileError(null); setFileTouched(false);
                    setDescriptionError(null); setDescriptionTouched(false);
                    setCallToActionError(null); setCallToActionTouched(false);
                    setLinkError(null); setLinkTouched(false);
                    setDailyBudgetError(null); setDailyBudgetTouched(false);
                    setStartDateError(null); setStartDateTouched(false);
                    setEndDateError(null); setEndDateTouched(false);
                    setEstimatedBudgetError(null); setEstimatedBudgetTouched(false);
                }
            }
        } catch (err: any) {
            setApiMessage({ type: 'error', text: err.message || "An unexpected error occurred during submission." });
            showToast(false, err.message || "An unexpected error occurred during submission.");
        } finally {
            setLoading(false);
        }
    };

    // --- Discard Handler: Resets form to initial or empty state ---
    const handleDiscard = useCallback(() => {
        if (campaignData) {
            // Revert to original campaign data if in edit mode
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
                file: null,
                mediaUrl: campaignData.adMedia?.url || campaignData.file,
            };
            setForm(mappedData);
        } else {
            // Clear form for new campaign
            setForm({
                title: '', description: '', callToAction: '', link: '',
                dailyBudget: '', startDate: '', endDate: '',
                estimatedBudget: '', file: null, mediaUrl: undefined,
            });
        }
        const fileInput = document.getElementById('file1') as HTMLInputElement;
        if (fileInput) fileInput.value = ''; // Clear file input display
        setApiMessage(null); // Clear API messages
        setLoading(false); // Ensure loading is off

        // Reset all specific validation states on discard
        setTitleError(null); setTitleTouched(false);
        setFileError(null); setFileTouched(false);
        setDescriptionError(null); setDescriptionTouched(false);
        setCallToActionError(null); setCallToActionTouched(false);
        setLinkError(null); setLinkTouched(false);
        setDailyBudgetError(null); setDailyBudgetTouched(false);
        setStartDateError(null); setStartDateTouched(false);
        setEndDateError(null); setEndDateTouched(false);
        setEstimatedBudgetError(null); setEstimatedBudgetTouched(false);
    }, [campaignData]);

    // Calculate min date for startDate input dynamically
    const todayISO = new Date().toISOString().split('T')[0];
    const minStartDateForInput = isEditMode && campaignData?.adDuration?.startDate &&
                                 new Date(campaignData.adDuration.startDate) < new Date(todayISO)
        ? new Date(campaignData.adDuration.startDate).toISOString().split('T')[0] // Allow displaying past original start date in edit mode
        : todayISO; // For new campaigns or future original start dates, min is today

                          
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
                        link: form.link,
                        mediaUrl: form.mediaUrl
                    } as any}
                />
            )}

            {loading && <p style={{ color: 'white', textAlign: 'center', margin: '10px 0' }}>Processing...</p>}

            <div className="form-wrapper">
                <h5>{isEditMode ? 'Edit Ad Campaign' : 'Create New Ad Campaign'}</h5>

                {/* Ad Title */}
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
                        disabled={loading}
                    />
                    <span className={`input-message ${titleTouched && titleError ? 'error-message' : ''}`}>
                        {getHelperMessage('title')}
                    </span>
                </div>

                {/* Ad Media */}
                <div className='admedia-box'>
                    <label>Ad Media</label>
                    <div className="file-upload-container-inline">
                        <label htmlFor="file1" className={`file1-class ${getInputClass('file')}`}>
                            Attach <i className="bi bi-paperclip"></i>
                        </label>
                        <input
                            type="file"
                            id="file1"
                            name="file"
                            className="file-box"
                            onChange={handleChange}
                            onBlur={handleBlur}
                            accept="image/*,video/*"
                            disabled={loading}
                        />
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
                                        const fileInput = document.getElementById('file1') as HTMLInputElement;
                                        if (fileInput) fileInput.value = '';
                                        setFileError(null); // Clear error on removal
                                        setFileTouched(false); // Reset touched state as well
                                    }}
                                    aria-label="Remove file"
                                    disabled={loading}
                                >
                                    &times;
                                </button>
                            </div>
                        )}
                    </div>
                    <span className={`input-message ${fileTouched && fileError ? 'error-message' : ''}`}>
                        {getHelperMessage('file')}
                    </span>
                </div>

                {/* Ad Description */}
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
                    <span className={`input-message ${descriptionTouched && descriptionError ? 'error-message' : ''}`}>
                        {getHelperMessage('description')}
                    </span>
                </div>

                {/* Call To Action */}
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
                    <span className={`input-message ${callToActionTouched && callToActionError ? 'error-message' : ''}`}>
                        {getHelperMessage('callToAction')}
                    </span>
                </div>

                {/* Link */}
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
                    <span className={`input-message ${linkTouched && linkError ? 'error-message' : ''}`}>
                        {getHelperMessage('link')}
                    </span>
                </div>

                {/* Daily Budget */}
                <div className='budget-box'>
                    <label htmlFor="dailyBudget">Daily Budget</label>
                    <div className={`daily-budget-input-group ${getInputClass('dailyBudget')}`}>
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
                            onWheel={(e) => e.currentTarget.blur()} // Prevents number input from changing on scroll
                        />
                    </div>
                    <span className={`input-message ${dailyBudgetTouched && dailyBudgetError ? 'error-message' : ''}`}>
                        {getHelperMessage('dailyBudget')}
                    </span>
                </div>

                {/* Ad Duration */}
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
                                min={minStartDateForInput} // Dynamically set min date based on edit mode and existing data
                                disabled={loading}
                            />
                            <span className={`input-message ${startDateTouched && startDateError ? 'error-message' : ''}`}>
                                {getHelperMessage('startDate')}
                            </span>
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
                                min={form.startDate || todayISO} // End date cannot be before start date, or today if start is empty
                                disabled={loading}
                            />
                            <span className={`input-message ${endDateTouched && endDateError ? 'error-message' : ''}`}>
                                {getHelperMessage('endDate')}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Estimated Budget (Optional) */}
                <div className='budget-box'>
                    <label htmlFor="estimatedBudget">Estimated Budget</label>
                    <div className={`daily-budget-input-group ${getInputClass('estimatedBudget')}`}>
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
                    <span className={`input-message ${estimatedBudgetTouched && estimatedBudgetError ? 'error-message' : ''}`}>
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

                {/* Action Buttons */}
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
                    disabled={isPublishDisabled || loading} // Disable button while loading
                    style={{
                        opacity: (isPublishDisabled || loading) ? 0.5 : 1,
                        cursor: (isPublishDisabled || loading) ? 'not-allowed' : 'pointer'
                    }}
                    onClick={handleSubmit}
                >
                    {loading ? (
                        <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Processing...
                        </>
                    ) : (isEditMode ? 'Update Campaign' : 'Publish Campaign')}
                </button>
                </div>

                {apiMessage && (
                    <p style={{ color: apiMessage.type === 'error' ? 'red' : 'green', marginTop: '15px', textAlign: 'center' }}>
                        {apiMessage.text}
                    </p>
                )}
            </div>
            {/* THE SIMPLE LOADING OVERLAY */}
            {loading && (
                <div style={{
                    position: 'fixed', // Covers the entire viewport
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: 'rgba(0, 0, 0, 0.6)', // Semi-transparent black background
                    zIndex: 9999, // Ensure it's on top of everything
                }}>
                    <Loader /> {/* Your ring loader component */}
                </div>
            )}
        </div>
    );
};

export default Userform;