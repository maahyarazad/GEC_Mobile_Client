import useAPI from "../../../hooks/useAPI";
import { config } from "../../../utils/constants/constants";
import PostCard from "../PostCard/PostCard";
import "./PostDetail.css";
import React, { FC, useEffect, useState } from "react";
import { Button } from "primereact/button";
import LoadingProgress from "../../LoadingSpinner/LoadingSpinner";
import {
  IForum,
  IMarketplaceImmo,
  IMarketplaceMobilBike,
  IMarketplaceMobilCar,
  IPost,
} from "../../../@types/Post";
import MarketplaceDetail from "../MarketplaceDetail/MarketplaceDetail";

interface Props {
  postId: number;
  onClose: () => void;
  statusChange: (status: number, id: number) => void;
}

const PostDetail: FC<Props> = ({ postId, onClose, statusChange }) => {
  const post = useAPI(config.BASE_URL2);
  const [data, setData] = useState<
    | IPost
    | IMarketplaceMobilBike
    | IMarketplaceMobilCar
    | IMarketplaceImmo
    | null
  >(null);

  const fetchPost = async () => {
    try {
      const response = await post.get(`/post/admin/get-post/${postId}`);
      console.log("response", response);
      if (response?.success) {
        setData(response.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchPost();

    return () => {};
  }, []);

  const renderDetails = () => {
    switch (data?.post_type) {
      case 1:
        return <PostCard post={data} />;
      case 2:
        const _post = data as
          | IMarketplaceMobilCar
          | IMarketplaceMobilBike
          | IMarketplaceImmo;
        return <MarketplaceDetail post={_post} />;
    }
  };

  return (
    <div className="flex gap-2">
      {post?.loading || !data ? (
        <LoadingProgress />
      ) : post?.error ? (
        <div>Error</div>
      ) : (
        <>
          <div
            className="post-container block"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            {renderDetails()}
          </div>
          <div className="flex flex-column gap-2">
            <div className="flex sm:flex-column sm:w-1 w-full flex-row gap-2 ">
              <Button
                className="sm:w-3rem w-full"
                severity="success"
                icon="pi pi-check"
                onClick={() => statusChange(1, data?.id)}
              />
              <Button
                className="sm:w-3rem w-full"
                severity="danger"
                icon="pi pi-times"
                onClick={() => statusChange(-1, data?.id)}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PostDetail;
