import { Button } from 'primereact/button';
import React, { useState } from 'react'
import './MessageModal.css'

interface Props {
    display: boolean;
    message?: string;
}

//Functional Component
const MessageModal: React.FC<Props> = ({display, message}) => {
    const [close, setClose] = useState(false)

    const onClose = () => {
        setClose(true)
    }
    
    return (<>
    {/* <div className='overlay-dialog' style={{animationName: display && !close ? 'animateModalOpen' : 'animateModalClose', }}> */}
    <div className='overlay-dialog' style={{display: display && !close ? 'flex' : 'none'}}>
        <div className="modal-content">
            {message}
            <div className='close-button'>
                <Button onClick={onClose} label='Ok'/>
            </div>
        </div>
    </div>
    </>
    )
}

export default MessageModal