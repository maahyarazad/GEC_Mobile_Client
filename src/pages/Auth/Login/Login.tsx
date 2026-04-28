import { Button } from 'primereact/button'
import { Checkbox } from 'primereact/checkbox'
import { Dialog } from 'primereact/dialog'
import { InputText } from 'primereact/inputtext'
import React, { ChangeEvent, useContext, useState, useEffect, KeyboardEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { ILoginCreds } from '../../../@types/Auth'
import { AuthContext } from '../../../services/Auth/Auth.context'
import { AuthService } from '../../../services/Auth/Auth.service'
import { StorageService } from '../../../services/Storage/Storage.service'
import Cookies from 'js-cookie';
import './Login.css'

        
interface Props {

}

//Functional Component
const Login: React.FC<Props> = () => {

    const navigation = useNavigate();
    const {setToken} = useContext(AuthContext)
    const [showDialog, setShowDialog] = useState(false)
    const [dialogHeader, setDialogHeader] = useState("")
    const [dialogMsg, setDialogMsg] = useState("")
    const [hasSubmitted, setHasSubmitted] = useState(false)
    const [state, setState] = useState<ILoginCreds>({
       username: '',
       password: '' 
    })

    const handleMessage = (header: string, message: string) => {
        setDialogHeader(header)
        setDialogMsg(message)
        setShowDialog(true)
    }

    const handleLogin = async () => {
        try {
            setHasSubmitted(true)
            console.log(state)
            if(state.username.trim() === '' ||
                state.password.trim() === ''
            ){
                handleMessage("Empty Fields", "Some fields are empty")
                return;
            }

            const response = await AuthService.login(state)
            if(!response.success){
                handleMessage(response.data.title, response.data.message)
                return;
            }
debugger;
            const token = response.data;
            StorageService.storeToken(response.data)
            //@ts-ignore
           localStorage.setItem('user', response?.user);

            setToken(response.data)

            const roles = await AuthService.roles()
            StorageService.storeRole(JSON.stringify(roles.data))

            navigation('/')
            return;
        } catch (error) {
            
        } finally {
            setHasSubmitted(false)
        }
        
    }

    const closeDialog = () => {
        setShowDialog(false)
    }

    const handleUsernameChange = (e: ChangeEvent<HTMLInputElement>) => {
        console.log(e.target.value)
        setState({...state, username: e.target.value})
    }

    const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
        console.log(e.target.value)
        setState({...state, password: e.target.value})
    }
    
    const handleEnterKey = (e: KeyboardEvent<HTMLInputElement>) => {
        if(e.key === 'Enter'){
            handleLogin();
        }
    }


    useEffect(() => {
        console.log("state",state);
        if(Cookies.get('__au_ol')) {
            setState({username:'*',password:'*',auto:Cookies.get('__au_ol')});
            if (state.username && state.password){
                handleLogin();
                Cookies.remove('__au_ol');
            }
        }
    },[state.username])

    return (<>
        <div className="flex align-items-center justify-content-center h-full">
        <div className="surface-card p-4 shadow-2 border-round w-full lg:w-4 sm:w-10 md:w-6">
        <div className="text-center mb-5">
            <div className="text-900 text-3xl font-medium mb-3">GEC Apps Control Panel</div>
        </div>

        <div>
            <label htmlFor="username" className="block text-900 font-medium mb-2 text-left">Username</label>
            <InputText id="username" onKeyDown={handleEnterKey} onChange={handleUsernameChange} type="text" className="w-full mb-3" />

            <label htmlFor="password" className="block text-900 font-medium mb-2 text-left">Password</label>

            <InputText id="password" onKeyDown={handleEnterKey} type="password" onChange={handlePasswordChange} className="w-full mb-3" />

            {/* <div className="flex align-items-center justify-content-between mb-6">
                <a className="font-medium no-underline ml-2 text-blue-500 text-right cursor-pointer">Forgot your password?</a>
            </div> */}

            <Button loading={hasSubmitted} onClick={handleLogin} label="Sign In" icon="pi pi-user" style={{width: '100%'}} size='small' />
        </div>
    </div>
</div>
    <Dialog header={dialogHeader} breakpoints={{'960px': '75vw', '640px': '100vw'}} style={{width: '30vw'}} onHide={closeDialog} closeOnEscape={true} draggable={false} visible={showDialog}>
       {dialogMsg}
    </Dialog>
    </>)
}

export default Login
