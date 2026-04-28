import { Image } from "primereact/image";
import "./PostCardHeader.css";
import React from "react";
import moment from "moment";
import useTime from "../../../hooks/useTime";

//write a prop type for this component
interface Props {
  prof_image: string;
  full_name: string;
  avatar_size?: number;
  position?: string;
  date_requested?: Date;
  category: string;
}

const PostCardHeader: React.FC<Props> = ({
  prof_image,
  full_name,
  avatar_size = 60,
  position,
  date_requested,
  category,
}) => {
  const { timeDiffString } = useTime();
  return (
    <div className="container post-card-header ">
      <div
        style={{
          borderRadius: "50%",
          overflow: "hidden",
          width: avatar_size,
          height: avatar_size,
        }}
      >
        <Image
          imageStyle={{
            width: avatar_size,
            height: avatar_size,
            objectFit: "contain",
          }}
          src={prof_image}
        />
      </div>
      <div className="flex justify-content-between flex-1">
        <div>
          <div className="post-card-header-content text-xl font-bold">
            {full_name}
          </div>
          <div>{position}</div>
          <div>{timeDiffString(date_requested as Date)}</div>
        </div>
        <div className="flex align-items-center">
          <div className="pill">
            <div className="pill-text">{category}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostCardHeader;
