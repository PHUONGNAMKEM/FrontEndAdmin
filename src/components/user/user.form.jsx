import { Button, Input, notification, Modal } from 'antd';
import { useState } from 'react';
import { createUserAPI } from '../../services/api.service';

const UserForm = (props) => {

    const { loadUser } = props;

    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [phone, setPhone] = useState("");


    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleClickBtn = async () => {
        const res = await createUserAPI(fullName, email, password, phone);
        if (res.data) {
            notification.success(
                {
                    message: "Create A New User",
                    description: "Create successfully" + " at " + res.data.createdAt + " and FullName is: " + fullName + " with email: " + res.data.email + " and phone is: " + res.data.phone,
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
                    message: "Error Create A New User Failed",
                    description: JSON.stringify(res.message),
                    duration: 3,
                    showProgress: true,
                }
            )
        }
    }

    const resetAndCloseModal = () => {
        setIsModalOpen(false)
        setFullName("")
        setEmail("")
        setPassword("")
        setPhone("")
    }

    return (
        <div className="user-form" style={{}}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
                <h3>Table Users</h3>
                <Button onClick={() => setIsModalOpen(true)} type="primary">Create User</Button>
            </div>

            <Modal
                title="Create User"
                closable={{ 'aria-label': 'Custom Close Button' }}
                open={isModalOpen}
                onOk={() => handleClickBtn()}
                onCancel={() => resetAndCloseModal()}
                maskClosable={false}
                okText={"CREATE"}
            >
                <div style={{ display: "flex", gap: "15px", flexDirection: "column" }}>


                    <div>
                        <span>FullName</span>
                        <Input
                            value={fullName}
                            onChange={(event) => setFullName(event.target.value)} placeholder="Enter your FullName" />
                    </div>
                    <div>
                        <span>Email</span>
                        <Input value={email}
                            onChange={(event) => setEmail(event.target.value)} placeholder="Enter your Email" />
                    </div>
                    <div>
                        <span>Password</span>
                        <Input.Password value={password}
                            onChange={(event) => setPassword(event.target.value)} placeholder="Enter your Password" />
                    </div>
                    <div>
                        <span>Phone number</span>
                        <Input value={phone}
                            onChange={(event) => setPhone(event.target.value)} placeholder="Enter your Phone number" />
                    </div>
                </div>
            </Modal>
        </div>
    );
}

export default UserForm;