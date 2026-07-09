import "./PartnerDetailsEdit.css";
import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { Dialog } from 'primereact/dialog';
import {
    IPartner,
    IPartnerDetail,
    ISpecialTags,
    IPartnerTags,
    IPCategory,
    PartnerServiceType,
    ICuisine,
} from "../../../@types/Partner";

import { InputTextarea } from "primereact/inputtextarea";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { Chip } from "primereact/chip";
import { MultiSelect } from "primereact/multiselect";
import LoadingSpinner from "../../../components/LoadingSpinner";

interface Props {
    partner: IPartner;
    categories: IPCategory[];
    partnerService: PartnerServiceType;
    toast: React.RefObject<Toast>;
    onUpdateSuccess?: () => void;
}

const CUISINE_SPECIAL_TAG = { id: 11, specialtags_en: 'Cuisine', specialtags_de: 'Exotisch Essen' };

// Pure helper — order-insensitive comparison of two arrays by value. Kept at
// module scope so it has a stable identity and never re-creates per render.
const isArrayHasSameValues = (previousArray: any[], newArray: any[]) => {
    if (previousArray.length != newArray.length) return false;
    else if (previousArray.length === 0) return true;
    else {
        for (let i = 0; i < previousArray.length; i++) {
            if (!newArray.includes(previousArray[i])) return false;
            else if (i + 1 == previousArray.length) return true;
        }
    }
};

