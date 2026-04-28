import './Navbar.css'
import React, { useState, useLayoutEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { links } from './links'
import { IAdminRelease } from '../../@types/AdminRelease';
import { StorageService } from '../../services/Storage/Storage.service';
import { AuthService } from '../../services/Auth/Auth.service';
import logo from '../../assets/20-Jahre.webp';

interface Props {
    close: ()=>void;
}

//Functional Component
const Navbar: React.FC<Props> = ({close: closeSidebar}) => {
    // List of ids to access navigation link. Data is from admin_release [id]
    const [accessibleApps, setAccessibleApps] = useState<IAdminRelease[]>([]);
    const location = useLocation();
    const setRolesToAccessibleApps = function () {
        let storageRoles = StorageService.retrieveRoles();
        
        if (!storageRoles) {
            console.log('Roles in localstorage is empty. Retrieving in 500ms')
            setTimeout(() => {
                setRolesToAccessibleApps();
            }, 500)
        } else {
            const _accessibleApps: IAdminRelease[] = storageRoles;
            setAccessibleApps(_accessibleApps)
        }
    }

    useLayoutEffect(() => {
        
        // get admin_app ids where parentId is {id: 74, title: 'App Admin'}
        // parameter: user
        setRolesToAccessibleApps()
    }, [])
    




    return (
        <div className='navbar'>
            <div className='navbar-header '>
                German Emirates Club
            </div>
            <ul>
            { links.map((link, index)=>{
                const appRole = accessibleApps.find(adminRelease =>  link.id == adminRelease.appId );
                debugger;
                if (link.id && !appRole) {
                    return false;
                }
                else {
                    if (appRole && appRole.r != '1') {
                        return false;
                    } else {
                        const selectedStyle =   location?.pathname?.split("/")[1] === link?.link?.replace(/^\//, "");
                          return <NavLink key={'link_'+index} onClick={closeSidebar} className='links' to={`${link.link}`}>
                                <li className={`nav-list ${selectedStyle? 'text-white': 'text-dark'}`} style={{backgroundColor: `${selectedStyle ? 'var(--primary)': ''}`, fontWeight: 400}}>
                                    {link.name}
                                </li>
                                </NavLink>
                    }
                }
            })}
            {/* { links.map((link, index)=>{
                
                const selectedStyle =   location?.pathname?.split("/")[1] === link?.link?.replace(/^\//, "");

                        return <NavLink key={'link_'+index} onClick={closeSidebar} className='links' to={`${link.link}`}>
                                <li className={`nav-list ${selectedStyle? 'text-white': 'text-dark'}`} style={{backgroundColor: `${selectedStyle ? 'var(--primary)': ''}`, fontWeight: 400}}>
                                    {link.name}
                                </li>
                                </NavLink>
                
                
            })} */}
            </ul>
        
{/* 
            
            <Link to="/dashboard">Dashboard</Link> |{" "}
            <Link to="/requests">Access Requests</Link> */}
            
            {/* <ListBox options={links} /> */}
        </div>
    )
}

export default Navbar