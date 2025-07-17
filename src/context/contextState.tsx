'use client';

import { createContext, useContext, useMemo, useState } from 'react';

// Message box type
type MessageBoxState = {
  message: string;
  type: 'info' | 'error' | 'success';
  show: boolean;
};

// Context type
type ContextStateType = {
  uploading: boolean;
	setUploading: (loading: boolean) => void;
	
	deleting: boolean;
	setDeleting: (loading: boolean) => void;
	
  downloading: boolean;	 
  setDownloading: (loading: boolean) => void;
	
  messageBox: MessageBoxState;
  setMessageBox: (state: Partial<MessageBoxState>) => void;
  closeMessageBox: () => void;
};

// Create context
const ContextState = createContext<ContextStateType | undefined>(undefined);

// Provider
export const ContextStateProvider = ({ children }: { children: React.ReactNode }) => {
  // Uploading/downloading state
  const [uploading, setUploading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Message box state
  const [messageBox, setMessageBoxState] = useState<MessageBoxState>({
    message: '',
    type: 'info',
    show: false,
  });

  const setMessageBox = (state: Partial<MessageBoxState>) => {
    setMessageBoxState((prev) => ({
      ...prev,
      ...state,
      show: true,
    }));
  };

  const closeMessageBox = () => {
    setMessageBoxState((prev) => ({
      ...prev,
      message: '',
      show: false,
    }));
  };

  // Memoize context value to avoid unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      uploading,
			setUploading,
      downloading, 
      setDownloading,
			deleting,
			setDeleting,
      messageBox,
      setMessageBox,
      closeMessageBox,
    }),
    [uploading, downloading, messageBox, deleting]
  );

  return (
    <ContextState.Provider value={contextValue}>
      {children}
    </ContextState.Provider>
  );
};

// Hook
export const useContextState = () => {
  const context = useContext(ContextState);
  if (!context) {
    throw new Error('useContextState must be used within ContextStateProvider');
  }
  return context;
};
