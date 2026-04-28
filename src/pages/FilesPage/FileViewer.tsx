// TODO: add isLoading

import React, { useEffect, useState, useCallback } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import "./FileViewer.css";
import { SERVER_URL } from "./../../utils/constants/constants";
import { FileService } from "../../services/File/FileList.service";

interface Props {}

interface Content {
  files: File;
  dir: DirItem;
}

interface File {
  name: string;
  url: string;
}

interface DirItem {
  name: string;
}

let _loadData = function () {};

const FileViewer: React.FC<Props> = () => {
  const [fetchedFiles, setFetchedFiles] = useState<File[]>();
  const [isLoading, setIsLoading] = useState(true);

  const APIBASEURL = SERVER_URL;
  const APIEndpoint = APIBASEURL + "/v1/api/files/allFiles";
  const [layout, setLayout] = useState("grid");

  // TODO: assign username
  const username = "user";

  useEffect(() => {
    loadData();
    _loadData = loadData;
  }, []);

  function loadData() {
    setIsLoading(true);
    FileService.getFiles().then((data: any) => {
      setFetchedFiles(data as File[]);
      setIsLoading(false);
    })
    .catch((error: any) => {
      console.log(error);
    });

  }

  const imageBodyTemplate = (file: File) => {
    return (
      <img
        src={`${file.url}`}
        alt={file.name}
        className="w-6rem shadow-2 border-round"
      />
    );
  };

  // <!-- TODO: add breadcrumbs here -->
  return (
    <div className="file-viewer">
      <div className="flex justify-content-between m-4 ">
        <h2>Files</h2>
        <Button
          onClick={loadData}
          label="Refresh"
          icon="pi pi-refresh"
          loading={isLoading}
        />
      </div>
      <DataTable value={fetchedFiles} paginator rows={30}>
        <Column header="" body={imageBodyTemplate}></Column>
        <Column field="name" header="Name"></Column>
        <Column field="url" header="URL"></Column>
      </DataTable>
    </div>
  );
};

export default {
  FileViewer,
  loadData: _loadData,
};
