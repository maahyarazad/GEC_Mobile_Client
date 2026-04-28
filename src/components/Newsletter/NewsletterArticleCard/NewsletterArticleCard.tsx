import "./NewsletterArticleCard.css";
import React, { FC } from "react";
import PostCardContent from "../PostCardContent/PostCardContent";
import { IPost, IForum } from "../../../@types/Post";
import { Image } from "primereact/image";
import { toProperNoun } from "../../../utils/toProperName";
import ImageGrid from "../../ImageGrid/imageGrid";
import { config } from "./../../../utils/constants/constants";

interface Props {
  post: IPost | IForum;
}

const NewsletterEventCard: FC<Props> = ({ post: IPost }) => {
  const _post = IPost as IForum;
    return (
      <div className="article-card w-full border-1 border-gray-300 ">
        <div className="w-full flex flex-column gap-1">
          <div className="text-xl font-bold">{_post?.title}</div>
          <Image
            src={config.BASE_URL+'/uploads/sys/' + _post.images}
            className="w-full"
            imageStyle={{
              objectFit: "cover",
              borderRadius: 8,
              width: "100%"
            }}
          />
          { _post.content }
        </div>
      </div>
    );

};

export default NewsletterEventCard;
