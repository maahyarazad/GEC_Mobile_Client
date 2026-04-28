import { AxiosResponse } from "axios";
import { IStandardResponse } from "../../@types/Response";
import { PostServiceType } from "../../@types/Post";
import { axiosInstance } from "../../utils/interceptor/Interceptor";
import { config } from "../../utils/constants/constants";

const API_URL = `/post`;

const response = (response: AxiosResponse) => {
  const res: IStandardResponse = response.data;
  return res;
};

const options = {
  baseURL: config.BASE_URL2,
};

export const PostService: PostServiceType = {
  getPendingPosts(): Promise<IStandardResponse> {
    return axiosInstance
      .get<IStandardResponse>(`${API_URL}/pending`, options)
      .then(response);
  },
};
