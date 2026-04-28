import './LoadingSpinner.css'
import React from 'react'

import { ProgressSpinner } from 'primereact/progressspinner'


interface Props {
    className?: string;
}

//Functional Component
const LoadingProgress: React.FC<Props> = ({className}) => {
    return (<>
        <div className={`flex 
        justify-content-center 
        align-items-center 
        absolute 
        bottom-0
        top-0
        left-0
        right-0 
        z-5 
        bg-black-alpha-20
        ${className}
        `}>
        <ProgressSpinner style={{width: '50px', height: '50px'}} strokeWidth="8" animationDuration="1s"/>
        </div>
    </>)
}

export default LoadingProgress