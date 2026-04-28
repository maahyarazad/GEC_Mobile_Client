// TODO: add pagination to list

import moment from "moment";
import { Button } from 'primereact/button'
import { Column } from "primereact/column";
import { Toolbar } from 'primereact/toolbar'
import { DataTable, DataTableRowClickEvent } from "primereact/datatable";
import React, { useEffect, useState } from "react";
import { useNavigate, useRoutes } from "react-router-dom";
import { IPostNewsletter } from "../../../@types/Newsletter";
import { AppInfoService } from "../../../services/AppInfo/AppInfo.service";
import "./NewsletterList.css";
import useAPI from "../../../hooks/useAPI";
import { config } from "../../../utils/constants/constants";

interface Props {}

//Functional Component
const NewsletterList: React.FC<Props> = () => {
  const api = useAPI(config.BASE_URL2);

  const [newsletters, setNewsletters] = useState<IPostNewsletter[]>();
  const navigator = useNavigate();
  const pathname = window.location.pathname;
  const request = useAPI(config.BASE_URL2);
  const navigate = useNavigate();
  const [destination, setDestination] = useState<string>("");

  const isMounted = React.useRef(false);

  useEffect(() => {
    let isMount = true;

    const getApps = async () => {

      try {
        if (isMount) {
        }
      } catch (err) {
        console.log(err);
        alert("Something went wrong");
      }
    };

    return () => {
      isMount = false;
    };
  }, [pathname]);

  useEffect(() => {
    isMounted.current = true;
    fetchNewsletters();

    return () => {
      isMounted.current = false;
    }
  }, [])

  const handleRowClick = (e: DataTableRowClickEvent) => {
    navigator(destination, {
      state: {
        app: e.data,
      },
    });
  };

    const leftToolbarContent = () => {
        return <>
            <div className='text-lg pl-2 font-bold'>
               Newsletter List
            </div>
        </>
    }

    const rightToolbarContent = () => {
      return <>
        <div className="flex gap-2">
          <Button onClick={()=>{navigate('/newsletters/new')}} 
            className='text-xs' 
            icon={'pi pi-plus'} 
            label="Create new Newsletter" />
        </div>
      </>
    }

    const fetchNewsletters = async () => {
      try {
        const response = await api.get("/post/newsletters");
        response.data.map((newsletter: IPostNewsletter) => {
          newsletter.status_name = newsletter.status == 1 ?  'Pending' : newsletter.status == 2 ? 'Sent' : 'Draft';
          newsletter.starttime_name = moment(newsletter.starttime).format('DD/MM/YYYY HH:mm');
          return newsletter
        })
        if (response.success && isMounted.current) setNewsletters(response.data)
      } catch (error) {
        console.log('Error getting newsletter list', error)
      }

    }

  return (
    <div className="page-container">
      <div className="col-12 ">
        <Toolbar className='p-2 m-0' right={rightToolbarContent} left={leftToolbarContent} />
        <br/>
        <DataTable value={newsletters} tableStyle={{ minWidth: '50rem' }}>
          <Column field="starttime_name" header="Scheduled date"></Column>
          <Column field="status_name" header="Status"></Column>
        </DataTable>
      </div>
   </div>
  );
};

export default NewsletterList;
