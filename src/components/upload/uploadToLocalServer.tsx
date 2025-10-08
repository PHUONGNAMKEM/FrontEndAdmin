import { Upload, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

const UploadToLocalServer = ({ onUploadSuccess }: { onUploadSuccess: (url: string) => void }) => {
    const handleCustomRequest = async ({ file, onSuccess, onError }: any) => {
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("http://localhost:3001/api/upload", {
                method: "POST",
                body: formData
            });

            const result = await res.json();
            message.success("Upload thành công!");
            onSuccess("ok");
            onUploadSuccess(result.imageUrl);
        } catch (err) {
            console.error(err);
            message.error("Upload thất bại");
            onError(err);
        }
    };

    return (
        <Upload
            customRequest={handleCustomRequest}
            showUploadList={false}
            accept="image/*"
        >
            <button>
                <UploadOutlined /> Upload Background
            </button>
        </Upload>
    );
};

export default UploadToLocalServer;
