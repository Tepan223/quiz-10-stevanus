'use client';
import { useEffect, useState } from "react";
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
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentStudent, setCurrentStudent] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState("");

  const API_URL = "/api/students";

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_URL);
      const data = res.data?.body?.data || [];
      setStudents(data);
      setFilteredStudents(data);
    } catch (error) {
      console.error(error);
      message.error("Failed to fetch students");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Search/filter handler
  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchText(value);
    const filtered = students.filter(
      (s) =>
        s.name.toLowerCase().includes(value) ||
        s.major.toLowerCase().includes(value)
    );
    setFilteredStudents(filtered);
  };

  const handleSubmit = async (values) => {
    try {
      if (isEditing && currentStudent) {
        await axios.put(`${API_URL}?id=${currentStudent.id}`, values);
        message.success("Student updated successfully!");
      } else {
        await axios.post(API_URL, values);
        message.success("Student added successfully!");
      }

      setIsModalOpen(false);
      form.resetFields();
      setIsEditing(false);
      setCurrentStudent(null);
      fetchStudents();
    } catch (error) {
      console.error(error);
      message.error("Failed to save student");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}?id=${id}`);
      message.success("Student deleted successfully!");
      fetchStudents();
    } catch (error) {
      console.error(error);
      message.error("Failed to delete student");
    }
  };

  const openEditModal = (student) => {
    setIsEditing(true);
    setCurrentStudent(student);
    form.setFieldsValue(student);
    setIsModalOpen(true);
  };

  const columns = [
    {
      title: "No",
      key: "index",
      render: (_, __, index) => <Text strong>{index + 1}</Text>,
      align: "center",
      width: 70,
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text) => <Text strong>{text}</Text>,
      sorter: (a, b) => a.name.localeCompare(b.name),
      width: 200,
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
      width: 120,
      render: (cls) => <Tag color="blue">{cls}</Tag>,
      sorter: (a, b) => a.class_name.localeCompare(b.class_name),
    },
    {
      title: "Major",
      dataIndex: "major",
      key: "major",
      render: (major) => <Text type="secondary">{major}</Text>,
      ellipsis: true,
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
            type="default"
            icon={<EditOutlined />}
            onClick={() => openEditModal(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure to delete this student?"
            okText="Yes"
            cancelText="No"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
              style={{ borderColor: "#ff4d4f" }}
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

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
        padding: 32,
        background: "#f0f2f5",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Card
        title={<Title level={3} style={{ margin: 0 }}>📋 Student Management</Title>}
        extra={
          <Space>
            <Input
              placeholder="Search by name or major"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={handleSearch}
              allowClear
            />
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchStudents}
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
          boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
          width: "100%",
          maxWidth: 1000,
          background: "#fff",
        }}
      >
        <Table
          columns={columns}
          dataSource={filteredStudents}
          rowKey="id"
          loading={loading}
          bordered={false}
          pagination={{
            pageSize: 8,
            showSizeChanger: false,
          }}
          style={{
            background: "#fff",
            borderRadius: 12,
          }}
          rowClassName={() => "custom-row"}
        />
      </Card>

      {/* Modal Form */}
      <Modal
        title={isEditing ? "✏️ Edit Student" : "➕ Add New Student"}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setIsEditing(false);
          setCurrentStudent(null);
        }}
        destroyOnClose
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          style={{ marginTop: 10 }}
        >
          <Form.Item
            name="name"
            label="Full Name"
            rules={[{ required: true, message: "Please input name" }]}
          >
            <Input placeholder="Enter student name" />
          </Form.Item>

          <Form.Item
            name="nis"
            label="NIS"
            rules={[{ required: true, message: "Please input NIS" }]}
          >
            <Input placeholder="Enter student NIS" />
          </Form.Item>

          <Form.Item
            name="class_name"
            label="Class"
            rules={[{ required: true, message: "Please select class" }]}
          >
            <Select
              placeholder="Select class"
              options={classOptions.map((cls) => ({ label: cls, value: cls }))}
            />
          </Form.Item>

          <Form.Item
            name="major"
            label="Major"
            rules={[{ required: true, message: "Please input major" }]}
          >
            <Input placeholder="Enter major (e.g. Rekayasa Perangkat Lunak)" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block size="large">
              {isEditing ? "Update Student" : "Add Student"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <style jsx global>{`
        .ant-table-thead > tr > th {
          background: #fafafa !important;
          font-weight: 600;
          text-align: center;
        }
        .ant-table-tbody > tr:hover > td {
          background: #f9f9ff !important;
        }
        .custom-row td {
          padding: 12px 16px !important;
        }
      `}</style>
    </div>
  );
}
