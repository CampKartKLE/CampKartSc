// client/src/context/RoleContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const RoleContext = createContext(null);

export const ROLES = {
    CUSTOMER: 'customer',
    SELLER: 'seller',
    ADMIN: 'admin',
};

export const RoleProvider = ({ children }) => {
    const { user, isAuthenticated } = useAuth();
    const [currentRole, setCurrentRole] = useState(ROLES.CUSTOMER);
    const [uiMode, setUiMode] = useState('buyer'); // 'buyer' or 'seller'
    const [isApprovedSeller, setIsApprovedSeller] = useState(false);

    useEffect(() => {
        if (isAuthenticated && user) {
            // Role comes from backend (user.role)
            const role = user.role || ROLES.CUSTOMER;
            setCurrentRole(role);
            setIsApprovedSeller(user.role === ROLES.SELLER || !!user.isApprovedSeller);

            // UI Mode persistence for sellers
            const savedMode = localStorage.getItem('campkart_ui_mode');
            if (savedMode && (user.role === ROLES.SELLER || user.role === ROLES.ADMIN)) {
                setUiMode(savedMode);
            } else {
                setUiMode('buyer');
            }
        } else {
            setCurrentRole(ROLES.CUSTOMER);
            setUiMode('buyer');
            setIsApprovedSeller(false);
        }
    }, [isAuthenticated, user]);

    const switchUiMode = () => {
        if (isApprovedSeller || currentRole === ROLES.SELLER || currentRole === ROLES.ADMIN) {
            const newMode = uiMode === 'buyer' ? 'seller' : 'buyer';
            setUiMode(newMode);
            localStorage.setItem('campkart_ui_mode', newMode);
        }
    };

    const value = {
        currentRole,
        uiMode,
        isApprovedSeller,
        ROLES,
        switchUiMode,
        isSeller: currentRole === ROLES.SELLER,
        isAdmin: currentRole === ROLES.ADMIN,
    };

    return (
        <RoleContext.Provider value={value}>
            {children}
        </RoleContext.Provider>
    );
};

export const useRole = () => {
    const context = useContext(RoleContext);
    if (!context) {
        throw new Error('useRole must be used within a RoleProvider');
    }
    return context;
};
