import React, { useEffect, useState, useCallback } from "react";
import FileUploader from "./FileUploader";
import FileViewerPage from "./FileViewer";
import { Button } from "primereact/button";
import "./index.css";
import { StorageService } from "../../services/Storage/Storage.service";

const FileViewer = FileViewerPage.FileViewer;

interface Props {}

const FilesPage: React.FC<Props> = () => {
  const canRead: boolean = StorageService.hasPrivilege(84, 'read')
  const canAdd: boolean = StorageService.hasPrivilege(84, 'add')
  const canEdit: boolean = StorageService.hasPrivilege(84, 'edit')
  const canDelete: boolean = StorageService.hasPrivilege(84, 'delete')
  const canModify: boolean = canAdd || canEdit || canDelete

  const [isUploaderVisible, setIsUploaderVisible] = useState(false);

  const showUploader = () => {
    setIsUploaderVisible(true);
  };

  return (
    <>
      <div className="page-container">
          {isUploaderVisible ? (
            <FileUploader />
          ) : (
            canAdd && <Button onClick={showUploader} label="Upload a file" />
          )}
        <FileViewer />
      </div>
    </>
  );
};

export default FilesPage;
