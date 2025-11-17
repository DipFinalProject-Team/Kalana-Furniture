import React from 'react';

// Define the type for the component's props
interface PasswordStrengthMeterProps {
  password: string;
}

const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ password }) => {
  const getPasswordStrength = (): number => {
    let score = 0;
    if (!password) return score;

    // Award points for different criteria
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    
    return Math.min(score, 5); // Cap score at 5
  };

  const strength = getPasswordStrength();
  const strengthLabels: string[] = ['Very Weak', 'Weak', 'Medium', 'Strong', 'Very Strong'];
  
  const strengthColor = (): string => {
    switch (strength) {
      case 0:
      case 1:
        return 'bg-password-weak'; // red-500
      case 2:
        return 'bg-password-medium'; // amber-500
      case 3:
      case 4:
      case 5:
        return 'bg-password-strong'; // green-500 or green-600
      default:
        return 'bg-gray-200';
    }
  };

  const barWidth = `${(strength / 5) * 100}%`;

  return (
    <div className="mt-2">
      <div className="relative w-full bg-gray-200 rounded-full h-2.5">
        <div 
          className={`h-2.5 rounded-full transition-all duration-300 ${strengthColor()}`} 
          style={{ width: barWidth }}
        ></div>
      </div>
      <p className="text-right text-sm text-wood-brown mt-1">
        {password && `Strength: ${strengthLabels[strength - 1] || ''}`}
      </p>
    </div>
  );
};

export default PasswordStrengthMeter;