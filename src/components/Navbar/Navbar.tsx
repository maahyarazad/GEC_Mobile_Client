import './Navbar.css'
import React, { useState,useRef, useLayoutEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { links } from './links'
import { IAdminRelease } from '../../@types/AdminRelease';
import { StorageService } from '../../services/Storage/Storage.service';
import { MdChevronLeft, MdChevronRight } from 'react-icons/md';
import { useAuth } from '../../services/Auth/Auth.context';

type RIIcon = React.FC<{ size?: number; className?: string }>;

const CollapseIcon = MdChevronLeft as unknown as RIIcon;
const ExpandIcon = MdChevronRight as unknown as RIIcon;

const Navbar: React.FC = () => {
    const { token } = useAuth();
    const [accessibleApps, setAccessibleApps] = useState<IAdminRelease[]>([]);
    const [collapsed, setCollapsed] = useState(false);
    const location = useLocation();

    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useLayoutEffect(() => {
        // Only read roles for authenticated users. Reading roles while logged out
        // fires an unauthenticated /admin/roles request that fails with
        // "Authentication failed" and an unbounded 500ms retry loop.
        if (!token) {
            setAccessibleApps([]);
            return;
        }

        let attempts = 0;
        const MAX_ATTEMPTS = 10; // ~5s of polling while roles are fetched

        const loadRoles = () => {
            const storageRoles = StorageService.retrieveRoles();

            if (!storageRoles) {
                if (attempts++ >= MAX_ATTEMPTS) return;
                timeoutRef.current = setTimeout(loadRoles, 500);
                return;
            }

            setAccessibleApps(storageRoles as IAdminRelease[]);
        };

        loadRoles();

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [token]);

    if (!token) return null;

    return (
        <nav className={`gcc-navbar ${collapsed ? 'gcc-navbar--collapsed' : ''}`}>
            <div className='gcc-navbar__header'>
                {!collapsed && <span className='gcc-navbar__title'>GEC APP Admin</span>}
                <button
                    className='gcc-navbar__toggle'
                    onClick={() => setCollapsed(prev => !prev)}
                    aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                    {collapsed ? <ExpandIcon size={20} /> : <CollapseIcon size={20} />}
                </button>
            </div>

            <ul className='gcc-navbar__list'>
                {links.map((link, index) => {
                    const appRole = accessibleApps.find(ar => link.id == ar.appId);
                    if (link.id && !appRole) return null;
                    if (appRole && appRole.r !== '1') return null;

                    const isActive = location?.pathname?.split('/')[1] === link?.link?.replace(/^\//, '');
                    const Icon = link.icon ? (link.icon as unknown as RIIcon) : null;
                    const isLogout = link.name === 'Log Out';

                    return (
                        <li key={'link_' + index} className={`gcc-navbar__item ${isLogout ? 'gcc-navbar__item--logout' : ''}`}>
                            <NavLink
                                to={link.link}
                                className={`gcc-navbar__link ${isActive ? 'gcc-navbar__link--active' : ''}`}
                                title={collapsed ? link.name : undefined}
                            >
                                {isActive && <span className='gcc-navbar__indicator' />}
                                {Icon && <Icon size={20} className='gcc-navbar__icon' />}
                                {!collapsed && <span className='gcc-navbar__label'>{link.name}</span>}
                            </NavLink>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
};

export default Navbar;
