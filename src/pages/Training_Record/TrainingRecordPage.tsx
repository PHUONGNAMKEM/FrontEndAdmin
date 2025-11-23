import React, { useEffect, useState } from "react";
import {
    Table,
    Input,
    Space,
    Pagination,
    Select,
    Card,
    Typography,
    Button,
    Popconfirm,
    Descriptions,
    message,
    notification,
    List,
    Modal,
    Splitter
} from "antd";

import { IconWrapper } from "@components/customsIconLucide/IconWrapper";

import {
    Edit3,
    Trash,
    Check,
    Ban,
    Search,
    AlignJustify,
    PanelLeft,
    CirclePlus,
} from "lucide-react";

import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useTrainingRecordStore } from "src/stores/training_record/useTrainingRecordStore";
import axios from "axios";
import { useEmployeeStore } from "src/stores/useEmployeeStore";
import { createTrainingRecordAPI } from "src/services/api.services";

const { Title } = Typography;

const statusOptions = [
    { value: null, label: "Tất cả" },
    { value: 0, label: "Đang học" },
    { value: 1, label: "Hoàn thành" },
    { value: 2, label: "Không hoàn thành" },
    { value: 3, label: "Trượt" },
];

export const TrainingRecordPage = () => {
    const {
        records,
        meta,
        fetchRecords,
        setCourseId,
        setStatus,
        filters,
        selected,
        setSelected,
        updateRecord,
        deleteRecord,
        createRecord,
        addLocalRecord
    } = useTrainingRecordStore();

    const { employees, fetchEmployees, meta: employeeMeta } = useEmployeeStore();

    const [viewMode, setViewMode] = useState<"list" | "detail">("list");
    const [isEditing, setIsEditing] = useState(false);
    const [editedRecord, setEditedRecord] = useState<any>(null);

    const [allocationModalOpen, setAllocationModalOpen] = useState(false);

    // Splitter states
    const [unassignedEmployees, setUnassignedEmployees] = useState<any[]>([]); // danh sách nhân viên chưa được phân bổ
    const [assignedEmployees, setAssignedEmployees] = useState<any[]>([]); // danh sách nhân viên đã được phân bổ

    const [searchParams, setSearchParams] = useSearchParams();

    const courseIdQuery = searchParams.get("courseId") || "";
    const searchQuery = searchParams.get("search") || "";

    const statusQuery = searchParams.get("status");
    const statusNumber =
        statusQuery === null || statusQuery === "" ? null : Number(statusQuery);

    const [searchName, setSearchName] = useState(searchQuery);

    const currentPage = parseInt(searchParams.get("current") || "1");
    const currentSize = parseInt(searchParams.get("pageSize") || "10");

    const { courseId } = useParams();

    /** INIT FILTERS (run once when route loaded) */
    useEffect(() => {
        if (courseId) setCourseId(courseId);
        setStatus(statusNumber ?? null);
    }, [courseId]);

    /** FETCH TRAINING RECORDS */
    useEffect(() => {
        fetchRecords(currentPage, currentSize);
    }, [filters, currentPage, currentSize]);

    /* FILTER LOCAL */
    const filteredRecords = records.filter((r) =>
        r.employeeName.toLowerCase().includes(searchName.toLowerCase())
    );

    // Chỉ fetch 1 lần khi modal được mở
    useEffect(() => {
        if (allocationModalOpen) {
            fetchEmployees(1, employeeMeta?.total);
        }
    }, [allocationModalOpen]);

    // Khi employees hoặc records thay đổi -> tính toán lại danh sách KHÔNG FETCH LẠIII
    useEffect(() => {
        if (!allocationModalOpen) return;

        const assignedIds = records.map((r) => r.employeeId);

        setAssignedEmployees(records);
        setUnassignedEmployees(
            employees.filter((emp) => !assignedIds.includes(emp.id!))
        );
    }, [allocationModalOpen, employees, records]);

    const handleSearchChange = (value: string) => {
        setSearchName(value);

        setSearchParams({
            courseId: courseIdQuery,
            search: value,
            status:
                filters.status === null ? "" : filters.status?.toString() || "",
            current: "1",
            pageSize: currentSize.toString(),
        });
    };

    const handleStatusChange = (value: number | null) => {
        setStatus(value);

        setSearchParams({
            courseId: courseIdQuery,
            search: searchName || "",
            status: value === null ? "" : value.toString(),
            current: "1",
            pageSize: currentSize.toString(),
        });
    };

    const handlePageChange = (current: number, pageSize: number) => {
        setSearchParams({
            courseId: courseIdQuery,
            search: searchName,
            status:
                filters.status === null ? "" : filters.status?.toString() || "",
            current: current.toString(),
            pageSize: pageSize.toString(),
        });
    };

    const toggleEdit = () => {
        if (!selected) return;
        setIsEditing(!isEditing);
        setEditedRecord({ ...selected });
    };

    const updateField = (field: keyof typeof editedRecord, value: any) => {
        setEditedRecord((prev: any) => ({ ...prev, [field]: value }));
    };

    const handleUpdate = async () => {
        if (!selected) return;

        const changed: any = {};
        Object.entries(editedRecord).forEach(([key, newVal]) => {
            const oldVal = (selected as any)[key];
            if (oldVal !== newVal) changed[key] = newVal;
        });

        if (Object.keys(changed).length === 0) {
            message.info("Không có thay đổi nào.");
            return;
        }

        try {
            await updateRecord(selected.id, changed);
            setSelected(selected ? { ...selected, ...changed } : selected);
            notification.success({ message: "Cập nhật thành công!" });
            setIsEditing(false);
        } catch {
            notification.error({ message: "Cập nhật thất bại!" });
        }
    };

    const confirmDelete = async () => {
        if (!selected) return;

        try {
            await deleteRecord(selected.id);
            notification.success({ message: "Xóa thành công!" });
            setSelected(null);
            setViewMode("list");
        } catch {
            notification.error({ message: "Xóa thất bại!" });
        }
    };

    /** ================= ASSIGN EMPLOYEE ================= */
    const handleAssignEmployee = async (emp: any) => {
        // const userId = JSON.parse(localStorage.getItem("userId") || "{}");
        const userId = localStorage.getItem("userId") || "";

        const payload = {
            employeeId: emp.id,
            courseId: courseId ?? "",
            evaluatedBy: userId,
            evaluationNote: "",
        };

        try {
            // const res = await axios.post("/api/TrainingRecord", payload);
            const created = await createRecord(payload);
            // const created = res.data.result;

            setAssignedEmployees((prev) => [...prev, created]);

            setUnassignedEmployees((prev) =>
                prev.filter((x) => x.id !== emp.id)
            );

            notification.success({
                message: "Phân bổ thành công!",
            });
        } catch (err) {
            console.error(err);
            notification.error({
                message: "Phân bổ thất bại!",
            });
        }
    };

    /** ================= UPDATE NOTE IN ASSIGNED LIST ================= */
    const updateNote = (id: string, value: string) => {
        setAssignedEmployees((prev) =>
            prev.map((r) => (r.id === id ? { ...r, evaluationNote: value } : r))
        );
    };

    const navigate = useNavigate();

    const columns = [
        { title: "Nhân viên", dataIndex: "employeeName" },
        { title: "Mã NV", dataIndex: "employeeCode" },
        { title: "Khóa học", dataIndex: "courseName" },
        { title: "Điểm", dataIndex: "score" },
        {
            title: "Trạng thái",
            dataIndex: "status",
            render: (s: number) => {
                if (s === 0) return "Đang học";
                if (s === 1) return "Hoàn thành";
                if (s === 2) return "Không hoàn thành";
                return "Trượt";
            },
        },
        { title: "Ghi chú", dataIndex: "evaluationNote", ellipsis: true },
    ];

    const [allocReason, setAllocReason] = useState("");
    const [allocTargetId, setAllocTargetId] = useState<string | null>(null);

    const handleAssignSubmit = async (emp: any) => {
        if (!allocReason.trim()) {
            message.warning("Bạn chưa nhập lý do!");
            return;
        }

        const userId = localStorage.getItem("userId") || "";

        const payload = {
            employeeId: emp.id,
            courseId: courseId ?? "",
            evaluatedBy: userId,
            evaluationNote: allocReason,
        };

        try {
            const created = await createRecord(payload);

            setAssignedEmployees(prev => [...prev, created]);
            setUnassignedEmployees(prev => prev.filter(x => x.id !== emp.id));
            // addLocalRecord(created);
            setAllocReason("");
            setAllocTargetId(null);

            notification.success({ message: "Phân bổ thành công!" });
        } catch (err) {
            notification.error({ message: "Phân bổ thất bại!" });
        }
    };


    return (
        <div style={{ background: "#fff", padding: 16, borderRadius: 8 }}>
            <div className="flex items-center justify-between mb-4">
                <Input
                    prefix={<IconWrapper Icon={Search} />}
                    placeholder="Tìm theo tên nhân viên..."
                    style={{ width: 320 }}
                    allowClear
                    value={searchName}
                    onChange={(e) => handleSearchChange(e.target.value)}
                />

                <Space>
                    <Button
                        size="large"
                        icon={<IconWrapper Icon={PanelLeft} />}
                        onClick={() => navigate(-1)}
                    >
                        Quay về
                    </Button>

                    <Button
                        size="large"
                        type={viewMode === "list" ? "primary" : "default"}
                        icon={<IconWrapper Icon={AlignJustify} color={viewMode === "list" ? "#fff" : undefined} />}
                        onClick={() => setViewMode("list")}
                    />
                    <Button
                        size="large"
                        type={viewMode === "detail" ? "primary" : "default"}
                        icon={<IconWrapper Icon={PanelLeft} color={viewMode === "detail" ? "#fff" : undefined} />}
                        onClick={() => setViewMode("detail")}
                    />

                    <Button
                        size="large"
                        icon={<IconWrapper Icon={CirclePlus} color="#fff" />}
                        type="primary"
                        onClick={() => setAllocationModalOpen(true)}
                    >
                        Phân bổ nhân viên
                    </Button>

                    <Select
                        style={{ width: 240 }}
                        value={filters.status ?? null}
                        onChange={handleStatusChange}
                        options={statusOptions}
                    />
                </Space>
            </div>

            {/** LIST */}
            {viewMode === "list" ? (
                <>
                    <Table
                        columns={columns}
                        dataSource={filteredRecords}
                        rowKey="id"
                        pagination={false}
                        onRow={(record) => ({
                            onClick: () => {
                                setSelected(record);
                                setIsEditing(false);
                                setViewMode("detail");
                            },
                        })}
                    />

                    <div className="mt-4 text-center">
                        <Pagination
                            current={meta?.current}
                            total={meta?.total}
                            pageSize={meta?.pageSize}
                            onChange={handlePageChange}
                        />
                    </div>
                </>
            ) : (
                /** DETAIL SPLIT VIEW */
                <div style={{ display: "flex", gap: 16 }}>
                    <Card style={{ flex: "1 0 25%", minWidth: 320 }} bodyStyle={{ padding: 8 }}>
                        <List
                            dataSource={filteredRecords}
                            renderItem={(item) => (
                                <List.Item
                                    onClick={() => {
                                        setSelected(item);
                                        setIsEditing(false);
                                    }}
                                    style={{
                                        cursor: "pointer",
                                        background:
                                            selected?.id === item.id
                                                ? "#e6f4ff"
                                                : "transparent",
                                        borderRadius: 6,
                                        padding: 8,
                                    }}
                                >
                                    <div>
                                        <div style={{ fontWeight: 600 }}>
                                            {item.employeeName}
                                        </div>
                                        <div
                                            style={{
                                                fontSize: 12,
                                                color: "#888",
                                            }}
                                        >
                                            {item.courseName}
                                        </div>
                                    </div>
                                </List.Item>
                            )}
                        />
                        <div style={{ marginTop: 16, textAlign: "center" }}>
                            <Pagination
                                current={meta?.current}
                                total={meta?.total}
                                pageSize={meta?.pageSize}
                                onChange={handlePageChange}
                            />
                        </div>
                    </Card>

                    <Card style={{ flex: 1 }}>
                        {selected ? (
                            <>
                                <div className="flex items-center justify-between mb-4">
                                    <Title level={4} style={{ margin: 0 }}>
                                        {selected.employeeName}
                                    </Title>

                                    <Space>
                                        <Button
                                            type="text"
                                            icon={<IconWrapper Icon={Edit3} />}
                                            onClick={toggleEdit}
                                        />

                                        <Popconfirm
                                            title="Bạn chắc chắn muốn xóa?"
                                            onConfirm={confirmDelete}
                                        >
                                            <Button
                                                danger
                                                icon={<IconWrapper Icon={Trash} color="#ff4d4f" />}
                                            >
                                                Xóa
                                            </Button>
                                        </Popconfirm>
                                    </Space>
                                </div>

                                <Descriptions bordered column={1} size="middle">
                                    <Descriptions.Item label="Mã nhân viên">
                                        {selected.employeeCode}
                                    </Descriptions.Item>

                                    <Descriptions.Item label="Khóa học">
                                        {selected.courseName}
                                    </Descriptions.Item>

                                    <Descriptions.Item label="Điểm">
                                        {isEditing ? (
                                            <Input
                                                value={editedRecord?.score}
                                                type="number"
                                                onChange={(e) =>
                                                    updateField(
                                                        "score",
                                                        Number(e.target.value)
                                                    )
                                                }
                                            />
                                        ) : (
                                            selected.score
                                        )}
                                    </Descriptions.Item>

                                    <Descriptions.Item label="Trạng thái">
                                        {isEditing ? (
                                            <Select
                                                className="w-full"
                                                value={editedRecord?.status}
                                                options={[
                                                    { value: 0, label: "Đang học" },
                                                    { value: 1, label: "Hoàn thành" },
                                                    { value: 2, label: "Không hoàn thành" },
                                                    { value: 3, label: "Trượt" },
                                                ]}
                                                onChange={(v) =>
                                                    updateField("status", v)
                                                }
                                            />
                                        ) : (
                                            statusOptions.find(
                                                (x) =>
                                                    x.value === selected.status
                                            )?.label
                                        )}
                                    </Descriptions.Item>

                                    <Descriptions.Item label="Ghi chú">
                                        {isEditing ? (
                                            <Input.TextArea
                                                value={
                                                    editedRecord?.evaluationNote
                                                }
                                                onChange={(e) =>
                                                    updateField(
                                                        "evaluationNote",
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        ) : (
                                            selected.evaluationNote || "—"
                                        )}
                                    </Descriptions.Item>
                                </Descriptions>

                                {isEditing && (
                                    <div className="flex justify-end mt-4">
                                        <Button
                                            icon={<Ban size={16} />}
                                            onClick={() => setIsEditing(false)}
                                        >
                                            Hủy
                                        </Button>

                                        <Button
                                            className="ml-4"
                                            type="primary"
                                            icon={<Check size={16} />}
                                            onClick={handleUpdate}
                                        >
                                            Cập nhật
                                        </Button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <p>Chọn một bản ghi để xem chi tiết.</p>
                        )}
                    </Card>
                </div>
            )}

            {/* ==================== ALLOCATION MODAL ==================== */}
            <Modal
                title="Phân bổ nhân viên học khóa này"
                open={allocationModalOpen}
                onCancel={() => setAllocationModalOpen(false)}
                footer={null}
                width={"90vw"}
            >
                <Splitter style={{ height: 500 }}>
                    {/* LEFT PANEL */}
                    <Splitter.Panel className="!mr-4">
                        <List

                            header={<b>Nhân viên chưa học khóa này</b>}
                            dataSource={unassignedEmployees}
                            renderItem={(emp) => (
                                <List.Item>
                                    <div style={{ width: "100%" }}>
                                        <div style={{ fontWeight: 600 }}>{emp.fullName}</div>
                                        <div style={{ fontSize: 12, color: "#999" }}>{emp.email}</div>

                                        {allocTargetId === emp.id ? (
                                            <div className="flex gap-2 mt-2">
                                                <Input
                                                    placeholder="Nhập lý do..."
                                                    value={allocReason}
                                                    onChange={(e) => setAllocReason(e.target.value)}
                                                />
                                                <Button
                                                    type="primary"
                                                    onClick={() => handleAssignSubmit(emp)}
                                                >
                                                    Phân bổ
                                                </Button>
                                                <Button onClick={() => setAllocTargetId(null)}>Hủy</Button>
                                            </div>
                                        ) : (
                                            <Button
                                                type="link"
                                                onClick={() => {
                                                    setAllocTargetId(emp.id);
                                                    setAllocReason("");
                                                }}
                                            >
                                                → Phân bổ
                                            </Button>
                                        )}
                                    </div>
                                </List.Item>
                            )}
                        />

                    </Splitter.Panel>

                    {/* RIGHT PANEL */}
                    <Splitter.Panel className="!ml-4">
                        <List
                            header={<b>Danh sách đã học khóa này</b>}
                            dataSource={assignedEmployees}
                            renderItem={(rec) => (
                                <List.Item>
                                    <div style={{ width: "100%" }}>
                                        <div style={{ fontWeight: 600 }}>{rec.employeeName}</div>
                                        <div style={{ fontSize: 12, color: "#999" }}>
                                            Điểm: {rec.score ?? "—"}
                                        </div>
                                    </div>
                                </List.Item>
                            )}
                        />
                    </Splitter.Panel>
                </Splitter>
            </Modal>
        </div>
    );
};
