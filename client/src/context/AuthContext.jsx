import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

const readApiResponse = async (response) => {
  const responseText = await response.text();
  let result = null;

  if (responseText) {
    try {
      result = JSON.parse(responseText);
    } catch {
      const message = response.status >= 500
        ? `The Skyline API returned HTTP ${response.status}. Check that the backend is running on port 5000.`
        : `The Skyline API returned an invalid response (HTTP ${response.status}).`;
      throw new Error(message);
    }
  }

  if (!response.ok) {
    throw new Error(result?.message || `Request failed with HTTP ${response.status}.`);
  }

  if (!result) {
    throw new Error('The Skyline API returned an empty response. Check the backend server.');
  }

  return result;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [authLoading, setAuthLoading] = useState(Boolean(token));
  const [managedEventIds, setManagedEventIds] = useState([]);
  const [approvedVolunteerEventIds, setApprovedVolunteerEventIds] = useState([]);

  useEffect(() => {
    let cancelled = false;

    const validateToken = async () => {
      if (!token) {
        setAuthLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const result = await readApiResponse(response);

        if (!cancelled) {
          setUser(result.data.user);
        }
      } catch {
        if (!cancelled) {
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      } finally {
        if (!cancelled) {
          setAuthLoading(false);
        }
      }
    };

    validateToken();

    return () => {
      cancelled = true;
    };
  }, [token]);

  useEffect(() => {
    let cancelled = false;

    const loadManagedEvents = async () => {
      if (!token || !user?._id) {
        setManagedEventIds([]);
        setApprovedVolunteerEventIds([]);
        return;
      }

      const response = await fetch('/api/events', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await readApiResponse(response);

      const userId = String(user._id);
      const assignedIds = (result.data?.events || [])
        .filter((event) =>
          String(event.createdBy?._id || event.createdBy || '') === userId ||
          event.managers?.some((manager) => String(manager?._id || manager) === userId)
        )
        .map((event) => String(event._id));

      if (!cancelled) setManagedEventIds(assignedIds);

      if (user.role !== 'officer' && user.role !== 'treasurer') {
        const volunteerApplications = await Promise.all(
          (result.data?.events || []).map(async (event) => {
            const applicationResponse = await fetch(`/api/events/${event._id}/volunteers`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (!applicationResponse.ok) return null;
            const applicationResult = await applicationResponse.json();
            const application = applicationResult.data?.applications?.[0];
            return application?.status === 'approved' ? String(event._id) : null;
          }),
        );
        if (!cancelled) {
          setApprovedVolunteerEventIds(volunteerApplications.filter(Boolean));
        }
      } else if (!cancelled) {
        setApprovedVolunteerEventIds([]);
      }
    };

    loadManagedEvents().catch((error) => {
      console.error(error.message || 'Unable to load event assignments.');
      if (!cancelled) setManagedEventIds([]);
    });

    return () => {
      cancelled = true;
    };
  }, [token, user?._id]);

  const authenticate = async (endpoint, payload) => {
    let response;
    try {
      response = await fetch(`/api/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch {
      throw new Error('Cannot reach the Skyline API. Start the backend with `npm run dev:server` from the SKYLINE folder.');
    }
    const result = await readApiResponse(response);

    const { token: newToken, user: authenticatedUser } = result.data;
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(authenticatedUser);
    return authenticatedUser;
  };

  const login = (credentials) => authenticate('login', credentials);

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setManagedEventIds([]);
  };

  const register = (userData) => authenticate('register', userData);

  const refreshUser = async () => {
    if (!token) return null;

    const response = await fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const result = await readApiResponse(response);

    setUser(result.data.user);
    return result.data.user;
  };

  const isMember = user?.membershipStatus === 'active';
  const isStudent = user?.role === 'student';
  const isTreasurer = user?.role === 'treasurer';
  const isOfficer = user?.role === 'officer';
  const isAdmin = isOfficer;
  const isExecutive = isTreasurer || isOfficer;
  const isEventManager = managedEventIds.length > 0;
  const canScan = isOfficer || isEventManager || approvedVolunteerEventIds.length > 0;
  const canAccessTreasury = isExecutive;
  const canManageMembers = isOfficer;
  const canSubmitExpenses = isExecutive || approvedVolunteerEventIds.length > 0;
  const canAccessProjects = isOfficer || managedEventIds.length > 0 || approvedVolunteerEventIds.length > 0;

  return (
    <AuthContext.Provider value={{
      user,
      token,
      authLoading,
      login,
      logout,
      register,
      refreshUser,
      isMember,
      isStudent,
      isTreasurer,
      isOfficer,
      approvedVolunteerEventIds,
      isAdmin,
      isExecutive,
      canScan,
      canAccessTreasury,
      canManageMembers,
      canSubmitExpenses,
      canAccessProjects,
      managedEventIds,
      isEventManager,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
