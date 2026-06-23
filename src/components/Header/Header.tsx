import React from 'react'
import { useAuth } from '../../services/Auth/Auth.context'
import { config } from '../../utils/constants/constants'
import './Header.css'
import logo from '../../assets/gec-logo.png'
import ClockComponent from './ClockComponent'

const Header: React.FC = () => {
    const { token } = useAuth()
    const user = localStorage.getItem('user');

    return (
        <div className='flex align-items-center p-2 justify-content-between header-navbar' style={{ backgroundColor: '#2b2c38' }}>
            <div className='flex align-items-center'>
                <img src={logo} height={50} />
                <div className='flex flex-column pl-3'>
                    <span className='text-white p-0 pb-1'><strong>{config.APP_NAME}</strong></span>
                    <span className='text-white p-0' style={{ fontSize: 10 }}>Admin Area</span>
                </div>
            </div>
            <div className='flex align-items-center' style={{ color: 'white', fontWeight: 300, fontSize: '0.8rem' }}>
                {token && <span className='pr-3'>Logged in as <strong>{user}</strong></span>}
                {token && <span className='mx-3'>|</span>}
                <ClockComponent />
            </div>
        </div>
    )
}

export default Header
