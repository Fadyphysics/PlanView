import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { saveTeacherProfile, getTeacherProfile } from '../utils/indexedDbUtils';
import type { TeacherProfile } from '../models';
import HomeButton from './HomeButton';
import { useProfile } from '../App'; // Import the profile context
import './ProfileSetup.css';

const ProfileSetup: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate(); // Add navigate hook
  const { setHasProfile } = useProfile(); // Get the setHasProfile function from context
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false); // Add saving state
  const [successMessage, setSuccessMessage] = useState(''); // Add success message state
  const [profile, setProfile] = useState<TeacherProfile>({
    id: 1,
    name: '',
    email: '',
    subject: '',
    grade: '',
    class: '',
    school: 'Seacoast International School',
    branch: 'Hay Demashq Branch',
    classes: [], // Initialize with empty array
    currentClass: '',
    createdAt: new Date(),
    updatedAt: new Date()
  });

  const [newClass, setNewClass] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const existingProfile = await getTeacherProfile();
        if (existingProfile) {
          setProfile({
            ...existingProfile,
            classes: existingProfile.classes || [],
            currentClass: existingProfile.currentClass || existingProfile.class || ''
          });
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value,
      updatedAt: new Date()
    } as TeacherProfile));
  };

  const handleAddClass = () => {
    if (newClass.trim() && !profile.classes?.includes(newClass.trim())) {
      setProfile(prev => ({
        ...prev,
        classes: [...(prev.classes || []), newClass.trim()],
        updatedAt: new Date()
      }));
      setNewClass('');
    }
  };

  const handleRemoveClass = (classToRemove: string) => {
    setProfile(prev => ({
      ...prev,
      classes: (prev.classes || []).filter(cls => cls !== classToRemove),
      // If we're removing the current class, clear it
      currentClass: prev.currentClass === classToRemove ? '' : prev.currentClass,
      updatedAt: new Date()
    }));
  };

  const handleCurrentClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedClass = e.target.value;
    setProfile(prev => ({
      ...prev,
      currentClass: selectedClass,
      // Keep the old class field for backward compatibility
      class: selectedClass,
      updatedAt: new Date()
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate that name and grade are provided
    if (!profile.name.trim()) {
      alert('Teacher name is required');
      return;
    }
    
    if (!profile.grade.trim()) {
      alert('Grade is required');
      return;
    }
    
    setSaving(true); // Set saving state to true
    setSuccessMessage(''); // Clear any previous success message
    
    try {
      // Ensure classes array exists and currentClass is set
      const profileToSave = {
        ...profile,
        id: profile.id || Date.now(),
        email: profile.email || '',
        classes: profile.classes || [],
        currentClass: profile.currentClass || profile.class || '',
        class: profile.currentClass || profile.class || '',
        branch: profile.branch || 'Hay Demashq Branch', // Add missing branch property
        updatedAt: new Date()
      } as TeacherProfile;
      
      // Wait for the save operation to complete
      await saveTeacherProfile(profileToSave);
      
      // Update the profile context to reflect that a profile now exists
      setHasProfile(true);
      
      // Set success message
      setSuccessMessage('Profile saved successfully!');
      
      // Navigate to home immediately since we've updated the context
      navigate('/', { replace: true });
      
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Error saving profile. Please try again.');
    } finally {
      setSaving(false); // Always reset saving state
    }
  };

  if (loading) {
    return (
      <div className="profile-setup loading">
        <div className="spinner"></div>
        <p>{t('loading')}...</p>
      </div>
    );
  }

  return (
    <div className="profile-setup">
      <HomeButton />
      <div className="container">
        <h1>{t('teacherProfileSetup')}</h1>
        <p>{t('enterYourDetails')}</p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">{t('teacher')}</label>
            <input
              type="text"
              id="name"
              name="name"
              value={profile.name}
              onChange={handleChange}
              required // Keep name as mandatory
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={profile.email || ''}
              onChange={handleChange}
              // Email is now optional
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="subject">{t('subject')}</label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={profile.subject}
              onChange={handleChange}
              // Subject is now optional
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="grade">{t('grade')}</label>
              <input
                type="text"
                id="grade"
                name="grade"
                value={profile.grade}
                onChange={handleChange}
                required // Keep grade as mandatory
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="class">{t('className')}</label>
              <input
                type="text"
                id="class"
                name="class"
                value={profile.class}
                onChange={handleChange}
                // Class is now optional
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="school">{t('schoolBranch')}</label>
            <input
              type="text"
              id="school"
              name="school"
              value={profile.school || ''}
              onChange={handleChange}
            />
          </div>
          
          {/* Multiple Classes Management */}
          <div className="form-group">
            <label>Add Classes</label>
            <div className="add-class-section">
              <input
                type="text"
                value={newClass}
                onChange={(e) => setNewClass(e.target.value)}
                placeholder="Enter class name"
                className="add-class-input"
              />
              <button 
                type="button" 
                className="btn-add-class"
                onClick={handleAddClass}
                disabled={!newClass.trim()}
              >
                Add Class
              </button>
            </div>
            
            {profile.classes && profile.classes.length > 0 && (
              <div className="classes-list">
                <p>Current Classes:</p>
                <ul>
                  {profile.classes.map((cls) => (
                    <li key={cls} className="class-item">
                      <span>{cls}</span>
                      <button 
                        type="button" 
                        className="btn-remove-class"
                        onClick={() => handleRemoveClass(cls)}
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {profile.classes && profile.classes.length > 0 && (
              <div className="form-group">
                <label htmlFor="currentClass">Select Current Class</label>
                <select
                  value={profile.currentClass || ''}
                  onChange={handleCurrentClassChange}
                  className="class-select"
                >
                  <option value="">Select a class</option>
                  {profile.classes.map((cls) => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
          
          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? t('saving') + '...' : t('save')}
            </button>
          </div>
        </form>
        
        {/* Success message display */}
        {successMessage && (
          <div className="success-message">
            {successMessage}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileSetup;