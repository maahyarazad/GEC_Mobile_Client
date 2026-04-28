import "./MarketplaceDetail.css";
import React, { FC, useEffect, useState } from "react";
import {
  IMarketplaceImmo,
  IMarketplaceMobilBike,
  IMarketplaceMobilCar,
} from "../../../@types/Post";
import { Galleria } from "primereact/galleria";
import { Image } from "primereact/image";
import { toProperNoun } from "../../../utils/toProperName";
import {
  carInclusions,
  motorcycleInclusions,
} from "../../../utils/constants/marketplaceConstants";
import moment from "moment";

type Props = {
  post: IMarketplaceMobilBike | IMarketplaceMobilCar | IMarketplaceImmo;
};

const MarketplaceDetail: FC<Props> = ({ post }) => {
  const [images, setImages] = useState<string[]>([]);
  useEffect(() => {
    setImages(post.images);

    return () => {};
  }, []);

  const itemTemplate = (item: string) => {
    return (
      <div
        className="w-full"
        style={{ aspectRatio: "1.33", position: "relative" }}
      >
        <Image
          preview
          src={item}
          style={{
            height: "100%",
            aspectRatio: "1.33",
          }}
          imageStyle={{
            height: "100%",
            aspectRatio: "1.33",
            objectFit: "cover",
          }}
        />
      </div>
    );
  };

  const Gallery = () => {
    if (post.mode === "search") return null;
    return (
      <Galleria
        className="marketplace-thumbnail"
        value={images}
        circular
        showIndicators
        showIndicatorsOnItem
        style={{ width: "100%", aspectRatio: "1.33" }}
        item={itemTemplate}
        showItemNavigators
        showThumbnails={false}
      />
    );
  };

  //   function isObjKey<T>(key: any, obj: T): key is keyof T {
  //     return key in obj;
  //   }

  type MarketplacePost =
    | IMarketplaceMobilCar
    | IMarketplaceMobilBike
    | IMarketplaceImmo;

  const renderSpecifications = <T extends MarketplacePost>(post: T) => {
    let fields;
    if ("milage_from" in post) {
      fields = car_fields;
    } else if ("sleep_rooms_start" in post) {
      fields = property_fields;
    } else {
      fields = job_fields;
    }
    return (
      <div>
        <span className="font-bold text-lg">Spezifikation</span>
        <hr />
        <div className="flex flex-column">
          {fields.map((field, index) => {
            const key = field.value as keyof T;
            let rawValue = post[key];
            let displayValue: string;

            if (key === "year_from" && "year_to" in post) {
              displayValue = `${rawValue} ${
                post.mode === "search" ? `- ${post.year_to}` : ``
              }`;
            } else if (
              key === `sleep_rooms_start` &&
              `sleep_rooms_end` in post
            ) {
              displayValue = `${rawValue} ${
                post.mode === "search" ? `- ${post.sleep_rooms_end}` : ``
              }`;
            } else if (typeof rawValue === "number") {
              if (key === "milage_from" && "milage_to" in post) {
                displayValue = `${Intl.NumberFormat("de-DE").format(
                  rawValue
                )} ${
                  post.mode === "search"
                    ? `- ${Intl.NumberFormat("de-DE").format(post.milage_to)}`
                    : ``
                }`;
              } else if (
                key === `living_space_start` &&
                `living_space_end` in post
              ) {
                displayValue = `${Intl.NumberFormat("de-DE").format(
                  rawValue
                )} ${
                  post.mode === "search"
                    ? `- ${Intl.NumberFormat("de-DE").format(
                        post.living_space_end
                      )}`
                    : ``
                } sqft`;
              } else {
                displayValue = Intl.NumberFormat("de-DE").format(rawValue);
              }
            } else if (key === `month` && typeof rawValue === "string") {
              displayValue = moment(rawValue).format("MMMM");
            } else {
              displayValue = String(rawValue);
            }

            return (
              <div
                className={`flex justify-content-between px-2 py-2 ${
                  index % 2 === 0 ? "bg-gray-300" : ""
                }`}
              >
                <span className="font-bold">{field.label}</span>
                <span>{displayValue}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderDetails = <T extends MarketplacePost>(post: T) => {
    return (
      <div>
        <span className="font-bold text-lg">Details</span>
        <hr />
        <div className="flex flex-column gap-3 py-3">
          <div className="flex flex-row justify-content-between">
            <div className="flex flex-row gap-2">
              <i className="pi pi-list " />
              <span>Kategorie</span>
            </div>
            <span>{post.category}</span>
          </div>
          <div className="flex flex-row justify-content-between">
            <div className="flex flex-row gap-2">
              <i className="pi pi-calendar " />
              <span>Datum der Veröffentlichung</span>
            </div>
            <span>{moment(post.date_requested).format("LL")}</span>
          </div>
          <div className="flex flex-row justify-content-between align-items-center">
            <div className="flex flex-row gap-2">
              <i className="pi pi-user " />
              <span>Gepostet von</span>
            </div>
            <div className="flex flex-row gap-2 align-items-center">
              <Image
                src={post.prof_image}
                className="border-circle overflow-hidden"
                style={{ aspectRatio: "1" }}
                imageStyle={{ width: 35, objectFit: "fill" }}
              />
              <span>{`${post.first_name} ${post.last_name}`}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderDescription = <T extends MarketplacePost>(post: T) => {
    return (
      <div>
        <span className="font-bold text-lg">Detaillierte Beschreibung</span>
        <hr />
        <div className="flex flex-wrap" style={{ whiteSpace: "pre-line" }}>
          {post.content}
        </div>
      </div>
    );
  };

  const renderHeadline = <T extends MarketplacePost>(post: T) => {
    let price: string;

    if ("price_from" in post && "price_to" in post) {
      price = `${Intl.NumberFormat("de-DE").format(post.price_from)}${
        post.mode === "search"
          ? " - " + Intl.NumberFormat("de-DE").format(post.price_to)
          : ""
      } AED`;
    } else {
      price = "";
    }

    return (
      <div className="flex flex-column gap-2">
        <div
          className={`pill w-min mt-2 mode-${post.mode} text-white font-bold text-md`}
        >
          {toProperNoun(post.mode)}
        </div>
        <div className="flex flex-column">
          <span className="font-bold text-2xl">{post.title}</span>
          <span className="font-bold text-xl" style={{ color: "#C3A446" }}>
            {price}
          </span>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (post.category_id) {
      case 2: {
        const _post = post as IMarketplaceMobilCar;
        const inclusions =
          _post.art === "car" ? carInclusions : motorcycleInclusions;
        return (
          <div>
            <Gallery />
            {}
            <div className="flex flex-column gap-3 px-2 pt-3 pb-4">
              {renderHeadline(post)}

              {renderSpecifications(post)}

              {/* inclusions */}
              <div>
                <span className="font-bold text-lg">Ausstattung</span>
                <hr />
                <div className="flex flex-wrap">
                  {inclusions.map((inclusion) => {
                    const active = parseInt(
                      _post[
                        inclusion.value as keyof IMarketplaceMobilCar
                      ].toString()
                    );
                    return (
                      <div className="flex w-6 gap-2">
                        <i
                          className={`text-${
                            active ? "green" : "red"
                          }-500 font-bold pi pi-${active ? "check" : "times"}
                      }`}
                        />
                        <span>{inclusion.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Details */}
              {renderDetails(post)}

              {/* Description */}
              {renderDescription(post)}
            </div>
          </div>
        );
      }
      case 5: {
        return (
          <div>
            <Gallery />
            <div className="flex flex-column gap-3 px-2 pt-2 pb-4">
              {/* Headline */}
              {renderHeadline(post)}

              {/* Specs */}
              {renderSpecifications(post)}

              {/* Details */}
              {renderDetails(post)}

              {/* Description */}
              {renderDescription(post)}
            </div>
          </div>
        );
      }
      case 6: {
        return (
          <div>
            <Gallery />
            <div className="flex flex-column gap-3 px-2 pt-2 pb-4">
              {/* Headline */}
              {renderHeadline(post)}

              {/* Specs */}
              {renderSpecifications(post)}

              {/* Details */}
              {renderDetails(post)}

              {/* Description */}
              {renderDescription(post)}
            </div>
          </div>
        );
      }

      default: {
        return (
          <div>
            <Gallery />
            <div className="flex flex-column gap-3 px-2 pt-2 pb-4">
              {/* Headline */}
              {renderHeadline(post)}

              {/* Details */}
              {renderDetails(post)}

              {/* Description */}
              {renderDescription(post)}
            </div>
          </div>
        );
      }
    }
    return null;
  };

  return renderContent();
};

export default MarketplaceDetail;

const car_fields = [
  {
    label: "Maker",
    value: "label",
  },
  {
    label: "Modell",
    value: "class",
  },
  {
    label: "Kilometer",
    value: "milage_from",
  },
  {
    label: "Farbe",
    value: "color",
  },

  {
    label: "Baumonat",
    value: "month",
  },
  {
    label: "Baujahr",
    value: "year_from",
  },
];

const property_fields = [
  {
    label: "Angebot",
    value: "offer",
  },
  {
    label: "Ort/Region/Land",
    value: "place",
  },
  {
    label: "Stadtteil/Straße",
    value: "street",
  },
  {
    label: "Art",
    value: "art",
  },
  {
    label: "Schlafräume",
    value: "sleep_rooms_start",
  },
  {
    label: "Wohnfläche",
    value: "living_space_start",
  },
];

const job_fields = [
  {
    label: "Arbeitszeit",
    value: "time",
  },
  {
    label: "Ort",
    value: "place",
  },
  {
    label: "Bereich",
    value: "occupational_area",
  },
  {
    label: "Branche",
    value: "branche",
  },
  {
    label: "Erfahrung",
    value: "work_experience",
  },
];
