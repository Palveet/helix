import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface ProfileFormProps {
  userId: string;
}

interface Profile {
  name: string;
  profession: string;
  company: string;
  location: string;
  age: string;
  gender: string;
}

const ProfileForm: React.FC<ProfileFormProps> = ({ userId }) => {
  const [profile, setProfile] = useState<Profile>({
    name: '',
    profession: '',
    company: '',
    location: '',
    age: '',
    gender: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [originalProfile, setOriginalProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(`/api/user/profile?user_id=${userId}`);
        
        const profileData: Profile = {
          name: response.data.name || '',
          profession: response.data.profession || '',
          company: response.data.company || '',
          location: response.data.location || '',
          age: response.data.age ? String(response.data.age) : '',
          gender: response.data.gender || '',
        };
        
        setProfile(profileData);
        setOriginalProfile(profileData);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error('Error fetching profile:', error.response?.data || error.message);
          alert('Failed to load profile data. Please try again.');
        }
      }
    };
    if (userId) {
      fetchProfile();
    }
  }, [userId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log('Saving profile for user ID:', userId);
      const dataToSend = {
        ...profile,
        user_id: userId,
        age: profile.age ? parseInt(profile.age) : null
      };
      
      const response = await axios.put('/api/user/profile', dataToSend);
      
      setOriginalProfile(profile);
      setIsEditing(false);
      alert('Profile saved successfully!');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Error saving profile:', error.response?.data || error.message);
        alert('Failed to save profile. Please try again.');
      }
    }
  };

  const handleEditClick = () => {
    console.log('Edit button clicked, setting isEditing to true');
    setIsEditing(true);
  };

  const handleCancel = () => {
    console.log('Cancel clicked, resetting profile and setting isEditing to false');
    if (originalProfile) {
      setProfile(originalProfile);
    }
    setIsEditing(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    console.log(`Updating ${name} field to:`, value);
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="profile-form">
      <h1>Your Profile</h1>
      
      {isEditing ? (
        <form onSubmit={handleSubmit}>
          <div className="profile-fields">
            <div className="profile-field">
              <label>Full Name</label>
              <input type="text" name="name" value={profile.name} onChange={handleChange} className="editable"/>
            </div>
            <div className="profile-field">
              <label>Role</label>
              <input type="text" name="profession" value={profile.profession} onChange={handleChange} className="editable" />
            </div>
            <div className="profile-field">
              <label>Company</label>
              <input type="text" name="company" value={profile.company} onChange={handleChange} className="editable" />
            </div>
            <div className="profile-field">
              <label>Location</label>
              <input type="text" name="location" value={profile.location} onChange={handleChange} className="editable" />
            </div>
            <div className="profile-field">
              <label>Age</label>
              <input type="text" name="age" value={profile.age} onChange={handleChange} className="editable"/>
            </div>
            <div className="profile-field">
              <label>Gender</label>
              <input type="text" name="gender" value={profile.gender} onChange={handleChange} className="editable"/>
            </div>
          </div>
          <div className="profile-actions">
            <button type="submit" className="profile-btn save-profile-btn">
              Save Profile
            </button>
            <button type="button" className="profile-btn cancel-profile-btn" onClick={handleCancel}>
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <>
          <div className="profile-fields">
            <div className="profile-field">
              <label>Full Name</label>
              <input type="text" name="name" value={profile.name} readOnly/>
            </div>
            <div className="profile-field">
              <label>Role</label>
              <input type="text" name="profession" value={profile.profession} readOnly/>
            </div>
            <div className="profile-field">
              <label>Company</label>
              <input type="text" name="company" value={profile.company} readOnly/>
            </div>
            <div className="profile-field">
              <label>Location</label>
              <input type="text" name="location" value={profile.location} readOnly/>
            </div>
            <div className="profile-field">
              <label>Age</label>
              <input type="text" name="age" value={profile.age} readOnly/>
            </div>
            <div className="profile-field">
              <label>Gender</label>
              <input type="text" name="gender" value={profile.gender} readOnly/>
            </div>
          </div>
          <div className="profile-actions">
            <button type="button" className="profile-btn edit-profile-btn" onClick={handleEditClick}>
              Edit Profile
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ProfileForm;
