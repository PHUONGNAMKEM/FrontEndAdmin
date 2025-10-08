import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Table, Popconfirm, notification } from 'antd';
import UpdateUserModal from './update.user.modal';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import ViewUserDetail from './view.user.detail';
// import DeleteUserPopconfirm from './delete.user.popconfirm';
import { deleteUserAPI } from '../../services/api.service';


const UserTable = (props) => {

    const { userData, loadUser, current, pageSize, total, setCurrent, setPageSize } = props;

    const [isModalUpdateOpen, setIsModalUpdateOpen] = useState(false);
    const [dataUpdate, setDataUpdate] = useState(null);

    const [dataDetail, setDataDetail] = useState(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);


    const handleDeleteUser = async (id) => {
        const res = await deleteUserAPI(id);
        if (res.data) {
            notification.success(
                {
                    message: "Delete A New User",
                    description: "Delete successfully",
                    duration: 3,
                    showProgress: true,
                }
            )
            // nếu như chỉ còn 1 user trên trang hiện tại và trang đang đứng không phải là trang đầu tiên (tức là nếu xóa thì sẽ ko còn dlieu trên trang này)
            if (userData.length === 1 && current > 1) {
                setCurrent(current - 1); // thì quay về trang trước
            } else {
                await loadUser(); // ko thì vẫn reload bình thường
            }
        }
        else {
            notification.error(
                {
                    message: "Error Delete A New User Failed",
                    description: JSON.stringify(res.message),
                    duration: 3,
                    showProgress: true,
                }
            )
        }
    }


    const columns = [
        {
            title: "No.",
            render: (_, record, index) => {
                return (
                    <>
                        {(index + 1) + (current - 1) * pageSize}
                    </>
                )
            }
        },
        {
            title: 'Id',
            dataIndex: '_id',
            render: (_, record) => {
                return (
                    <>
                        <Link to='#'
                            onClick={() => {
                                setDataDetail(record)
                                setIsDetailOpen(true)
                            }}
                        >{record._id}</Link>
                    </>
                )
            }
        },
        {
            title: 'FullName',
            dataIndex: 'fullName',
        },
        {
            title: 'Email',
            dataIndex: 'email',
        },
        {
            title: 'Phone',
            dataIndex: 'phone',
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <div style={{ display: "flex", gap: "20px" }}>
                    <EditOutlined
                        onClick={() => {
                            setDataUpdate(record)
                            setIsModalUpdateOpen(true)
                        }}
                        style={{ cursor: "pointer", color: "orange" }}
                    />
                    <Popconfirm
                        title="Delete A User"
                        description="Are you sure to delete this user?"
                        onConfirm={
                            () => handleDeleteUser(record._id)
                        }
                        // onCancel={cancel}
                        okText="Yes"
                        cancelText="No"
                        placement="bottom"
                    >
                        <DeleteOutlined style={{ cursor: "pointer", color: "red" }} />
                    </Popconfirm>

                </div>
            ),
        },
    ];

    const onChange = (pagination, filters, sorter, extra) => {

        // if status of pagination changed -> set current
        if (pagination && pagination.current) {
            if (+pagination.current !== +current) {
                setCurrent(+pagination.current)
            }
        }

        // if status of pageSize changed -> set total pageSize
        if (pagination && pagination.pageSize) {
            if (+pagination.pageSize !== +pageSize) {
                setPageSize(+pagination.pageSize)
            }
        }

    };


    return (
        <>
            <Table
                // tableLayout="fixed"
                columns={columns}
                dataSource={userData}
                rowKey={"_id"}
                pagination={
                    {
                        current: current,
                        pageSize: pageSize,
                        showSizeChanger: true,
                        total: total,
                        showTotal: (total, range) => { return (<div> {range[0]}-{range[1]} trên {total} rows</div>) }
                    }}
                onChange={onChange}
            />

            <UpdateUserModal
                isModalUpdateOpen={isModalUpdateOpen}
                setIsModalUpdateOpen={setIsModalUpdateOpen}
                dataUpdate={dataUpdate}
                setDataUpdate={setDataUpdate}
                loadUser={loadUser}
            />
            <ViewUserDetail
                dataDetail={dataDetail}
                setDataDetail={setDataDetail}
                isDetailOpen={isDetailOpen}
                setIsDetailOpen={setIsDetailOpen}
                loadUser={loadUser}
            />

            {/* <DeleteUserPopconfirm
                idDelele={idDelele}
                setIdDelete={setIdDelete}
                loadUser={loadUser}
            /> */}
        </>
    );

}

export default UserTable;