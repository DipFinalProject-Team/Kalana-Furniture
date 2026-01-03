import React, { useState, useRef } from 'react';
import { FiUser, FiMapPin, FiPhone, FiMail, FiCreditCard, FiLock, FiSave, FiCamera, FiCheck, FiAlertCircle, FiEye, FiEyeOff } from 'react-icons/fi';
import Modal from '../components/Modal';
import Toast from '../components/Toast';
import { supplierProfile } from '../data/mockdata';

const Profile: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    title: '',
    message: '',
    type: 'info' as 'info' | 'success' | 'warning' | 'danger',
    onConfirm: undefined as (() => void) | undefined
  });

  const [toast, setToast] = useState({ show: false, message: '', type: 'success' as 'success' | 'error' | 'info' | 'warning' });

  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'success') => {
    setToast({ show: true, message, type });
  };

  const [password, setPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [profileData, setProfileData] = useState(supplierProfile);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [passwordErrors, setPasswordErrors] = useState<{ [key: string]: string }>({});

  const validateProfile = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!profileData.companyName.trim()) {
      newErrors.companyName = 'Company name is required';
    }

    if (!profileData.contactNumber.trim()) {
      newErrors.contactNumber = 'Contact number is required';
    } else if (!/^\+?[\d\s-]{10,}$/.test(profileData.contactNumber)) {
      newErrors.contactNumber = 'Invalid contact number format';
    }

    if (!profileData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email)) {
      newErrors.email = 'Invalid email address';
    }

    if (!profileData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePasswordChange = () => {
    const newErrors: { [key: string]: string } = {};

    if (!currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!password) {
      newErrors.newPassword = 'New password is required';
    } else if (passwordStrength < 3) {
      newErrors.newPassword = 'Password is too weak';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Confirm password is required';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setPasswordErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handlePasswordInputChange = (field: 'current' | 'new' | 'confirm', value: string) => {
    if (field === 'current') {
      setCurrentPassword(value);
      if (passwordErrors.currentPassword) {
        setPasswordErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.currentPassword;
          return newErrors;
        });
      }
    } else if (field === 'new') {
      setPassword(value);
      setPasswordStrength(calculateStrength(value));
      if (passwordErrors.newPassword) {
        setPasswordErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.newPassword;
          return newErrors;
        });
      }
    } else if (field === 'confirm') {
      setConfirmPassword(value);
      if (passwordErrors.confirmPassword) {
        setPasswordErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.confirmPassword;
          return newErrors;
        });
      }
    }
  };

  const calculateStrength = (pass: string) => {
    let strength = 0;
    if (pass.length > 6) strength += 1;
    if (pass.length > 10) strength += 1;
    if (/[A-Z]/.test(pass)) strength += 1;
    if (/[0-9]/.test(pass)) strength += 1;
    if (/[^A-Za-z0-9]/.test(pass)) strength += 1;
    return strength;
  };

  const getStrengthLabel = () => {
    switch (passwordStrength) {
      case 0: return { label: 'Very Weak', color: 'bg-stone-200 text-stone-500' };
      case 1: return { label: 'Weak', color: 'bg-red-500 text-white' };
      case 2: return { label: 'Fair', color: 'bg-orange-500 text-white' };
      case 3: return { label: 'Good', color: 'bg-yellow-500 text-white' };
      case 4: return { label: 'Strong', color: 'bg-green-500 text-white' };
      case 5: return { label: 'Very Strong', color: 'bg-emerald-600 text-white' };
      default: return { label: '', color: '' };
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = () => {
    if (!validateProfile()) {
      return;
    }

    setModalConfig({
      title: 'Confirm Changes',
      message: 'Are you sure you want to update your profile information?',
      type: 'info',
      onConfirm: () => {
        // API call would go here
        showToast('Profile updated successfully!', 'success');
      }
    });
    setIsModalOpen(true);
  };

  const handleUpdatePassword = () => {
    if (!validatePasswordChange()) {
      return;
    }

    setModalConfig({
      title: 'Update Password',
      message: 'Are you sure you want to change your password? You will need to use the new password next time you login.',
      type: 'warning',
      onConfirm: () => {
        // API call would go here
        showToast('Password changed successfully!', 'success');
        setPassword('');
        setCurrentPassword('');
        setConfirmPassword('');
        setPasswordStrength(0);
      }
    });
    setIsModalOpen(true);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-serif text-amber-900 mb-8">Profile</h1>
      
      <div className="space-y-6">
        {/* Supplier Profile Management */}
        <div className="bg-white rounded-lg shadow-md border border-amber-100 overflow-hidden">
          <div className="p-4 bg-amber-50 border-b border-amber-100 flex items-center gap-3">
            <FiUser className="text-amber-600 text-xl" />
            <h2 className="text-lg font-semibold text-amber-900">Supplier Profile Management</h2>
          </div>
          <div className="p-6 space-y-6">
            {/* Profile Image Upload */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-amber-100 shadow-lg bg-stone-100">
                  {profileImage ? (
                    <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-400">
                      <FiUser size={48} />
                    </div>
                  )}
                </div>
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <FiCamera className="text-white text-2xl" />
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </div>
              <p className="text-sm text-stone-500 mt-2">Click to upload new photo</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Company Name */}
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-stone-600 mb-1">Company Name</label>
                <div className="relative">
                  <input 
                    type="text" 
                    name="companyName"
                    value={profileData.companyName}
                    onChange={handleInputChange}
                    className={`w-full pl-10 p-2 border rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none ${errors.companyName ? 'border-red-500' : 'border-stone-300'}`}
                  />
                  <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                </div>
                {errors.companyName && <p className="text-red-500 text-xs mt-1">{errors.companyName}</p>}
              </div>

              {/* Contact Number */}
              <div>
                <label className="block text-sm font-medium text-stone-600 mb-1">Contact Number</label>
                <div className="relative">
                  <input 
                    type="tel" 
                    name="contactNumber"
                    value={profileData.contactNumber}
                    onChange={handleInputChange}
                    className={`w-full pl-10 p-2 border rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none ${errors.contactNumber ? 'border-red-500' : 'border-stone-300'}`}
                  />
                  <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                </div>
                {errors.contactNumber && <p className="text-red-500 text-xs mt-1">{errors.contactNumber}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-stone-600 mb-1">Email Address</label>
                <div className="relative">
                  <input 
                    type="email" 
                    name="email"
                    value={profileData.email}
                    onChange={handleInputChange}
                    className={`w-full pl-10 p-2 border rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none ${errors.email ? 'border-red-500' : 'border-stone-300'}`}
                  />
                  <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                </div>
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              {/* Address */}
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-stone-600 mb-1">Address</label>
                <div className="relative">
                  <textarea 
                    name="address"
                    value={profileData.address}
                    onChange={handleInputChange}
                    className={`w-full pl-10 p-2 border rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none min-h-[80px] ${errors.address ? 'border-red-500' : 'border-stone-300'}`}
                  />
                  <FiMapPin className="absolute left-3 top-3 text-stone-400" />
                </div>
                {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
              </div>

              {/* Bank Details (Optional) */}
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-stone-600 mb-1">
                  Bank Details <span className="text-stone-400 font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <textarea 
                    name="bankDetails"
                    value={profileData.bankDetails}
                    onChange={handleInputChange}
                    className="w-full pl-10 p-2 border border-stone-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none min-h-[80px]" 
                    placeholder="Bank Name, Account Number, Branch, etc."
                  />
                  <FiCreditCard className="absolute left-3 top-3 text-stone-400" />
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button 
                onClick={handleSaveProfile}
                className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors"
              >
                <FiSave />
                Save Profile
              </button>
            </div>
          </div>
        </div>

        {/* Change Password Section */}
        <div className="bg-white rounded-lg shadow-md border border-amber-100 overflow-hidden">
          <div className="p-4 bg-amber-50 border-b border-amber-100 flex items-center gap-3">
            <FiLock className="text-amber-600 text-xl" />
            <h2 className="text-lg font-semibold text-amber-900">Change Password</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-600 mb-1">Current Password</label>
                <div className="relative">
                  <input 
                    type={showCurrentPassword ? "text" : "password"} 
                    value={currentPassword}
                    onChange={(e) => handlePasswordInputChange('current', e.target.value)}
                    placeholder="••••••••" 
                    className={`w-full p-2 pr-10 border rounded-md focus:ring-2 focus:ring-amber-500 outline-none ${passwordErrors.currentPassword ? 'border-red-500' : 'border-stone-300'}`}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                  >
                    {showCurrentPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                {passwordErrors.currentPassword && <p className="text-red-500 text-xs mt-1">{passwordErrors.currentPassword}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-600 mb-1">New Password</label>
                <div className="relative">
                  <input 
                    type={showNewPassword ? "text" : "password"} 
                    value={password}
                    onChange={(e) => handlePasswordInputChange('new', e.target.value)}
                    placeholder="••••••••" 
                    className={`w-full p-2 pr-10 border rounded-md focus:ring-2 focus:ring-amber-500 outline-none ${passwordErrors.newPassword ? 'border-red-500' : 'border-stone-300'}`}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                  >
                    {showNewPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                {passwordErrors.newPassword && <p className="text-red-500 text-xs mt-1">{passwordErrors.newPassword}</p>}
                {/* Password Strength Indicator */}
                {password && (
                  <div className="mt-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-stone-500">Strength:</span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getStrengthLabel().color}`}>
                        {getStrengthLabel().label}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-stone-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${getStrengthLabel().color.split(' ')[0]}`} 
                        style={{ width: `${(passwordStrength / 5) * 100}%` }}
                      />
                    </div>
                    <ul className="mt-2 space-y-1">
                      <li className={`text-xs flex items-center gap-1 ${password.length > 6 ? 'text-green-600' : 'text-stone-400'}`}>
                        {password.length > 6 ? <FiCheck /> : <FiAlertCircle />} 7+ characters
                      </li>
                      <li className={`text-xs flex items-center gap-1 ${/[A-Z]/.test(password) ? 'text-green-600' : 'text-stone-400'}`}>
                        {/[A-Z]/.test(password) ? <FiCheck /> : <FiAlertCircle />} Uppercase letter
                      </li>
                      <li className={`text-xs flex items-center gap-1 ${/[0-9]/.test(password) ? 'text-green-600' : 'text-stone-400'}`}>
                        {/[0-9]/.test(password) ? <FiCheck /> : <FiAlertCircle />} Number
                      </li>
                    </ul>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-600 mb-1">Confirm New Password</label>
                <div className="relative">
                  <input 
                    type={showConfirmPassword ? "text" : "password"} 
                    value={confirmPassword}
                    onChange={(e) => handlePasswordInputChange('confirm', e.target.value)}
                    placeholder="••••••••" 
                    className={`w-full p-2 pr-10 border rounded-md focus:ring-2 focus:ring-amber-500 outline-none ${passwordErrors.confirmPassword ? 'border-red-500' : 'border-stone-300'}`}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                  >
                    {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                {passwordErrors.confirmPassword && <p className="text-red-500 text-xs mt-1">{passwordErrors.confirmPassword}</p>}
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button 
                onClick={handleUpdatePassword}
                className="px-4 py-2 border border-stone-300 text-stone-600 rounded-md hover:bg-stone-50 transition-colors"
              >
                Update Password
              </button>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalConfig.title}
        type={modalConfig.type}
        onConfirm={modalConfig.onConfirm}
      >
        <p>{modalConfig.message}</p>
      </Modal>

      <Toast 
        message={toast.message}
        type={toast.type}
        isVisible={toast.show}
        onClose={() => setToast(prev => ({ ...prev, show: false }))}
      />
    </div>
  );
};

export default Profile;
