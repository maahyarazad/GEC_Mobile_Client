import { ProgressSpinner } from 'primereact/progressspinner'
import React, { useEffect } from 'react'
import { useAuth } from '../../services/Auth/Auth.context'
import { config } from '../../utils/constants/constants'
import { history } from '../../utils/history/history'

interface Props {

}

//Functional Component
const SessionExpired: React.FC<Props> = () => {

    const {setToken} = useAuth()

    useEffect(() => {
      let isMounted = true

      if(isMounted){
        setToken(null)
        setTimeout(() => {
            history.replace(`${process.env.REACT_APP_PROXY}/login`)
        }, 3000);
      }
    
      return () => {
        isMounted = false   
      }
    }, [])
    

    return (<>
    <div className="absolute top-0 left-0 right-0 bottom-0 flex justify-content-center align-items-center" style={{zIndex: 10, backgroundColor: '#00000088'}}>
        <div className="bg-white p-5 border-round text-center w-20rem">
            <ProgressSpinner strokeWidth="4"/>
            <p className="text-lg font-bold">SESSION EXPIRED</p>
            Redirecting to Login
        </div>
    </div></>)
}

export default SessionExpired