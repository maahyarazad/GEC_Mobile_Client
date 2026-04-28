import React, {
    ChangeEvent,
    ChangeEventHandler,
    useEffect,
    useLayoutEffect,
    useCallback,
    useRef,
    useState,

} from "react";
import "./OfferDetails.css";
import { InputText } from "primereact/inputtext";
import { InputSwitch } from "primereact/inputswitch";
import { MultiSelect } from "primereact/multiselect";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import OfferPreview from "../../components/OfferPreview/OfferPreview";
import RawEditor from "../../components/RawEditor";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { IPartner } from "../../@types/Partner";
import { Button } from "primereact/button";
import { Toolbar } from "primereact/toolbar";
import { AppInfoService } from "../../services/AppInfo/AppInfo.service";
import { IApp } from "../../@types/AppInfo";
import { OfferService } from "../../services/Offer/Offer.services";
import { IOffer, IOCategory, IOfferPremium } from "../../@types/Offer";
import { Toast } from "primereact/toast";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { PartnerService } from "../../services/Partner/Partner.service";
import {PDFViewer} from "@react-pdf/renderer";

import ReactDOM from "react-dom";
import export_template from "../../assets/offer_export_template.jpg";
import moment from "moment";
import { Checkbox, CheckboxChangeEvent } from "primereact/checkbox";
import { FileUpload } from "primereact/fileupload";
import * as PrimeImage from "primereact/image";
import { config, SERVER_URL } from "../../utils/constants/constants";
import { Nullable } from "primereact/ts-helpers";
import { StorageService } from "../../services/Storage/Storage.service";
import styles from "./styles";
import OfferPDFPage2 from "./OfferPDFPage2";

interface Props { }

interface LocationProps {
    partner: IPartner;
    partner_end?: Date | Date[];
}

const MAX_FILE_SIZE = 1000000;