//Functional Component
const PartnerDetailsEdit: React.FC<Props> = ({
    toast,
    partner,
    categories,
    partnerService,
    onUpdateSuccess,
}) => {
    const canAdd = true;
    const canEdit = true;

    const [selectedCategory, setSelectedCategory] = useState<IPCategory | null>(
        null
    );
    const [partnerDetail, setPartnerDetail] = useState<IPartnerDetail>();
    const [phone, setPhone] = useState<string>("");
    const [phone2, setPhone2] = useState<string>("");
    const [website, setWebsite] = useState<string>("");
    const [content, setContent] = useState<string>("");
    const [aboutEn, setAboutEn] = useState<string>("");
    const [aboutDe, setAboutDe] = useState<string>("");
    const [hasChanged, setHasChanged] = useState(true);
    const [partnerTags, setPartnerTags] = useState<IPartnerTags[]>([]);
    const [cuisineList, setCuisineList] = useState<ICuisine[]>();
    const [selectedCuisines, setSelectedCuisines] = useState<ICuisine[]>([]);
    const [specialTagList, setSpecialTagList] = useState<ISpecialTags[]>([]);
    const [selectedSpecialTags, setSelectedSpecialTags] = useState<ISpecialTags[]>([]);
    const [selectablePartnerTags, setSelectablePartnerTags] = useState<IPartnerTags[]>([]);
    const [selectablePartnerSpecialTags, setSelectablePartnerSpecialTags] = useState<ISpecialTags[]>([]);
    const [selectedPartnerSpecialTags, setSelectedPartnerSpecialTags] = useState<ISpecialTags[]>([]);
    const [merchantPin, setMerchantPin] = useState("");
    const [lockPin, setLockPin] = useState(true);
    const merchantPinUnique = useRef(false);
    // Tracks whether the component is still mounted to avoid setting state
    // after unmount (e.g. when navigating back to the OfferList tab).
    const isMounted = useRef(true);
    const [prevInfo, setPrevInfo] = useState({
        specialTags: [{}],
        cuisines: [{}],
        partnerTags: [{}]
    });
    const [generatedPin, setGeneratedPin] = useState("");
    const [visibleNewTag, setVisibleNewTag] = useState(false);
    const [createNewSpecialTagEN, setCreateNewSpecialTagEN] = useState<string>("");
    const [createNewSpecialTagDE, setCreateNewSpecialTagDE] = useState("");
    const [isLoadingCreatingNewTag, setIsLoadingCreatingNewTag] = useState(false);
    const [isDisplayCuisineMultiSelect, setIsDisplayCuisineMultiSelect] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Keep the mounted flag in sync so async callbacks can bail out early.
    useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
        };
    }, []);

    useEffect(() => {
        (async () => {
            try {
                while (isMounted.current && !merchantPinUnique.current) {
                    const randomCode = Math.ceil(Math.random() * 999999);

                    const found = await partnerService.checkPin(randomCode);
                    if (!isMounted.current) return;
                    if (found) {
                        merchantPinUnique.current = false;
                    } else {
                        merchantPinUnique.current = true;
                        setGeneratedPin(randomCode.toString().padStart(6, "0"));
                    }
                }
            } catch (err) {
                console.log(err);
                alert("Error");
            }
        })();

        // Get all Hot Offer Tags
        partnerService
            .getAllSpecialTags()
            .then((result) => {
                if (isMounted.current) setSpecialTagList(result);
            })
            .catch((err) => {
                console.log(err);
            });

        //Get all Cuisines
        partnerService
            .getAllCuisines()
            .then((result) => {
                if (isMounted.current) setCuisineList(result);
            })
            .catch((err) => {
                console.log(err);
            });

        //Get Partner Tags
        partnerService
            .getPartnerTags(partner.id)
            .then((result) => {
                if (isMounted.current) setPartnerTags(result);
            })
            .catch((err) => {
                console.log(err);
            });
    }, [partner.id, partnerService]);

    const fetchPartnerDetails = useCallback(async () => {
        if (!partner?.id) return;

        const result = await partnerService.getPartnerDetails(partner.id);
        if (isMounted.current) setPartnerDetail(result);

        return result;
    }, [partner?.id, partnerService]);

    useEffect(() => {
        fetchPartnerDetails();
    }, [fetchPartnerDetails]);

    useEffect(() => {
        if (!partnerDetail) return;

        const foundCategory = categories.find(
            (cat) => cat.id === partnerDetail!.category_id
        );
        if (foundCategory) setSelectedCategory(foundCategory);

        const _cuisines: ICuisine[] =
            cuisineList && partnerDetail!.cuisines
                ? cuisineList.filter((cuisine) =>
                    partnerDetail!.cuisines!.some((c) => c.id === cuisine.id)
                )
                : [];

        setSelectedCuisines(_cuisines);

        const _specialTags: ISpecialTags[] =
            specialTagList && partnerDetail!.specialtags
                ? specialTagList.filter((specialTag) =>
                    partnerDetail!.specialtags!.some((t) => t.id === specialTag.id)
                )
                : [];

        const _selectedSpecialTags = _specialTags.filter(
            (specialTag) => specialTag.id <= 20
        );
        const _selectedPartnerSpecialTags = _specialTags.filter(
            (specialTag) => specialTag.id > 20
        );

        setSelectedSpecialTags(_selectedSpecialTags);
        setSelectedPartnerSpecialTags(_selectedPartnerSpecialTags);

        const _selectablePartnerSpecialTags = specialTagList.filter((tag) => {
            const _tag = tag.specialtags_de?.trim().toLowerCase();
            let xx =
                tag.id > 20 &&
                partnerTags.find(
                    (partnerTag) => partnerTag.tag.trim().toLowerCase() === _tag
                );
            if (!xx && _tag) {
                xx = { tag: _tag };
            }
            return xx;
        });
        setSelectablePartnerSpecialTags(_selectablePartnerSpecialTags);

        const _selectablePartnerTags = partnerTags.filter((partnerTag) => {
            const _partnerTag = partnerTag.tag.trim().toLowerCase();
            return _selectablePartnerSpecialTags.find(
                (specialTag) =>
                    specialTag.specialtags_de?.trim().toLowerCase() !== _partnerTag
            );
        });
        setSelectablePartnerTags(_selectablePartnerTags);

        setPrevInfo((prev) => ({
            ...prev,
            cuisines: _cuisines,
            specialTags: _selectedSpecialTags,
            partnerTags: _selectedPartnerSpecialTags,
        }));

        setMerchantPin(
            partnerDetail!.merchant_pin
                ? partnerDetail!.merchant_pin.toString().padStart(6, "0")
                : generatedPin.toString().padStart(6, "0")
        );

        setPhone(partnerDetail!.phone ?? "");
        setPhone2(partnerDetail!.phone2 ?? "");
        setWebsite(partnerDetail!.web ?? "");
        setContent(partnerDetail!.content ?? "");
        setAboutEn(partnerDetail!.about_en ?? "");
        setAboutDe(partnerDetail!.about_de ?? "");

        setIsLoading(false);
    }, [partnerDetail, cuisineList, specialTagList, partnerTags]);

    useEffect(() => {
        if (
            aboutEn !== undefined &&
            aboutDe !== undefined &&
            selectedCategory !== undefined &&
            partnerDetail !== undefined &&
            selectedSpecialTags !== undefined
        ) {
            // Hard validation errors that block the update:
            //  - picking the "Cuisine" hot-offer tag requires at least one cuisine.
            //  - partner special tags are mandatory: while suggested partner tags
            //    still exist they must all be added (the Suggested list must end
            //    up empty), so an empty selection can't be submitted.
            if (
                (!!selectedSpecialTags.find(tag => tag.id == CUISINE_SPECIAL_TAG.id) &&
                    selectedCuisines.length === 0) ||
                (selectedPartnerSpecialTags.length === 0 &&
                    selectablePartnerTags.length > 0)
            ) {
                setHasChanged(false);
            }
            // When form has no error, check for any changes
            else if (
                aboutEn !== partnerDetail.about_en ||
                aboutDe !== partnerDetail.about_de ||
                partnerDetail.category_id !== selectedCategory?.id ||
                !isArrayHasSameValues(prevInfo.cuisines, selectedCuisines) ||
                !isArrayHasSameValues(prevInfo.specialTags, selectedSpecialTags) ||
                !isArrayHasSameValues(prevInfo.partnerTags, selectedPartnerSpecialTags) ||
                phone !== partnerDetail.phone ||
                merchantPin != partnerDetail.merchant_pin
            ) {
                setHasChanged(true);
            } else {
                setHasChanged(false);
            }
        } else {
            setHasChanged(false);
        }
    }, [
        selectedCategory,
        aboutEn,
        aboutDe,
        selectedCuisines,
        selectedSpecialTags,
        selectedPartnerSpecialTags,
        selectablePartnerTags,
        phone,
        merchantPin,
        partnerDetail,
        prevInfo,
    ]);

    // When Hot Offer Tags is changed
    useEffect(() => {
        const hasCuisine = selectedSpecialTags.some(
            tag => tag.id === CUISINE_SPECIAL_TAG.id
        );

        if (hasCuisine) {
            setIsDisplayCuisineMultiSelect(true);
        } else {
            setIsDisplayCuisineMultiSelect(false);
            setSelectedCuisines([]);
        }
    }, [selectedSpecialTags]);

    // -------------------------------------------------------------------------
    // Derived (memoized) values
    // -------------------------------------------------------------------------

    // Hot-offer tags are the ones with id <= 20; partner special tags are id > 20.
    const hotOfferTagOptions = useMemo(
        () => specialTagList?.filter((tag) => tag.id <= 20) ?? [],
        [specialTagList]
    );

    const selectedHotOfferTags = useMemo(
        () => selectedSpecialTags.filter((tag) => tag.id <= 20),
        [selectedSpecialTags]
    );

    const renderedPartnerTags = useMemo(
        () => (
            <div className="mt-2">
                {partnerTags.map((tag, index) => (
                    <Chip
                        key={`tag${index}`}
                        className="mr-2 mb-2 text-xs"
                        label={tag.tag}
                    />
                ))}
            </div>
        ),
        [partnerTags]
    );

    // -------------------------------------------------------------------------
    // Callbacks (stable identities via useCallback)
    // -------------------------------------------------------------------------

    const popupCreateNewSpecialTag = useCallback((de: string) => {
        setVisibleNewTag(true);
        setCreateNewSpecialTagDE(de);
    }, []);

    const specialTagLookup = useCallback(
        (name: string) => {
            name = name.trim().toLowerCase();
            return selectablePartnerSpecialTags?.find(
                (specialTag) => specialTag.specialtags_de?.trim().toLowerCase() === name
            );
        },
        [selectablePartnerSpecialTags]
    );

    const convertWebTagToSpecialTag = useCallback(
        async (webTag: IPartnerTags) => {
            const foundSpecialTag = specialTagLookup(webTag.tag);
            if (!foundSpecialTag) {
                popupCreateNewSpecialTag(webTag.tag);
                return;
            }
            return foundSpecialTag as ISpecialTags;
        },
        [specialTagLookup, popupCreateNewSpecialTag]
    );

    const selectPartnerTag = useCallback(
        async (tag: IPartnerTags) => {
            const equivalentSpecialTag = await convertWebTagToSpecialTag(tag);
            if (!equivalentSpecialTag) {
                // return the chip back to Suggested list
                return;
            }
            setSelectedPartnerSpecialTags((prev) => [...prev, equivalentSpecialTag]);
        },
        [convertWebTagToSpecialTag]
    );

    const removeSpecialTag = useCallback((index: number) => {
        setSelectedSpecialTags((prev) => {
            const _next = [...prev];
            _next.splice(index, 1);
            return _next;
        });
    }, []);

    const removeSelectedPartnerTag = useCallback((tag: ISpecialTags) => {
        setSelectedPartnerSpecialTags((prev) => prev.filter((tags) => tags !== tag));
    }, []);

    const removeCuisine = useCallback((index: number) => {
        setSelectedCuisines((prev) => {
            const _next = [...prev];
            _next.splice(index, 1);
            return _next;
        });
    }, []);

    const handleCreateNewSpecialTag = useCallback(async () => {
        setIsLoadingCreatingNewTag(true);
        const result = await partnerService.createNewSpecialTag(
            createNewSpecialTagEN,
            createNewSpecialTagDE
        );
        if (result) {
            setSelectablePartnerSpecialTags((prev) => [...prev, result]);
            setSelectedPartnerSpecialTags((prev) => [...prev, result]);
            setCreateNewSpecialTagEN('');
            setCreateNewSpecialTagDE('');
        } else {
            console.log('no result: ', result);
        }
        setIsLoadingCreatingNewTag(false);
        setVisibleNewTag(false);
    }, [partnerService, createNewSpecialTagEN, createNewSpecialTagDE]);

    const handleUpdate = useCallback(() => {
        if (
            selectedCategory !== undefined &&
            aboutEn !== undefined &&
            aboutDe !== undefined &&
            toast !== undefined
        ) {
            const specialtags = [...selectedSpecialTags, ...selectedPartnerSpecialTags];
            const data: IPartnerDetail = {
                partner_id: partner.id,
                category_id: selectedCategory?.id || 0,
                about_en: aboutEn,
                about_de: aboutDe,
                cuisines: selectedCuisines,
                specialtags: specialtags,
                merchant_pin: merchantPin,
                phone: phone,
            };
            setIsLoading(true);
            partnerService
                .updatePartnerDetail(data)
                .then((result) => {
                    if (!isMounted.current) return;
                    setIsLoading(false);

                    if (result) {
                        toast.current!.show({
                            severity: "success",
                            summary: "Update Successful",
                            detail: "Success",
                        });

                        const newPartnerDetail: IPartnerDetail = {
                            partner_id: partnerDetail!.partner_id,
                            content: partnerDetail!.content,
                            phone: partnerDetail!.phone,
                            web: partnerDetail!.web,
                            about_en: aboutEn,
                            about_de: aboutDe,
                            category_id: selectedCategory?.id || 0,
                            cuisines: selectedCuisines,
                            specialtags: specialtags,
                            merchant_pin: merchantPin,
                        };

                        setPartnerDetail(newPartnerDetail);

                        setPrevInfo((prev) => ({
                            ...prev,
                            cuisines: [...selectedCuisines],
                            specialTags: [...selectedSpecialTags],
                            partnerTags: [...selectedPartnerSpecialTags],
                        }));

                        setHasChanged(false);

                        // Return to the OfferList tab and trigger a refetch of
                        // the updated partner data in the parent component.
                        onUpdateSuccess?.();
                    } else {
                        toast.current!.show({
                            severity: "error",
                            summary: "Update Unsuccessful",
                            detail: "Changes not saved",
                        });
                    }
                })
                .catch((err) => {
                    if (!isMounted.current) return;
                    setIsLoading(false);
                    toast.current!.show({
                        severity: "error",
                        summary: "Update Unsuccessful",
                        detail: err.response.data.message,
                    });
                    console.log(err.response);
                });
        }
    }, [
        partner.id,
        selectedCategory,
        aboutEn,
        aboutDe,
        toast,
        selectedSpecialTags,
        selectedPartnerSpecialTags,
        selectedCuisines,
        merchantPin,
        phone,
        partnerService,
        partnerDetail,
        onUpdateSuccess,
    ]);

    const onCategoryChange = useCallback((e: { value: IPCategory }) => {
        setSelectedCategory(e.value);
    }, []);

    const onPhoneChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => setPhone(e.target.value),
        []
    );

    const onHotOfferTagsChange = useCallback((e: { value: ISpecialTags[] }) => {
        setSelectedSpecialTags(e.value);
    }, []);

    const onCuisinesChange = useCallback((e: { value: ICuisine[] }) => {
        setSelectedCuisines(e.value);
    }, []);

    return (
        <div className="grid text-left text-xs p-4 partner-edit relative">
            {isLoading && <LoadingSpinner />}
            <div className="col-12 flex justify-content-between">
                <div className="font-bold text-base">Partner Details</div>

                <div className="">
                    {canEdit && selectedCategory !== undefined && (
                        <Button
                            disabled={!hasChanged}
                            className="p-button-success py-2 m-0 text-sm"
                            icon={"pi pi-save"}
                            onClick={handleUpdate}
                            label="Update"
                        />
                    )}
                </div>
            </div>
            <div className="col-12">
                <div className="grid">
                    <div className="col-6 p-2">
                        <label>Partner Name</label>
                        <div>
                            <InputText
                                value={partner.title}
                                className="w-full text-xs h-2rem mt-2"
                                disabled
                            />
                        </div>
                    </div>
                    <div className="col-6 p-2">
                        <label>Partner Category *</label>
                        <div>
                            <Dropdown
                                value={selectedCategory}
                                panelClassName="text-xs"
                                className="w-full text-xs h-2rem mt-2 p-0 flex align-items-center"
                                onChange={onCategoryChange}
                                placeholder="Select a category"
                                options={categories}
                                optionLabel="pcategory_en"
                                disabled={!(canAdd || canEdit)}
                            />
                        </div>
                    </div>
                    <div className="col-6 p-2">
                        <label>Phone Number (GEC Website)</label>
                        <div>
                            <InputText
                                value={phone2}
                                disabled
                                className="w-full text-xs h-2rem mt-2"
                            />
                        </div>
                    </div>
                    <div className="col-6 p-2">
                        <label>Phone Number (Used by App)</label>
                        <div>
                            <InputText
                                value={phone}
                                onChange={onPhoneChange}
                                className="w-full text-xs h-2rem mt-2"
                                disabled={!(canAdd || canEdit)}
                            />
                        </div>
                    </div>
                    <div className="col-6 p-2">
                        <label>Website</label>
                        <div>
                            <InputText
                                value={website}
                                className="w-full text-xs h-2rem mt-2"
                                disabled
                            />
                        </div>
                    </div>
                    <div className="col-6 p-2">
                        <label>Merchant Pin</label>
                        <div className="flex gap-2">
                            <InputText
                                value={merchantPin}
                                maxLength={6}
                                max={999999}
                                disabled={lockPin}
                                type={"number"}
                                onChange={(e) => {
                                    if (e.target.value.length <= 6) {
                                        setMerchantPin(e.target.value);
                                    }
                                }}
                                onBlur={() => {
                                    setMerchantPin(merchantPin.toString().padStart(6, "0"));
                                }}
                                className="w-full text-xs h-2rem mt-2"
                            />
                            {(canAdd || canEdit) && <Button
                                className="text-xs p-0 m-0 p-2 w-8rem"
                                onClick={() => {
                                    setLockPin(!lockPin);
                                }}
                                label={lockPin ? "Unlock" : "Lock"}
                            />}
                        </div>
                    </div>

                    <div className="col-6 p-2">
                        <div className="flex gap-1">
                            {(canAdd || canEdit) && <MultiSelect
                                value={selectedHotOfferTags}
                                filter
                                panelClassName="partner-edit"
                                className=" w-full text-xs h-2rem mt-2 flex align-items-center mb-2"
                                onChange={onHotOfferTagsChange}
                                options={hotOfferTagOptions}
                                optionLabel={"specialtags_en"}
                                placeholder="Select one or more hot offer tags"
                                disabled={!(canAdd || canEdit)}
                            />}
                        </div>
                        {selectedSpecialTags !== undefined &&
                            selectedSpecialTags.map((tag, index) => {
                                // display the first 20 categories only as gray
                                if (tag.id > 20) return;

                                return (
                                    <Chip
                                        className={`mr-2 mb-2 text-xs`}
                                        key={`tag_${tag.specialtags_en}`}
                                        removable={canAdd || canEdit}
                                        onRemove={() => {
                                            removeSpecialTag(index);
                                            return true; // ✅ Must return boolean
                                        }}
                                        label={tag.specialtags_en}
                                    />
                                );
                            })
                        }
                    </div>
                    <div className="col-6 p-2">
                        {isDisplayCuisineMultiSelect && (
                            <div>
                                <label>Cuisine *</label>
                                <div>
                                    <MultiSelect
                                        invalid={selectedCuisines.length === 0}
                                        value={selectedCuisines}
                                        filter
                                        panelClassName="partner-edit"
                                        className="w-full text-xs h-2rem mt-2 flex align-items-center mb-2"
                                        onChange={onCuisinesChange}
                                        options={cuisineList}
                                        optionLabel={"cuisine_en"}
                                        placeholder="Select one or more cuisines"
                                        disabled={!(canAdd || canEdit)}
                                    />
                                </div>
                                {selectedCuisines !== undefined &&
                                    selectedCuisines.map((cuisine, index) => (
                                        <Chip
                                            className="mr-2 mb-2 text-xs bg-orange-200"
                                            key={`tag_${cuisine.cuisine_en}`}
                                            removable={canAdd || canEdit}
                                            onRemove={() => {
                                                removeCuisine(index);
                                                return true; // ✅ Must return boolean
                                            }}
                                            label={cuisine.cuisine_en}
                                        />
                                    ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="col-12 m-2 border-1 border-round" style={{ borderColor: '#ced4da' }} >

                <Dialog
                    header="Add new Tag translation"
                    visible={visibleNewTag}
                    onHide={() => { if (!visibleNewTag) return; setVisibleNewTag(false) }}>

                    <table>
                        <thead>
                            <tr>
                                <td className="bg-blue-100 text-center">English</td>
                                <td className="bg-red-100 text-center">German</td>
                            </tr>
                        </thead>

                        <tbody>
                            <tr>
                                <td>
                                    <InputText
                                        value={createNewSpecialTagEN}
                                        onChange={(e) => setCreateNewSpecialTagEN(e.target.value)}
                                        className="text-xs h-2rem mt-2"
                                        style={{ minWidth: "300px" }}
                                        autoFocus
                                        placeholder="Input English equivalent"
                                    />
                                </td>
                                <td>
                                    <InputText
                                        value={createNewSpecialTagDE}
                                        className="w-full text-xs h-2rem mt-2"
                                        style={{ minWidth: "300px" }}
                                        readOnly
                                    />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <br />
                    <Button
                        disabled={!createNewSpecialTagEN || isLoadingCreatingNewTag}
                        className="p-button-success py-2 m-0 text-sm w-full "
                        icon={"pi pi-save"}
                        onClick={handleCreateNewSpecialTag}
                        label="Save"
                    />
                </Dialog>

                <div className="col-12">
<label className="p-error">Suggested Partner Tags (at least one tag is required)</label>
                    <div style={{ minHeight: "40px" }} className="mb-2 mt-2">
                        {
                            selectedPartnerSpecialTags.map((tag, index) => {
                                let tagWord = tag.specialtags_de?.trim().toLocaleLowerCase()
                                const isSelectedTagInSuggestedTagList = partnerTags.find(partnerTag => partnerTag.tag.trim().toLowerCase() === tagWord)
                                return (
                                    <Chip
                                        className={`mr-2 mb-2 pb-2 pt-2 hover-cursor-pointer text-xs bg-${isSelectedTagInSuggestedTagList ? '' : 'red'}-200`}
                                        key={`selected-tag-${index}`}
                                        onClick={() => { if (canAdd || canEdit) removeSelectedPartnerTag(tag) }}
                                        title={tag.specialtags_en + ' - ' + tag.id}
                                        label={tag.specialtags_de}
                                        template={
                                            <>
                                                <label className="mr-2">{tag.specialtags_de} </label>
                                                {(canAdd || canEdit) && <i className="pi pi-times"></i>}
                                            </>
                                        }
                                    />
                                )
                            })
                        }
                    </div>
                </div>
                <div className="col-12 ">

                    
                    <div style={{ minHeight: "40px" }} className="mb-2 mt-2">
                        {
                            selectablePartnerTags?.map((tag, index) => {
                                let webTag = tag.tag.trim().toLowerCase();
                                // do not display if web tag has been selected
                                if (selectedPartnerSpecialTags?.find(specialTag => specialTag.specialtags_de?.trim().toLowerCase() == webTag)) return;

                                let tagExistInSelectables = selectablePartnerSpecialTags?.find(specialTag => specialTag.specialtags_de?.trim().toLowerCase() == webTag)

                                return (
                                    <Chip
                                        className={`mr-2 mb-2 pb-2 pt-2 hover-cursor-pointer text-xs bg-${tagExistInSelectables ? 'green' : 'red'}-200`}
                                        key={`suggested-tag-${index}`}
                                        onClick={() => { if (canAdd || canEdit) selectPartnerTag(tag) }}
                                        label={tag.tag}
                                        template={
                                            <>
                                                <label className="mr-2">{tag.tag} </label>
                                                {(canAdd || canEdit) && <i className="pi pi-plus"></i>}
                                            </>
                                        }
                                    />
                                )
                            })
                        }
                    </div>
                </div>
            </div>

            <div className="col-12">
                <label>Website Partner Tags for reference</label>
                <div style={{ minHeight: "40px" }} className="mb-2 mt-2">{renderedPartnerTags}</div>
            </div>

            <div className="col-12">
                <label>Old Description (disabled editing)</label>
                <InputTextarea
                    value={content}
                    rows={15}
                    className="w-full text-xs mt-2"
                />
            </div>
            <div className="col-12">
                <div className="grid font-bold text-sm text-center">
                    <div className="col-6 bg-blue-100 ">English</div>
                    <div className="col-6 bg-red-100">German</div>
                </div>
            </div>
            <div className="col-12">
                <div className="grid">
                    <div className="col-6 ">
                        <div className="flex align-items-center">
                            <label>Description</label>
                        </div>
                        <InputTextarea
                            disabled={!(canAdd || canEdit)}
                            value={aboutEn}
                            onChange={(e: { target: { value: string } }) => {
                                setAboutEn(e.target.value);
                            }}
                            rows={30}
                            className="w-full text-xs mt-2"
                        />
                    </div>
                    <div className="col-6 ">
                        <div className="flex align-items-center">
                            <label>Bezeichnung</label>
                        </div>
                        <InputTextarea
                            disabled={!(canAdd || canEdit)}
                            value={aboutDe}
                            onChange={(e: { target: { value: string } }) => {
                                setAboutDe(e.target.value);
                            }}
                            rows={30}
                            className="w-full text-xs mt-2"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PartnerDetailsEdit;
