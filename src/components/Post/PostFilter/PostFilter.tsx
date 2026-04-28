import { Button } from "primereact/button";
import "./PostFilter.css";
import React, { FC } from "react";

interface Props {
  selectedFilter: string;
  post_status: string[];
  onSelectFilter: (filter: string) => void;
}

const PostFilter: FC<Props> = ({
  selectedFilter,
  post_status,
  onSelectFilter,
}) => {
  return (
    <div className="flex flex-column gap-3 bg-gray-400">
      <div className="text-xl font-bold">Status Filter</div>
      {post_status?.map((status) => (
       <Button
          key={status}
          className={`p-button ${selectedFilter === status ? "selected" : "p-button-outlined"}`}
          onClick={() => onSelectFilter(status)}
          label={status}
        />
      ))}
    </div>
  );
};

export default PostFilter;
