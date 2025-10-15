import React, { createContext, useEffect, useState } from 'react';
import { AuthContextType } from '../../types/auth/AuthContextType';
import { useQuery } from '@tanstack/react-query';
import { DEFAULT_USER, UserAuth } from 'src/types/user/UserType';
import { getAccountAPI } from 'src/services/api.services';


export const AuthContext = createContext<AuthContextType>({
    user: null,
    setUser: () => { },
    isAppLoading: false,
    setIsAppLoading: () => { }
});



export const AuthWrapper = (props: { children: React.ReactNode }) => {
    const [user, setUser] = useState<UserAuth | null>(null);
    const [isAppLoading, setIsAppLoading] = useState(true);

    const { data, isLoading } = useQuery({
        queryKey: ["account"],
        queryFn: getAccountAPI,
        retry: 2,
    });

    useEffect(() => {
        if (data?.data?.length > 0) {
            console.log("check user auth me", data?.data)
            console.log("check data", data)
            console.log("check user name", data?.data[0].username)
            setUser(data?.data[0]);
        } else {
            setUser(DEFAULT_USER);
        }
        setIsAppLoading(isLoading);
    }, [data, isLoading]);

    return (
        <AuthContext.Provider value={{ user, setUser, isAppLoading, setIsAppLoading }}>
            {props.children}
        </AuthContext.Provider>
    );
}