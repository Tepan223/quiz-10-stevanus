"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  message,
  Card,
  Space,
  Select,
  Typography,
  Popconfirm,
  Tag,
  Row,
  Col,
  Spin,
} from "antd";
import {
  PlusOutlined,
  ReloadOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import axios from "axios";

const { Title, Text } = Typography;

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [rawStudents, setRawStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentStudent, setCurrentStudent] = useState(null);
  const [form] = Form.useForm();

  const [searchTerm, setSearchTerm] = useState("");
  const [classFilter, setClassFilter] = useState(null);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 8,
  });

  const API_URL = "/api/students";

  const fetchStudents = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);

      const res = await axios.get(API_URL);
      const data = res.data?.data ?? res.data ?? [];
      const arr = Array.isArray(data) ? data : data?.body?.data ?? [];
      const filteredArr = arr.filter((s) => s.status !== "deleted");

      setRawStudents(filteredArr);
      setStudents(filteredArr);
    } catch (error) {
      console.error(error);
      message.error("Failed to fetch students");
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    const term = String(searchTerm).trim().toLowerCase();
    let filtered = rawStudents;

    if (term) {
      filtered = filtered.filter(
        (s) =>
          String(s.name).toLowerCase().includes(term) ||
          String(s.major).toLowerCase().includes(term)
      );
    }

    if (classFilter) {
      filtered = filtered.filter((s) => s.class_name === classFilter);
    }

    setPagination((p) => ({ ...p, current: 1 }));
    setStudents(filtered);
  }, [searchTerm, classFilter, rawStudents]);

  const handleSubmit = async (values) => {
    try {
      setLoading(true);

      if (isEditing && currentStudent) {
        await axios.put(`${API_URL}?id=${currentStudent.id}`, values);
        message.success("Student updated successfully!");

        setRawStudents((prev) =>
          prev.map((s) =>
            s.id === currentStudent.id ? { ...s, ...values } : s
          )
        );
      } else {
        await axios.post(API_URL, values);
        message.success("Student added successfully!");
      }

      setIsModalOpen(false);
      form.resetFields();
      setIsEditing(false);
      setCurrentStudent(null);

      await fetchStudents(false);
    } catch (error) {
      console.error(error);
      message.error("Failed to save student");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);

      await axios.delete(`${API_URL}?id=${id}`);

      message.success("Student deleted successfully!");

      setRawStudents((prev) => prev.filter((s) => s.id !== id));
      setStudents((prev) => prev.filter((s) => s.id !== id));
    } catch (error) {
      console.error(error);
      message.error("Failed to delete student");
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (student) => {
    setIsEditing(true);
    setCurrentStudent(student);

    form.setFieldsValue({
      name: student.name,
      nis: student.nis,
      class_name: student.class_name,
      major: student.major,
    });

    setIsModalOpen(true);
  };

  const columns = useMemo(
    () => [
      {
        title: "No",
        key: "index",
        align: "center",
        width: 70,
        render: (_, __, index) =>
          (pagination.current - 1) * pagination.pageSize + index + 1,
      },
      {
        title: "Name",
        dataIndex: "name",
        key: "name",
        width: 240,
        sorter: (a, b) => a.name.localeCompare(b.name),
      },
      {
        title: "NIS",
        dataIndex: "nis",
        key: "nis",
        align: "center",
        width: 120,
      },
      {
        title: "Class",
        dataIndex: "class_name",
        key: "class_name",
        align: "center",
        width: 140,
        render: (cls) => <Tag color="blue">{cls}</Tag>,
      },
      {
        title: "Major",
        dataIndex: "major",
        key: "major",
      },
      {
        title: "Actions",
        key: "actions",
        align: "center",
        width: 160,
        render: (_, record) => (
          <Space>
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => openEditModal(record)}
            >
              Edit
            </Button>
            <Popconfirm
              title="Delete student?"
              okText="Yes"
              cancelText="No"
              onConfirm={() => handleDelete(record.id)}
            >
              <Button size="small" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Space>
        ),
      },
    ],
    [pagination]
  );

  const classOptions = [
    "X RPL 1",
    "X RPL 2",
    "XI RPL 1",
    "XI RPL 2",
    "XII RPL 1",
    "XII RPL 2",
  ];

  return (
    <div
      style={{
        padding: 24,
        background: "#f0f2f5",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Card
        title={<Title level={3}>Student Management</Title>}
        extra={
          <Space>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => fetchStudents()}
              loading={loading}
            >
              Refresh
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setIsEditing(false);
                setCurrentStudent(null);
                form.resetFields();
                setIsModalOpen(true);
              }}
            >
              Add Student
            </Button>
          </Space>
        }
        style={{
          borderRadius: 16,
          width: "100%",
          maxWidth: 1100,
          background: "#fff",
        }}
      >
        <Row gutter={[12, 12]} style={{ marginBottom: 12 }}>
          <Col xs={24} sm={12} md={10}>
            <Input
              placeholder="Search by name or major..."
              prefix={<SearchOutlined />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={12} sm={6} md={6}>
            <Select
              placeholder="Filter by class"
              allowClear
              style={{ width: "100%" }}
              value={classFilter}
              onChange={(v) => setClassFilter(v)}
              options={classOptions.map((c) => ({ label: c, value: c }))}
            />
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Button
              onClick={() => {
                setSearchTerm("");
                setClassFilter(null);
                fetchStudents();
              }}
            >
              Reset
            </Button>
          </Col>
          <Col xs={24} sm={24} md={4} style={{ textAlign: "right" }}>
            <Text>
              Total: <b>{students.length}</b>
            </Text>
          </Col>
        </Row>

        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={students}
            rowKey="id"
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: students.length,
              showSizeChanger: false,
              onChange: (page, pageSize) =>
                setPagination({ current: page, pageSize }),
            }}
          />
        </Spin>
      </Card>

      <Modal
        title={isEditing ? "Edit Student" : "Add Student"}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
          setIsEditing(false);
        }}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="name" label="Full Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item name="nis" label="NIS" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item
            name="class_name"
            label="Class"
            rules={[{ required: true }]}
          >
            <Select options={classOptions.map((c) => ({ label: c, value: c }))} />
          </Form.Item>

          <Form.Item name="major" label="Major" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Button type="primary" htmlType="submit" block loading={loading}>
            {isEditing ? "Update" : "Add"}
          </Button>
        </Form>
      </Modal>
    </div>
  );
}
