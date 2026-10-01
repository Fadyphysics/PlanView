import React from 'react';
import type { TeacherProfile } from '../models';
import './ClassSelectionModal.css';

interface ClassSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectClass: (className: string) => void;
  profile: TeacherProfile | null;
}

const ClassSelectionModal: React.FC<ClassSelectionModalProps> = ({
  isOpen,
  onClose,
  onSelectClass,
  profile
}) => {
  if (!isOpen || !profile || !profile.classes || profile.classes.length === 0) {
    return null;
  }

  return (
    <div className="class-selection-modal-overlay" onClick={onClose}>
      <div className="class-selection-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Select Class</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <p>Please select a class to create lesson plans for:</p>
          <ul className="class-list">
            {profile.classes.map((cls, index) => (
              <li key={index} className="class-item">
                <button 
                  className={`class-button ${profile.currentClass === cls ? 'selected' : ''}`}
                  onClick={() => onSelectClass(cls)}
                >
                  {cls}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ClassSelectionModal;