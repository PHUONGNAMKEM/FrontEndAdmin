import React, { useEffect, useMemo, useState } from "react";
import {
    Button, Checkbox, DatePicker, Dropdown, Form, Input, Modal, Pagination, Select, Space, Tag, Tooltip, Typography, notification, Popconfirm, MenuProps,
} from "antd";
import dayjs, { Dayjs } from "dayjs";
import { useSearchParams, useOutletContext } from "react-router-dom";

import { HeaderOutletContextType } from "src/types/layout/HeaderOutletContextType";
import { useWorkScheduleStore } from "src/stores/work_schedule/useWorkScheduleStore";
import { useEmployeeStore } from "src/stores/useEmployeeStore";
import { useDepartmentStore } from "src/stores/useDepartmentStore";
import { useShiftTemplateStore } from "src/stores/shift/useShiftTemplateStore";

import {
    WorkSchedule,
    WorkScheduleBulkCreatePayload,
    WorkScheduleBulkDeletePayload,
    WorkSchedulePayload,
} from "src/types/work/WorkSchedule";
import { ShiftTemplate } from "src/types/shift/ShiftTemplate";
import { IconWrapper } from "@components/customsIconLucide/IconWrapper";
import { ChevronLeft, ChevronRight, Calendar, Trash } from "lucide-react";


const { RangePicker } = DatePicker;

// ===== type riêng cho FORM đơn lẻ =====
interface WorkScheduleFormValues {
    employeeId: string;
    date: Dayjs;
    shiftTemplateId: string;
    note?: string;
}

// ===== type form bulk =====
interface BulkCreateFormValues {
    departmentId?: string;
    employeeIds?: string[];
    range?: [Dayjs, Dayjs];
    daysOfWeek?: number[];
    shiftTemplateId?: string;
    note?: string;
    overwrite?: boolean;
}

interface BulkDeleteFormValues {
    departmentId?: string;
    employeeIds?: string[];
    range?: [Dayjs, Dayjs];
}

const BACKEND_PAGE_SIZE = 1000; // load đủ lịch tuần
const EMP_PAGE_SIZE = 12;       // số nhân viên mỗi trang
const weekdayLabel = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

