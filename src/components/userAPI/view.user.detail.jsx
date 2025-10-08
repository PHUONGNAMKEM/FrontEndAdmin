import { Drawer, Button, notification } from "antd";
import { useState } from "react";
import { handleUploadFile, updateUserAvatarAPI } from "../../services/api.service";

const ViewUserDetail = (props) => {
  const { dataDetail, setDataDetail, isDetailOpen, setIsDetailOpen, loadUser } = props;

  const [selectedFile, setSelectedFile] = useState(null) // một state để lưu trữ info of file
  const [preview, setPreview] = useState(null) // một state để lưu trữ url lại

  const handleOnchangeFile = (event) => {
    if (!event.target.files || event.target.files.length === 0) {
      setSelectedFile(null)
      setPreview(null)
      return;
    }

    // I've kept this example simple by using the first image instead of multiple
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file))
    }
    // console.log(">>> check file: ", file);
  }

  const handleUpdateUserAvatar = async () => {
    // 1: upload file
    const resUpload = await handleUploadFile(selectedFile, "avatar")
    if (resUpload.data) {
      const newAvatar = resUpload.data.fileUploaded;

      const resUpdateAvatar = await updateUserAvatarAPI(
        newAvatar, dataDetail._id, dataDetail.fullName, dataDetail.phone
      );
      if (resUpdateAvatar) {
        setIsDetailOpen(false);
        setSelectedFile(null)
        setPreview(null)
        await loadUser();

        notification.success({
          message: "Update user avatar",
          description: "Update avatar successfully"
        })

      } else {
        notification.error({
          message: "Error update avatar",
          description: JSON.stringify(resUpdateAvatar.message)
        })
      }
    } else {
      notification.error({
        message: "Error upload file",
        description: JSON.stringify(resUpload.message)
      })
    }
    // 2. 
  }

  return (
    <>
      <Drawer
        width={"40vw"}
        title="User Detail"
        closable={{ "aria-label": "Close Button" }}
        onClose={() => {
          setDataDetail(null);
          setIsDetailOpen(false);
        }}
        open={isDetailOpen}
      >
        {dataDetail ? (
          <>
            <p style={{ marginBottom: "20px", fontSize: "16px" }}>
              Id: {dataDetail._id}
            </p>
            <p style={{ marginBottom: "20px", fontSize: "16px" }}>
              FullName: {dataDetail.fullName}
            </p>
            <p style={{ marginBottom: "20px", fontSize: "16px" }}>
              Email: {dataDetail.email}
            </p>
            <p style={{ marginBottom: "20px", fontSize: "16px" }}>
              Phone number: {dataDetail.phone}
            </p>
            <p style={{ marginBottom: "20px", fontSize: "16px" }}>Avatar:</p>

            <div style={{ marginTop: "10px", width: "150px", height: "100px", }}>
              <img
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain"
                }}
                src={`${import.meta.env.VITE_BACKEND_URL}/images/avatar/${dataDetail.avatar
                  }`}
              />
            </div>

            {preview &&
              <>
                <div style={{ marginTop: "10px", width: "150px", height: "100px", marginBottom: "15px" }}>
                  <img
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain"
                    }}
                    src={preview}
                  />
                </div>
                <Button
                  type="primary"
                  onClick={() => handleUpdateUserAvatar()}
                >Save</Button>
              </>
            }

            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div></div>
              <div>
                <Button style={{ margin: "0 10px" }} type="primary" onClick={() => setIsDetailOpen(false)}>
                  OK
                </Button>
                <div style={{ display: "inline-block" }}>
                  <label htmlFor="btnUpload" style={{
                    display: "block",
                    width: "fit-content",
                    marginTop: "15px",
                    padding: "6px 14px",
                    background: "#1677ff",
                    fontSize: "14px",
                    borderRadius: "5px",
                    color: "#fff",
                    cursor: "pointer"
                  }}>Upload Avatar</label>
                  <input
                    type="file"
                    id="btnUpload"
                    hidden
                    onChange={handleOnchangeFile}
                  />
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <p style={{ color: "red" }}>Data is empty</p>
          </>
        )}
      </Drawer>
    </>
  );
};

export default ViewUserDetail;
