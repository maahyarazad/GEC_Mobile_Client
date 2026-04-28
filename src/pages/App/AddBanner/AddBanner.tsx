import React, { useEffect, useRef, useState } from "react";
import { RadioButton, RadioButtonChangeEvent } from "primereact/radiobutton";
import "./AddBanner.css";
import { FileUpload } from "primereact/fileupload";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { AppInfoService } from "../../../services/AppInfo/AppInfo.service";
import { InputText } from "primereact/inputtext";
import { Checkbox, CheckboxChangeEvent } from "primereact/checkbox";
import { InputTextarea } from "primereact/inputtextarea";
import { useLocation, useNavigate } from "react-router-dom";
import { IApp, IAppBanner } from "../../../@types/AppInfo";
import { config, SERVER_URL } from "../../../utils/constants/constants";
import { InputSwitch, InputSwitchChangeEvent } from "primereact/inputswitch";
import { Image } from "primereact/image";
import LinkSelector, {
  PathEnum,
} from "../../../components/LinkSelector/LinkSelector";
import { findCharRight } from "../../../utils/findCharRight";
import DateRange from "../../../components/DateRange/DateRange";
import { IDateRange } from "../../../@types/Reports";
import moment from "moment";
import { Countdown } from "../../../components/Countdown/Countdown";
import { Calendar } from "primereact/calendar";
import { Dialog } from "primereact/dialog";
import { StorageService } from "../../../services/Storage/Storage.service";

interface Props {}

interface LocationProps {
  app: IApp;
  banner_id: number;
}

const CONTENT_OPTIONS: IContentOption[] = [
  {
    label: "None",
    value: "none",
  },
  {
    label: "URL",
    value: "url",
  },
  {
    label: "App Link",
    value: "applink",
  },
  // {
  //   label: "Pop-up",
  //   value: "popup",
  // },
];
interface IContentOption {
  label: ContentLabel;
  value: ContentType;
}
type ContentType = "none" | "popup" | "applink" | "url";
export type ContentLabel = "None" | "Pop-up" | "App Link" | "URL";

/**
 * Maximum File Size: 5mb
 */
export const MAX_FILE_SIZE = 5000000;

