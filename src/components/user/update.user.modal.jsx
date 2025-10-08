import { Input, notification, Modal } from 'antd';
import { useEffect, useState } from 'react';
import { updateUserAPI } from '../../services/api.service';

const UpdateUserModal = (props) => {
    const [id, setId] = useState("");
    const [fullName, setFullName] = useState("");
    const [phone, setPhone] = useState("");

    const { isModalUpdateOpen, setIsModalUpdateOpen, dataUpdate, setDataUpdate, loadUser } = props;

    useEffect(() => {
        if (dataUpdate) {
            setId(dataUpdate._id)
            setFullName(dataUpdate.fullName)
            setPhone(dataUpdate.phone)
        }
    }, [dataUpdate])

    const handleClickBtn = async () => {
        const res = await updateUserAPI(id, fullName, phone);
        if (res.data) {
            notification.success(
                {
                    message: "Update A User",
                    description: "Update successfully" + " with FullName is: " + fullName + " and phone is: " + res.data.phone,
                    duration: 3,
                    showProgress: true,
                }
            )
            resetAndCloseModal();
            await loadUser();
        }
        else {
            notification.error(
                {
                    message: "Error Update A New User Failed",
                    description: JSON.stringify(res.message),
                    duration: 3,
                    showProgress: true,
                }
            )
        }
    }

    const resetAndCloseModal = () => {
        setIsModalUpdateOpen(false)
        setFullName("")
        setPhone("")
        setId("")
        setDataUpdate(null)
    }

    return (
        <Modal
            title="Update A User"
            closable={{ 'aria-label': 'Custom Close Button' }}
            open={isModalUpdateOpen}
            onOk={() => handleClickBtn()}
            onCancel={() => resetAndCloseModal()}
            maskClosable={false}
            okText={"UPDATE"}
        >
            <div style={{ display: "flex", gap: "15px", flexDirection: "column" }}>
                <div>
                    <span>Id</span>
                    <Input value={id} disabled />
                </div>
                <div>
                    <span>FullName</span>
                    <Input
                        value={fullName}
                        onChange={(event) => setFullName(event.target.value)} placeholder="Enter your FullName" />
                </div>
                <div>
                    <span>Phone number</span>
                    <Input value={phone}
                        onChange={(event) => setPhone(event.target.value)} placeholder="Enter your Phone number" />
                </div>

            </div>
        </Modal>
    )
}

export default UpdateUserModal;
