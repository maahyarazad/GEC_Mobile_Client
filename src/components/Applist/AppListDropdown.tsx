import { Dropdown, DropdownChangeEvent,  } from 'primereact/dropdown'
import React, { useEffect, useState } from 'react'
import { IApp } from '../../@types/AppInfo'
import { AppInfoService } from '../../services/AppInfo/AppInfo.service'
import MessageModal from '../MessageModal/MessageModal'
import './AppListDropdown.css'

interface Props {
    dropdownChange: (e: DropdownChangeEvent) => void;
    selectedApp: IApp | null;
}

//Functional Component
const AppListDropdown: React.FC<Props> = ({dropdownChange, selectedApp}) => {
    const [appList, setAppList] = useState<IApp[]>();
    const [modal, setModal] = useState({show: false, message: ""})
    

    useEffect(() => {
      let isMounted = true

      const getAppList = async () => {
        try {
            
            const response = await AppInfoService.getAppList();
            if(isMounted && response){
                setAppList(response)
            }
        } catch (error) {
            setModal({show: true, message: 'Could not get application list.'})
        }

      }

      getAppList();
    
      return () => {
        isMounted = false
      }
    }, [])
    

    return (<>

      <MessageModal display={modal.show} message={modal.message}/>
        <Dropdown className='w-full text-left' 
            dataKey='id' 
            placeholder='Select an App' 
            panelClassName='text-xs' 
            value={selectedApp} 
            options={appList} 
            onChange={dropdownChange} 
            optionLabel={'name'}  />
    </>)
}

export default AppListDropdown