export const WorkSchedulePage = () => {
    // ======= store =======
    const {
        schedules,
        meta,
        fetchSchedules,
        addSchedule,
        updateSchedule,
        deleteSchedule,
        bulkCreateSchedules,
        bulkDeleteSchedules,
        isModalOpen,
        setModalOpen,
    } = useWorkScheduleStore();

    const { employees = [], fetchEmployees } = useEmployeeStore();
    const { departments = [], fetchDepartment } = useDepartmentStore();
    const { templates = [], fetchTemplates } = useShiftTemplateStore();

    const [searchParams, setSearchParams] = useSearchParams();

    const initialWeekFromUrl = searchParams.get("week");
    // ngày đại diện tuần hiện tại
    const [currentDate, setCurrentDate] = useState<Dayjs>(
        initialWeekFromUrl ? dayjs(initialWeekFromUrl) : dayjs()
    );

    // filter
    const [departmentId, setDepartmentId] = useState<string | undefined>(
        searchParams.get("departmentId") || undefined
    );
    const [employeeId, setEmployeeId] = useState<string | undefined>(
        searchParams.get("employeeId") || undefined
    );
    const [shiftTemplateId, setShiftTemplateId] = useState<string | undefined>(
        searchParams.get("shiftTemplateId") || undefined
    );

    // phân trang nhân viên (trong grid)
    const [employeePage, setEmployeePage] = useState(1);

    // modal đơn lẻ
    const [form] = Form.useForm<WorkScheduleFormValues>();
    const [editingRecord, setEditingRecord] = useState<WorkSchedule | null>(null);
    const [selectedCell, setSelectedCell] = useState<{
        employeeId: string;
        date: string;
    } | null>(null);

    // modal bulk create
    const [bulkCreateOpen, setBulkCreateOpen] = useState(false);
    const [bulkCreateForm] = Form.useForm<BulkCreateFormValues>();

    // modal bulk delete
    const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
    const [bulkDeleteForm] = Form.useForm<BulkDeleteFormValues>();

    // ======= load dữ liệu phụ =======
    useEffect(() => {
        fetchEmployees?.(1, 200);
        fetchDepartment?.();
        fetchTemplates?.(1, 100);
    }, []);

    // reset trang nhân viên khi đổi filter
    useEffect(() => {
        setEmployeePage(1);
    }, [departmentId, employeeId]);

    // map shiftTemplateId -> code (HC, CA2,...)
    const shiftCodeMap = useMemo(() => {
        const map: Record<string, string> = {};
        (templates || []).forEach((t: ShiftTemplate) => {
            map[t.id] = t.code;
        });
        return map;
    }, [templates]);

    // ======= tuần hiện tại & list ngày =======
    const weekStart = useMemo(
        () => currentDate.startOf("week"),
        [currentDate]
    );
    const weekEnd = useMemo(
        () => weekStart.add(6, "day"),
        [weekStart]
    );

    const dateList: string[] = useMemo(() => {
        const arr: string[] = [];
        for (let i = 0; i < 7; i++) {
            arr.push(weekStart.add(i, "day").format("YYYY-MM-DD"));
        }
        return arr;
    }, [weekStart]);

    // ======= fetch lịch làm việc theo filters (theo tuần) =======
    useEffect(() => {
        const from = weekStart.format("YYYY-MM-DD");
        const to = weekEnd.format("YYYY-MM-DD");

        fetchSchedules(1, BACKEND_PAGE_SIZE, {
            departmentId,
            employeeId,
            shiftTemplateId,
            from,
            to,
        });

        setSearchParams({
            week: weekStart.format("YYYY-MM-DD"),
            departmentId: departmentId || "",
            employeeId: employeeId || "",
            shiftTemplateId: shiftTemplateId || "",
        });
    }, [weekStart, weekEnd, departmentId, employeeId, shiftTemplateId]);

    const handleDateChange = (value: Dayjs | null) => {
        if (value) setCurrentDate(value);
    };

    const handlePrevWeek = () => setCurrentDate((prev) => prev.add(-7, "day"));
    const handleNextWeek = () => setCurrentDate((prev) => prev.add(7, "day"));

    // ======= Header content =======
    const { setHeaderContent } = useOutletContext<HeaderOutletContextType>();
    useEffect(() => {
        setHeaderContent(
            <div className="flex items-center gap-4">
                <IconWrapper Icon={Calendar} />
                <span className="text-lg font-semibold">
                    Lịch làm việc tuần {weekStart.format("DD/MM")} -{" "}
                    {weekEnd.format("DD/MM/YYYY")} – Tổng lịch:{" "}
                    <b>{meta?.total || 0}</b>
                </span>
            </div>
        );
        return () => setHeaderContent(null);
    }, [meta?.total, weekStart, weekEnd]);

    // ======= build dữ liệu grid =======

    // danh sách nhân viên theo phòng ban
    const employeesFiltered = useMemo(() => {
        let list = employees;
        if (departmentId) {
            list = list.filter((e: any) => e.departmentId === departmentId);
        }
        return list;
    }, [employees, departmentId]);

    // phân trang nhân viên trong grid
    const pagedEmployees = useMemo(() => {
        const start = (employeePage - 1) * EMP_PAGE_SIZE;
        return employeesFiltered.slice(start, start + EMP_PAGE_SIZE);
    }, [employeesFiltered, employeePage]);

    // map nhanh (employeeId + date) -> schedule
    const scheduleMap = useMemo(() => {
        const map: Record<string, WorkSchedule> = {};
        (schedules || []).forEach((s) => {
            const key = `${s.employeeId}_${s.date}`;
            map[key] = s;
        });
        return map;
    }, [schedules]);

    const handleCellClick = (empId: string, date: string) => {
        const existing = scheduleMap[`${empId}_${date}`];

        if (existing) {
            // edit
            setEditingRecord(existing);
            setSelectedCell(null);
            form.setFieldsValue({
                employeeId: existing.employeeId,
                date: dayjs(existing.date),
                shiftTemplateId: existing.shiftTemplateId,
                note: existing.note,
            });
        } else {
            // create
            setEditingRecord(null);
            setSelectedCell({ employeeId: empId, date });
            form.setFieldsValue({
                employeeId: empId,
                date: dayjs(date),
                shiftTemplateId: undefined as any,
                note: "",
            });
        }

        setModalOpen(true);
    };

    // ======= Modal đơn lẻ OK (add/update) =======
    const handleModalOk = async () => {
        try {
            const values = await form.validateFields();

            const payload: WorkSchedulePayload = {
                employeeId: values.employeeId,
                date: values.date.format("YYYY-MM-DD"),
                shiftTemplateId: values.shiftTemplateId,
                note: values.note,
            };

            if (editingRecord) {
                await updateSchedule(editingRecord.id, payload);
                notification.success({ message: "Cập nhật lịch làm việc thành công!" });
            } else {
                await addSchedule(payload);
                notification.success({ message: "Thêm lịch làm việc thành công!" });
            }

            const from = weekStart.format("YYYY-MM-DD");
            const to = weekEnd.format("YYYY-MM-DD");
            await fetchSchedules(1, BACKEND_PAGE_SIZE, {
                departmentId,
                employeeId,
                shiftTemplateId,
                from,
                to,
            });

            setModalOpen(false);
            setEditingRecord(null);
            setSelectedCell(null);
        } catch {
            notification.error({ message: "Lưu lịch làm việc thất bại!" });
        }
    };

    const handleDelete = async () => {
        if (!editingRecord) return;
        try {
            await deleteSchedule(editingRecord.id);
            notification.success({ message: "Xoá lịch làm việc thành công!" });

            const from = weekStart.format("YYYY-MM-DD");
            const to = weekEnd.format("YYYY-MM-DD");
            await fetchSchedules(1, BACKEND_PAGE_SIZE, {
                departmentId,
                employeeId,
                shiftTemplateId,
                from,
                to,
            });

            setModalOpen(false);
            setEditingRecord(null);
        } catch {
            notification.error({ message: "Xoá lịch làm việc thất bại!" });
        }
    };

    // ======= Dropdown “Thao tác hàng loạt” =======
    const bulkMenuItems: MenuProps["items"] = [
        {
            key: "bulkCreate",
            label: "Tạo lịch làm việc cho nhiều nhân viên",
        },
        {
            type: "divider",
        },
        {
            key: "bulkDelete",
            label: "Xoá lịch làm việc hàng loạt",
        },
    ];

    const handleBulkMenuClick: MenuProps["onClick"] = ({ key }) => {
        if (key === "bulkCreate") {
            // default range = tuần hiện tại
            bulkCreateForm.setFieldsValue({
                range: [weekStart, weekEnd],
                overwrite: true,
            } as any);
            setBulkCreateOpen(true);
        }
        if (key === "bulkDelete") {
            bulkDeleteForm.setFieldsValue({
                range: [weekStart, weekEnd],
            } as any);
            setBulkDeleteOpen(true);
        }
    };

    // ======= Bulk CREATE OK =======
    const handleBulkCreateOk = async () => {
        try {
            const values = await bulkCreateForm.validateFields();

            const range = values.range!;
            const payload: WorkScheduleBulkCreatePayload = {
                employeeIds:
                    values.employeeIds && values.employeeIds.length > 0
                        ? values.employeeIds
                        : undefined,
                departmentId: values.departmentId || undefined,
                fromDate: range[0].format("YYYY-MM-DD"),
                toDate: range[1].format("YYYY-MM-DD"),
                daysOfWeek:
                    values.daysOfWeek && values.daysOfWeek.length > 0
                        ? values.daysOfWeek
                        : undefined,
                shiftTemplateId: values.shiftTemplateId!,
                note: values.note,
                overwrite:
                    values.overwrite !== undefined ? values.overwrite : true,
            };

            await bulkCreateSchedules(payload);
            notification.success({
                message: "Tạo lịch làm việc hàng loạt thành công!",
            });

            const from = weekStart.format("YYYY-MM-DD");
            const to = weekEnd.format("YYYY-MM-DD");
            await fetchSchedules(1, BACKEND_PAGE_SIZE, {
                departmentId,
                employeeId,
                shiftTemplateId,
                from,
                to,
            });

            setBulkCreateOpen(false);
            bulkCreateForm.resetFields();
        } catch (err) {
            // validate lỗi thì Form đã báo, chỉ catch error API
            if (err instanceof Error) {
                notification.error({
                    message: "Tạo lịch hàng loạt thất bại!",
                    description: err.message,
                });
            } else {
                notification.error({ message: "Tạo lịch hàng loạt thất bại!" });
            }
        }
    };

    // ======= Bulk DELETE OK =======
    const handleBulkDeleteOk = async () => {
        try {
            const values = await bulkDeleteForm.validateFields();
            const range = values.range!;

            // Kiểm tra nếu bỏ trống cả phòng ban và nhân viên thì mình thông báo lên cho người ta thấy
            const noDepartment = !values.departmentId;
            const noEmployees =
                !values.employeeIds || values.employeeIds.length === 0;

            if (noDepartment && noEmployees) {
                notification.info({
                    message: "Không có gì để xoá",
                    description:
                        "Vui lòng chọn phòng ban hoặc nhân viên trước khi xoá.",
                });

                // đóng modal + reset form
                setBulkDeleteOpen(false);
                bulkDeleteForm.resetFields();
                return; // dừng luôn, không call API
            }

            const payload: WorkScheduleBulkDeletePayload = {
                employeeIds:
                    values.employeeIds && values.employeeIds.length > 0
                        ? values.employeeIds
                        : undefined,
                departmentId: values.departmentId || undefined,
                fromDate: range[0].format("YYYY-MM-DD"),
                toDate: range[1].format("YYYY-MM-DD"),
            };

            await bulkDeleteSchedules(payload);
            notification.success({
                message: "Xoá lịch làm việc hàng loạt thành công!",
            });

            const from = weekStart.format("YYYY-MM-DD");
            const to = weekEnd.format("YYYY-MM-DD");
            await fetchSchedules(1, BACKEND_PAGE_SIZE, {
                departmentId,
                employeeId,
                shiftTemplateId,
                from,
                to,
            });

            setBulkDeleteOpen(false);
            bulkDeleteForm.resetFields();
        } catch (err) {
            if (err instanceof Error) {
                notification.error({
                    message: "Xoá lịch hàng loạt thất bại!",
                    description: err.message,
                });
            } else {
                notification.error({ message: "Xoá lịch hàng loạt thất bại!" });
            }
        }
    };

    return (
        <div style={{ background: "#fff", padding: 16, borderRadius: 8 }}>
            {/* Toolbar filter */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <Space wrap>
                    <Button
                        icon={<IconWrapper Icon={ChevronLeft} />}
                        onClick={handlePrevWeek}
                    />
                    <DatePicker
                        value={currentDate}
                        onChange={handleDateChange}
                        format="DD/MM/YYYY"
                    />
                    <Button
                        icon={<IconWrapper Icon={ChevronRight} />}
                        onClick={handleNextWeek}
                    />
                </Space>

                <Space wrap>
                    <Select
                        allowClear
                        placeholder="Phòng ban"
                        style={{ minWidth: 220 }}
                        value={departmentId}
                        onChange={(v) => setDepartmentId(v)}
                        options={departments.map((d: any) => ({
                            label: d.name,
                            value: d.id,
                        }))}
                    />

                    <Select
                        allowClear
                        placeholder="Nhân viên"
                        style={{ minWidth: 200 }}
                        value={employeeId}
                        onChange={(v) => setEmployeeId(v)}
                        options={employeesFiltered.map((e: any) => ({
                            label: e.fullName || e.name,
                            value: e.id,
                        }))}
                        showSearch
                        optionFilterProp="label"
                    />

                    <Select
                        allowClear
                        placeholder="Ca làm"
                        style={{ minWidth: 160 }}
                        value={shiftTemplateId}
                        onChange={(v) => setShiftTemplateId(v)}
                        options={templates.map((t: ShiftTemplate) => ({
                            label: `${t.code} – ${t.name}`,
                            value: t.id,
                        }))}
                        showSearch
                        optionFilterProp="label"
                    />

                    {/* Dropdown thao tác bulk */}
                    <Dropdown
                        menu={{ items: bulkMenuItems, onClick: handleBulkMenuClick }}
                        placement="bottomRight"
                    >
                        <Button type="primary" size="large">Thao tác hàng loạt</Button>
                    </Dropdown>
                </Space>
            </div>

            {/* Grid calendar: cột = ngày trong tuần, hàng = nhân viên */}
            <div
                style={{
                    overflow: "auto",
                    border: "1px solid #f0f0f0",
                    borderRadius: 8,
                }}
            >
                {/* header row */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: `260px repeat(${dateList.length}, 1fr)`,
                        borderBottom: "1px solid #f0f0f0",
                        background: "#fafafa",
                        position: "sticky",
                        top: 0,
                        zIndex: 1,
                    }}
                >
                    <div
                        style={{
                            padding: "8px 12px",
                            borderRight: "1px solid #f0f0f0",
                            fontWeight: 600,
                        }}
                    >
                        Nhân viên / Ngày
                    </div>
                    {dateList.map((dateStr) => {
                        const d = dayjs(dateStr);
                        const isWeekend = d.day() === 0 || d.day() === 6;
                        return (
                            <div
                                key={dateStr}
                                style={{
                                    padding: "8px 4px",
                                    textAlign: "center",
                                    borderRight: "1px solid #f0f0f0",
                                    color: isWeekend ? "#cf1322" : undefined,
                                    fontSize: 12,
                                    minWidth: 90,
                                }}
                            >
                                <div style={{ fontWeight: 600 }}>{weekdayLabel[d.day()]}</div>
                                <div>{d.format("DD/MM")}</div>
                            </div>
                        );
                    })}
                </div>

                {/* body rows */}
                {pagedEmployees.map((emp: any) => (
                    <div
                        key={emp.id}
                        style={{
                            display: "grid",
                            gridTemplateColumns: `260px repeat(${dateList.length}, 1fr)`,
                            borderBottom: "1px solid #f0f0f0",
                        }}
                    >
                        {/* cột nhân viên */}
                        <div
                            style={{
                                padding: "8px 12px",
                                borderRight: "1px solid #f0f0f0",
                                background: "#fafafa",
                            }}
                        >
                            <div style={{ fontWeight: 600 }}>{emp.fullName || emp.name}</div>
                            <div style={{ fontSize: 11, color: "#999" }}>
                                ID: {emp.code || emp.shortCode || emp.id?.slice(0, 6)}
                            </div>
                        </div>

                        {/* các ngày */}
                        {dateList.map((dateStr) => {
                            const schedule = scheduleMap[`${emp.id}_${dateStr}`];
                            const shiftLabel = schedule
                                ? shiftCodeMap[schedule.shiftTemplateId] || schedule.shiftName
                                : "";

                            const isToday = dateStr === dayjs().format("YYYY-MM-DD");

                            return (
                                <div
                                    key={dateStr}
                                    style={{
                                        borderRight: "1px solid #f0f0f0",
                                        padding: 4,
                                        // height: 44,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        background: isToday ? "#fffbe6" : "white",
                                        cursor: "pointer",
                                    }}
                                    onClick={() => handleCellClick(emp.id, dateStr)}
                                >
                                    {schedule ? (
                                        <Tooltip
                                            title={
                                                <>
                                                    <div>{schedule.shiftName}</div>
                                                    <div>
                                                        {schedule.shiftStartTime} - {schedule.shiftEndTime}
                                                    </div>
                                                    {schedule.note && <div>Ghi chú: {schedule.note}</div>}
                                                </>
                                            }
                                        >
                                            <Tag color="blue" style={{ padding: "0 10px" }} className="!m-0">
                                                {shiftLabel}
                                            </Tag>
                                        </Tooltip>
                                    ) : (
                                        <div
                                            style={{
                                                width: "70%",
                                                height: 22,
                                                borderRadius: 6,
                                                background: "#fafafa",
                                            }}
                                        />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>

            {/* Pagination nhân viên */}
            <div
                style={{
                    marginTop: 12,
                    display: "flex",
                    justifyContent: "flex-end",
                }}
            >
                <Pagination
                    size="small"
                    current={employeePage}
                    pageSize={EMP_PAGE_SIZE}
                    total={employeesFiltered.length}
                    onChange={setEmployeePage}
                    showSizeChanger={false}
                    showTotal={(total) => `Tổng nhân viên: ${total}`}
                />
            </div>

            {/* Modal thêm/sửa lịch làm việc đơn lẻ */}
            <Modal
                open={isModalOpen}
                title={editingRecord ? "Cập nhật lịch làm việc" : "Thêm lịch làm việc"}
                onCancel={() => {
                    setModalOpen(false);
                    setEditingRecord(null);
                    setSelectedCell(null);
                }}
                onOk={handleModalOk}
                okText={editingRecord ? "Lưu" : "Thêm"}
                cancelText="Hủy"
                footer={(_, { OkBtn, CancelBtn }) => (
                    <div className="flex justify-between">
                        {editingRecord && (
                            <Popconfirm
                                title="Xoá lịch làm việc này?"
                                onConfirm={handleDelete}
                            >
                                <Button
                                    danger
                                    icon={<IconWrapper Icon={Trash} color="#ff4d4f" />}
                                >
                                    Xoá
                                </Button>
                            </Popconfirm>
                        )}

                        <div className="flex gap-2 ml-auto">
                            <CancelBtn />
                            <OkBtn />
                        </div>
                    </div>
                )}
            >
                <Form<WorkScheduleFormValues> layout="vertical" form={form}>
                    <Form.Item
                        label="Nhân viên"
                        name="employeeId"
                        rules={[{ required: true, message: "Chọn nhân viên" }]}
                    >
                        <Select
                            showSearch
                            optionFilterProp="label"
                            options={employees.map((e: any) => ({
                                label: e.fullName || e.name,
                                value: e.id,
                            }))}
                        />
                    </Form.Item>

                    <Form.Item
                        label="Ngày làm việc"
                        name="date"
                        rules={[{ required: true, message: "Chọn ngày" }]}
                    >
                        <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
                    </Form.Item>

                    <Form.Item
                        label="Ca làm"
                        name="shiftTemplateId"
                        rules={[{ required: true, message: "Chọn ca làm" }]}
                    >
                        <Select
                            showSearch
                            optionFilterProp="label"
                            options={templates.map((t: ShiftTemplate) => ({
                                label: `${t.code} – ${t.name}`,
                                value: t.id,
                            }))}
                        />
                    </Form.Item>

                    <Form.Item label="Ghi chú" name="note">
                        <Input.TextArea rows={3} />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Modal BULK CREATE */}
            <Modal
                open={bulkCreateOpen}
                title="Tạo lịch làm việc cho nhiều nhân viên"
                onCancel={() => {
                    setBulkCreateOpen(false);
                    bulkCreateForm.resetFields();
                }}
                onOk={handleBulkCreateOk}
                okText="Tạo lịch"
                cancelText="Hủy"
            >
                <Form<BulkCreateFormValues> layout="vertical" form={bulkCreateForm}>
                    <Form.Item label="Phòng ban" name="departmentId">
                        <Select
                            allowClear
                            placeholder="Chọn phòng ban (tuỳ chọn)"
                            options={departments.map((d: any) => ({
                                label: d.name,
                                value: d.id,
                            }))}
                        />
                    </Form.Item>

                    <Form.Item label="Nhân viên" name="employeeIds">
                        <Select
                            mode="multiple"
                            allowClear
                            placeholder="Chọn một hoặc nhiều nhân viên (tuỳ chọn)"
                            showSearch
                            optionFilterProp="label"
                            options={employees.map((e: any) => ({
                                label: e.fullName || e.name,
                                value: e.id,
                            }))}
                        />
                    </Form.Item>

                    <Form.Item
                        label="Khoảng ngày áp dụng"
                        name="range"
                        rules={[{ required: true, message: "Chọn khoảng ngày" }]}
                    >
                        <RangePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
                    </Form.Item>

                    <Form.Item label="Ngày trong tuần" name="daysOfWeek">
                        <Checkbox.Group
                            options={[
                                { label: "CN", value: 0 },
                                { label: "Th 2", value: 1 },
                                { label: "Th 3", value: 2 },
                                { label: "Th 4", value: 3 },
                                { label: "Th 5", value: 4 },
                                { label: "Th 6", value: 5 },
                                { label: "Th 7", value: 6 },
                            ]}
                        />
                    </Form.Item>

                    <Form.Item
                        label="Ca làm"
                        name="shiftTemplateId"
                        rules={[{ required: true, message: "Chọn ca làm" }]}
                    >
                        <Select
                            showSearch
                            optionFilterProp="label"
                            placeholder="Chọn ca làm"
                            options={templates.map((t: ShiftTemplate) => ({
                                label: `${t.code} – ${t.name}`,
                                value: t.id,
                            }))}
                        />
                    </Form.Item>

                    <Form.Item label="Ghi chú" name="note">
                        <Input.TextArea rows={3} />
                    </Form.Item>

                    <Form.Item
                        name="overwrite"
                        valuePropName="checked"
                        initialValue={true}
                    >
                        <Checkbox>Ghi đè lịch cũ nếu trùng</Checkbox>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Modal BULK DELETE */}
            <Modal
                open={bulkDeleteOpen}
                title="Xoá lịch làm việc hàng loạt"
                onCancel={() => {
                    setBulkDeleteOpen(false);
                    bulkDeleteForm.resetFields();
                }}
                onOk={handleBulkDeleteOk}
                okText="Xoá lịch"
                cancelText="Hủy"
            >
                <Form<BulkDeleteFormValues> layout="vertical" form={bulkDeleteForm}>
                    <Form.Item label="Phòng ban" name="departmentId">
                        <Select
                            allowClear
                            placeholder="Chọn phòng ban (tuỳ chọn)"
                            options={departments.map((d: any) => ({
                                label: d.name,
                                value: d.id,
                            }))}
                        />
                    </Form.Item>

                    <Form.Item label="Nhân viên" name="employeeIds">
                        <Select
                            mode="multiple"
                            allowClear
                            placeholder="Chọn một hoặc nhiều nhân viên (tuỳ chọn)"
                            showSearch
                            optionFilterProp="label"
                            options={employees.map((e: any) => ({
                                label: e.fullName || e.name,
                                value: e.id,
                            }))}
                        />
                    </Form.Item>

                    <Form.Item
                        label="Khoảng ngày cần xoá"
                        name="range"
                        rules={[{ required: true, message: "Chọn khoảng ngày" }]}
                    >
                        <RangePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};
