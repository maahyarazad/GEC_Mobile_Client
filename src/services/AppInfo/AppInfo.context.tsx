import React, { createContext, FC, useEffect, useState } from 'react'
import { IApp } from '../../@types/AppInfo';
import { AppInfoService } from './AppInfo.service';


interface Props {
    children: React.ReactNode;
}



export const AppInfoContext = createContext<any>([])
export const AppInfoContextProvider:FC<Props> = ({children}) => {

    const [appList, setAppList] = useState<IApp[]>([])

    useEffect(() => {
         AppInfoService.getAppList()
        .then(result => {
            // console.log("Result:", result)
            handleAppListUpdate(result)
        }).catch(err=>{
            console.log(err)
        })
    
    }, [])
    

    const handleAppListUpdate = (newValue: IApp[]) => {
        setAppList(newValue)
    }

    const contextValue = {
        appList,
        handleAppListUpdate
    }

    

    return <AppInfoContext.Provider value={contextValue}>
        {children}
    </AppInfoContext.Provider>
}