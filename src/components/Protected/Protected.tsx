import React, { ReactNode, useEffect, useLayoutEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { StorageService } from '../../services/Storage/Storage.service'
import './Protected.css'

interface Props {
    children: ReactNode
}

//Functional Component
const Protected: React.FC<Props> = ({children}) => {
    const navigate = useNavigate()
    
    useEffect(() => {
      let isMounted = true

      if(isMounted){
        const token = StorageService.retrieveToken();
        if(!token){

            navigate('/login')
        }
      }
    
      return () => {
        isMounted = false
      }
    }, [])
    

    return (<>
        {children}
    </>)
}

export default Protected