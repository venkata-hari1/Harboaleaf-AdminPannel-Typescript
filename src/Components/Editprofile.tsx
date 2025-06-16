import React, { useEffect, useState } from 'react';

import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../Redux/store/Store';
import { AdminProfile, AdminUpdateProfile, AdminUploadProfileImage } from '../Redux/Reducers/UserMangement';
import { showToast } from '../../Utils/Validation';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import Loader from '../../Utils/Loader'
const Editprofile = () => {
  const { profile, loading }: any = useSelector((state: RootState) => state.UserMangment);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [Loading, setLoading] = useState(false)

  const dispatch = useDispatch<AppDispatch>();

  const [editField, setEditField] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstname: '',
    mobile: '',
    password: ''
  });

  useEffect(() => {
    dispatch(AdminProfile());
  }, [dispatch]);

  useEffect(() => {
    if (profile?.user) {
      setFormData({
        firstname: profile.user.firstname || '',
        mobile: profile.user.mobile || '',
        password: ''
      });
    }
  }, [profile, editField]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEdit = async (field: string) => {

    setEditField(field);
  };
  const handleUpdate = async () => {
    try {
      setLoading(true);
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
      if (editField === 'password' && !passwordRegex.test(formData.password)) {
        showToast(false, 'Password must contain uppercase, lowercase, number, special character and be at least 6 characters long');
        return;
      }

      const data = {
        firstname: editField === 'firstname' ? formData.firstname : profile?.user?.firstname,
        mobile: editField === 'mobile' ? formData.mobile : profile?.user?.mobile,
        password: editField === 'password' ? formData.password : undefined,
      };

      const response = await dispatch(AdminUpdateProfile({ data }));
      const fulfilled = response.payload;

      if (fulfilled?.status) {
        showToast(true, 'Profile updated successfully');
        setEditField(null);
        dispatch(AdminProfile());
      } else {
        showToast(false, fulfilled?.message || 'Update failed');
      }
    } catch (error) {
      showToast(false, 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditField(null);
    setFormData({
      firstname: profile?.user?.firstname || '',
      mobile: profile?.user?.mobile || '',
      password: ''
    });
  };
  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try{
      setLoading(true)
    const file = e.target.files?.[0];
  
    if (!file) return;
  
    const validImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    const maxSizeInBytes = 1 * 1024 * 1024; // 1MB
  
    if (!validImageTypes.includes(file.type)) {
      showToast(false, 'Only JPEG, PNG, or WEBP images are allowed');
      return;
    }
  
    if (file.size > maxSizeInBytes) {
      showToast(false, 'Image must be less than 1MB');
      return;
    }
  
    const formData = new FormData();
    formData.append('file', file); 
  
    await dispatch(AdminUploadProfileImage(formData));
    setSelectedImage(file);
  
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  }
  catch(error){}
  finally{
    setLoading(false)
  }
  };
  
  const renderEditField = (field: string, label: string, value: string) => {
    const isEditing = editField === field;

    return (
      <div className="row align-items-center mb-3"  >
        <div className="col-2" style={{ color: '#898989', fontSize: '14px' }}>{label}</div>
        <div className="col-4">
          {isEditing ? (
            <div className="d-flex align-items-center gap-2">
              <input
                type={'text'}
                name={field}
                value={formData[field as keyof typeof formData]}
                onChange={handleChange}
                className="form-control form-control-sm bg-dark text-white border-light"

              />
              <button className="btn btn-sm btn-success" disabled={Loading} onClick={handleUpdate}>{Loading ? 'Update...' : 'Update'}</button>
              <button className="btn btn-sm btn-secondary" disabled={Loading} onClick={handleCancel}>Cancel</button>
            </div>
          ) : (
            <div className="d-flex justify-content-between align-items-center">
              <span className="text-white" style={{ whiteSpace: 'nowrap' }}>
                {field === 'mobile'
                  ? `${profile?.user?.countryCode}${value}`
                  : field === 'password'
                    ? '*******'
                    : value}
              </span>
              <i
                className="bi bi-pencil-square text-white ms-2"
                style={{ cursor: 'pointer' }}
                onClick={() => handleEdit(field)}
              ></i>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="container my-5">
      {loading  ? <Skeleton width={1000} height={300} baseColor="#202020"
        highlightColor="#444" /> :
        <div
          className="rounded p-4 shadow"
          style={{
            background: '#60606017',
            display: 'grid',
            gridTemplateColumns: '20% 80%',
            gap: '3%',
            alignItems: 'start'
          }}
        >
       {Loading&&<Loader/>}
          <div className="d-flex flex-column align-items-center position-relative"
            onMouseEnter={() => setPreviewVisible(true)}
            onMouseLeave={() => setPreviewVisible(false)}
          >
           {profile?.user?.image? <img
              src={profile?.user?.image}
              alt="Profile"
              width="170"
              height="200"
              className="rounded mb-3 border border-light"
              style={{ objectFit: 'cover' }}
            />:<img
            src={selectedImage ? previewUrl ?? '' : ''}
            alt="Profile"
            width="170"
            height="200"
            className="rounded mb-3 border border-light"
            style={{ objectFit: 'cover' }}
          />}
            {previewVisible && (
              <i
                className="bi bi-pencil-square text-white position-absolute"
                style={{
                  bottom: '20px',
                  right: '10px',
                  cursor: 'pointer',
                  background: '#00000088',
                  padding: '5px',
                  borderRadius: '50%'
                }}
                onClick={() => document.getElementById('upload-photo')?.click()}
              ></i>
            )}
            <input
              type="file"
              accept="image/*"
              id="upload-photo"
              style={{ display: 'none' }}
              onChange={handleUploadImage}
            />
          </div>



          <div className="px-2" style={{ whiteSpace: 'nowrap', lineHeight: '40px' }}>
            {renderEditField('firstname', 'Name', formData.firstname)}
            {renderEditField('mobile', 'Phone Number', formData.mobile)}
            {renderEditField('password', 'Password', formData.password)}


          </div>
        </div>}
    </div>
  );
};

export default Editprofile;
