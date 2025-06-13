import React, { useState, useEffect } from 'react';
import '../Styles/Userform.css';
import PreviewPopUp from './PreviewPopUp';

interface FormState {
  title: string;
  description: string;
  callToAction: string;
  link: string;
  location: string;
  allIndia: boolean; // State for "All over India" option
  ageFrom: string;
  ageTo: string;
  gender: string;
  dailyBudget: string;
  startDate: string;
  endDate: string;
  eliminatedBudget: string;
  placing: string[];
  file: File | null;
}

const Userform: React.FC = () => {
  const [state, setState] = useState<boolean>(false);
  const [form, setForm] = useState<FormState>({
    title: '',
    description: '',
    callToAction: '',
    link: '',
    location: '',
    allIndia: false, // Initialize to false
    ageFrom: '',
    ageTo: '',
    gender: '',
    dailyBudget: '',
    startDate: '',
    endDate: '',
    eliminatedBudget: '',
    placing: [],
    file: null,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof FormState, boolean>>>({});

  const handlePopup = () => setState(prev => !prev);

  const validate = (name: keyof FormState, value: any): string => {
    let error = '';
    // A more robust URL regex, ensuring http/https and a domain
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
        // Validation for location: required ONLY if 'allIndia' is false
        if (!form.allIndia && !value) error = 'Location is required if not "All over India"';
        break;
      case 'dailyBudget':
        if (isNaN(Number(value)) || Number(value) <= 0) error = 'Budget must be greater than 0';
        break;
      case 'eliminatedBudget':
        if (isNaN(Number(value)) || Number(value) < 0) error = 'Cannot be negative';
        break;
      case 'ageFrom':
      case 'ageTo':
        if (value && (isNaN(Number(value)) || Number(value) < 0)) error = 'Age must be a positive number';
        if (name === 'ageTo' && form.ageFrom && value && Number(value) < Number(form.ageFrom)) {
          error = 'Max age must be greater than min age';
        }
        break;
      case 'startDate':
      case 'endDate':
        if (form.startDate && form.endDate) {
          const start = new Date(form.startDate);
          const end = new Date(form.endDate);
          if (end <= start) {
            error = 'End date must be after start date';
          }
        }
        break;
      case 'file':
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
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type, files } = e.target as HTMLInputElement;
    let newVal: any = value;

    if (type === 'file') {
      newVal = files?.[0] || null;
    } else if (type === 'radio' && name === 'placingRadio') {
      newVal = [value];
      setForm(prev => ({ ...prev, placing: newVal }));
      setErrors(prev => ({ ...prev, placing: '' }));
      return;
    }

    setForm(prev => ({ ...prev, [name]: newVal }));
    const error = validate(name as keyof FormState, newVal);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validate(name as keyof FormState, form[name as keyof FormState]);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  // Renamed from handleAllIndiaClick to handleAllIndiaChange
  const handleAllIndiaChange = () => {
    setForm(prev => ({
      ...prev,
      allIndia: !prev.allIndia, // Toggle the allIndia state
      location: prev.allIndia ? '' : prev.location, // Clear location if enabling allIndia
    }));
    setErrors(prev => ({ ...prev, location: '' })); // Clear location error on toggle
    setTouched(prev => ({ ...prev, location: true })); // Mark location as touched to update validation
  };

  const getHelperMessage = (name: keyof FormState): string => {
    const emptyMsgs: Record<keyof FormState, string> = {
      title: 'Enter at least 4 characters',
      description: 'Enter at least 10 characters',
      callToAction: 'Example: Learn More',
      link: 'e.g., https://yourwebsite.com', // Updated helper message for link
      location: 'Select a state',
      allIndia: '', // No specific helper message for the checkbox itself
      ageFrom: 'Min age (e.g., 18)',
      ageTo: 'Max age (e.g., 65)',
      gender: 'Select target gender',
      dailyBudget: 'Enter a number > 0',
      startDate: 'Select start date',
      endDate: 'Must be after start date',
      eliminatedBudget: 'Optional: Cannot be negative',
      placing: 'Select placement option',
      file: 'Upload image (<1MB) or video (<2MB)',
    };

    if (!touched[name]) return emptyMsgs[name];
    return errors[name] || '';
  };

  const getInputClass = (name: keyof FormState): string => {
    const baseClass = 'form-textbox';
    if (touched[name] && errors[name]) return `${baseClass} has-error`;
    return baseClass;
  };

  useEffect(() => {
    if (touched.startDate || touched.endDate) {
      const error = validate('endDate', form.endDate);
      setErrors(prev => ({
        ...prev,
        endDate: error
      }));
    }
  }, [form.startDate, form.endDate, touched.startDate, touched.endDate]);

  useEffect(() => {
    if (touched.ageFrom || touched.ageTo) {
      const ageToError = validate('ageTo', form.ageTo);
      setErrors(prev => ({ ...prev, ageTo: ageToError }));

      const ageFromError = validate('ageFrom', form.ageFrom);
      setErrors(prev => ({ ...prev, ageFrom: ageFromError }));
    }
  }, [form.ageFrom, form.ageTo, touched.ageFrom, touched.ageTo]);

  // CORRECTED: Validate location only if it has been touched
  useEffect(() => {
    if (touched.location) {
      const locationError = validate('location', form.location);
      setErrors(prev => ({ ...prev, location: locationError }));
    } else {
      // If location is not touched, ensure no error message is displayed
      setErrors(prev => {
        const newErrors = { ...prev };
        // Only delete if the error specifically belongs to location
        if (newErrors.location) {
          delete newErrors.location;
        }
        return newErrors;
      });
    }
  }, [form.location, form.allIndia, touched.location]);


  const isFormValid = (): boolean => {
    const requiredFields: Array<keyof FormState> = [
      'title', 'description', 'callToAction', 'link', 'dailyBudget',
      'startDate', 'endDate', 'gender', 'placing'
    ];

    // Location is conditionally required
    if (!form.allIndia) {
      requiredFields.push('location');
    }

    const allRequiredFieldsFilledAndValid = requiredFields.every(field => {
      if (field === 'gender') {
        return !!form[field] && validate(field, form[field]) === '';
      }
      if (field === 'placing') {
        return form[field].length > 0;
      }
      if (field === 'location' && form.allIndia) {
          return true; // If allIndia is true, location is not required
      }
      // For all other fields, check if value exists and validation passes
      return !!form[field] && validate(field, form[field]) === '';
    });

    // Also check for general errors not caught by 'requiredFields' logic
    const noOtherErrors = Object.values(errors).every(error => !error);

    return allRequiredFieldsFilledAndValid && noOtherErrors;
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
            />
            {form.file && (
              <div className="file-info-inline">
                <span className="file-name">{form.file.name}</span>
                <button
                  type="button"
                  className="file-remove"
                  onClick={() => {
                    setForm(prev => ({ ...prev, file: null }));
                    setErrors(prev => ({ ...prev, file: '' }));
                    setTouched(prev => ({ ...prev, file: false }));
                  }}
                  aria-label="Remove file"
                >
                  &times;
                </button>
              </div>
            )}
          </div>
          {(touched.file && errors.file) && (
            <p className="error-msg">{errors.file}</p>
          )}
          {!touched.file && !errors.file && (
            <span className="input-message info">{getHelperMessage('file')}</span>
          )}
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
          />
          <span className={`input-message ${touched.link && errors.link? 'error' : 'info'}`}>
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
                    disabled={form.allIndia} // Disable dropdown if "All over India" is selected
                >
                    <option value="">Select State</option>
                    <option value="AP">Andhra Pradesh</option>
                    <option value="MH">Maharashtra</option>
                    {/* Add more states as needed */}
                </select>
                <label 
                  className={`custom-checkbox-container all-india-checkbox-label`}
                  onBlur={(e) => handleBlur(e as any)} // Ensure label blur also sets touched state for 'location'
                >
                    <input
                        type="checkbox"
                        name="allIndia"
                        checked={form.allIndia}
                        onChange={handleAllIndiaChange} // Use the renamed handler
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
              min={form.ageFrom ? Number(form.ageFrom) + 1 : "0"}
            />
          </div>
          <span className={`input-message ${
            (touched.ageFrom || touched.ageTo) && (errors.ageFrom || errors.ageTo) ? 'error' : 'info'
          }`}>
            {errors.ageFrom || errors.ageTo || getHelperMessage('ageFrom')}
          </span>
        </div>

        {/* Gender Radio Buttons */}
        <div className='gender-box'>
          <label>Gender</label>
          <div className="d-flex gender-options">
            <label className="me-3"><input type='radio' name="gender" value="male" checked={form.gender === 'male'} onChange={handleChange} onBlur={handleBlur} /> Male</label>
            <label className="me-3"><input type='radio' name="gender" value="female" checked={form.gender === 'female'} onChange={handleChange} onBlur={handleBlur} /> Female</label>
            <label><input type='radio' name="gender" value="all" checked={form.gender === 'all'} onChange={handleChange} onBlur={handleBlur} /> All</label>
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
            />
          </div>
          <span className={`input-message ${touched.endDate && errors.endDate ? 'error' : 'info'}`}>
            {getHelperMessage('endDate')}
          </span>
        </div>

        {/* Eliminated Budget Input */}
        <div className='budget-box'>
          <label htmlFor="eliminatedBudget">Estimated Budget</label>
          <div className="daily-budget-input-group">
              <span className="currency-prefix">Rs.</span>
              <input
                type="number"
                id="eliminatedBudget"
                name="eliminatedBudget"
                className={getInputClass('eliminatedBudget')}
                value={form.eliminatedBudget}
                onChange={handleChange}
                onBlur={handleBlur}
                min="0"
              />
          </div>
          <span className={`input-message ${touched.eliminatedBudget && errors.eliminatedBudget ? 'error' : 'info'}`}>
            {getHelperMessage('eliminatedBudget')}
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
          >
            <i className="bi bi-eye-fill"></i>
          </button>
        </div>

        {/* Submit & Discard*/}
        <div className='buttons-ds'>
          <button
            className='discard-button'
            type="button"
            onClick={() => {
              setForm({ // Reset form data
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
                eliminatedBudget: '',
                placing: [],
                file: null,
              });
              setErrors({}); // Clear all errors
              setTouched({}); // Reset all touched states
            }}
          >
            Discard
          </button>
          <button
            className='submit-button'
            type="submit"
            disabled={!isFormValid()}
            style={{
              opacity: !isFormValid() ? 0.5 : 1,
              cursor: !isFormValid() ? 'not-allowed' : 'pointer'
            }}
            onClick={() => {
                if (isFormValid()) {
                    console.log("Form submitted:", form);
                } else {
                    const newTouched: Partial<Record<keyof FormState, boolean>> = {};
                    (Object.keys(form) as Array<keyof FormState>).forEach(key => {
                        newTouched[key] = true;
                    });
                    setTouched(newTouched);
                }
            }}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default Userform;