import "./PostCard.css";
import React, { FC } from "react";
import PostCardHeader from "../PostCardHeader/PostCardHeader";
import PostCardContent from "../PostCardContent/PostCardContent";
import {
  IForum,
  IMarketplaceImmo,
  IMarketplaceMobilBike,
  IMarketplaceMobilCar,
  IPost,
} from "../../../@types/Post";
import { Image } from "primereact/image";
import { toProperNoun } from "../../../utils/toProperName";
import ImageGrid from "../../ImageGrid/imageGrid";

interface Props {
  post: IPost | IMarketplaceMobilBike | IMarketplaceMobilCar | IMarketplaceImmo;
}

const PostCard: FC<Props> = ({ post }) => {
  if (post.post_type === 1) {
    const _post = post as IForum;
    return (
      <div className="post-card w-full border-1 border-gray-300 ">
        <PostCardHeader
          prof_image={_post?.prof_image ?? "https://picsum.photos/200"}
          full_name={`${_post?.first_name} ${_post?.last_name}`}
          position={_post?.position}
          date_requested={_post?.date_requested}
          category={_post.post_type === 2 ? "Marktplatz" : _post?.category}
        />
        <PostCardContent title={_post?.title} content={_post?.content} />
        {_post.images && <ImageGrid images={_post.images.split(",")} />}
      </div>
    );
  } else if (post.post_type === 2) {
    const _post = post as
      | IMarketplaceMobilBike
      | IMarketplaceMobilCar
      | IMarketplaceImmo;
    return (
      <div className="post-card w-full border-1 border-gray-300 ">
        <PostCardHeader
          prof_image={_post?.prof_image ?? "https://picsum.photos/200"}
          full_name={`${_post?.first_name} ${_post?.last_name}`}
          position={_post?.position}
          date_requested={_post?.date_requested}
          category={_post.post_type === 2 ? "Marktplatz" : _post?.category}
        />

        <div className="p-2 flex flex-column gap-2">
          <div className={`pill w-min mode-${_post.mode} text-white font-bold`}>
            {toProperNoun(_post.mode)}
          </div>
          <div className=" gap-2 flex flex-row ">
            {!!_post?.images && _post.mode === `offer` && (
              <div className="w-9rem">
                <Image
                  src={_post?.images + "_s2.jpg"}
                  className="w-full"
                  imageStyle={{
                    width: "140px",
                    aspectRatio: "1",
                    objectFit: "cover",
                    borderRadius: 8,
                  }}
                />
              </div>
            )}
            <div className="flex flex-column gap-2  justify-content-between">
              <div className="flex flex-column gap-2">
                <div className="text-xl font-bold">{_post?.title}</div>
                <div className="">
                  {_post?.content.length > 100 ? (
                    <>
                      {`${_post.content.slice(1, 100).trim()}...`}{" "}
                      <span className="font-bold">Read More</span>
                    </>
                  ) : (
                    _post.content
                  )}
                </div>
              </div>
              <div className="">
                <div>
                  Kategorie:{" "}
                  <span className="font-bold">{_post?.category}</span>
                </div>
                {_post.price_from ? (
                  _post.mode === "offer" ? (
                    <div className="font-bold">
                      {Intl.NumberFormat("de-DE").format(_post.price_from)} AED
                    </div>
                  ) : (
                    _post.mode === "search" && (
                      <div className="font-bold">
                        {`${Intl.NumberFormat("de-DE").format(
                          _post.price_from
                        )} - ${Intl.NumberFormat("de-DE").format(
                          _post.price_to
                        )}`}{" "}
                        AED
                      </div>
                    )
                  )
                ) : (
                  <></>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } else {
    return null;
  }
};

export default PostCard;
