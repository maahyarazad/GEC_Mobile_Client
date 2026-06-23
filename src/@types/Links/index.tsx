import { IconType } from 'react-icons';

export interface INavbarLinks {
    id?: number,
    name: string;
    link: string;
    color?: string;
    icon?: IconType;
}