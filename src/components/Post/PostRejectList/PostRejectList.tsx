import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import React, {
  ChangeEvent,
  ChangeEventHandler,
  FC,
  useEffect,
  useState,
} from "react";
import useAPI from "../../../hooks/useAPI";
import { config } from "../../../utils/constants/constants";
import { IPostRejectionMsg } from "../../../@types/Post";
import { InputTextarea } from "primereact/inputtextarea";

interface Props {
  // onSelect: React.Dispatch<React.SetStateAction<number | null>>;
  onSelect: (e: {}) => void;
}

const PostRejectList: FC<Props> = ({ onSelect }) => {
  const api = useAPI(config.BASE_URL2);

  const [data, setData] = useState<IPostRejectionMsg[]>([]);
  const [selected, setSelected] = useState<IPostRejectionMsg | null>(null);
  const [message, setMessage] = useState<string>("");

  const fetchData = async () => {
    try {
      const response = await api.get("/post/rejection-response");

      if (response.success) {
        setData(response.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchData();

    return () => {};
  }, []);

  const onDropdownChange = (e: DropdownChangeEvent) => {
    const _selected = e.value as IPostRejectionMsg;
    console.log("DROPDOWN", e.value);
    setSelected(_selected);
    onSelect(e);
  };

  const onMessageChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    if (selected) {
      const _selected = {
        ...(selected as IPostRejectionMsg),
        message: e.target.value,
      };
      setSelected(_selected);
      onSelect(_selected);
    }
    // setMessage(e.target.value);
  };

  return (
    <>
      <div className="mb-2 mt-4">Reason for Rejection:</div>
      <div>
        <Dropdown
          className="w-full"
          value={selected}
          placeholder="Select a reason"
          onChange={onDropdownChange}
          options={data}
          optionLabel="short_description"
        />
        {selected && (
          <InputTextarea
            className="w-full mt-2"
            rows={5}
            placeholder="Enter your message here"
            value={selected.message}
            onChange={onMessageChange}
          />
        )}
      </div>
    </>
  );
};

export default PostRejectList;
