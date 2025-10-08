import { Button, ColorPicker, DatePicker, Dropdown, Flex, GetProp, Image, Input, InputNumber, MenuProps, Modal, notification, Popconfirm, Progress, Radio, Select, Space, Tag, Upload, UploadFile, UploadProps } from "antd";
import { useEffect, useState } from "react";
import { HiOutlineBookmark } from "react-icons/hi";
import './goalAdd.scss';
import { Link } from "react-router-dom";
import { GoalType } from "../../../types/Goal/GoalType";
import dayjs, { Dayjs, extend } from "dayjs";
import { DashOutlined, PlusOutlined, SettingOutlined } from "@ant-design/icons";
import { createGoalAPI, deleteGoalAPI } from "src/services/api.me.service";
import TextArea from "antd/es/input/TextArea";
import { RcFile } from "antd/es/upload";
import { AxiosResponse } from "axios";

// interface GoalProps {
//     goalData: GoalType;
//     loadGoal: () => void;
// }
interface GoalAddProps {
    goalData: GoalType[];
    isModalOpen: boolean;
    setIsModalOpen: (open: boolean) => void;
    loadGoal: () => void;
}

const GoalAdd = ({ goalData, isModalOpen, setIsModalOpen, loadGoal }: GoalAddProps) => {

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [startDate, setStartDate] = useState<Dayjs | null>(dayjs());
    const [endDate, setEndDate] = useState<Dayjs | null>(); //dayjs().add(3, "day") nếu muốn set mặc định 3 ngày sau start date
    const [isPublic, setIsPublic] = useState<boolean>(false);

    const handleChange = (e: any) => {
        setIsPublic(e.target.value);
        console.log("Đã chọn: ", e.target.value ? "Public" : "No Public");
    };

    useEffect(() => {

    }, [goalData])

    const handleCreateGoal = async () => {
        if (!title || !description || !startDate || !endDate) {
            notification.error({
                message: "Missing fields",
                description: "Please fill in all required fields.",
            });
            return;
        }

        try {
            const res = await createGoalAPI(
                title,
                description,
                startDate.toISOString(),
                endDate.toISOString(),
                isPublic,
                fileNameBackground,
            );

            if (res.statusCode === 201) {
                notification.success({
                    message: "Goal created successfully",
                });
                resetAndCloseModal();
            }
            else {
                throw new Error(res?.message || "Unexpected response");
            }

            console.log(">>> check res: ", res);
        } catch (error: any) {
            console.log(">>> check error: ", error);
            console.log(error.response?.data?.message);

            notification.error({
                message: "Create Goal Failed",
                description: error?.response?.data?.message || error.message || "Unknown error",
            });
        }
    };

    const resetAndCloseModal = () => {
        setIsModalOpen(false);
        setTitle("");
        setDescription("");
        setStartDate(dayjs());
        setEndDate(dayjs().add(3, "day"));
        setIsPublic(false);
        setFileNameBackground(null);
        setPreviewOpen(false);
        setPreviewImage('');
        setFileList([]);
        loadGoal();
    };

    const [fileNameBackground, setFileNameBackground] = useState<RcFile | null>(null);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [fileList, setFileList] = useState<UploadFile[]>([]);

    type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];
    const getBase64 = (file: FileType): Promise<string> =>
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = (error) => reject(error);
        });

    const handlePreview = async (file: UploadFile) => {
        if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj as FileType);
        }

        setPreviewImage(file.url || (file.preview as string));
        setPreviewOpen(true);
    };

    const handleChangeFile: UploadProps['onChange'] = ({ fileList: newFileList }) => {
        setFileList(newFileList);
        setFileNameBackground(newFileList[0].originFileObj as RcFile);
        console.log(">>> check fileNameBackground: ", fileNameBackground);
        console.log(">>> check newFileList[0]: ", newFileList[0]);
    }

    const uploadButton = (
        <button style={{ border: 0, background: 'none' }} type="button">
            <PlusOutlined />
            <div style={{ marginTop: 8 }}>Upload</div>
        </button>
    );

    return (
        <div className="user-form">
            <Modal
                title="Create Goal"
                closable={{ 'aria-label': 'Custom Close Button' }}
                open={isModalOpen}
                onOk={() => handleCreateGoal()}
                onCancel={() => resetAndCloseModal()}
                maskClosable={false}
                okText={"CREATE"}
            >
                <div style={{ display: "flex", gap: "15px", flexDirection: "column" }}>
                    <div>
                        <span>Title</span>
                        <Input
                            placeholder="Enter Title of your Goal"
                            value={title}
                            onChange={(event) => setTitle(event.target.value)} />
                    </div>
                    <div>
                        <span>Description</span>
                        <TextArea
                            placeholder="Describe for your Stunning Goal"
                            autoSize={{ minRows: 2, maxRows: 6 }}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>
                    <div>
                        <span>Start Date</span>
                        <DatePicker value={startDate} onChange={(date) => setStartDate(date)} style={{ width: '100%' }} />
                    </div>
                    <div>
                        <span>End Date</span>
                        <DatePicker value={endDate} onChange={(date) => setEndDate(date)} style={{ width: '100%' }} />
                    </div>
                    <div>
                        <div style={{ width: "100%" }}>
                            <Radio.Group onChange={handleChange} value={isPublic}>
                                <Radio value={true}>Public</Radio>
                                <Radio value={false}>No Public</Radio>
                            </Radio.Group>
                        </div>
                    </div>

                    <div>
                        <Upload
                            // action="https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload"
                            listType="picture-card"
                            // fileList={fileList}
                            onPreview={handlePreview}
                            onChange={handleChangeFile}
                        >
                            {fileList.length >= 1 ? null : uploadButton}
                        </Upload>
                        {previewImage && (
                            <Image
                                wrapperStyle={{ display: 'none' }}
                                preview={{
                                    visible: previewOpen,
                                    onVisibleChange: (visible) => setPreviewOpen(visible),
                                    afterOpenChange: (visible) => !visible && setPreviewImage(''),
                                }}
                                src={previewImage}
                            />
                        )}
                    </div>
                </div>
            </Modal>
        </div>
    )
}

export default GoalAdd;