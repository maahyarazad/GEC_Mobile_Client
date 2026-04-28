import React from 'react'
import './PageNotFound.css'

interface Props {

}

//Functional Component
const PageNotFound: React.FC<Props> = () => {
    return (<>
        <div className="flex justify-content-center align-items-center h-full">
            <div className='flex  align-items-center' style={{flexDirection: 'column'}}>
                <i style={{fontSize: 200}} className='pi pi-times-circle text-gray-400' ></i>
            
               <span className='text-gray-400' style={{fontSize: 50, marginTop: 30}}>404 Page Not Found</span>
            </div>
        </div>
    </>)
}

export default PageNotFound