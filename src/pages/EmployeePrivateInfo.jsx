import React, { useState } from 'react';
import { User, Save, Calendar, MapPin, Mail, Phone, CreditCard, Building2, Lock } from 'lucide-react';

const EmployeePrivateInfo = () => {
  const [privateInfo, setPrivateInfo] = useState({
    dateOfBirth: '',
    residingAddress: '',
    nationality: '',
    personalEmail: '',
    gender: '',
    maritalStatus: '',
    dateOfJoining: ''
  });

  const [bankDetails, setBankDetails] = useState({
    accountNumber: '',
    bankName: '',
    ifscCode: '',
    panNo: '',
    uanNo: '',
    empCode: ''
  });

  const [isEditing, setIsEditing] = useState(false);

  const handlePrivateInfoChange = (field, value) => {
    setPrivateInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleBankDetailsChange = (field, value) => {
    setBankDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    // API call to save data would go here
    console.log('Saving private info:', privateInfo);
    console.log('Saving bank details:', bankDetails);
    setIsEditing(false);
    alert('Information saved successfully!');
  };

  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-3">
                  <Lock size={32} />
                  Private Information
                </h1>
                <p className="text-indigo-100 mt-2">Manage your personal and banking details securely</p>
              </div>
              <button
                onClick={toggleEdit}
                className="px-6 py-2 bg-white text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors font-semibold"
              >
                {isEditing ? 'Cancel' : 'Edit'}
              </button>
            </div>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Personal Information Section */}
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
                  <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <User className="text-indigo-600" size={24} />
                    Personal Information
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <Calendar size={16} />
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        value={privateInfo.dateOfBirth}
                        onChange={(e) => handlePrivateInfoChange('dateOfBirth', e.target.value)}
                        disabled={!isEditing}
                        className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                          !isEditing ? 'bg-gray-100 cursor-not-allowed' : ''
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <MapPin size={16} />
                        Residing Address
                      </label>
                      <textarea
                        value={privateInfo.residingAddress}
                        onChange={(e) => handlePrivateInfoChange('residingAddress', e.target.value)}
                        disabled={!isEditing}
                        rows={3}
                        className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                          !isEditing ? 'bg-gray-100 cursor-not-allowed' : ''
                        }`}
                        placeholder="Enter your complete address"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nationality
                      </label>
                      <input
                        type="text"
                        value={privateInfo.nationality}
                        onChange={(e) => handlePrivateInfoChange('nationality', e.target.value)}
                        disabled={!isEditing}
                        className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                          !isEditing ? 'bg-gray-100 cursor-not-allowed' : ''
                        }`}
                        placeholder="Enter nationality"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <Mail size={16} />
                        Personal Email
                      </label>
                      <input
                        type="email"
                        value={privateInfo.personalEmail}
                        onChange={(e) => handlePrivateInfoChange('personalEmail', e.target.value)}
                        disabled={!isEditing}
                        className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                          !isEditing ? 'bg-gray-100 cursor-not-allowed' : ''
                        }`}
                        placeholder="personal@email.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Gender
                      </label>
                      <select
                        value={privateInfo.gender}
                        onChange={(e) => handlePrivateInfoChange('gender', e.target.value)}
                        disabled={!isEditing}
                        className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                          !isEditing ? 'bg-gray-100 cursor-not-allowed' : ''
                        }`}
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                        <option value="prefer-not-to-say">Prefer not to say</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Marital Status
                      </label>
                      <select
                        value={privateInfo.maritalStatus}
                        onChange={(e) => handlePrivateInfoChange('maritalStatus', e.target.value)}
                        disabled={!isEditing}
                        className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                          !isEditing ? 'bg-gray-100 cursor-not-allowed' : ''
                        }`}
                      >
                        <option value="">Select Marital Status</option>
                        <option value="single">Single</option>
                        <option value="married">Married</option>
                        <option value="divorced">Divorced</option>
                        <option value="widowed">Widowed</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <Calendar size={16} />
                        Date of Joining
                      </label>
                      <input
                        type="date"
                        value={privateInfo.dateOfJoining}
                        onChange={(e) => handlePrivateInfoChange('dateOfJoining', e.target.value)}
                        disabled={!isEditing}
                        className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                          !isEditing ? 'bg-gray-100 cursor-not-allowed' : ''
                        }`}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Bank Details Section */}
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200">
                  <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Building2 className="text-green-600" size={24} />
                    Bank Details
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <CreditCard size={16} />
                        Account Number
                      </label>
                      <input
                        type="text"
                        value={bankDetails.accountNumber}
                        onChange={(e) => handleBankDetailsChange('accountNumber', e.target.value)}
                        disabled={!isEditing}
                        className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                          !isEditing ? 'bg-gray-100 cursor-not-allowed' : ''
                        }`}
                        placeholder="Enter account number"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <Building2 size={16} />
                        Bank Name
                      </label>
                      <input
                        type="text"
                        value={bankDetails.bankName}
                        onChange={(e) => handleBankDetailsChange('bankName', e.target.value)}
                        disabled={!isEditing}
                        className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                          !isEditing ? 'bg-gray-100 cursor-not-allowed' : ''
                        }`}
                        placeholder="Enter bank name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        IFSC Code
                      </label>
                      <input
                        type="text"
                        value={bankDetails.ifscCode}
                        onChange={(e) => handleBankDetailsChange('ifscCode', e.target.value.toUpperCase())}
                        disabled={!isEditing}
                        className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                          !isEditing ? 'bg-gray-100 cursor-not-allowed' : ''
                        }`}
                        placeholder="ABCD0123456"
                        maxLength={11}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        PAN No
                      </label>
                      <input
                        type="text"
                        value={bankDetails.panNo}
                        onChange={(e) => handleBankDetailsChange('panNo', e.target.value.toUpperCase())}
                        disabled={!isEditing}
                        className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                          !isEditing ? 'bg-gray-100 cursor-not-allowed' : ''
                        }`}
                        placeholder="ABCDE1234F"
                        maxLength={10}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        UAN No
                      </label>
                      <input
                        type="text"
                        value={bankDetails.uanNo}
                        onChange={(e) => handleBankDetailsChange('uanNo', e.target.value)}
                        disabled={!isEditing}
                        className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                          !isEditing ? 'bg-gray-100 cursor-not-allowed' : ''
                        }`}
                        placeholder="Universal Account Number"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Emp Code
                      </label>
                      <input
                        type="text"
                        value={bankDetails.empCode}
                        onChange={(e) => handleBankDetailsChange('empCode', e.target.value)}
                        disabled={!isEditing}
                        className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                          !isEditing ? 'bg-gray-100 cursor-not-allowed' : ''
                        }`}
                        placeholder="Employee Code"
                      />
                    </div>
                  </div>
                </div>

                {/* Information Notice */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex gap-3">
                    <Lock className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
                    <div>
                      <h3 className="font-semibold text-yellow-900 mb-1">Secure Information</h3>
                      <p className="text-sm text-yellow-800">
                        Your personal and banking information is encrypted and securely stored. This information is confidential and only accessible to authorized personnel.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Save Button */}
            {isEditing && (
              <div className="mt-8 flex justify-end gap-4">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-8 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-colors font-semibold shadow-lg"
                >
                  <Save size={20} />
                  Save Changes
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeePrivateInfo;