//Functional Component
const OfferDetails: React.FC<Props> = () => {

    // const canRead = StorageService.hasPrivilege(76, 'read')
    // const canAdd = StorageService.hasPrivilege(76, 'add')
    // const canEdit = StorageService.hasPrivilege(76, 'edit')
    // const canDelete = StorageService.hasPrivilege(76, 'delete')
    const canRead = true;
    const canAdd = true;
    const canEdit = true;
    const canDelete = true;

    const canModify: boolean = canAdd || canEdit || canDelete

    const navigate = useNavigate();
    const location = useLocation();
    const state = location.state as LocationProps;
    const { offerId } = useParams();
    const { partner, partner_end } = state;
    const dateNow = new Date(Date.now());
    const dateYearAhead = new Date(Date.now());
    dateYearAhead.setFullYear(dateYearAhead.getFullYear() + 1);
    // console.log(dateNow)
    // console.log(dateYearAhead)
    // console.log('----------------')
    const [maxDate, setMaxDate] = useState<Date | Date[]>(dateNow);
    const [startDate, setStartDate] = useState<Date | Date[]>(dateNow);
    const [endDate, setEndDate] = useState<Date | Date[]>(dateYearAhead);
    const [minValue, setMinValue] = useState<number>(0);
    const [quantity, setQuantity] = useState<number>(0);
    const [selectedApps, setSelectedApps] = useState<IApp[]>();
    const [selectedCategory, setSelectedCategory] = useState<IOCategory>();
    const [selectedPremiumEn, setSelectedPremiumEn] = useState<IOfferPremium>();
    const [selectedPremiumDe, setSelectedPremiumDe] = useState<IOfferPremium>();
    const [productNameEn, setProductNameEn] = useState<string>("");
    const [productNameDe, setProductNameDe] = useState<string>("");
    const [isActive, setIsActive] = useState(false);
    const [showFreebie, setShowFreebie] = useState<number>(0);
    const [offerColor, setOfferColor] = useState<string>("");
    const [freebieEn, setFreebieEn] = useState<string>("");
    const [freebieDe, setFreebieDe] = useState<string>("");
    const [highlightsEn, setHighlightsEn] = useState<string>("");
    const [highlightsDe, setHighlightsDe] = useState<string>("");
    const [finePrintsEn, setFinePrintsEn] = useState<string>("");
    // const [finePrintsDeInit, setFinePrintsDeInit] = useState<string>("");
    const [finePrintsDe, setFinePrintsDe] = useState<string>("");
    const [tncEn, setTncEn] = useState<string>("");
    const [tncDe, setTncDe] = useState<string>("");
    const [appList, setAppList] = useState<IApp[]>();
    const [categoryList, setCategoryList] = useState<IOCategory[]>();
    const [premiumList, setPremiumList] = useState<IOfferPremium[]>();
    const [disableSave, setDisableSave] = useState(true);
    const [freebieValue, setFreebieValue] = useState<number>(0);
    const [isHotpick, setIsHotpick] = useState(false);
    const [hotpickImg, setHotpickImg] = useState("");
    const [hotpickPreview, setHotpickPreview] = useState("");
    const [fileExceeded, setFileExceeded] = useState(false);

    const [editMode, setEditMode] = useState(false);
    const [startDateEdit, setStartDateEdit] = useState<string>("");
    const [endDateEdit, setEndDateEdit] = useState<string>("");
    const [isStartDateEditMode, setIsStartDateEditMode] = useState(false);
    const [isEndDateEditMode, setIsEndDateEditMode] = useState(false);

    const toast = useRef<Toast>(null);
    const [modSelectedApps, setModSelectedApps] = useState<
        { id: number; op: number }[]
    >([]);
    const [refinePrevApps, setRefinePrevApps] = useState<
        { id: number; op: number }[]
    >([]);
    const fileUploadRef = useRef<FileUpload>(null);

    const [showExport, setShowExport] = useState(false);

    const showGerman = true;


const editorRefs = {
  highlightsEn: useRef<any>(null),
  highlightsDe: useRef<any>(null),
  finePrintsDe: useRef<any>(null),
  finePrintsEn: useRef<any>(null),
  tncEn: useRef<any>(null),
  tncDe: useRef<any>(null),
};

const stateSetters = {
  highlightsEn: setHighlightsEn,
  highlightsDe: setHighlightsDe,
  finePrintsDe: setFinePrintsDe,
  finePrintsEn: setFinePrintsEn,
  tncEn: setTncEn,
  tncDe: setTncDe,
};
    const handleTextChange = (fieldName: keyof typeof editorRefs) => {
    const html = editorRefs[fieldName].current?.getHTML?.() || "";
        stateSetters[fieldName](html);
    };



    useEffect(() => {
        if (selectedApps !== undefined && refinePrevApps !== undefined) {
            let modified;
            const refineSelectedApps = selectedApps.map((app) => {
                return { id: app.id, op: 0 };
            });

            // Find added entries
            modified = refineSelectedApps.filter((app) => {
                return !refinePrevApps.some((prev) => app.id === prev.id);
            });
            // Add indicator
            modified.map((newApp) => {
                return (newApp.op = 1);
            });

            //Find & Join removed entry
            modified = modified.concat(
                refinePrevApps.filter((prev) => {
                    return !selectedApps.some((app) => app.id === prev.id);
                })
            );

            setModSelectedApps(modified);
            console.log("mod:", modified);
        }
    }, [selectedApps]);

    const fetchData = useCallback(async () => {
        try {
            const [apps, categories, premiums] = await Promise.all([
                AppInfoService.getAppListByPartner(partner.id),
                OfferService.getAllCategories(),
                OfferService.getPremiums(),
            ]);

            setAppList(apps);
            setCategoryList(categories);
            setPremiumList(premiums);
        } catch (err) {
            console.error("Fetching data failed:", err);
        }
    }, [partner.id]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);


    const dateUTC = (date: Date) => {
        let _date = date;
        _date.setMinutes(_date.getMinutes() + Math.abs(_date.getTimezoneOffset()));
        return _date;
    };

    const loadOffer = useCallback(async () => {
         try{

             if (
                 offerId !== undefined &&
                 categoryList !== undefined &&
                 premiumList !== undefined &&
                 appList !== undefined
             ) {
                
                 setEditMode(true);
                 
                 const result = await OfferService.getOfferById(parseInt(offerId));
                 console.log(result);
     
                 // ---- Dates ----
                 setStartDate(new Date(result.date_start as Date));
                 setEndDate(new Date(result.date_end as Date));
     
                 // ---- Category ----
                 const _category = categoryList.find(
                     (category) => category.id === result.offer_category
                 );
                 if (_category) {
                     setSelectedCategory(_category);
                     setOfferColor(_category.color);
                 }
     
                 // ---- General fields ----
                 setMinValue(result.min_value);
                 setQuantity(result.stock_qty);
                 setIsActive(!!result.status);
                 setProductNameEn(result.prodname_en);
                 setProductNameDe(result.prodname_de);
     
                 // ---- Premium ----
                 const _premium = premiumList.find(
                     (premium) => premium.id === result.offer_premium
                 );
                 if (_premium) {
                     setSelectedPremiumEn(_premium);
                     setSelectedPremiumDe(_premium);
                     setShowFreebie(_premium.with_freebie);
                 }
     
                 
                 // ---- Content fields ----
                 setHighlightsEn(result.highlights_en);
                 setHighlightsDe(result.highlights_de);
                 setFinePrintsEn(result.fineprints_en);
                 setFinePrintsDe(result.fineprints_de);
                 setTncEn(result.tnc_en);
                 setTncDe(result.tnc_de);



                 // ---- Freebie fields ----
                 setFreebieValue(result.freebie_value);
                 setFreebieEn(result.freebie_en);
                 setFreebieDe(result.freebie_de);
     
                 // ---- Hotpick preview ----
                 setIsHotpick(!!result.isHotpick);
                 setHotpickPreview(
                     result.hotpick_image
                         ? `${SERVER_URL}/offers/${result.hotpick_image}`
                         : ""
                 );
     
                 // ---- Apps ----
                 const prevApps = result.allowed_in_apps.map((app) => ({
                     id: app.app,
                     op: 0,
                 }));
     
                 const selectedApps = result.allowed_in_apps
                     .map((app) => appList.find((x) => x.id === app.app))
                     .filter(Boolean) as IApp[];
     
                 setRefinePrevApps(prevApps);
                 setSelectedApps(selectedApps);
             } else {
                 setEditMode(false);
             }
            }catch(err){
                console.error(err);
            }
            
    }, [partner.id, offerId, categoryList, premiumList, appList]);


    useEffect(() => {
        
        loadOffer();
    }, [loadOffer]);


    useEffect(() => {
        if (startDate === undefined) {
            console.log("date undefined");
            console.log("s1");
        }
        if (startDate === null) {
            setStartDate(dateNow);
            console.log("s2");
        }
        if (endDate === null) {
            setEndDate(startDate);
            console.log("s3");
        }

        if (endDate! < startDate) {
            console.log("END: ", endDate, "\nSTART:", startDate);
            console.log(endDate > startDate);
            setEndDate(startDate);
        }
        // console.log('Start: '+startDate)
        // console.log('End: '+endDate)
    }, []);
    // }, [startDate, endDate])

    useEffect(() => {
        if (
            selectedApps !== undefined &&
            selectedApps !== null &&
            selectedCategory !== undefined &&
            selectedCategory !== null &&
            selectedPremiumEn !== undefined &&
            selectedPremiumEn !== null
        ) {
            setDisableSave(false);
        } else {
            setDisableSave(true);
        }
    }, [selectedApps, selectedCategory, selectedPremiumEn]);

    const onCategoryChange = (e: { value: any }) => {
        setSelectedCategory(e.value);
        setOfferColor(e.value.color);
    };

    const toggleStatus = () => {
        isActive ? setIsActive(false) : setIsActive(true);
    };

    const onPremiumChange = (e: { value: IOfferPremium }) => {
        setSelectedPremiumEn(e.value);
        setSelectedPremiumDe(e.value);
        setShowFreebie(e.value.with_freebie);

        if (e.value.with_freebie !== 1) {
            setFreebieValue(0);
            setFreebieEn("");
            setFreebieDe("");
        }
    };

    const onSelectImage = async ({ files }: any) => {
        const [file] = files;
        onResetImage();

        const fileReader = new FileReader();
        fileReader.onload = (e) => {
            // const url = e.target!.result;
            if (fileReader && fileReader.result) {
                setHotpickPreview(fileReader.result.toString());
            }
            setHotpickImg(files[0]);
        };
        console.log(files[0]);
        fileReader.readAsDataURL(file);
    };

    const onResetImage = () => {
        setHotpickPreview("");
        fileUploadRef.current!.clear();
        setFileExceeded(false);
    };

    const checkFieldErrors = () => {
        if (showFreebie) {
            if (!(!!freebieEn && !!freebieDe)) {
                toast.current!.show({
                    severity: "error",
                    summary: editMode ? "Update Failed" : "Creation Failed",
                    detail: "Freebie name is required",
                });
                return true;
            }
            if (!(freebieValue > 0)) {
                toast.current!.show({
                    severity: "error",
                    summary: editMode ? "Update Failed" : "Creation Failed",
                    detail: "Freebie Value should be more than 0",
                });
                return true;
            }
        }

        return false;
    };

    const handleSave = async () => {
        if (modSelectedApps != undefined) {
            const formData = new FormData();

            const newOffer: IOffer = {
                partner_id: partner.id,
                offer_category: selectedCategory!.id,
                offer_premium: selectedPremiumEn!.id,
                allowed_in_apps: [...modSelectedApps],
                min_value: minValue,
                stock_qty: quantity,
                prodname_en: productNameEn,
                prodname_de: productNameDe,
                highlights_en: highlightsEn,
                highlights_de: highlightsDe,
                fineprints_en: finePrintsEn,
                fineprints_de: finePrintsDe,
                tnc_en: tncEn,
                tnc_de: tncDe,
                date_start: startDate,
                date_end: endDate,
                freebie_en: freebieEn,
                freebie_de: freebieDe,
                freebie_value: freebieValue,
                status: isActive ? 1 : 0,
                isHotpick: isHotpick ? 1 : 0,
                hotpick_image: hotpickPreview,
            };

            if (!!isHotpick && hotpickPreview === "" && hotpickPreview != undefined) {
                alert("Hotpick is enabled. Please provide an image.");
                return;
            }

            formData.append("data", JSON.stringify({ ...newOffer }));
            formData.append("hotpick_image", hotpickImg || "");

            OfferService.addOffer(formData)
                .then((result) => {
                    if (result) {
                        setDisableSave(true);
                        toast.current!.show({
                            severity: "success",
                            summary: "Offer Created",
                            detail: "Offer successfully created",
                            className: "text-left text-xs",
                        });
                        setTimeout(() => {
                            navigate(-1);
                        }, 2000);
                    } else {
                        toast.current!.show({
                            severity: "error",
                            summary: "Creation Failed",
                            detail: "Could not create offer",
                            className: "text-left text-xs",
                        });
                    }
                })
                .catch((err) => {
                    console.log(err);
                });
        }
    };

    const handleUpdate = async () => {
        try {
            if (checkFieldErrors()) {
                return;
            }

            if (offerId != undefined && modSelectedApps != undefined) {
                const formData = new FormData();

                const newOffer: IOffer = {
                    id: parseInt(offerId),
                    partner_id: partner.id,
                    offer_category: selectedCategory!.id,
                    offer_premium: selectedPremiumEn!.id,
                    allowed_in_apps: [...modSelectedApps],
                    min_value: minValue,
                    stock_qty: quantity,
                    prodname_en: productNameEn,
                    prodname_de: productNameDe,
                    highlights_en: highlightsEn,
                    highlights_de: highlightsDe,
                    fineprints_en: finePrintsEn,
                    fineprints_de: finePrintsDe,
                    tnc_en: tncEn,
                    tnc_de: tncDe,
                    date_start: startDate,
                    date_end: endDate,
                    freebie_en: freebieEn,
                    freebie_de: freebieDe,
                    freebie_value: freebieValue,
                    status: isActive ? 1 : 0,
                    isHotpick: isHotpick ? 1 : 0,
                    hotpick_image: hotpickPreview,
                };

                if (
                    !!isHotpick &&
                    hotpickPreview === "" &&
                    hotpickPreview != undefined
                ) {
                    alert("Hotpick is enabled. Please provide an image.");
                    return;
                }

                formData.append("data", JSON.stringify({ ...newOffer }));
                formData.append("hotpick_image", hotpickImg || "");

                console.log("OFFER SAVED: ", formData);
                // OfferService.updateOffer(newOffer)
                OfferService.updateOffer(formData)
                    .then((result) => {
                        console.log(result);
                        if (result) {
                            toast.current!.show({
                                severity: "success",
                                summary: "Update Successful",
                                detail: "Offer successfully updated",
                                className: "text-left text-xs",
                            });
                            setTimeout(() => {
                                navigate(-1);
                            }, 2000);
                        } else {
                            toast.current!.show({
                                severity: "error",
                                summary: "Update Failed",
                                detail: "Could not update offer",
                                className: "text-left text-xs",
                            });
                        }
                    })
                    .catch((err) => {
                        console.log(err);
                    });
            }
        } catch (err) {
            console.log(err);
        }
    };

    const handleConfirmation = () => {
        confirmDialog({
            header: "Confirmation",
            message: editMode
                ? "Are you sure you want to apply these changes?"
                : "Are you sure you want to create this offer?",
            icon: "pi pi-exclamation-triangle",
            className: "text-xs",
            acceptClassName: "p-button-success text-xs",
            rejectClassName: "p-button-danger text-xs",
            accept: editMode ? handleUpdate : handleSave,
            reject: () => { },
        });
    };

    const OfferPDF = () => {
        return (
            <PDFViewer width={"100%"} height={window.innerHeight}>
                <OfferPDFPage2
    partner={partner}
    selectedPremiumEn={selectedPremiumEn}
    isHotpick={isHotpick}
    productNameEn={productNameEn}
    freebieEn={freebieEn}
    freebieValue={freebieValue}
    selectedCategory={selectedCategory}
    startDate={startDate}
    endDate={endDate}
    highlightsEn={highlightsEn}
    finePrintsEn={finePrintsEn}
    export_template={export_template}
/>

            </PDFViewer>
        );
    };

    const handleHotpickChange = (e: CheckboxChangeEvent) => {
        if (e.checked != undefined) setIsHotpick(e.checked);
    };

    const rightContents = () => {
        return (
            <div className="flex gap-2 justify-content-end">
                <div>
                    <Button
                        onClick={() => {
                            // navigate(-1)
                            // ReactPDF.render(<OfferPDF/>, `${__dirname}/example.pdf`);
                            // setShowExport(true)
                            ReactDOM.render(<OfferPDF />, document.getElementById("root"));
                            // ReactDOM.render(<OfferPDF/>, document.getElementById('export-content'))
                        }}
                        label="Download PDF"
                        className="p-button-danger  text-xs"
                    />
                </div>
                <div>
                    <Button
                        onClick={() => {
                            // navigate(-1)
                            console.log(startDate);
                        }}
                        label="Return"
                        className="p-button-danger  text-xs"
                        style={{ "display": 'none' }}
                    />
                </div>
                <div>
                    {(canAdd || canEdit) && <Button
                        disabled={disableSave}
                        onClick={handleConfirmation}
                        icon={`pi ${editMode ? "pi-save" : "pi-plus"}`}
                        label={editMode ? "Update" : "Create"}
                        className="p-button-success text-xs"
                    />}
                </div>
            </div>
        );
    };

    const leftContents = () => {
        return (
            <div className="pl-2 font-bold text-2xl">
                {editMode ? "Edit" : "Add"} Offer
                {endDate > new Date() ? (
                    <></>
                ) : (
                    <>
                        {` - `}
                        <span style={{ color: "red" }}>[EXPIRED]</span>
                    </>
                )}
            </div>
        );
    };




    return (
        // <div className='flex p-4 w-full'>

        <div className="page-container grid text-xs offer-details">
            <div className="col-12 text-left">
                <Button
                    icon={"pi pi-arrow-left text-xs"}
                    className="p-button-secondary text-xs"
                    onClick={() => {
                        navigate(-1);
                    }}
                    label="Back"
                />
            </div>

            <div className="col-12">
                <Toolbar
                    left={leftContents}
                    right={rightContents}
                    className="p-2 m-0"
                />
            </div>
            <div className="col-12">
                <div className="grid">
                    <div className="col-6 ">
                        <div className="flex align-items-center">
                            <label>Partner Name</label>
                        </div>
                        <div className="mt-2">
                            <InputText
                                className="w-full text-xs"
                                value={partner ? partner.title : ""}
                                disabled
                            />
                            {/* <InputText className='w-full' value={'hmm'} disabled /> */}
                        </div>
                    </div>
                    <div className="col-6">
                        <div className="flex align-items-center">
                            <label>Start Date/Time</label>
                        </div>
                        <div className="mt-2">
                            {(canAdd || canEdit) ? <div>
                                {isStartDateEditMode ?
                                    <div className="input-with-button">
                                        <InputText
                                            className="w-full"
                                            placeholder="mm/dd/yyyy, hh:mm"
                                            value={startDateEdit}
                                            invalid={!moment(startDateEdit, "MM/DD/YYYY, HH:mm", true).isValid()}
                                            onChange={(e) => {
                                                setStartDateEdit(e.target.value);
                                            }}
                                        />
                                        <Button type="button" icon="pi pi-check" aria-label="Save"
                                            disabled={!moment(startDateEdit, "MM/DD/YYYY, HH:mm", true).isValid()}
                                            onClick={() => {
                                                setStartDate(new Date(startDateEdit))
                                                setIsStartDateEditMode(!isStartDateEditMode)
                                            }} />
                                    </div>
                                    :
                                    <div className="input-with-button">
                                        <Calendar
                                            className="w-full"
                                            id="time24"
                                            value={startDate as Nullable<Date>}
                                            dateFormat="d-M, yy"
                                            maxDate={endDate as Date}
                                            showButtonBar
                                            showTime
                                            onChange={(e) => {
                                                setStartDate(e.value ? (e.value as Date) : dateNow);
                                            }}
                                        />
                                        <Button type="button" icon="pi pi-pencil" aria-label="Edit"
                                            onClick={() => {
                                                setStartDateEdit(startDate.toLocaleString("en-US", {
                                                    day: "2-digit",
                                                    month: "2-digit",
                                                    year: "numeric",
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                    hourCycle: "h24"
                                                }))
                                                setIsStartDateEditMode(!isStartDateEditMode)
                                            }} />
                                    </div>
                                }
                            </div>
                                :
                                <div>
                                    <Calendar
                                        className="w-full"
                                        id="time24"
                                        value={startDate as Nullable<Date>}
                                        dateFormat="d-M, yy"
                                        maxDate={endDate as Date}
                                        showButtonBar
                                        showTime
                                        onChange={(e) => {
                                            setStartDate(e.value ? (e.value as Date) : dateNow);
                                        }}
                                        disabled
                                    />
                                </div>}
                        </div>
                    </div>
                </div>
            </div>
            <div className="col-12">
                <div className="grid">
                    <div className="col-6">
                        <div className="flex align-items-center">
                            <label>GEC Client*</label>
                        </div>
                        <div className="mt-2">
                            <MultiSelect
                                className="w-full text-left"
                                panelClassName="offer-details"
                                value={selectedApps}
                                options={appList}
                                onChange={(e) => setSelectedApps(e.value)}
                                optionLabel="name"
                                showSelectAll
                                placeholder="Select a Client"
                                display="chip"
                                disabled={!(canAdd || canEdit)}
                            />
                        </div>
                    </div>
                    <div className="col-6">
                        <div className="flex align-items-center">
                            <label>End Date/Time</label>
                        </div>
                        {(canAdd || canEdit) ? <div className="mt-2">
                            {isEndDateEditMode ?
                                <div className="input-with-button">
                                    <InputText
                                        className="w-full"
                                        placeholder="mm/dd/yyyy, hh:mm"
                                        value={endDateEdit}
                                        invalid={!moment(endDateEdit, "MM/DD/YYYY, HH:mm", true).isValid()}
                                        onChange={(e) => {
                                            setEndDateEdit(e.target.value);
                                        }}
                                    />
                                    <Button type="button" icon="pi pi-check" aria-label="Save"
                                        disabled={!moment(endDateEdit, "MM/DD/YYYY, HH:mm", true).isValid()}
                                        onClick={() => {
                                            setEndDate(new Date(endDateEdit));
                                            setIsEndDateEditMode(!isEndDateEditMode)
                                        }} />
                                </div>
                                :
                                <div className="input-with-button">
                                    <Calendar
                                        className="w-full"
                                        id="time24"
                                        value={endDate as Nullable<Date>}
                                        dateFormat="d-M, yy"
                                        onChange={(e) =>
                                            setEndDate(e.value ? (e.value as Date) : dateNow)
                                        }
                                        minDate={startDate as Date}
                                        maxDate={new Date(maxDate as Date)}
                                        showTime
                                    />
                                    <Button type="button" icon="pi pi-pencil" aria-label="Edit"
                                        onClick={() => {
                                            setEndDateEdit(endDate.toLocaleString("en-US", {
                                                day: "2-digit",
                                                month: "2-digit",
                                                year: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                                hourCycle: "h24"
                                            }))
                                            setIsEndDateEditMode(!isEndDateEditMode)
                                        }} />
                                </div>
                            }
                        </div>
                            :
                            <div>
                                <Calendar
                                    className="w-full"
                                    id="time24"
                                    value={endDate as Nullable<Date>}
                                    dateFormat="d-M, yy"
                                    onChange={(e) =>
                                        setEndDate(e.value ? (e.value as Date) : dateNow)
                                    }
                                    minDate={startDate as Date}
                                    maxDate={new Date(maxDate as Date)}
                                    showTime
                                    disabled
                                />
                            </div>
                        }
                    </div>
                </div>
            </div>
            <div className="col-12">
                <div className="grid">
                    <div className="col-6 ">
                        <div className="flex align-items-center">
                            <label>Offer Category*</label>
                        </div>
                        <div className="mt-2">
                            <Dropdown
                                className="w-full text-left"
                                panelClassName="text-xs"
                                value={selectedCategory}
                                options={categoryList}
                                onChange={onCategoryChange}
                                optionLabel="category_en"
                                placeholder="Select a Category"
                                disabled={!(canAdd || canEdit)}
                            />
                        </div>
                    </div>
                    <div className="col-6 m-0 p-0 pt-2 px-2 ">
                        <div className="grid">
                            <div className="col-4">
                                <div className="flex align-items-center">
                                    <label>Min. Value (in AED)</label>
                                </div>
                                <div className="flex align-items-center mt-2">
                                    <div className="flex align-items-center ">
                                        <InputNumber
                                            inputClassName="w-full text-xs"
                                            value={minValue}
                                            onValueChange={(e) => setMinValue(e.value ? e.value : 0)}
                                            mode="decimal"
                                            minFractionDigits={2}
                                            min={0}
                                            disabled={!(canAdd || canEdit)}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="col-4">
                                <div className="flex align-items-center">
                                    <label>Stock Qty</label>
                                </div>
                                <div className="flex align-items-center mt-2">
                                    <div className="flex align-items-center ">
                                        <InputNumber
                                            inputClassName="w-full text-xs"
                                            value={quantity}
                                            onValueChange={(e) => setQuantity(e.value ? e.value : 0)}
                                            min={0}
                                            disabled={!(canAdd || canEdit)}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="col-2">
                                <div className="flex align-items-center">
                                    <label htmlFor="hotpick">Hot Pick</label>
                                </div>
                                <div className="flex align-items-center pt-2 mt-2">
                                    <Checkbox
                                        inputId="hotpick"
                                        name="hotpick"
                                        onChange={handleHotpickChange}
                                        checked={isHotpick}
                                        disabled={!(canAdd || canEdit)}
                                    />
                                </div>
                            </div>
                            <div className="col-2">
                                <div className="flex align-items-center">
                                    <label>Status</label>
                                </div>
                                <div className="flex align-items-center pt-2 mt-2">
                                    <InputSwitch
                                        className="mr-2"
                                        checked={isActive}
                                        onChange={toggleStatus}
                                        disabled={!(canAdd || canEdit)}
                                    />
                                    {isActive ? "Active" : "Inactive"}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {!!isHotpick && (
                <div className="col-12">
                    <div className="grid">
                        <div className="col-offset-6 col-6 ">
                            <div className="flex align-items-center">
                                <label>Hot Pick Image</label>
                            </div>
                            <div className="mt-2">
                                <div
                                    className="mt-2 flex justify-content-center align-items-center"
                                    style={{
                                        borderRadius: 10,
                                        backgroundColor: "#eee",
                                        width: 400,
                                        height: 300,
                                        overflow: "hidden",
                                    }}
                                >
                                    {hotpickPreview != undefined && hotpickPreview !== "" ? (
                                        <PrimeImage.Image
                                            imageClassName="w-full"
                                            className="border-round w-full"
                                            style={{ objectFit: "cover" }}
                                            preview
                                            src={hotpickPreview}
                                        />
                                    ) : (
                                        <i className="pi pi-image text-4xl text-gray-600" />
                                    )}
                                </div>
                                <div className="flex gap-2 mt-2">
                                    <FileUpload
                                        ref={fileUploadRef}
                                        mode="basic"
                                        chooseOptions={{ className: "p-button-success text-xs" }}
                                        chooseLabel="Choose Image"
                                        name="banner"
                                        accept="image/*"
                                        customUpload={true}
                                        onValidationFail={(e) => {
                                            setFileExceeded(true);
                                        }}
                                        maxFileSize={1000000}
                                        auto={true}
                                        uploadHandler={onSelectImage}
                                    />
                                    {hotpickPreview != undefined && hotpickPreview !== "" && (
                                        <Button
                                            onClick={onResetImage}
                                            className={"p-button-danger text-xs"}
                                            label="Cancel"
                                        />
                                    )}
                                    <div
                                        className={`${fileExceeded ? "flex" : "hidden"
                                            } my-2 align-items-center 
            text-sm font-italic text-red-300 `}
                                    >
                                        File Size Exceeded. Maximum Size: {MAX_FILE_SIZE / 1000000}{" "}
                                        MB
                                    </div>
                                </div>

                                {/* <Dropdown className='w-full text-left' panelClassName='text-xs' value={selectedCategory} options={categoryList} onChange={onCategoryChange} optionLabel="category_en" placeholder="Select a Category" /> */}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="col-12 justify-content-center">
                <div className="grid flex font-bold text-lg">
                    <div className="flex-1 py-3 bg-blue-100 text-center">English</div>
                    <div
                        className={`flex-1 py-3 bg-red-100 text-center ${showGerman ? "block" : "hidden"
                            }`}
                    >
                        German
                    </div>
                </div>
            </div>

            {/* ------Start Translation------- */}

            {/* ------ Offer Preview ------- */}

            <div className="col-12">
                <div className="grid flex my-5 ">
                    <div className="flex flex-1 justify-content-center">
                        <OfferPreview
                            type={selectedPremiumEn ? selectedPremiumEn.type : null}
                            hotpick={isHotpick}
                            endDate={endDate}
                            freebie={freebieEn}
                            premium={selectedPremiumEn ? selectedPremiumEn.premium_en : ""}
                            prep={"on"}
                            product={productNameEn}
                            color={offerColor ? offerColor : "#C5C5C5"}
                        />
                    </div>
                    <div
                        className={`justify-content-center ${showGerman ? "flex flex-1 " : "hidden"
                            }`}
                    >
                        <OfferPreview
                            type={selectedPremiumEn ? selectedPremiumEn.type : null}
                            hotpick={isHotpick}
                            endDate={endDate}
                            freebie={freebieDe}
                            premium={selectedPremiumDe ? selectedPremiumDe.premium_de : ""}
                            prep={"auf"}
                            product={productNameDe}
                            color={offerColor ? offerColor : "#C5C5C5"}
                        />
                    </div>
                </div>
            </div>

            <div className="col-12">
                <div className="flex ">
                    <div className="flex-1">
                        <div className="flex align-items-center">
                            <label>Product/Service Name</label>
                        </div>
                        <div className="mt-2">
                            <InputText
                                className="w-full text-xs"
                                maxLength={50}
                                value={productNameEn}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                    setProductNameEn(e.target.value);
                                }}
                                disabled={!(canAdd || canEdit)}
                            />
                        </div>
                    </div>
                    <div className={` ${showGerman ? "flex-1  ml-5" : "hidden"}`}>
                        <div className="flex align-items-center">
                            <label>Produktname/Dienstleistungsname</label>
                        </div>
                        <div className="mt-2">
                            <InputText
                                className="w-full text-xs"
                                value={productNameDe}
                                maxLength={50}
                                onChange={(e) => setProductNameDe(e.target.value)}
                                disabled={!(canAdd || canEdit)}
                            />
                        </div>
                    </div>
                </div>
            </div>
            <div className="col-12">
                <div className="flex ">
                    <div className="flex-1">
                        <div className="grid">
                            {/* <div className="col-5"> */}
                            <div className={showFreebie > 0 ? "col-5" : "col-12"}>
                                <div className="flex align-items-center ">
                                    <label>Premium*</label>
                                </div>
                                <div className="mt-2">
                                    <Dropdown
                                        className="w-full text-left text-green-400"
                                        value={selectedPremiumEn}
                                        options={premiumList}
                                        optionLabel={"premium_en"}
                                        onChange={onPremiumChange}
                                        disabled={!(canAdd || canEdit)}
                                    />
                                </div>
                            </div>
                            <div className={`col-7 ${showFreebie ? "block" : "hidden"}`}>
                                <div className="flex align-items-center">Freebie Value*</div>
                                <div className="mt-2">
                                    <InputNumber
                                        className="w-full text-xs"
                                        value={freebieValue}
                                        allowEmpty={false}
                                        onChange={(e) => setFreebieValue(e.value!)}
                                        mode="decimal"
                                        minFractionDigits={2}
                                        min={0}
                                    />
                                    {/* <InputText className='w-full' value={freebieValue} onChange={(e)=> setFreebieValue(parseFloat(e.target.value))} /> */}
                                </div>
                            </div>
                            <div
                                className={`col-12 ${showFreebie === 1 ? "block" : "hidden"}`}
                            >
                                <div className="flex align-items-center">Freebie*</div>
                                <div className="mt-2">
                                    <InputText
                                        className="w-full text-xs"
                                        value={freebieEn}
                                        onChange={(e) => setFreebieEn(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className={` ${showGerman ? "flex-1  ml-5" : "hidden"}`}>
                        <div className="grid">
                            <div className={showFreebie ? "col-5" : "col-12"}>
                                <div className="flex align-items-center">
                                    <label>Prämie</label>
                                </div>
                                <div className="mt-2">
                                    <Dropdown
                                        className="w-full text-left"
                                        disabled
                                        value={selectedPremiumDe}
                                        options={premiumList}
                                        optionLabel={"premium_de"}
                                    />
                                </div>
                            </div>
                            <div className={`col-7 ${showFreebie ? "block" : "hidden"}`}>
                                <div className="flex align-items-center">
                                    Werbegeschenk-Wert*
                                </div>
                                <div className="mt-2">
                                    <InputNumber
                                        className="w-full"
                                        value={freebieValue}
                                        allowEmpty={false}
                                        onChange={(e) => setFreebieValue(e.value!)}
                                        mode="decimal"
                                        minFractionDigits={2}
                                        min={0}
                                        disabled
                                    />
                                </div>
                            </div>
                            <div
                                className={`col-12 ${showFreebie === 1 ? "flex-1" : "hidden"}`}
                            >
                                <div className="flex align-items-center">Werbegeschenk*</div>
                                <div className="mt-2">
                                    <InputText
                                        className="w-full "
                                        value={freebieDe}
                                        onChange={(e) => setFreebieDe(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="col-12">
                <div className="flex">
                    <div className="flex-1">
                        <div className="flex align-items-center">
                            <label>Highlights</label>
                        </div>
                        <div className="mt-2">
                                                       <RawEditor
  ref={editorRefs.highlightsEn}
  value={highlightsEn}
  onTextChange={() => handleTextChange("highlightsEn")}
  height={200}
/>
                        </div>
                    </div>
                    <div className={` ${showGerman ? "flex-1  ml-5" : "hidden"}`}>
                        <div className="flex align-items-center">
                            <label>Höhepunkte</label>
                        </div>
                        <div className="mt-2">
                                                       <RawEditor
  ref={editorRefs.highlightsDe}
  value={highlightsDe}
  onTextChange={() => handleTextChange("highlightsDe")}
  height={200}
/>
                        </div>
                    </div>
                </div>
            </div>
            <div className="col-12">
                <div className="flex">
                    <div className="flex-1">
                        <div className="flex align-items-center">
                            <label>Fine Prints / Terms & Conditions</label>
                        </div>
                        <div className="mt-2">
                            <RawEditor
  ref={editorRefs.finePrintsEn}
  value={finePrintsEn}
  onTextChange={() => handleTextChange("finePrintsEn")}
  height={200}
/>
                        </div>
                    </div>
                    <div className={` ${showGerman ? "flex-1  ml-5" : "hidden"}`}>
                        <div className="flex align-items-center">
                            <label>Feine Drucke / Bedingungen und Konditionen</label>
                        </div>
                        <div className="mt-2">
                            <RawEditor
  ref={editorRefs.finePrintsDe}
  value={finePrintsDe}
  onTextChange={() => handleTextChange("finePrintsDe")}
  height={200}
/>
                        </div>
                    </div>
                </div>
            </div>
            <div className="col-12 hidden">
                <div className="flex">
                    <div className="flex-1">
                        <div className="flex align-items-center">
                            <label>Terms & Conditions</label>
                        </div>
                        <div className="mt-2">
                            <RawEditor
  ref={editorRefs.tncEn}
  value={tncEn}
  onTextChange={() => handleTextChange("tncEn")}
  height={200}
/>
                        </div>
                    </div>
                    <div className={`${showGerman ? "flex-1  ml-5" : "hidden"}`}>
                        <div className="flex align-items-center">
                            <label>Bedingungen und Konditionen</label>
                        </div>
                        <div className="mt-2">
                            <RawEditor
  ref={editorRefs.tncDe}
  value={tncDe}
  onTextChange={() => handleTextChange("tncDe")}
  height={200}
/>
                        </div>
                    </div>
                </div>
            </div>
            <Toast position="bottom-right" ref={toast} />
            <ConfirmDialog />
        </div>

        // </div>
        //    <OfferPDF/>
    );
};

export default OfferDetails;
