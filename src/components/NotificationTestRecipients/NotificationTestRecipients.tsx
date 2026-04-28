import { Button } from 'primereact/button';
import { Column, ColumnBodyOptions } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { InputText } from 'primereact/inputtext';
import React, { ChangeEvent, MouseEvent, MouseEventHandler, useEffect, useRef, useState } from 'react'
import { ITestRecipient } from '../../@types/Notification';
import { NotificationService } from '../../services/Notification/Notification.service';
import { OverlayPanel } from 'primereact/overlaypanel'
import { ListBox, ListBoxChangeEvent,  } from 'primereact/listbox'


import './NotificationTestRecipients.css'
import { ProgressSpinner } from 'primereact/progressspinner';

interface Props {
}

//Functional Component
const NotificationTestRecipients: React.FC<Props> = () => {
    
    const overlayRef = useRef<OverlayPanel>(null);
    const [isLoadingUsers, setIsLoadingUsers] = useState(false)
    const [search, setSearch] = useState('')
    const [searchList, setSearchList] = useState<ITestRecipient[] | null>(null)
    const [testRecipients, setTestRecipients] = useState<ITestRecipient[]>([])
    const height = window.innerHeight;
    
    

    useEffect(() => {
      let isMounted = true;
    
        const getRecipients = async () => {
            const response = await NotificationService.getTestRecipients();
            if(!response){
                return;
            }
            setTestRecipients(response)
        }

        getRecipients();

      return () => {
        isMounted = false;
      }
    }, [])

    const renderUserList = (e: ChangeEvent<HTMLInputElement>) => {
        if(overlayRef && overlayRef.current){
          if(e.target.value.length > 2){
            overlayRef.current.show(e, e.target)
          }
        }

        //search in database
        searchRecipient(e.target.value)
    }

    const searchRecipient = async (search_user: string) => {
      setIsLoadingUsers(true)
      const response = await NotificationService.searchUser(search_user);
        setSearchList(response)
        setIsLoadingUsers(false)
    }

    const handleSearchUser = (e: ChangeEvent<HTMLInputElement>) => {
      setSearchList(null)
        setSearch(e.target.value)
        if(overlayRef && overlayRef.current){
          if(e.target.value.length > 2) {
            renderUserList(e)
          }else if(search.length > e.target.value.length && e.target.value.length < 3){
            overlayRef.current.hide()
          }
        }
    }

    
    const onSelectUser = async (e: ListBoxChangeEvent) => {
      console.log(e.value)
      const response = await NotificationService.addTestRecipient(e.value.user_id)
      if(!response.success){
        alert('Not added')
        return;
      }

      if(overlayRef != undefined && overlayRef.current != undefined){

        overlayRef.current.hide();
        setSearch('')
        setSearchList(null)
        setTestRecipients([e.value, ...testRecipients])
      }
    }
    
    const onBlurSearch = () => {
      if(overlayRef && overlayRef.current)
        overlayRef.current.hide();
    }
    
    const onFocusSearch = (e: ChangeEvent<HTMLInputElement>) => {
      if(overlayRef && overlayRef.current && search.length > 2)
            overlayRef.current.show(e, e.target)
        // renderUserList(e)

    }

    const renderHeader = () => {
      return <>
        <div className='flex gap-2 align-items-center text-left'>
          <InputText value={search} onBlur={onBlurSearch} onFocus={onFocusSearch} onChange={handleSearchUser} 
          className='w-4' placeholder='Search user to add'/>
          {
            isLoadingUsers && 
            
          <ProgressSpinner className='m-0 p-0 h-2rem text-left'/>
          }
          <OverlayPanel className='push-recipients-search w-auto' ref={overlayRef}>
            {
              searchList ? 
                searchList.length > 0 ?
                  <ListBox 
                  className='w-full' 
                  listStyle={{maxHeight: height * 0.3}} 
                  options={searchList} 
                  optionLabel={'name'} 
                  onChange={onSelectUser} /> :
                  <div className='p-3'>
                    No results
                  </div>:
                <></>
            }
           
          </OverlayPanel>
          {/* <Button label="Add" className='p-button-success text-xs'/> */}
        </div>
      </>
    }

    const handleRemoveTester = async (user_id: number) => {
      const response = await NotificationService.removeTestRecipient(user_id)
      if(!response.success){
        alert(response.message)
      }


      const _testRecipients = testRecipients.filter((data) => {
        return data.user_id !== user_id
      })
      setTestRecipients(_testRecipients)
    }

    const renderRemoveButton = (rowData: ITestRecipient, row: ColumnBodyOptions) => {
     
      return <>
        <Button className='text-xs w-2rem h-2rem border-circle
                p-button-danger bg-red-600' 
                onClick={()=>handleRemoveTester(rowData.user_id)} 
                icon={'pi pi-minus'}/>
        </>
    }
    
    const header = renderHeader();

    return (<>
        <DataTable className='test-recipients-table' 
                  tableStyle={{maxHeight: 20, backgroundColor: 'palegreen'}} 
                  value={testRecipients} 
                  header={header}
                  scrollHeight='flex' 
                  responsiveLayout='scroll'>
          <Column body={renderRemoveButton} ></Column>
          <Column field='user_id' header="User ID"></Column>
          <Column field='name' header="Name"></Column>
          <Column field='userPushToken' header="Push Token"></Column>
        </DataTable>
    </>)
}

export default NotificationTestRecipients