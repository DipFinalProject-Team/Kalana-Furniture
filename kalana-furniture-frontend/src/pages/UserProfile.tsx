import { useState } from "react";
import {
  FaUser,
  FaPhone,
  FaMapMarkerAlt,
  FaEnvelope,
  FaCamera,
  FaLock,
  FaCheckCircle,
  FaExclamationTriangle,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import SnowAnimation from "../components/SnowAnimation";
import Header from '../components/Header';

const UserProfile = () => {
  const [profileData, setProfileData] = useState({
    name: "John Doe",
    phone: "+94",
    address: "123 Furniture St, Wood City, WC 12345",
    email: "john.doe@example.com",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [profilePicture, setProfilePicture] = useState(
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=150&q=80"
  );

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error'; visible: boolean }>({
    text: '',
    type: 'success',
    visible: false,
  });

  const [profileErrors, setProfileErrors] = useState<{ [key: string]: string }>({});
  const [passwordErrors, setPasswordErrors] = useState<{ [key: string]: string }>({});

  // Validation functions
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    // Sri Lankan phone number validation: +94 followed by 9 digits
    const sriLankanPhoneRegex = /^\+94\d{9}$/;
    return sriLankanPhoneRegex.test(phone);
  };

  const validatePassword = (password: string): { isValid: boolean; strength: string } => {
    const minLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const criteria = [minLength, hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar];
    const passedCriteria = criteria.filter(Boolean).length;

    let strength = 'weak';
    if (passedCriteria >= 4) strength = 'strong';
    else if (passedCriteria >= 3) strength = 'medium';

    return { isValid: minLength, strength };
  };

  const validateProfileField = (field: string, value: string): string => {
    switch (field) {
      case 'name':
        if (!value.trim()) return 'Full name is required';
        if (value.trim().length < 2) return 'Name must be at least 2 characters';
        return '';
      case 'phone':
        if (!value.trim()) return 'Phone number is required';
        if (!validatePhone(value)) return 'Please enter a valid Sri Lankan phone number (+94XXXXXXXXX)';
        return '';
      case 'address':
        if (!value.trim()) return 'Address is required';
        if (value.trim().length < 10) return 'Address must be at least 10 characters';
        return '';
      case 'email':
        if (!value.trim()) return 'Email is required';
        if (!validateEmail(value)) return 'Please enter a valid email address';
        return '';
      default:
        return '';
    }
  };

  const validatePasswordField = (field: string, value: string, allData: typeof passwordData): string => {
    switch (field) {
      case 'currentPassword':
        if (!value.trim()) return 'Current password is required';
        return '';
      case 'newPassword':
        if (!value.trim()) return 'New password is required';
        const { isValid } = validatePassword(value);
        if (!isValid) return 'Password must be at least 8 characters';
        return '';
      case 'confirmPassword':
        if (!value.trim()) return 'Please confirm your new password';
        if (value !== allData.newPassword) return 'Passwords do not match';
        return '';
      default:
        return '';
    }
  };

  const handleProfileUpdate = (field: string, value: string) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));

    // Real-time validation
    const error = validateProfileField(field, value);
    setProfileErrors(prev => ({
      ...prev,
      [field]: error
    }));
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData((prev) => ({ ...prev, [field]: value }));

    // Real-time validation
    setPasswordData(currentData => {
      const error = validatePasswordField(field, value, { ...currentData, [field]: value });
      setPasswordErrors(prev => ({
        ...prev,
        [field]: error
      }));
      return currentData;
    });
  };

  const handleProfilePictureChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfilePicture(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = () => {
    // Validate all profile fields
    const errors: { [key: string]: string } = {};
    Object.keys(profileData).forEach(field => {
      const error = validateProfileField(field, profileData[field as keyof typeof profileData]);
      if (error) errors[field] = error;
    });

    setProfileErrors(errors);

    // Check if there are any errors
    if (Object.keys(errors).length > 0) {
      setMessage({
        text: 'Something went wrong.',
        type: 'error',
        visible: true,
      });
      return;
    }

    // Simulate save
    setMessage({
      text: 'Profile updated successfully!',
      type: 'success',
      visible: true,
    });
  };

  const handleChangePassword = () => {
    // Validate all password fields
    const errors: { [key: string]: string } = {};
    Object.keys(passwordData).forEach(field => {
      const error = validatePasswordField(field, passwordData[field as keyof typeof passwordData], passwordData);
      if (error) errors[field] = error;
    });

    setPasswordErrors(errors);

    // Check if there are any errors
    if (Object.keys(errors).length > 0) {
      setMessage({
        text: 'Please fix the validation errors before changing password.',
        type: 'error',
        visible: true,
      });
      return;
    }

    // Simulate password change
    setMessage({
      text: 'Password changed successfully!',
      type: 'success',
      visible: true,
    });
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setShowPasswordModal(false);
  };

  const openPasswordModal = () => {
    setShowPasswordModal(true);
  };

  const closePasswordModal = () => {
    setShowPasswordModal(false);
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setPasswordErrors({});
  };

  return (
    <>
    <div>
      <Header />
    </div>
    <div className="min-h-screen bg-gradient-to-br from-wood-brown via-nav-brown to-wood-accent py-[140px] px-4 relative overflow-hidden">
      {/* Floating decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-wood-accent/10 rounded-full animate-blob"></div>
        <div className="absolute bottom-20 right-10 w-24 h-24 bg-wood-brown/10 rounded-full animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-wood-light/10 rounded-full animate-blob animation-delay-4000"></div>
        <div className="absolute top-40 right-1/4 w-20 h-20 bg-wood-accent/5 rounded-full animate-float"></div>
      </div>
      <SnowAnimation
        containerClass="absolute inset-0 pointer-events-none overflow-hidden"
        numFlakes={25}
        minDuration={8}
        maxDuration={15}
        minDelay={0}
        maxDelay={5}
        minSize={8}
        maxSize={20}
        opacity={0.5}
      />
      <div className="max-w-4xl mx-auto">
        <div className="text-start mb-4">
          <h1 className="font-sans text-4xl font-bold text-white mb-4 drop-shadow-lg">
            Your Profile
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Profile Picture Section */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20  transition-all duration-500 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]">
            <div className="text-center">
              <div className="relative inline-block mb-6">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-wood-accent shadow-[0_0_30px_rgba(200,162,124,0.3)] mx-auto hover:shadow-[0_0_40px_rgba(200,162,124,0.5)] transition-shadow duration-500">
                  <img
                    src={profilePicture}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
                <label className="absolute bottom-0 right-0 bg-wood-accent text-white p-3 rounded-full cursor-pointer hover:bg-wood-accent-hover transition-colors duration-300 shadow-lg">
                  <FaCamera className="text-lg" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePictureChange}
                    className="hidden"
                  />
                </label>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Profile Picture
              </h2>
              <p className="text-wood-light mb-6">
                Click the camera icon to update your photo
              </p>
              <hr className="border-white/20 my-8 w-3/4 mx-auto" />
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <FaLock className="mr-3 text-wood-accent" />
                Change Password
              </h2>
              <div className="text-center">
                <p className="text-wood-light mb-6">
                  For security reasons, we recommend changing your password
                  regularly.
                </p>
                <button
                  onClick={openPasswordModal}
                  className="bg-wood-accent text-white font-bold py-3 px-16 rounded-lg hover:bg-wood-accent-hover transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-[0_0_20px_rgba(200,162,124,0.5)]"
                >
                  Change Password
                </button>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 transition-all duration-500 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <FaUser className="mr-3 text-wood-accent" />
              Personal Information
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-wood-light mb-2">Full Name</label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => handleProfileUpdate("name", e.target.value)}
                  className={`w-full px-4 py-3 bg-white/20 border rounded-lg text-white placeholder-wood-light focus:outline-none focus:ring-2 transition-all duration-300 ${
                    profileErrors.name
                      ? 'border-red-400 focus:ring-red-400'
                      : 'border-white/30 focus:ring-wood-accent'
                  }`}
                  placeholder="Enter your full name"
                />
                {profileErrors.name && (
                  <p className="text-red-400 text-sm mt-1 flex items-center">
                    <FaExclamationTriangle className="mr-1" />
                    {profileErrors.name}
                  </p>
                )}
              </div>
              <div>
                <label className="flex items-center text-wood-light mb-2">
                  <FaPhone className="mr-2" />
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white font-medium pointer-events-none z-10">
                    +94
                  </div>
                  <input
                    type="tel"
                    value={profileData.phone.startsWith('+94') ? profileData.phone.substring(3) : profileData.phone}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, ''); // Only allow digits
                      const fullNumber = '+94' + digits;
                      handleProfileUpdate("phone", fullNumber);
                    }}
                    onKeyPress={(e) => {
                      // Only allow numeric input
                      if (!/[0-9]/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'Enter'].includes(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    className={`w-full pl-12 pr-4 py-3 bg-white/20 border rounded-lg text-white placeholder-wood-light focus:outline-none focus:ring-2 transition-all duration-300 ${
                      profileErrors.phone
                        ? 'border-red-400 focus:ring-red-400'
                        : 'border-white/30 focus:ring-wood-accent'
                    }`}
                    placeholder="XXXXXXXXX"
                    maxLength={9}
                  />
                </div>
                {profileErrors.phone && (
                  <p className="text-red-400 text-sm mt-1 flex items-center">
                    <FaExclamationTriangle className="mr-1" />
                    {profileErrors.phone}
                  </p>
                )}
              </div>
              <div>
                <label className="flex items-center text-wood-light mb-2">
                  <FaMapMarkerAlt className="mr-2" />
                  Address
                </label>
                <textarea
                  value={profileData.address}
                  onChange={(e) =>
                    handleProfileUpdate("address", e.target.value)
                  }
                  className={`w-full px-4 py-3 bg-white/20 border rounded-lg text-white placeholder-wood-light focus:outline-none focus:ring-2 transition-all duration-300 resize-none ${
                    profileErrors.address
                      ? 'border-red-400 focus:ring-red-400'
                      : 'border-white/30 focus:ring-wood-accent'
                  }`}
                  rows={3}
                  placeholder="Enter your address"
                />
                {profileErrors.address && (
                  <p className="text-red-400 text-sm mt-1 flex items-center">
                    <FaExclamationTriangle className="mr-1" />
                    {profileErrors.address}
                  </p>
                )}
              </div>
              <div>
                <label className="flex items-center text-wood-light mb-2">
                  <FaEnvelope className="mr-2" />
                  Email Address
                </label>
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => handleProfileUpdate("email", e.target.value)}
                  className={`w-full px-4 py-3 bg-white/20 border rounded-lg text-white placeholder-wood-light focus:outline-none focus:ring-2 transition-all duration-300 ${
                    profileErrors.email
                      ? 'border-red-400 focus:ring-red-400'
                      : 'border-white/30 focus:ring-wood-accent'
                  }`}
                  placeholder="Enter your email"
                />
                {profileErrors.email && (
                  <p className="text-red-400 text-sm mt-1 flex items-center">
                    <FaExclamationTriangle className="mr-1" />
                    {profileErrors.email}
                  </p>
                )}
              </div>
              <button
                onClick={handleSaveProfile}
                className="w-full bg-wood-accent text-white font-bold py-3 px-6 rounded-lg hover:bg-wood-accent-hover transform hover:scale-105 transition-all duration-300 shadow-lg"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Styled Message Notification */}
      {message.visible && (
        <div className="fixed top-28 right-4 z-50 animate-in slide-in-from-right-4 fade-in-0 duration-300">
          <div className={`flex items-center space-x-3 px-6 py-4 rounded-2xl shadow-2xl border backdrop-blur-lg ${
            message.type === 'success'
              ? 'bg-green-500/20 border-green-400/30 text-green-100'
              : 'bg-red-500/20 border-red-400/30 text-red-100'
          }`}>
            {message.type === 'success' ? (
              <FaCheckCircle className="text-green-400 text-xl flex-shrink-0" />
            ) : (
              <FaExclamationTriangle className="text-red-400 text-xl flex-shrink-0" />
            )}
            <span className="font-medium">{message.text}</span>
            <button
              onClick={() => setMessage(prev => ({ ...prev, visible: false }))}
              className="ml-4 text-white/70 hover:text-white transition-colors duration-200 text-lg"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20 max-w-md w-full mx-4 transform scale-100 animate-in fade-in-0 zoom-in-95 duration-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white flex items-center">
                <FaLock className="mr-3 text-wood-accent" />
                Change Password
              </h3>
              <button
                onClick={closePasswordModal}
                className="text-white/70 hover:text-white transition-colors duration-300 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-wood-light mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    handlePasswordChange("currentPassword", e.target.value)
                  }
                  className={`w-full px-4 py-3 bg-white/20 border rounded-lg text-white placeholder-wood-light focus:outline-none focus:ring-2 transition-all duration-300 ${
                    passwordErrors.currentPassword
                      ? 'border-red-400 focus:ring-red-400'
                      : 'border-white/30 focus:ring-wood-accent'
                  }`}
                  placeholder="Enter current password"
                />
                {passwordErrors.currentPassword && (
                  <p className="text-red-400 text-sm mt-1 flex items-center">
                    <FaExclamationTriangle className="mr-1" />
                    {passwordErrors.currentPassword}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-wood-light mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      handlePasswordChange("newPassword", e.target.value)
                    }
                    className={`w-full px-4 py-3 pr-12 bg-white/20 border rounded-lg text-white placeholder-wood-light focus:outline-none focus:ring-2 transition-all duration-300 ${
                      passwordErrors.newPassword
                        ? 'border-red-400 focus:ring-red-400'
                        : 'border-white/30 focus:ring-wood-accent'
                    }`}
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {passwordData.newPassword && (
                  <div className="mt-2">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-white/20 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            validatePassword(passwordData.newPassword).strength === 'strong'
                              ? 'bg-green-400 w-full'
                              : validatePassword(passwordData.newPassword).strength === 'medium'
                              ? 'bg-yellow-400 w-2/3'
                              : 'bg-red-400 w-1/3'
                          }`}
                        ></div>
                      </div>
                      <span className={`text-xs font-medium ${
                        validatePassword(passwordData.newPassword).strength === 'strong'
                          ? 'text-green-400'
                          : validatePassword(passwordData.newPassword).strength === 'medium'
                          ? 'text-yellow-400'
                          : 'text-red-400'
                      }`}>
                        {validatePassword(passwordData.newPassword).strength}
                      </span>
                    </div>
                  </div>
                )}
                {passwordErrors.newPassword && (
                  <p className="text-red-400 text-sm mt-1 flex items-center">
                    <FaExclamationTriangle className="mr-1" />
                    {passwordErrors.newPassword}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-wood-light mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      handlePasswordChange("confirmPassword", e.target.value)
                    }
                    className={`w-full px-4 py-3 pr-12 bg-white/20 border rounded-lg text-white placeholder-wood-light focus:outline-none focus:ring-2 transition-all duration-300 ${
                      passwordErrors.confirmPassword
                        ? 'border-red-400 focus:ring-red-400'
                        : 'border-white/30 focus:ring-wood-accent'
                    }`}
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {passwordErrors.confirmPassword && (
                  <p className="text-red-400 text-sm mt-1 flex items-center">
                    <FaExclamationTriangle className="mr-1" />
                    {passwordErrors.confirmPassword}
                  </p>
                )}
              </div>
            </div>

            <div className="flex space-x-4 mt-8">
              <button
                onClick={closePasswordModal}
                className="flex-1 bg-gray-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-gray-700 transform hover:scale-105 transition-all duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleChangePassword}
                className="flex-1 bg-wood-accent text-white font-bold py-3 px-6 rounded-lg hover:bg-wood-accent-hover transform hover:scale-105 transition-all duration-300 shadow-lg"
              >
                Update Password
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
};

export default UserProfile;
