import React, { createContext, useEffect, useState } from 'react';
import { AuthContextType } from '../../types/AuthContextType';
import { Rank, Role, User } from '../../types/UserType';
import { useQuery } from '@tanstack/react-query';
import { getAccountAPI } from 'src/services/api.me.service';


export const AuthContext = createContext<AuthContextType>({
    user: null,
    setUser: () => { },
    isAppLoading: false,
    setIsAppLoading: () => { }
});



export const AuthWrapper = (props: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isAppLoading, setIsAppLoading] = useState(true);

    const { data, isLoading } = useQuery({
        queryKey: ["account"],
        queryFn: getAccountAPI,
        retry: 2,
    });

    useEffect(() => {
        if (data?.data?.user) {
            setUser(data.data.user);
        } else {
            setUser(null);
        }
        setIsAppLoading(isLoading);
    }, [data, isLoading]);

    return (
        <AuthContext.Provider value={{ user, setUser, isAppLoading, setIsAppLoading }}>
            {props.children}
        </AuthContext.Provider>
    );
}