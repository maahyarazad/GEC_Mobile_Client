import React, { useRef, useEffect } from "react";
import { Navigate, Outlet, Route, Routes } from "react-router-dom";
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
import ProspectDetailsEdit from "../../pages/Prospect/ProspectDetailsEdit";
import ExpertEventDetailEdit from "../../pages/Experts/EventDetailsEdit";
import ExpertMemberDetailEdit from "../../pages/Experts/MemberDetailsEdit";
import ExpertMemberList from "../../pages/Experts/MemberList";
import { Toast } from "primereact/toast";
import ExpertGuestsList from "../../pages/Experts/GuestList";
import PartnerOnboarding from "../../pages/PartnerOnboarding/PartnerOnboarding";
import Dashboard from "../../pages/Dashboard";

interface Props {}

interface ProtectedProp {
  redirectPath?: string;
}

const ProtectedRoute: React.FC<ProtectedProp> = ({ redirectPath = "/login" }) => {
  const token = StorageService.retrieveToken();

  useEffect(() => {
    if (token) {
      StorageService.fetchPartnerCategories();
    }
  }, [token]);

  if (!token) {
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
};

//Functional Component
const PageContainer: React.FC<Props> = () => {
  const toast = useRef<Toast>(null);

  return (
    <div className="p-0" style={{ flex: 1, overflow: "auto" }}>
      <Toast ref={toast} />

      <Routes>
        <Route element={<ProtectedRoute />}>
          {/* Default landing page: send the root path to the dashboard */}
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path={"dashboard"} element={<Dashboard />} />
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
            <Route path={"detail"} element={<ExpertEventDetailEdit />} />
            <Route path={"detail/:eventId"} element={<ExpertEventDetailEdit />} />
            <Route path={"guests/:eventId"} element={<ExpertGuestsList />} />
            <Route path={"members"} element={<ExpertMemberList />} />
            <Route path={"member/detail"} element={<ExpertMemberDetailEdit />} />
            <Route path={"member/detail/:memberId"} element={<ExpertMemberDetailEdit />} />
          </Route>
          <Route path={"prospects"}>
            <Route index element={<ProspectList />} />
            <Route path={"new"} element={<ProspectDetailsEdit />} />
          </Route>
          <Route path={"partner-onboarding"}>
            <Route index element={<PartnerOnboarding />} />
            <Route path={"new"} element={<ProspectDetailsEdit />} />
          </Route>
        </Route>

        <Route path={"login"} element={<Login />} />
        <Route path={"logout"} element={<Logout />} />
        <Route path={"session-expired"} element={<SessionExpired />} />

        <Route path={"*"} element={<PageNotFound />} />
      </Routes>
    </div>
  );
};

export default PageContainer;