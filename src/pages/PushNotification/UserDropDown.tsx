import React, { useEffect, useState } from "react";
import { MultiSelect, MultiSelectChangeEvent } from "primereact/multiselect";
import useAPI from "../../hooks/useAPI";
import { config } from "../../utils/constants/constants";

interface IUser {
    user_id: number;
    first_name: string;
    last_name: string;
    email: string;
}

interface Props {
    onUserSelect: React.Dispatch<React.SetStateAction<IUser[]>>;
    placeholder?: string;
}

const UserDropDown: React.FC<Props> = ({
    onUserSelect,
    placeholder = "Select Users",
}) => {
    const [userList, setUserList] = useState<IUser[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<IUser[]>([]);
    const request = useAPI(config.BASE_URL2);

    useEffect(() => {
        let isMount = true;

        const fetchUsers = async () => {
            try {
                const response = await request.get("/user/push-targets/dropdown");
                if (isMount) setUserList(response.result);
            } catch (err) {
                console.error(err);
            }
        };

        fetchUsers();

        return () => {
            isMount = false;
        };
    }, []);

    const handleChange = (e: MultiSelectChangeEvent) => {
        const updated: IUser[] = e.value;
        setSelectedUsers(updated);
        onUserSelect(updated);
    };

    const removeUser = (userId: number) => {
        const updated = selectedUsers.filter((u) => u.user_id !== userId);
        setSelectedUsers(updated);
        onUserSelect(updated);
    };

    const selectedItemTemplate = (user: IUser) => {
        if (!user) return null;
        return (
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    minHeight: "27px",
                }}
            >
                <span>{user.first_name} {user.last_name}</span>
                <i
                    className="pi pi-times"
                    style={{ fontSize: "0.65rem", cursor: "pointer", marginLeft: "2px" }}
                    onClick={(e) => {
                        e.stopPropagation(); // prevent dropdown from opening
                        removeUser(user.user_id);
                    }}
                />
            </div>
        );
    };

    const optionTemplate = (user: IUser) => (
        <div>
            <span style={{ fontSize: "0.7rem" }}>{user.user_id}</span>
            <div className="font-semibold">{user.first_name} {user.last_name}</div>
            <div className="text-xs text-color-secondary">{user.email}</div>
        </div>
    );

    return (
        <MultiSelect
            value={selectedUsers}
            options={userList}
            onChange={handleChange}
            optionLabel="first_name"
            placeholder={placeholder}
            itemTemplate={optionTemplate}
            selectedItemTemplate={selectedItemTemplate}
            filter
            filterBy="first_name,last_name,email"
            showClear
            display="chip"
            className="w-full text-xs"
        />
    );
};

export default UserDropDown;