import React, { useEffect, useState, useCallback } from "react";
import { FileUpload } from "primereact/fileupload";
import "./FileUploader.css";
import { SERVER_URL } from "./../../utils/constants/constants";
import FileViewerPage from "./FileViewer";

interface Props {}

const FileUploader: React.FC<Props> = () => {
  const APIBASEURL = SERVER_URL;
  const APIEndpoint = APIBASEURL + "/v1/api/files";
  const uploadPath = "/upload";
  const parser = new DOMParser();

  return (
    <>
      <h1>Upload files</h1>
      <p>Note: Same files name will override existing file</p>
      <div className="card">
        <FileUpload
          name="files"
          url={`${APIEndpoint}${uploadPath}`}
          multiple
          accept="image/*"
          maxFileSize={10000000}
          emptyTemplate={
            <p className="m-0">Drag and drop files here to upload.</p>
          }
        />
      </div>
    </>
  );
};

export default FileUploader;
