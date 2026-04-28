// TODO: do not allow to select previous date

import "./NewsletterDetails.css";
import React, { useEffect, useState } from "react";
import NewsletterPostCard from "../../../components/Newsletter/NewsletterPostCard/NewsletterPostCard";
import NewsletterArticleCard from "../../../components/Newsletter/NewsletterArticleCard/NewsletterArticleCard";
import useAPI from "../../../hooks/useAPI";
import { Button } from "primereact/button";
import LoadingProgress from "../../../components/LoadingSpinner/LoadingSpinner";
import { IPost } from "../../../@types/Post";
import { config } from "../../../utils/constants/constants";
import PostFilter from "../../../components/Post/PostFilter/PostFilter";
import { ConfirmDialog } from "primereact/confirmdialog";
import { InputText } from "primereact/inputtext";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { TabMenu } from 'primereact/tabmenu';
import { Calendar } from 'primereact/calendar';
import { useNavigate } from "react-router-dom";

import header from "../../../assets/newsletter_header.jpg";
import footerhr from "../../../assets/newsletter_footer_hr.gif";
import downloadAppstore from "../../../assets/download-appstore.png";
import downloadGoogleplay from "../../../assets/download-playstore.png";

const post_status = ["Unsent", "Do not send"];
const tabOptions = [
  {id: '0', label: 'Forum' },
  {id: '1', label: 'Marketplace' },
  {id: '2', label: 'Event' },
  {id: '3', label: 'Magazine' }
]

