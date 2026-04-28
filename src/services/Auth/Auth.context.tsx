import { ProgressSpinner } from "primereact/progressspinner";
import React, { useEffect, useState } from "react";
import { createContext, FC } from "react";
import { StorageService } from "../Storage/Storage.service";

interface Props {
    children: React.ReactNode;
}

export const AuthContext = createContext<any>([]);

export const AuthContextProvider: FC<Props> = ({children}) => {
        const [token, setToken] = useState<string | null>(null)

        const contextValue = {
            token, setToken
        }

        useEffect(() => {
          let isMounted = true;
            const getToken = () => {
            const storedToken =  StorageService.retrieveToken();
            setToken(storedToken)
            }
          if(isMounted){
            getToken();
          }
        
          return () => {
            isMounted = false
          }
        }, [])
        

    return (<>
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    </>
    )
}