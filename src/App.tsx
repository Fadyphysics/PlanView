import { useEffect, useState, createContext, useContext } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // Using react-i18next's hook
import { initDb } from './utils/indexedDbUtils';
import './App.css';
import HomeScreen from './components/HomeScreen';
import ProfileSetup from './components/ProfileSetup';
import WeeklyPlanEditor from './components/WeeklyPlanEditor';
import DayEditor from './components/DayEditor';
import ReviewScreen from './components/ReviewScreen';
import './utils/i18n'; // Initialize i18n

// Create a context for profile status
interface ProfileContextType {
  hasProfile: boolean;
  setHasProfile: (hasProfile: boolean) => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

// Custom hook to use the profile context
export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};

// Wrapper component to handle location changes and profile checking
function AppContent() {
  const location = useLocation();
  const { i18n } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize the database
        await initDb();
        
        // Check if teacher profile exists
        const { getTeacherProfile } = await import('./utils/indexedDbUtils');
        const profile = await getTeacherProfile();
        setHasProfile(!!profile);
      } catch (error) {
        console.error('Error initializing app:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  // Check profile status when location changes (especially after saving)
  useEffect(() => {
    const checkProfileStatus = async () => {
      if (!isLoading) {
        const { getTeacherProfile } = await import('./utils/indexedDbUtils');
        const profile = await getTeacherProfile();
        setHasProfile(!!profile);
      }
    };
    
    // Only check if we're on the profile setup page
    if (location.pathname === '/profile-setup') {
      checkProfileStatus();
    }
  }, [location.pathname, isLoading]);

  // Set RTL for Arabic - moved before the conditional return to maintain hook order
  useEffect(() => {
    if (selectedLanguage) {
      document.documentElement.dir = selectedLanguage === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = selectedLanguage;
    }
  }, [selectedLanguage]);

  const handleLanguageSelect = (lang: string) => {
    setSelectedLanguage(lang);
    i18n.changeLanguage(lang);
    setShowLanguageModal(false);
  };

  // Provide the context value
  const contextValue = {
    hasProfile,
    setHasProfile
  };

  // Show language selection modal first
  if (showLanguageModal) {
    return (
      <div className="language-selection-modal">
        <div className="modal-content">
          <h2 className="modal-title">Choose Language<br />اختر اللغة</h2>
          <div className="language-buttons">
            <button 
              className="language-btn english-btn"
              onClick={() => handleLanguageSelect('en')}
            >
              English
            </button>
            <button 
              className="language-btn arabic-btn"
              onClick={() => handleLanguageSelect('ar')}
            >
              عربي
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="app-loading">
        <div className="spinner"></div>
        <p>Loading PlanView...</p>
      </div>
    );
  }

  return (
    <ProfileContext.Provider value={contextValue}>
      <div className={`App ${i18n.language === 'ar' ? 'rtl' : 'ltr'}`}>
        <Routes>
          {/* Redirect to profile setup if no profile exists, otherwise go to home */}
          <Route path="/" element={
            !hasProfile ? <Navigate to="/profile-setup" replace /> : <HomeScreen />
          } />
          
          <Route path="/profile-setup" element={<ProfileSetup />} />
          <Route path="/weekly-plan" element={<WeeklyPlanEditor />} />
          <Route path="/day/:dayIndex" element={<DayEditor />} />
          <Route path="/review" element={<ReviewScreen />} />
          {/* Catch-all route for unmatched paths */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </ProfileContext.Provider>
  );
}

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AppContent />
    </Router>
  );
}

export default App;