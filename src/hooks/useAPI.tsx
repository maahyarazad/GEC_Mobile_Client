import { axiosInstance } from "../utils/interceptor/Interceptor";
import { useState } from "react";

const useAPI = (baseURL: string) => {
  const [data, setData] = useState<any>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>();

  // const options = {
  //   method: method.toUpperCase(),
  //   url: `${config.BASE_URL2}${endpoint}`,
  //   params: { ...query },
  // };

  // const fetcHData = async () => {
  //   setLoading(true);
  //   try {
  //     const response = await axios.request(options);
  //     setData(response.data.data);
  //   } catch (error) {
  //     console.log(error);
  //     setError(error);
  //     alert("Error while fetching data.");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // useEffect(() => {
  //   fetcHData();
  // }, []);

  const get = async (endpoint: string, params?: any) => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`${baseURL}${endpoint}`, {
        params,
      });
      setData(response.data);
      return response.data;
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const post = async (endpoint: string, body: any) => {
    try {
      setLoading(true);
      const response = await axiosInstance.post(`${baseURL}${endpoint}`, body);
      setData(response.data);
      return response.data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const put = async (endpoint: string, body: any) => {
    try {
      setLoading(true);
      const response = await axiosInstance.put(`${baseURL}${endpoint}`, body);
      setData(response.data);
      return response.data;
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const del = async (endpoint: string) => {
    try {
      setLoading(true);
      const response = await axiosInstance.delete(`${baseURL}${endpoint}`);
      setData(response.data);
      return response.data;
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, get, post, put, del };
};

export default useAPI;
