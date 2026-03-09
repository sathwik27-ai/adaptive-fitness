import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../features/authSlice';
import { useGetMeQuery } from '../../services/apiSlice';

// Silently fetch user on app load if a session cookie exists
export default function AuthInitializer({ children }) {
    const dispatch = useDispatch();
    const { data, isSuccess } = useGetMeQuery(undefined, {
        // Skip if cookie is not present (will fail silently)
    });

    useEffect(() => {
        if (isSuccess && data?.user) {
            dispatch(setCredentials(data.user));
        }
    }, [isSuccess, data, dispatch]);

    return children;
}
