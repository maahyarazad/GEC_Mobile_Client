import { DataTable } from "primereact/datatable";
import "./PostList.css";
import React, {
  KeyboardEvent,
  KeyboardEventHandler,
  useEffect,
  useRef,
  useState,
} from "react";
import { Column } from "primereact/column";
import PostCard from "../../components/Post/PostCard/PostCard";
import useAPI from "../../hooks/useAPI";
import { Button } from "primereact/button";
import LoadingProgress from "../../components/LoadingSpinner/LoadingSpinner";
import {
  IPost,
  IMarketplaceMobilBike,
  IMarketplaceMobilCar,
  IPostRejectionMsg,
} from "../../@types/Post";
import { config } from "../../utils/constants/constants";
import PostDetail from "../../components/Post/PostDetail/PostDetail";
import PostFilter from "../../components/Post/PostFilter/PostFilter";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { InputText } from "primereact/inputtext";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import PostRejectList from "../../components/Post/PostRejectList/PostRejectList";
import { set } from "lodash";
import moment, { now } from "moment";

const post_status = ["Pending", "Approved", "Rejected", "Delete Requests"];

const PostList = () => {
  const api = useAPI(config.BASE_URL2);

  const [data, setData] = useState<
    IPost[] | IMarketplaceMobilCar[] | IMarketplaceMobilBike[]
  >([]);

  const [openModal, setOpenModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<{
    post_id: number;
    post_type: number;
  } | null>(null);
  const [selectedFilter, setSelectedFilter] = useState(post_status[0]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const selectedResponse = useRef<{} | null>(null);
  const loaderRef = useRef(null);
  const remainingRef = useRef<boolean | null>(null);
  const [isFetchComplete, setisFetchComplete] = useState(false);

  useEffect(() => {
    remainingRef.current = false;
    setisFetchComplete(false);
    setData([]);
    fetchPending(now());
    setSearchKeyword("");

    return () => {
      setOpenModal(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFilter]);

  useEffect(() => {
    let observer: IntersectionObserver;
    if (isFetchComplete && loaderRef.current) {
      observer = new IntersectionObserver((entries) => {
        const entry = entries[0];
        if (remainingRef.current && entry.isIntersecting) {
          fetchPending(
            data.length > 0
              ? moment(data[data.length - 1].date_requested).unix() * 1000
              : now()
          );
        }
      });

      observer.observe(loaderRef.current);
    }

    return () => {
      if (observer) observer.disconnect();
      setOpenModal(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaderRef.current, isFetchComplete, data]);

  const fetchPending = async (last: number) => {
    try {
      if (findStatusValue() === 9) {
        //Get delete requests
        setisFetchComplete(true);
      } else {
        const response = await api.get("/post/pending", {
          status: findStatusValue(),
          last: moment(last).unix(),
          limit: 10,
        });
        console.log("response", response);
        if (response.success) {
          setData((prev) => [...prev, ...response.data]);
          remainingRef.current = response.remaining;
          setisFetchComplete(true);
        }
      }
    } catch (error) {
      setisFetchComplete(true);
    }
  };

  const searchPost = async (query: string) => {
    const response = await api.get("/post/pending/search", {
      status: findStatusValue(),
      keyword: query,
    });
    if (response.success) {
      setData(response.data);
    }
  };

  const findStatusValue = () => {
    let _status = 0;

    switch (selectedFilter) {
      case "Pending":
        _status = 0;
        break;
      case "Approved":
        _status = 1;
        break;
      case "Rejected":
        _status = -1;
        break;
      case "Delete Requests":
        _status = 2;
    }

    return _status;
  };

  const removeLocalPost = (id: number) => {
    const newData = data.filter((post) => post.id !== id);
    setData(newData);
  };

  const approve = async (id: number) => {
    try {
      const response = await api.put("/post/approve", { id });
      if (response.success) {
        removeLocalPost(id);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const reject = async (id: number) => {
    try {
      const response = await api.put("/post/reject", {
        id,
        response: selectedResponse.current,
      });
      if (response.success) {
        removeLocalPost(id);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const onSelectResponse = (e: {}) => {
    selectedResponse.current = e;
  };

  const confirmStatusChange = (status: number, id: number) => {
    const _status = status > 0;

    const handleReject = () => {
      if (selectedResponse.current === null) {
        alert("Please select a reason");
      } else {
        reject(id);
      }
    };

    const handleApprove = () => {
      approve(id);
    };

    confirmDialog({
      message: (
        <div>
          <div>
            {`Are you sure you want to ${_status ? "approve" : "reject"} this
          post?`}
          </div>

          {!_status && <PostRejectList onSelect={onSelectResponse} />}
        </div>
      ),
      header: "Confirmation",
      icon: "pi pi-exclamation-triangle",
      contentClassName: "align-items-start",
      accept: _status ? handleApprove : handleReject,
    });
  };

  const handlePostPress = (post_id: number, post_type: number) => {
    setOpenModal(true);
    setSelectedPost({ post_id, post_type });
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedPost(null);
  };

  const handleSelectFilter = async (filter: string) => {
    setSelectedFilter(filter);
  };

  const handleOnSearch = (e: KeyboardEvent<HTMLInputElement>) => {
    // const cleanKeyword = e.currentTarget.value.replace(/[^a-zA-Z0-9 ]/g, "");
    const cleanKeyword = searchKeyword.trim();

    if (e.key === "Enter") {
      searchPost(cleanKeyword);
    }
  };

  const handleSearchKeywordChange = (e: any) => {
    setSearchKeyword(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchKeyword("");
    fetchPending(now());
  };

  const removePost = async (post_id: number) => {
    try {
      const response = await api.del(`/post/remove?post_id=${post_id}`);
      if (response.success) {
        removeLocalPost(post_id);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <div
        className={`${
          openModal ? "flex" : "hidden"
        } fixed z-4 w-full top-0 bottom-0 align-content-evenly modal-background-animation animation-fill-forwards justify-content-center align-items-center `}
        onClick={handleCloseModal}
      >
        {selectedPost && (
          <PostDetail
            postId={selectedPost.post_id}
            onClose={handleCloseModal}
            statusChange={confirmStatusChange}
          />
        )}

        {/* <PostDetail  */}
      </div>

      <div className="flex flex-column lg:flex-row gap-2 h-full ">
        <div className="lg:w-4 h-full w-full p-3">
          <div className="h-auto bg-gray-200 border-round p-3">
            <PostFilter
              selectedFilter={selectedFilter}
              post_status={post_status}
              onSelectFilter={handleSelectFilter}
            />
          </div>
        </div>
        <div className="flex flex-column gap-3 w-full pt-3">
          <span className="ml-3 lg:ml-0 mr-3 p-input-icon-left p-input-icon-right ">
              
            <InputText
              className="w-full"
              placeholder="Search user, content, title, category..."
              onKeyDown={handleOnSearch}
              onChange={handleSearchKeywordChange}
              value={searchKeyword}
            />
            <i
              className="pi pi-times cursor-pointer"
              onClick={handleClearSearch}
            />
          </span>

          <div className="flex flex-column align-items-center gap-6 w-full p-3 py-0 sm:p-3 sm:pl-0 overflow-scroll overflow-x-hidden h-full">
            <div className="w-full h-full">
              {/* {data.length > 0 ? ( */}
              {!isFetchComplete ? (
                <>
                  <LoadingProgress />
                </>
              ) : data.length ? (
                <div className="w-full gap-6 flex flex-column align-items-center">
                  {data.map((post) => {
                    const handleApprove = () => {
                      if (findStatusValue() === 2) {
                        removePost(post.id);
                      } else {
                        confirmStatusChange(1, post.id);
                      }
                    };

                    return (
                      <div
                        key={post.id}
                        className="flex gap-2 flex-wrap sm:flex-nowrap w-full sm:w-10 md:w-8 xl:w-6"
                      >
                        <div
                          className="w-full cursor-pointer"
                          onClick={() =>
                            handlePostPress(post.id, post.post_type)
                          }
                        >
                          <PostCard post={post} />
                        </div>
                        <div className="flex sm:flex-column sm:w-1 w-full flex-row gap-2  ">
                          {(findStatusValue() <= 0 ||
                            findStatusValue() === 2) && (
                            <Button
                              className="sm:w-3rem w-full"
                              severity="success"
                              icon="pi pi-check"
                              onClick={handleApprove}
                            />
                          )}
                          {findStatusValue() >= 0 && (
                            <Button
                              className="sm:w-3rem w-full"
                              severity="danger"
                              icon="pi pi-times"
                              onClick={() => confirmStatusChange(-1, post.id)}
                            />
                          )}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={loaderRef} style={{ height: 1 }}></div>
                </div>
              ) : (
                <div className="flex h-full justify-content-center align-items-center text-2xl flex-column gap-5">
                  <i className="pi pi-search text-7xl" />
                  <span className="block"> No results found</span>
                </div>
              )}
            </div>
          </div>
        </div>
        <ConfirmDialog />
      </div>
    </>
  );
};

export default PostList;
