import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setCredentials, setInitialized } from '../../features/authSlice';
import { useGetMeQuery } from '../../services/apiSlice';

export default function AuthInitializer({ children }) {
    const dispatch = useDispatch();
    const { data, isSuccess, isLoading, isFetching } = useGetMeQuery();

    useEffect(() => {
        if (isLoading || isFetching) return;

        if (isSuccess && data?.user) {
            dispatch(setCredentials(data.user));
        } else {
            dispatch(setInitialized());
        }
    }, [isSuccess, isLoading, isFetching, data, dispatch]);

    return children;
}
