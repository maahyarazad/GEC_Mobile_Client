import { Button } from 'primereact/button'
import { Sidebar } from 'primereact/sidebar'
import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../../services/Auth/Auth.context'
import { StorageService } from '../../services/Storage/Storage.service'
import { config } from '../../utils/constants/constants'
import Navbar from '../Navbar'
import './Header.css'
import logo from '../../assets/20-Jahre.webp'
import CHookDateTime from './Time';
import { Tooltip } from 'primereact/tooltip';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import ClockComponent from './ClockComponent'
interface Props {

}

//Functional Component
const Header: React.FC<Props> = () => {


    const navigate = useNavigate();
    const { setToken } = useContext(AuthContext)

    const logout = () => {

        StorageService.removeToken();
        StorageService.removeRoles();
        setToken(null)
        Cookies.remove('__i_a_u');

        navigate('/login')



    };


    const dateTime = CHookDateTime();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const { token } = useContext(AuthContext)

    useEffect(() => {

    }, [])

    const user = localStorage.getItem('user');
    const openSidebar = () => {
        setIsSidebarOpen(true)
    }

    const closeSidebar = () => {
        setIsSidebarOpen(false)
    }



    return (
        <div className='flex align-items-center p-2 justify-content-between header-navbar' style={{ backgroundColor: '#2b2c38' }}>

            <div className='flex align-items-center '>
                <Sidebar visible={isSidebarOpen} className='p-0 m-0' onHide={() => {
                    setIsSidebarOpen(false);
                }}>
                    <Navbar close={closeSidebar} />
                </Sidebar>


                <Button
                    className='text-white p-button-link none'
                    icon={'pi pi-bars'}
                    onClick={openSidebar} disabled={!token}
                    style={{
                        opacity: token ? 1 : 0,
                        visibility: token ? "visible" : "hidden",
                        transition: "opacity 0.3s ease"
                    }} />
                <div className='flex align-items-center'>
                    <img src={logo} height={50} />
                    <div className='flex flex-column pl-3'>
                        <span className='text-white p-0 pb-1' ><strong>{config.APP_NAME}</strong></span>
                        <span className='text-white p-0' style={{ fontSize: 10 }}>Admin Area</span>
                    </div>
                </div>
            </div>
            <div>
                <div className='flex align-items-center' style={{ color: 'white', fontWeight: 300, fontSize: 15 }}>

                    <strong className={`pr-3 flex`} style={{ fontSize: '0.8rem' }}>
                        <div className='pr-3'>

                            {token && <p> Logged in as <strong>{user}</strong></p>}
                        </div>
                        <div>

                            <p>
                                {token && <span className='mx-3'>|</span>}

                                <ClockComponent />

                            </p>
                        </div>
                    </strong>

                    {token && <>
                        <span className='mx-3'>|</span>
                        <Tooltip target=".logout-icon" style={{ fontSize: 10, whiteSpace: 'nowrap' }} />
                        <div onClick={logout}
                            data-pr-tooltip="Logout"
                            data-pr-position="left"
                            style={{ cursor: 'pointer', display: !token ? 'none' : 'block' }} className='flex logout-icon align-items-center'>
                            <i className="pi pi-sign-out mr-2" style={{ fontSize: '1rem' }}></i><span style={{ fontSize: '0.8rem' }}>{`  Logout`}</span>
                        </div>
                    </>
                    }

                </div>
            </div>
        </div>
    )
}

export default Header
