import { AxiosResponse } from 'axios';
import { axiosInstance } from '../../utils/interceptor/Interceptor';
import { config } from '../../utils/constants/constants';
import {
    IKnowledgeBaseApiEntry,
    IKnowledgeBaseListData,
    KB_STATUS,
} from '../../@types/KnowledgeBase';

// The Knowledge Base lives on v2, while axiosInstance is based at v1. Passing an
// absolute URL overrides the baseURL while keeping the auth request interceptor.
const API_URL = `${config.BASE_URL2}/knowledge-base`;

const data = (response: AxiosResponse) => response.data.data;

export const KnowledgeBaseService = {
    /**
     * Published entries, ordered by the server (sort_order, then newest).
     *
     * The catalogue is small and the screen filters client-side, so this asks
     * for one large page rather than paginating. `limit` is capped at 100
     * server-side; requesting more is silently clamped, not an error.
     */
    listPublishedEntries(): Promise<IKnowledgeBaseApiEntry[]> {
        return axiosInstance
            .get<IKnowledgeBaseListData>(API_URL, {
                params: { status: KB_STATUS.PUBLISHED, limit: 100, page: 1 },
            })
            .then(data)
            .then((payload: IKnowledgeBaseListData) => payload.rows ?? []);
    },

    /**
     * Fetch a video's bytes and wrap them in an object URL.
     *
     * The stream endpoint sits behind the admin JWT, and a plain <video src>
     * does not send the Authorization header — so the bytes have to come
     * through axios (which attaches the token) and be handed to the element as
     * a blob URL. The caller owns the returned URL and must revoke it.
     *
     * Trade-off: this buffers the whole file before playback, so the server's
     * HTTP Range support goes unused. Header auth leaves no alternative.
     */
    fetchVideoObjectUrl(videoId: number): Promise<string> {
        return axiosInstance
            .get(`${API_URL}/video/${videoId}`, { responseType: 'blob' })
            .then(response => URL.createObjectURL(response.data as Blob));
    },
};
