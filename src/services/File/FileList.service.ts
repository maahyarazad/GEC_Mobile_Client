import { config } from "./../../utils/constants/constants";

const API_URL = 'files'

// TODO: make time to make the interfaces
const APIBASEURL = process.env.REACT_APP_API_URL;
const APIEndpoint = APIBASEURL+"/v1/api/files/allFiles"
const UPLOADBASEURL = process.env.REACT_APP_API_URL

function mapToFiles(files: any[]) {
  return files.map((file) => {
    return {
      name: file.name,
      url: new URL(UPLOADBASEURL + file.url).href
    }
  })
}

export const FileService : any = {

  getFiles(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      fetch (APIEndpoint)
        .then(response => {
          if(response.ok) {
            return response.json();
          } else {
            reject(response);
          }
        })
        .then(response => {
          resolve(mapToFiles(response.files))
        })
        .catch (error => {
          reject(error)
        })
    })
  }

}
