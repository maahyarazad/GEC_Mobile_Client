import { IStandardResponse } from "../Response";

export type IPostAuthor = {
  user_id: number;
  first_name: string;
  last_name: string;
  prof_image: string;
  position: string;
};

export type IPost = IPostAuthor & {
  id: number;
  post_id: number;
  post_type: number;
  category: string;
  category_id: number;
  date_requested: Date;
  title: string;
  content: string;
};

export type IForum = IPost & {
  images: string;
};

export type IMarketplace = {
  mode: "offer" | "search";
  images: string[];
};

export type IMarketplaceImmo = IMarketplace &
  IPost & {
    offer: string;
    place: string;
    street: string;
    art: string; //Category
    sleep_rooms_start: number;
    sleep_rooms_end: number;
    living_space_start: number;
    living_space_end: number;
    price_from: number;
    price_to: number;
    currency: "Dirham";
  };

export type IMarketplaceMobil = IMarketplace &
  IPost & {
    art: "car" | "bike";
    label: string;
    class: string;
    milage_from: number;
    milage_to: number;
    color: string;
    month: string;
    year_from: number;
    year_to: number;
    price_from: number;
    price_to: number;
    currency: string;
  };

export type IMarketplaceMobilCar = IMarketplaceMobil & ICarInclusions;
export type IMarketplaceMobilBike = IMarketplaceMobil & IBikeInclusions;

export type ICarInclusions = {
  elec_window: boolean;
  elec_seat: boolean;
  climate: boolean;
  climate_auto: boolean;
  leather: boolean;
  seat_heater: boolean;
  board_computer: boolean;
  navi: boolean;
  all_wheel: boolean;
  esp: boolean;
  radio: boolean;
  radio_cd: boolean;
  speed_control: boolean;
  alarmsystem: boolean;
  airbag: boolean;
  co_driver_airbag: boolean;
  site_airbag: boolean;
  immobilizer: boolean;
  central_locking: boolean;
  accident_free: boolean;
  abs: boolean;
  power_steering: boolean;
  tractions_control: boolean;
  alloy_rim: boolean;
  hitch: boolean;
  luggage_rack: boolean;
  fog_lamp: boolean;
  park_distance_control: boolean;
  sunroof: boolean;
  xenon: boolean;
  handicaped_accessible: boolean;
};

export type IBikeInclusions = {
  abs: boolean;
  catalyst: boolean;
  elec_starter: boolean;
  service_history: boolean;
  kick_starter: boolean;
};
export interface IPostRejectionMsg {
  id: number;
  short_description: string;
  message: string;
  date_created: Date;
  date_updated: Date;
  status: boolean;
}

export type PostServiceType = {
  getPendingPosts: () => Promise<IStandardResponse>;
};
