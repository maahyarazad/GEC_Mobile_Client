import "./PostCardContent.css";

import React, { FC } from "react";

interface Props {
  content: string;
  title: string;
}

const PostCardContent: FC<Props> = ({ content, title }) => {
  return (
    <div className="container flex-row">
      <div className="font-bold text-2xl mb-2">{`${title}`}</div>
      <div>{`${content}`}</div>
    </div>
  );
};

export default PostCardContent;
