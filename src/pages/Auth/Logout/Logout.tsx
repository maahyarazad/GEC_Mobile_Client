import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../services/Auth/Auth.context';
import { StorageService } from '../../../services/Storage/Storage.service';
import Cookies from 'js-cookie';
import './Logout.css'

interface Props {

}

//Functional Component
const Logout: React.FC<Props> = () => {
    const navigate = useNavigate();
    const {setToken} = useAuth()

    useEffect(() => {
      let isMounted = true

      const removeToken = async () => {

        await StorageService.removeToken();
        await StorageService.removeRoles();
        setToken(null)
      }

      if(isMounted){
        Cookies.remove('__i_a_u');
        removeToken();
        navigate('/login')
      }
    
      return () => {
        isMounted = false
      }
    }, [])
    

    return (<>
    <div>
        what
    </div>
    </>)
}

export default Logout
