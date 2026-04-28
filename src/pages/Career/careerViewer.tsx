import React, { useEffect, useState, useRef } from "react";
import "./careerViewer.css";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import { config } from "../../utils/constants/constants";
import moment from "moment";
import { ITableConfig } from "../../@types/Reports";
import { Toast } from "primereact/toast";
import { DataTable } from "primereact/datatable";
import { ICareerList } from "../../@types/Career";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { FilterMatchMode, FilterOperator } from 'primereact/api';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { MultiSelect } from "primereact/multiselect";
import { Dropdown } from "primereact/dropdown";
import { confirmPopup, ConfirmPopup } from "primereact/confirmpopup";
import { StorageService } from "../../services/Storage/Storage.service";

interface Props {}

const CareerViewer: React.FC<Props> = () => {
  const canDelete = StorageService.hasPrivilege(83, 'delete')
  const canEdit = StorageService.hasPrivilege(83, 'edit')
  const canRead = StorageService.hasPrivilege(83, 'read')

  const [isLoading, setIsLoading] = useState(true);
  const [careerList, setCareerList] = useState<ICareerList[]>();
  const APIBASEURL = process.env.REACT_APP_API_URL;
  const APIEndpoint = APIBASEURL + "/v1/api/career/applicants";
  const resumePath = "/career/file/";
  const parser = new DOMParser();
  const toastRef = useRef<Toast>(null);

  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    name: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    position: { value: null, matchMode: FilterMatchMode.IN },
  });
  const [positionOptions, setPositionOptions] = useState(new Set())

  useEffect(() => {
    let isMounted = true;

    function fetchApplicantData() {
      fetch(APIEndpoint)
        .then((response) => {
          if (response.ok) {
            return response.json();
          } else {
            throw new Error("NETWORK RESPONSE ERROR");
          }
        })
        .then(async (response) => {
          setIsLoading(false);
          let applicants = response.data

          // do not display trashed applicant
          applicants = await applicants.filter((_applicant: ICareerList) => _applicant.trashed != true)
          setCareerList(applicants);

          response.data.forEach((applicant: ICareerList) => {
            setPositionOptions(positionOptions.add(applicant.position));
          })
        })
        .catch((error) => {
          console.error("ERROR: ", error);
        });
    }
    fetchApplicantData();

    return () => {
      isMounted = false;
    };
  }, []);

  const cvButtonTemplate = (rowData: ICareerList) => {
    return <a target="_blank" href={APIBASEURL + resumePath + rowData.path}>View</a>
  }

  const dateSubmittedTemplate = (rowData: ICareerList) => {
    return moment(rowData.dateSubmitted as Date).format(
      "DD-MMM, YYYY h:mm:ss a"
    )
  }

  function handleDeleteApplicant(applicant: ICareerList) {
    setIsLoading(true)

    try {
      fetch(APIEndpoint+`/${applicant.id}?trash=true`, {
        method: "POST"
      })
        .then((response) => {
          if (response.ok) return response.json();
        })
        .then((response) => {
          if (response) setCareerList(careerList?.filter((_applicant: ICareerList)  => _applicant != applicant));
          setIsLoading(false)

          if (toastRef.current) {
            toastRef.current.show({
              summary: "Applicant removed",
              detail: `${applicant.name} has been removed`,
              severity: "success",
            });
          }
        })
    } catch (err) {
      setIsLoading(false)
      console.log("Failed to trash applicant. ", err);
      toastRef.current && toastRef.current.show({
        summary: "Failed to trash applicant",
        detail: `${err}`,
        severity: "error",
      });
    }
  }

  const actionTemplate = (rowData: ICareerList) => {
    // confirm2
    const accept = () => {
      handleDeleteApplicant(rowData)
    };

    const reject = () => {}

    const confirmTrash = (event: any ) => {
      confirmPopup({
          target: event.currentTarget,
          message: 'Are you sure you want to delete this record?',
          icon: 'pi pi-info-circle',
          defaultFocus: 'reject',
          acceptClassName: 'p-button-danger',
          accept,
          reject
      });
    };
    return <>

        <Toast ref={toastRef} />
        <ConfirmPopup />
        <div className="card flex flex-wrap gap-2 justify-content-center">
            <Button icon="pi pi-trash" text severity="danger"
            onClick={confirmTrash}></Button>
        </div>
    </>

  }

  function handleRating(rowData: ICareerList, rating: number) {
    if (!canEdit) {
      toastRef.current?.show({
        summary: "Unauthorized access",
        detail: `You cannot rate an applicant. Contact admin for Edit rights`,
        severity: "info",
      });
    }  else {
      setIsLoading(true)
      fetch(APIEndpoint+`/${rowData.id}?rating=${rating}`, {
        method: "POST"
      })
        .then((response) => {
          if (response.ok) {
            return response.json();
          } else {
            console.log("NETWORK RESPONSE ERROR");
          }
          setIsLoading(false)
        })
        .then((response) => {
          setIsLoading(false)
          rowData.rating = rating
        })
    }
  }

  const ratingTemplate = (rowData: ICareerList) => {
    let rating = rowData.rating;
    const originalRating = rowData.rating;

    const handleMouseOver = (count: number) => {
      rating = count;
      rowData.rating = count;
    }

    const resetRating = () => {
      rating = 0;
      rowData.rating = originalRating
    }

    return <div className="rating-group"
      onMouseLeave={resetRating}>
      <Button icon={`pi ${rating >= 1 ? "pi-star-fill" : "pi-star"}`} text
        onClick={() => {handleRating(rowData, 1)}}
        onMouseOver={() => {handleMouseOver(1)}}></Button>
      <Button icon={`pi ${rating >= 2 ? "pi-star-fill" : "pi-star"}`} text
        onClick={() => {handleRating(rowData, 2)}}
        onMouseOver={() => {handleMouseOver(2)}}></Button>
      <Button icon={`pi ${rating >= 3 ? "pi-star-fill" : "pi-star"}`} text
        onClick={() => {handleRating(rowData, 3)}}
        onMouseOver={() => {handleMouseOver(3)}}></Button>
      <Button icon={`pi ${rating >= 4 ? "pi-star-fill" : "pi-star"}`} text
        onClick={() => {handleRating(rowData, 4)}}
        onMouseOver={() => {handleMouseOver(4)}}></Button>
      <Button icon={`pi ${rating >= 5 ? "pi-star-fill" : "pi-star"}`} text
        onClick={() => {handleRating(rowData, 5)}}
        onMouseOver={() => {handleMouseOver(5)}}></Button>
    </div>
  }

  const onGlobalFilterChange = (e: any) => {
    const value = e.target.value;
    let _filters = { ...filters };

    _filters['global'].value = value;

    setFilters(_filters);
    setGlobalFilterValue(value);
  };

  const renderHeader = () => {
    return (
        <div className="flex justify-content-end">
            <IconField iconPosition="left">
                <InputIcon className="pi pi-search" />
                <InputText value={globalFilterValue} onChange={onGlobalFilterChange} placeholder="Keyword Search" />
            </IconField>
        </div>
    );
  };

  const header = renderHeader();

  const positionItemTemplate = (position:string) => {
    return (
        <div className="flex align-items-center gap-2">
            <span>{position}</span>
        </div>
    );
  };

  const positionRowFilterTemplate = (options: any) => {
    return (
        <MultiSelect
            value={options.value}
            options={Array.from(positionOptions)}
            itemTemplate={positionItemTemplate}
            onChange={(e) => {
              options.filterApplyCallback(e.value)
            }}
            placeholder="Any"
            className="p-column-filter text-xs w-full"
            maxSelectedLabels={1}
            style={{ minWidth: '11rem' }}
        />
    );
  };

  const positionBodyTemplate = (rowData: ICareerList) => {
    const position = rowData.position;

    return (
        <div className="flex align-items-center gap-2">
            <span>{position}</span>
        </div>
    );
  };

  return (
    <div className="page-container">
      <div className="text-2xl font-bold mb-3">Resume Submissions</div>

      <DataTable
        id="applicants-table"
        loading={isLoading}
        value={careerList}
        className="text-xs"
        dataKey="id"
        stripedRows
        sortField="dateSubmitted" sortOrder={-1}
        paginator rows={50}
        filters={filters}
        globalFilterFields={['name', 'positionOptions']}
        header={header} filterDisplay="row" 
      >
        <Column field="id" header="ID" ></Column>
        <Column field="name" header="Name" ></Column>

        <Column field="position" header="Position"
        filterField="position" showFilterMenu={false} filterMenuStyle={{ width: '11rem' }} style={{ minWidth: '11rem' }}
        filter filterElement={positionRowFilterTemplate} ></Column>
        <Column field="phone" header="Phone" style={{ minWidth: '8rem' }} ></Column>
        <Column field="email" header="Email" ></Column>
        <Column field="origin" header="Origin" ></Column>
        {canRead && <Column field="path" header="CV" body={cvButtonTemplate} ></Column>}
        <Column field="message" header="Message" ></Column>
        <Column field="rating" header="Rating" body={ratingTemplate} sortable ></Column>
        <Column field="dateSubmitted" header="Date" body={dateSubmittedTemplate} sortable></Column>
        {canDelete && <Column header="Actions" body={actionTemplate}></Column>}
      </DataTable>
      <Toast ref={toastRef} position="bottom-right" />
    </div>
  );
};

export default CareerViewer;
