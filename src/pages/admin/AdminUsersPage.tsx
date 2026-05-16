import { useEffect, useState, useCallback } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Input,
  Select,
  Tag,
  Modal,
  Form,
  Popconfirm,
  Descriptions,
  Avatar,
  message,
} from 'antd';
import { SearchOutlined, EyeOutlined, EditOutlined, DeleteOutlined, UserOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchAdminUsers, updateUser, deleteUser } from '@/store/slices/adminSlice';
import type { User } from '@/types';

const roleColors: Record<string, string> = {
  admin: 'red',
  user: 'blue',
};

export default function AdminUsersPage() {
  const dispatch = useAppDispatch();
  const { users, loading } = useAppSelector((s) => s.admin);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string | undefined>();
  const [page, setPage] = useState(1);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selected, setSelected] = useState<User | null>(null);
  const [form] = Form.useForm();

  const load = useCallback(() => {
    dispatch(
      fetchAdminUsers({
        search: search || undefined,
        role: roleFilter,
        page,
        per_page: 20,
      }),
    );
  }, [dispatch, search, roleFilter, page]);

  useEffect(() => { load(); }, [load]);

  const handleSearch = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  const viewDetails = (record: User) => {
    setSelected(record);
    setDetailOpen(true);
  };

  const openEdit = (record: User) => {
    setSelected(record);
    form.setFieldsValue({
      firstName: record.firstName,
      lastName: record.lastName,
      email: record.email,
      phone: record.phone,
      role: record.role,
    });
    setEditOpen(true);
  };

  const handleEdit = async () => {
    if (!selected) return;
    try {
      const values = await form.validateFields();
      await dispatch(updateUser({ id: selected.id, data: values })).unwrap();
      message.success('User updated');
      setEditOpen(false);
      load();
    } catch {
      message.error('Failed to update user');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await dispatch(deleteUser(id)).unwrap();
      message.success('User deleted');
    } catch {
      message.error('Failed to delete user');
    }
  };

  const columns: ColumnsType<User> = [
    {
      title: 'User',
      key: 'user',
      render: (_, r) => (
        <Space>
          <Avatar size={36} icon={<UserOutlined />} src={r.avatar} style={{ background: '#1677ff' }}>
            {r.firstName?.charAt(0).toUpperCase()}
          </Avatar>
          <div>
            <div style={{ fontWeight: 500 }}>{r.firstName} {r.lastName}</div>
            <div style={{ fontSize: 12, color: '#888' }}>{r.email}</div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
      render: (v: string) => v || '—',
      responsive: ['md'],
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => (
        <Tag color={roleColors[role] || 'default'}>{(role || 'user').toUpperCase()}</Tag>
      ),
    },
    {
      title: 'Joined',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (v: string) => v ? new Date(v).toLocaleDateString() : '—',
      responsive: ['lg'],
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 140,
      render: (_, record) => (
        <Space>
          <Button type="text" icon={<EyeOutlined />} onClick={() => viewDetails(record)} />
          <Button type="text" icon={<EditOutlined />} onClick={() => openEdit(record)} />
          <Popconfirm title="Delete this user?" onConfirm={() => handleDelete(record.id)}>
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card
        title="Users"
        extra={
          <Space wrap>
            <Input
              placeholder="Search users..."
              prefix={<SearchOutlined />}
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              allowClear
              style={{ width: 220 }}
            />
            <Select
              placeholder="All Roles"
              allowClear
              value={roleFilter}
              onChange={(v) => { setRoleFilter(v); setPage(1); }}
              options={[
                { value: '0', label: 'User' },
                { value: '1', label: 'Admin' },
              ]}
              style={{ width: 130 }}
            />
          </Space>
        }
      >
        <Table
          dataSource={users.data}
          columns={columns}
          rowKey="id"
          loading={loading.users}
          pagination={{
            current: users.page,
            pageSize: users.pageSize,
            total: users.total,
            onChange: (p) => setPage(p),
            showSizeChanger: false,
          }}
          scroll={{ x: 600 }}
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title="User Details"
        open={detailOpen}
        onCancel={() => setDetailOpen(false)}
        footer={null}
        width={500}
      >
        {selected && (
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="ID">{selected.id}</Descriptions.Item>
            <Descriptions.Item label="Name">{selected.firstName} {selected.lastName}</Descriptions.Item>
            <Descriptions.Item label="Email">{selected.email}</Descriptions.Item>
            <Descriptions.Item label="Phone">{selected.phone || '—'}</Descriptions.Item>
            <Descriptions.Item label="Role">
              <Tag color={roleColors[selected.role || 'user']}>{(selected.role || 'user').toUpperCase()}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Joined">{new Date(selected.createdAt).toLocaleString()}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal
        title="Edit User"
        open={editOpen}
        onCancel={() => setEditOpen(false)}
        onOk={handleEdit}
        okText="Update"
        width={480}
      >
        <Form form={form} layout="vertical">
          <Space style={{ width: '100%' }} size={16}>
            <Form.Item name="firstName" label="First Name" rules={[{ required: true }]} style={{ flex: 1 }}>
              <Input />
            </Form.Item>
            <Form.Item name="lastName" label="Last Name" rules={[{ required: true }]} style={{ flex: 1 }}>
              <Input />
            </Form.Item>
          </Space>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="Phone">
            <Input />
          </Form.Item>
          <Form.Item name="role" label="Role" rules={[{ required: true }]}>
            <Select
              options={[
                { value: 'user', label: 'User' },
                { value: 'admin', label: 'Admin' },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
