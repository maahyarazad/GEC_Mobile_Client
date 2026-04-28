//  CHANGE ME from .env file
const MODE = process.env.REACT_APP_NODE_MODE ?? 'prod';

export const SERVER_URL = process.env.REACT_APP_API_URL;

export const config = {  
    BASE_URL: `${SERVER_URL}/v1/api`,
    BASE_URL2: `${SERVER_URL}/v2`,
    APP_NAME: `GEC Mobile Application`,
    MODE: MODE,
}