

let server_url = process.env.REACT_APP_API_URL;
if (!server_url) {
    throw new Error('REACT_APP_API_URL is not set. Create a .env.development or .env.production file.');
}
export const SERVER_URL = server_url;
export const config = {
    BASE_URL: `${SERVER_URL}/v1/api`,
    BASE_URL2: `${SERVER_URL}/v2`,
    APP_NAME: `GEC Mobile Application`,
    MODE: process.env.REACT_APP_NODE_MODE ?? 'prod',
}