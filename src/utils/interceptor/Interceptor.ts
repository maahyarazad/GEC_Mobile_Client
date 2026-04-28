import axios from 'axios'
import { StorageService } from '../../services/Storage/Storage.service'
import { config } from '../constants/constants'
import { history } from '../history/history'

let headers = {}

export const axiosInstance = axios.create({
    baseURL: config.BASE_URL,
    headers,
})

const logout = () => {
    StorageService.removeToken();
    StorageService.removeRoles();
    history.replace(`${process.env.REACT_APP_PROXY}/session-expired`)
}

axiosInstance.interceptors.request.use(
    async (config) => {

        const token = StorageService.retrieveToken();
        if (token && config && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
            
        return config;

    }, (error: any)=>{

        console.log("Axios Error: ", error.message)
        return Promise.reject(error)
    }
)


axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error: any) => {
        // Optional: handle specific status codes
        if (error.response?.status === 403) {
            logout();
        }
        
        //
        if (error.response) {
            const detail = Object.entries(error.response.data)
            .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
            .join('\n');
            return Promise.reject(detail)
        };
      
   

    // Pass the full error down so your catch blocks can see it
    return Promise.reject(error);
  }
);