//Functional Component
const AddBanner: React.FC<Props> = () => {
  const canRead: boolean = StorageService.hasPrivilege(77, 'read')
  const canAdd: boolean = StorageService.hasPrivilege(77, 'add')
  const canEdit: boolean = StorageService.hasPrivilege(77, 'edit')
  const canDelete: boolean = StorageService.hasPrivilege(77, 'delete')
  const canModify: boolean = canAdd || canEdit || canDelete

  const toast = useRef<Toast>(null);
  const fileUploadRef = useRef<FileUpload>(null);
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [fileExceeded, setfileExceeded] = useState(false);
  const { app, banner_id } = location.state as LocationProps;
  const navigate = useNavigate();
  const [editMode, setEditMode] = useState(false);
  const [fileImage, setFileImage] = useState();
  const [contentType, setContentType] = useState<ContentType>("none");
  const [dialog, setDialog] = useState<{ show: boolean; message: string }>({
    show: false,
    message: "",
  });

  let BASE_URL = ``;
  if (process.env.REACT_APP_NODE_MODE == 'local') {
      !process.env.REACT_APP_DEV_APP_DEEPLINK && console.log("ERROR: REACT_APP_DEV_APP_DEEPLINK in .env file is not found. Deep link will not work on mobile device. Check .env.sample for more information.")
      BASE_URL = process.env.REACT_APP_DEV_APP_DEEPLINK ?? "exp://localhost:19000/--/";
  } else {
      BASE_URL = `${app.applink_scheme}://app/`;
  }

  const [path, setPath] = useState<PathEnum>("partner");
  const [value, setValue] = useState<string | number>(0);
  const [state, setState] = useState<IAppBanner>({
    status: 0,
    withLink: 0,
    url_link: "",
    banner_image: "",
    name: "",
    id: 0,
    order_id: 0,
    date_start: new Date(),
    date_end: new Date(),
    member: false,
    corporate: false,
  });

  useEffect(() => {
    let isMounted = true;
    // console.log("TRY");
    const getBanner = async () => {
      const response = await AppInfoService.getOneBanner(banner_id);
      if (response) {
        //Decode Percent-Encoded URLS
        const decodedURL = response.url_link
          .replace(/%28/g, "(")
          .replace(/%29/g, ")");

        setState((prev) => ({
          ...prev,
          name: response.name,
          banner_image: `${SERVER_URL}/banners/${response.banner_image}`,
          withLink: response.withLink,
          url_link: decodedURL,
          status: response.status,
          date_start: response.date_start as Date,
          date_end: response.date_end as Date,
          member: !!response.member,
          corporate: !!response.corporate,
        }));

        switch (response.withLink) {
          case 0:
            setContentType("none");
            break;
          case 1:
            setContentType("url");
            break;
          case 2:
            if (response.url_link) {
              const url = new URL(response.url_link);
              const _path = url.pathname;
              const _pathname: PathEnum = _path.slice(
                findCharRight(_path, "/"),
                _path.length
              ) as PathEnum;
              const _value = url.searchParams.get("id");
              setPath(_pathname);
              if (_value != undefined) setValue(parseInt(_value));

              setContentType("applink");
            }
            break;
          case 3:
            setContentType("popup");
            break;
        }
      }
    };

    if (banner_id) {
      setEditMode(true);
      getBanner();
    }

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    if (contentType === "applink") {
      if (path != undefined && value != undefined) {
        const _urlLink = BASE_URL + `${path}?id=${value}`;
        setState((prev) => ({ ...prev, url_link: _urlLink }));
      }
    }

    return () => {
      isMounted = false;
    };
  }, [path, value]);

  const onSelectImage = async ({ files }: any) => {
    const [file] = files;
    if (file.size > MAX_FILE_SIZE) {
      fileUploadRef.current!.clear();
      setfileExceeded(true);
      return;
    }
    setfileExceeded(false);
    const fileReader = new FileReader();
    fileReader.onload = (e) => {
      // const url = e.target!.result;
      if (fileReader && fileReader.result) {
        setState({ ...state, banner_image: fileReader.result.toString() });
      }
      setFileImage(files[0]);
    };
    fileReader.readAsDataURL(file);
  };

  const onResetImage = () => {
    setState({ ...state, banner_image: "" });
    fileUploadRef.current!.clear();
    setfileExceeded(false);
  };

  const handleUrlChange = (value: string) => {
    setState({ ...state, url_link: value });
  };

  const handleTitleChange = (value: string) => {
    setState({ ...state, name: value });
  };

  const handleStatusChange = (e: InputSwitchChangeEvent) => {
    setState({ ...state, status: !!e.value ? 1 : 0 });
  };

  const goBack = () => {
    navigate(-1);
  };

  const showDialog = (message: string) => {
    setDialog({ show: true, message: message });
  };

  const hideDialog = () => {
    setDialog({ ...dialog, show: false });
  };

  const validateForm = () => {
    if (state.name.trim() === "") {
      showDialog("Banner title should not be blank");
      return false;
    }
    console.log(moment(state.date_start).toDate());
    console.log(moment(state.date_end).toDate());

    if (
      !!state.date_start &&
      !!state.date_end &&
      moment(state.date_start).toDate() > moment(state.date_end).toDate()
    ) {
      showDialog("Date Start must not be greater than Date End");
      return false;
    }

    if (contentType === "url" && state.url_link.trim() === "") {
      showDialog("URL Link must not be blank");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (toast && toast.current) {
      try {
        setIsLoading(true);

        if (!validateForm()) return;

        const formData = new FormData();

        //Encode to Percent-Encoded URLS
        const encodeURL = state.url_link
          .replace(/\(/g, "%28")
          .replace(/\)/g, "%29");

        if (editMode) {
          formData.append(
            "data",
            JSON.stringify({
              ...state,
              id: banner_id,
              url_link: encodeURL,
            })
          );
          formData.append("banner_image", fileImage ? fileImage : "");

          const response = await AppInfoService.editBanner(formData);
        } else {
          //Adding Banner

          formData.append(
            "data",
            JSON.stringify({
              ...state,
              image: "",
              app_id: app.id,
              url_link: encodeURL,
            })
          );
          formData.append("banner_image", fileImage ? fileImage : "");
        }

        const response = editMode
          ? await AppInfoService.editBanner(formData)
          : await AppInfoService.createBanner(formData);
        if (response.success) {
          toast.current.show({
            severity: "info",
            summary: "Success",
            detail: response.message,
          });
          setTimeout(() => {
            navigate(-1);
          }, 2000);
        } else {
          toast.current.show({
            severity: "error",
            summary: "Failed",
            detail: response.message,
          });
        }
      } catch (error) {
        toast.current.show({
          severity: "error",
          summary: "Failed",
          detail: error as String,
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const showBannerContent = () => {
    switch (contentType) {
      case "none":
        return <></>;
      case "popup":
        return <div>Upload pics here</div>;
      case "applink":
        return (
          <div>
            <LinkSelector
              show={true}
              path={path}
              value={value}
              selectedApp={app}
              setPath={setPath}
              setValue={setValue}
            />
            <InputText className="w-full" disabled value={state.url_link} />
          </div>
        );

      case "url":
        return (
          <InputTextarea
            value={state.url_link}
            className="w-full"
            placeholder="URL Link *"
            rows={4}
            onChange={(e) => {
              handleUrlChange(e.target.value);
            }}
          />
        );
    }
  };

  const handleSelectType = (e: RadioButtonChangeEvent) => {
    setContentType(e.value);
    setPath("partner");
    setValue(0);
    setState({ ...state, url_link: "" });
    let _withLink: number = 0;
    switch (e.value as ContentType) {
      case "none":
        _withLink = 0;
        break;
      case "url":
        _withLink = 1;
        break;
      case "applink":
        _withLink = 2;
        break;
      case "popup":
        _withLink = 3;
        break;
    }
    setState((prev) => ({ ...prev, withLink: _withLink }));
  };

  const onScheduleChange = (range: IDateRange) => {
    setState({
      ...state,
      date_start: range.startDate as Date,
      date_end: range.endDate as Date,
    });
  };

  const handleVisibilityCheckbox = (
    visCheckbox: "members" | "corporate",
    e: CheckboxChangeEvent
  ) => {
    switch (visCheckbox) {
      case "members":
        setState({ ...state, member: !!e.checked });
        break;
      case "corporate":
        setState({ ...state, corporate: !!e.checked });
        break;
    }
  };

  return (
    <div className="page-container">
      <Button
        iconPos="left"
        icon="pi pi-arrow-left"
        onClick={goBack}
        className="p-button-danger text-xs"
        label="Return"
      />
      <h3>{`${app.name} > ${editMode ? "Edit" : "Add"} Banner`}</h3>
      <div className="grid-nogutter">
        <div className="col-6 flex">
          <InputText
            value={state.name}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="w-full"
            placeholder="Banner Title *"
            disabled={!(canAdd || canEdit)}
          />

          <div className="flex mx-2 align-items-center">
            <InputSwitch
              checked={!!state.status}
              onChange={handleStatusChange}
              className="mr-2"
              disabled={!(canAdd || canEdit)}
            />{" "}
            Active?
          </div>
        </div>
      </div>

      <div
        className="mt-2 flex justify-content-center align-items-center"
        style={{
          borderRadius: 10,
          backgroundColor: "#eee",
          width: `calc(100vw/2)`,
          height: `calc(100vw/2*(3/4))`,
          overflow: "hidden",
        }}
      >
        {state.banner_image != undefined && state.banner_image !== "" ? (
          <Image
            imageClassName="w-full"
            className="border-round w-full"
            style={{ objectFit: "cover" }}
            preview
            src={state.banner_image}
          />
        ) : (
          <i className="pi pi-image text-4xl text-gray-600" />
        )}
      </div>
      { canModify && 
      <div className="flex gap-2 mt-2">
        <FileUpload
          ref={fileUploadRef}
          mode="basic"
          chooseOptions={{ className: "p-button-success text-xs" }}
          chooseLabel="Browse Image"
          name="banner"
          accept="image/*"
          customUpload={true}
          onError={(e) => {
            // console.log(e)
            alert(e);
            // onUpload={onUpload}
          }}
          auto={true}
          uploadHandler={onSelectImage}
        />
        {state.banner_image != undefined && state.banner_image !== "" && (
          <Button
            onClick={onResetImage}
            className={"p-button-danger text-xs"}
            label="Cancel"
          />
        )}
      </div> }
      <div
        className={`${fileExceeded ? "flex" : "hidden"} my-2 align-items-center 
            text-sm font-italic text-red-300 `}
      >
        File Size Exceeded. Maximum Size: {MAX_FILE_SIZE / 1000000} MB
      </div>

      {/* DATE RANGE */}
      <div className="flex w-6 gap-3 mt-3">
        <div className="flex-1 p-3 border-round border-2">
          <div className="mb-3 font-bold">Schedule</div>
          <DateRange
            value={{ startDate: state.date_start, endDate: state.date_end }}
            onChange={onScheduleChange}
            disabled={!(canAdd || canEdit)}
          />
          {/* {state.date_start != undefined && <label>ano</label>} */}
          <div className="flex mb-2">
            Status:&nbsp;
            <Countdown
              value={{ startDate: state.date_start, endDate: state.date_end }}
            />
          </div>
        </div>

        <div
          className={`p-3 border-round border-2 ${
            app.id === 2 ? "flex-1" : "hidden"
          }`}
        >
          <label className="font-bold">Visibility</label>
          <div className="flex-column mt-3 flex-1 ">
            <div className="gap-2 flex align-items-center">
              <Checkbox
                onChange={(e) => handleVisibilityCheckbox("members", e)}
                checked={state.member}
                disabled={!(canAdd || canEdit)}
              />
              <div>Members</div>
            </div>
            <div className="gap-2 mt-2 flex align-items-center">
              <Checkbox
                onChange={(e) => handleVisibilityCheckbox("corporate", e)}
                checked={state.corporate}
                disabled={!(canAdd || canEdit)}
              />
              <div>Corporate</div>
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-column my-3 align-items-center w-6 border-2 border-round p-3">
        <label className="font-bold">Content Type</label>
        <div className="radio flex gap-4 mt-2">
          {CONTENT_OPTIONS.map((option: IContentOption, index) => {
            return (
              <div key={index}>
                <RadioButton
                  inputId={`content-${option.value}`}
                  name={option.value}
                  value={option.value}
                  onChange={handleSelectType}
                  checked={contentType === option.value}
                  disabled={!(canAdd || canEdit)}
                />{" "}
                {option.label}
              </div>
            );
          })}
        </div>
        <div className=" my-4">{showBannerContent()}</div>
      </div>

      <Dialog
        visible={dialog.show}
        closeOnEscape
        modal
        dismissableMask
        header={"Warning"}
        footer={
          <Button className="bg-red-700" onClick={hideDialog}>
            Close
          </Button>
        }
        onHide={hideDialog}
      >
        {dialog.message}
      </Dialog>
      { canModify && 
      <Button
        loading={isLoading}
        disabled={isLoading}
        onClick={handleSubmit}
        className="p-button-success text-xs w-15rem mt-2"
        label={`${editMode ? "Save" : "Add"} Banner`}
      /> }
      <Toast ref={toast} position="bottom-right" />
    </div>
  );
};

export default AddBanner;
