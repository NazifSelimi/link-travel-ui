import { useEffect, useState, useCallback } from 'react';
import { Button, Card, Input, message, Modal, Popconfirm, Space, Table, Tag, Typography } from 'antd';
import { DeleteOutlined, EyeOutlined, MailOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { deleteContact, fetchAdminContacts, markContactAsRead } from '@/store/slices/adminSlice';
import type { ContactMessage } from '@/types';

const { Paragraph, Text } = Typography;

export default function AdminContactsPage() {
  const dispatch = useAppDispatch();
  const { contacts, loading } = useAppSelector((state) => state.admin);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<ContactMessage | null>(null);

  const load = useCallback(() => {
    dispatch(fetchAdminContacts({ search: search || undefined, page, per_page: 15 }));
  }, [dispatch, search, page]);

  useEffect(() => { load(); }, [load]);

  const openContact = async (contact: ContactMessage) => {
    setSelected(contact);

    if (!contact.read) {
      try {
        await dispatch(markContactAsRead(contact.id)).unwrap();
      } catch {
        message.error('Failed to mark contact as read');
      }
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await dispatch(deleteContact(id)).unwrap();
      message.success('Contact deleted');
    } catch {
      message.error('Failed to delete contact');
    }
  };

  const columns: ColumnsType<ContactMessage> = [
    {
      title: 'Contact',
      key: 'contact',
      render: (_, contact) => (
        <div>
          <div style={{ fontWeight: 600 }}>{contact.name}</div>
          <div style={{ fontSize: 12, color: '#888' }}>{contact.email}</div>
          {contact.phone ? <div style={{ fontSize: 12, color: '#888' }}>{contact.phone}</div> : null}
        </div>
      ),
    },
    {
      title: 'Subject',
      dataIndex: 'subject',
      key: 'subject',
      render: (value?: string | null) => value || 'General inquiry',
      responsive: ['md'],
    },
    {
      title: 'Status',
      dataIndex: 'read',
      key: 'read',
      render: (read: boolean) => (
        <Tag color={read ? 'default' : 'blue'}>
          {read ? 'Read' : 'Unread'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_, contact) => (
        <Space>
          <Button type="text" icon={<EyeOutlined />} onClick={() => openContact(contact)} />
          <Popconfirm title="Delete this contact message?" onConfirm={() => handleDelete(contact.id)}>
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Card
        title="Contacts"
        extra={(
          <Input
            placeholder="Search contacts..."
            prefix={<SearchOutlined />}
            value={search}
            onChange={(event) => { setSearch(event.target.value); setPage(1); }}
            allowClear
            style={{ width: 240 }}
          />
        )}
      >
        <Table
          rowKey="id"
          dataSource={contacts.data}
          columns={columns}
          loading={loading.contacts}
          pagination={{
            current: contacts.page,
            pageSize: contacts.pageSize,
            total: contacts.total,
            onChange: (nextPage) => setPage(nextPage),
            showSizeChanger: false,
          }}
          scroll={{ x: 640 }}
        />
      </Card>

      <Modal
        open={Boolean(selected)}
        title={selected?.subject || 'Contact Message'}
        onCancel={() => setSelected(null)}
        footer={null}
        width={680}
      >
        {selected ? (
          <Space direction="vertical" style={{ width: '100%' }} size={12}>
            <Text strong>{selected.name}</Text>
            <Text type="secondary">{selected.email}</Text>
            {selected.phone ? <Text type="secondary">{selected.phone}</Text> : null}
            <Button icon={<MailOutlined />} href={`mailto:${selected.email}`} style={{ width: 'fit-content' }}>
              Reply by email
            </Button>
            <Paragraph style={{ whiteSpace: 'pre-wrap', marginBottom: 0 }}>
              {selected.message}
            </Paragraph>
          </Space>
        ) : null}
      </Modal>
    </>
  );
}
