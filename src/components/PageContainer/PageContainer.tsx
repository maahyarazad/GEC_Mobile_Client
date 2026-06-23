import React, { useRef } from "react";
import { Navigate, Outlet, Route, Router, Routes, useLocation } from "react-router-dom";
import ApprovalList from "../../pages/ApprovalList";
import OfferDetails from "../../pages/OfferDetails";
import PageNotFound from "../../pages/PageNotFound";
import PartnerDetails from "../../pages/Partner/PartnerDetails";
import PartnerList from "../../pages/Partner/PartnerList";
import ProspectList from "../../pages/Prospect/ProspectList";
import ExpertEventsList from "../../pages/Experts/EventList";
import Login from "../../pages/Auth/Login/Login";
import "./PageContainer.css";
import PartnerCategory from "../../pages/Category/PartnerCategory";
import OfferCategory from "../../pages/Category/OfferCategory";
import AppList from "../../pages/App/AppList";
import AppBanner from "../../pages/App/AppBanner";
import AddBanner from "../../pages/App/AddBanner";
import UsersList from "../../pages/Users/UsersList";
import Logout from "../../pages/Auth/Logout/Logout";
import { StorageService } from "../../services/Storage/Storage.service";
import SessionExpired from "../../pages/Users/SessionExpired";
import PushNotification from "../../pages/PushNotification/PushNotification";
import EventList from "../../pages/Events/EventList";
import EventDetails from "../../pages/Events/EventDetails/EventDetails";
import CareerViewer from "../../pages/Career/careerViewer";
import FilesPage from "../../pages/FilesPage";
import Reports from "../../pages/Reports/Reports";
import GuestList from "../../pages/Events/GuestList";
import PostList from "../../pages/Posts/PostList";
import NewsletterList from "../../pages/Newsletters/NewsletterList";
import NewsletterDetails from "../../pages/Newsletters/NewsletterDetails";
import { links } from "../Navbar/links";
import ProspectDetailsEdit from "../../pages/Prospect/ProspectDetailsEdit";
import ExpertEventDetailEdit from "../../pages/Experts/EventDetailsEdit";
import ExpertMemberDetailEdit from "../../pages/Experts/MemberDetailsEdit";
import ExpertMemberList from "../../pages/Experts/MemberList";
import { Toast } from "primereact/toast";
import ExpertGuestsList from "../../pages/Experts/GuestList";
import PartnerOnboarding from "../../pages/PartnerOnboarding/PartnerOnboarding";


interface Props {}

interface ProtectedProp {
  redirectPath?: string;
  pathname?: string;
}

const ProtectedRoute: React.FC<ProtectedProp> = ({
  redirectPath = "/login",
  pathname = '/'
}) => {
  const token = StorageService.retrieveToken();
  if (!token) {
    return <Navigate to={redirectPath} replace />;
  }

  // consider root path as /requests path
  // so it can register root as one of the links<INavbarLinks>
  if (pathname == '/') {
    pathname = '/requests'
  }

  // // get link<INavbarLinks> base on pathname
  // let pathnameLink = links.find(link=>link.link==pathname)

  // // check if user is redirecting to a admin_release protected route
  // if (pathnameLink?.id) {

  //   // check if user has access to the page
  //   let roles = StorageService.retrieveRoles();

  //   let pathRole = roles.find(role=>role.appId==pathnameLink?.id)
  //   let hasAccessToPath = !!pathRole

  //   if (pathRole) {
  //     hasAccessToPath = pathRole.r == '1'
  //   }

  //   if (!pathRole || !hasAccessToPath) {
  //     let link
  //     if (roles.length == 0) {
  //       alert("You do not have acecss to any App Admin application. Please contact admin.")
  //       redirectPath = '/login'
  //     } else {
  //       console.log('link: ', link)
  //       // find role with READ
  //       const nextReadableApp = roles.find(role => role.r == '1')
  //       if (nextReadableApp) {
  //         link = links.find(link => link.id === nextReadableApp.appId)
  //       }

  //     }
  //     redirectPath = link ? link.link : '/login'

  //     // route to next accessible link
  //     return <Navigate to={redirectPath} replace />;
  //   }
  //   // if has access, ignore and allow to continue
  // }
  // fetch other data to store in LocalStorage
  StorageService.fetchPartnerCategories()


  return <Outlet />;
};

//Functional Component
const PageContainer: React.FC<Props> = () => {

  const location = useLocation();
  const toast = useRef<Toast>(null);
  

  return (
    <div className="p-0" style={{ flex: 1, overflow: 'auto' }}>


      <Routes>
      
        <Route element={<ProtectedRoute pathname={location.pathname} />}>
          <Route index element={<AppList />} />
          <Route path={"apps"}>
            <Route index element={<AppList />} />
            <Route path={"banners"}>
              <Route index element={<AppBanner />} />
              <Route path={"add"} element={<AddBanner />} />
            </Route>
          </Route>
          <Route path={"users"}>
            <Route index element={<UsersList />} />
          </Route>
          <Route path={"events"}>
            <Route index element={<EventList />} />
            <Route path={"detail"}>
              <Route index element={<EventDetails />} />
            </Route>
          </Route>
          <Route path={"requests"}>
            <Route index element={<AppList />} />
            <Route path={"list"} element={<ApprovalList />} />
          </Route>
          <Route path={"category"}>
            <Route path={"partner"} element={<PartnerCategory />} />
            <Route path={"offer"} element={<OfferCategory />} />
          </Route>
          <Route path={"posts"}>
            <Route index element={<PostList />} />
          </Route>
          <Route path={"newsletters"}>
            <Route index element={<NewsletterList />} />
            <Route path={"new"} element={<NewsletterDetails />} />
            <Route path={":cronId"} element={<NewsletterDetails />} />
          </Route>
          <Route path={"partner"}>
            <Route index element={<PartnerList />} />
            <Route path={"detail"} element={<PartnerDetails />} />
            <Route path={"create-offer"} element={<OfferDetails />} />
            <Route path={"offer/:offerId"} element={<OfferDetails />} />
          </Route>
          <Route path={"careers"} element={<CareerViewer />} />
          <Route path={"files"} element={<FilesPage />} />
          <Route path={"push-notification"}>
            <Route index element={<PushNotification />} />
          </Route>
          <Route path="reports" element={<Reports />} />
          <Route path="guest-list" element={<GuestList />} />
          <Route path={"experts"}>
            <Route index element={<ExpertEventsList />} />
            <Route path={"detail"} element={<ExpertEventDetailEdit/>} />
            <Route path={"detail/:eventId"} element={<ExpertEventDetailEdit/>} />
            <Route path={"guests/:eventId"} element={<ExpertGuestsList/>} />
            <Route path={"members"} element={<ExpertMemberList/>} />
            <Route path={"member/detail"} element={<ExpertMemberDetailEdit/>} />
            <Route path={"member/detail/:memberId"} element={<ExpertMemberDetailEdit/>} />
          </Route>
          <Route path={"prospects"}>
            <Route index element={<ProspectList />} />
            <Route path={"new"} element={<ProspectDetailsEdit/>} />
          </Route>
          <Route path={"partner-onboarding"}>
            <Route index element={<PartnerOnboarding />} />
            <Route path={"new"} element={<ProspectDetailsEdit/>} />
          </Route>
        </Route>

        <Route path={"*"} element={<PageNotFound />} />

        <Route path={"login"} element={<Login />} />
        <Route path={"logout"} element={<Logout />} />
        <Route path={"session-expired"} element={<SessionExpired />} />
      
      </Routes>

    </div>
  );
};

export default PageContainer;