const NewsletterDetails = () => {
  const api = useAPI(config.BASE_URL2);

  const [datetime, setDatetime] = useState<Date>(new Date());
  const [data, setData] = useState<IPost[]>([]);
  const [includedData, setIncludedData] = useState<IPost[]>([]);
  const [unsentForumList, setUnsentForumList] = useState<IPost[]>([]);
  const [unsentMarketplaceList, setUnsentMarketplaceList] = useState<IPost[]>([]);
  const [eventsList, setEventsList] = useState<IPost[]>([]);
  const [magazineList, setMagazineList] = useState<IPost[]>([]); 
  const [donotsendForumList, setDonotsendForumList] = useState<IPost[]>([]);
  const [donotsendMarketplaceList, setDonotsendMarketplaceList] = useState<IPost[]>([]);

  const navigate = useNavigate();
  const [openModal, setOpenModal] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState(post_status[0]);
  const [selectedTab, setSelectedTab] = useState(0);
  const [tab, setTab] = useState(tabOptions);

  const isMounted = React.useRef(false);

  // when selectedFilter is changed, we need to change tab options and fetch data of donotsend
  useEffect(() => {
    isMounted.current = true;


    if (selectedFilter === post_status[0]) {
      // show all tabs
      setTab(tabOptions);

      switch (selectedTab) {
        case 0:
          setData(unsentForumList);
          break;
        case 1:
          setData(unsentMarketplaceList);
          break;
        case 2:
          setData(eventsList);
          break;
        case 3:
          setData(magazineList);
          break;
      }

    } else if (selectedFilter === post_status[1]) {
      if (!donotsendForumList.length) fetchDonotsendForums();
      if (!donotsendMarketplaceList.length) fetchDonotsendMarketplace();

      switch (selectedTab) {
        case 0:
          setData(donotsendForumList);
          break;
        case 1:
          setData(donotsendMarketplaceList);
          break;
      }

      // change tab to forum
      setSelectedTab(0);
      // limit tab to forum and marketplace
      setTab(tabOptions.slice(0, 2));


    }

    return () => {
      isMounted.current = false;
    };
  }, [selectedFilter, donotsendForumList, donotsendMarketplaceList]);

  // separate selectedTab since we don't need to know if selectedFilter is changed
  useEffect(() => {
    isMounted.current = true;

    if (selectedFilter === post_status[0]) {
      // show all tabs

      switch (selectedTab) {
         case 0:
          setData(unsentForumList);
          break;
       case 1:
          setData(unsentMarketplaceList);
          break;
        case 2:
          setData(eventsList);
          break;
        case 3:
          setData(magazineList);
          break;
      }

    } else if (selectedFilter === post_status[1]) {
      switch (selectedTab) {
        case 0:
          setData(donotsendForumList);
          break;
        case 1:
          setData(donotsendMarketplaceList);
          break;
      }
    }

    return () => {
      isMounted.current = false;
    };
  }, [selectedTab, unsentForumList]);




  useEffect(() => {

  }, [donotsendForumList, donotsendMarketplaceList])



  useEffect(() => {
    fetchUnsentForums();
    fetchUnsentMarketplace();
    fetchEvents();
    fetchMagazines();
  }, []);

  const fetchUnsentForums = async () => {
    const response = await api.get("/post/newsletter/forum/unsent");
    if (response.success && isMounted.current && response.data.length) setUnsentForumList(response.data)
  };

  const fetchUnsentMarketplace = async () => {
    const response = await api.get("/post/newsletter/marketplace/unsent");
    if (response.success && isMounted.current && response.data.length) setUnsentMarketplaceList(response.data);
  }

  const fetchEvents = async () => {
    const response = await api.get("/post/newsletter/events");
    if (response.success && isMounted.current) setEventsList(response.data);
  }

  const fetchMagazines = async () => {
    const response = await api.get("/post/newsletter/magazines");
    if (response.success && isMounted.current) setMagazineList(response.data);
  }

  const fetchDonotsendForums = async () => {
    const response = await api.get("/post/newsletter/forum/donotsend");
    if (response.success && isMounted.current) setDonotsendForumList(response.data);
  };

  const fetchDonotsendMarketplace = async () => {
    const response = await api.get("/post/newsletter/marketplace/donotsend");
    if (response.success && isMounted.current) setDonotsendMarketplaceList(response.data);
  }

  const findStatusValue = () => {
    let _status = 0;

    switch (selectedFilter) {
      case post_status[0]: // Unsent
        _status = 0;
        break;
      // TODO: Add Pending case
      // TODO: Add Sent case
      case post_status[1]: // Do not send
        _status = 1;
        break;
    }

    return _status;
  };

  const removePostFromList = (post: IPost) => {
    if (post.post_type === 1) setUnsentForumList(unsentForumList.filter((item: IPost) => item.id !== post.id));
    if (post.post_type === 2) setUnsentMarketplaceList(unsentMarketplaceList.filter((item: IPost) => item.id !== post.id));
  }

  const moveToDonotsendList = (post: IPost) => {
    if (post.post_type === 1) setDonotsendForumList([post, ...includedData]);
    if (post.post_type === 2) setDonotsendMarketplaceList([post, ...includedData]);
  }

  const includeToNewsletter = async (post: IPost) => {
    setIncludedData([...includedData, post]);
    removePostFromList(post)
  }

  const neverSend = async (post: IPost) => {
    const id: number = post.id;
    const response = await api.get(`/post/newsletter/donotsend/${id}`);
    if (response.success) {
      moveToDonotsendList(post)
      removePostFromList(post)
    }
  }

  const donotIncludeToNewsletter = async (post: IPost) => {
    setIncludedData(includedData.filter((item: IPost) => item.id !== post.id));
    // if post type is forum, add to unsent forum list
    if (post.post_type === 1) setUnsentForumList([...unsentForumList, post]);
    if (post.post_type === 2) setUnsentMarketplaceList([...unsentMarketplaceList, post]);
  }


  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const submitNewsletter = async (status: number) => {
    if (!status) status = 1;

    console.log('save newsletter', includedData);
    // create ids for each post data with prefix

    let newsletterIds: string[]= []
    includedData.forEach((post: IPost) => {
      newsletterIds.push(`${post.id}`);
    })
    const newsletterIdsStr: string = newsletterIds.join(',');
    console.log('newsletterIds: ', newsletterIds);
    console.log('newsletterIdsStr: ', newsletterIdsStr);
    console.log('date: ', datetime);

    try {
      // submit newsletter ids to backend
      const response = await api.post('/post/newsletter/new', {ids: newsletterIdsStr, status, time: datetime});
      console.log('response: ', response);
      if (response?.success) {
        console.log('newsletter saved');
        navigate('/newsletters')
      }

    } catch (error) {
      console.log('error: ', error);
    }
  }

  const saveNewsletter = () => {
    submitNewsletter(1);
  }

  const draftNewsletter = () => {
    submitNewsletter(0);
  }
  
  return (
    <>
      <div className="h-screen">
        <div className="flex p-3 w-full justify-content-between gap-3">
          <div className="w-full w-20rem">
            <div className="h-auto bg-gray-200 border-round p-3">
              <PostFilter
                selectedFilter={selectedFilter}
                post_status={post_status}
                onSelectFilter={setSelectedFilter}
              />
            </div>
            
          </div>

          <div className="flex gap-3">
            <div className="">
              <span className="mr-1">Date & Time of sending</span>
              <Calendar value={datetime} onChange={(e) => setDatetime(e.value as Date)} showTime hourFormat="12" showIcon />
            </div>

            <div className="justify-content-end">
              <div>
                <Button
                  severity="success"
                  label="Save"
                  onClick={saveNewsletter}
                  disabled={!includedData.length}
                />
              </div>

            </div>
          </div>
        </div>

        <hr/>

        <div className="flex m-auto h-full static top-0 pt-3" style={{width: "fit-content"}}>
         { /* First Column - START */}

          <div className="flex flex-column h-full gap-3 m-3" style={{width: "636px"}}>

            <div
              className="flex flex-column align-items-center gap-6 w-full  h-full"
              id="testing"
            >

              
                <div className="flex flex-column align-items-center w-full h-full">
                  <TabMenu 
                  className="w-full mb-3"
                  model={tab}
                  activeIndex={selectedTab}
                  onTabChange={(e) => setSelectedTab(e.index)}
                  />


                <div className="overflow-scroll overflow-x-hidden w-full flex-1">

                  {data?.map((post: IPost) => {
                    return (
                    <div className="flex gap-2 flex-wrap sm:flex-nowrap w-full mb-5" key={post.id}>
                      <div className="w-full cursor-pointer">

                        { selectedTab === 0 || selectedTab === 1 ?
                        <NewsletterPostCard post={post} /> :
                        <NewsletterArticleCard post={post} />
                        }

                        <Button
                          className="w-full mt-2"
                          icon="pi pi-check"
                          label="Include to Newsletter"
                          onClick={() => includeToNewsletter(post)}
                        />

                        { (selectedFilter === post_status[0] && ( selectedTab === 0 || selectedTab === 1))  && (
                          <Button
                            className="w-full"
                            severity="secondary"
                            label="Never send"
                            onClick={() => neverSend(post)}
                            text
                          />
                        )}

                      </div>

                    </div>
                    )}
                  )}

                </div>

                </div>
            </div>
          </div>

          { /* First Column - END */}

          <hr/>

          { /* Second Column (Preview) - START */}
          <div className="overflow-scroll p-6">

            <div className="" style={{width: "636px"}}>
              <img  src={header} alt="Header" />

              {includedData?.map((post: IPost) => {
                return (
                <div className="flex gap-2 flex-wrap sm:flex-nowrap w-full" key={post.id} >
                  <div className="w-full cursor-pointer mb-2 mt-2 relative">

                    <Button
                      className="absolute"
                      severity="danger"
                      icon="pi pi-times"
                      onClick={() => donotIncludeToNewsletter(post)}
                      outlined
                      text raised
                      rounded
                      aria-label="Close"
                      style={{top: "-18px", right: "-18px"}}
                    ></Button>


                    {
                    //  if id starts with 'post'
                    post.id.toString().startsWith('post') ?
                      <NewsletterPostCard post={post} /> :
                      <NewsletterArticleCard post={post} />
                    }
                  </div>

                </div>
                )}
              )}

              <img  src={footerhr} alt="" className="mt-3" />
              <p className="text-center">Laden Sie jetzt Ihre GEC Mobile App auf Ihr Mobiltelefon!</p>

              <div>
                <img src={downloadAppstore} alt="Download on the App Store" />
                <img src={downloadGoogleplay} alt="Get it on Google Play" />
              </div>

              <div className="flex flex-column gap-2 text-center" style={{
                fontFamily: "Georgia",
                fontSize: "11px" ,
                fontWeight: "normal" ,
                color: "#333333" ,
                padding: "10px 0 10px 0",
              }}>
                <span>Wenn Sie uns Feedback oder Anregungen geben möchten, nutzen Sie bitte diesen Link</span>

                <div>
                  <span>Diese E-Mail wurde an die Adresse development3@german-emirates-club.com versendet.</span>
                  <br></br>
                  <span>Anfragen richten Sie bitte an mitgliedschaft@german-emirates-club.com</span>
                  <br></br>
                  <span>Sie erhalten diesen Newsletter, da Sie Mitglied im German Emirates Club sind.</span>
                </div>

                <div>
                  <span>www.German-Emirates-Club.com</span>
                  <span>© by German Emirates Club </span>
                </div>
              </div>


            </div>

              <Button
                className="w-full mt-3"
                severity="success"
                label="Save"
                onClick={saveNewsletter}
                disabled={!includedData.length}
              />

          </div>

          { /* Second Column (Preview) - START */}

          <ConfirmDialog />
        </div>
      </div>
    </>
  );
};

export default NewsletterDetails;
