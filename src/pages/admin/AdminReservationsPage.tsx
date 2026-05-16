import { useEffect, useState, useCallback } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Input,
  Select,
  Tag,
  Popconfirm,
  Modal,
  Descriptions,
  message,
} from 'antd';
import { SearchOutlined, EyeOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchAdminReservations,
  updateReservationStatus,
  deleteReservation,
} from '@/store/slices/adminSlice';
import type { AdminReservation } from '@/types';

const statusMap: Record<string, { label: string; color: string; value: number }> = {
  pending: { label: 'In Progress', color: 'orange', value: 0 },
  confirmed: { label: 'Confirmed', color: 'blue', value: 1 },
  cancelled: { label: 'Cancelled', color: 'red', value: 2 },
  completed: { label: 'Completed', color: 'green', value: 3 },
};

const statusOptions = Object.entries(statusMap).map(([key, v]) => ({
  value: v.value,
  label: v.label,
}));

export default function AdminReservationsPage() {
  const dispatch = useAppDispatch();
  const { reservations, loading } = useAppSelector((s) => s.admin);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [page, setPage] = useState(1);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState<AdminReservation | null>(null);

  const load = useCallback(() => {
    dispatch(
      fetchAdminReservations({
        search: search || undefined,
        status: statusFilter,
        page,
        per_page: 15,
      }),
    );
  }, [dispatch, search, statusFilter, page]);

  useEffect(() => { load(); }, [load]);

  const handleSearch = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  const handleStatusChange = async (id: string, statusValue: number) => {
    try {
      await dispatch(updateReservationStatus({ id, status: statusValue })).unwrap();
      message.success('Status updated');
      load();
    } catch {
      message.error('Failed to update status');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await dispatch(deleteReservation(id)).unwrap();
      message.success('Reservation deleted');
    } catch {
      message.error('Failed to delete reservation');
    }
  };

  const viewDetails = (record: AdminReservation) => {
    setSelected(record);
    setDetailOpen(true);
  };

  const columns: ColumnsType<AdminReservation> = [
    {
      title: 'Guest',
      key: 'guest',
      render: (_, r) => (
        <div>
          <div style={{ fontWeight: 500 }}>{r.fullName}</div>
          <div style={{ fontSize: 12, color: '#888' }}>{r.email}</div>
          {r.phone && <div style={{ fontSize: 12, color: '#888' }}>{r.phone}</div>}
        </div>
      ),
    },
    {
      title: 'Booking',
      key: 'booking',
      render: (_, r) => r.package?.name ?? r.hotel?.name ?? `#${r.packageId || r.hotelId}`,
      responsive: ['md'],
    },
    {
      title: 'Dates',
      key: 'dates',
      render: (_, r) => (
        <div style={{ fontSize: 13 }}>
          <div>{new Date(r.checkIn).toLocaleDateString()}</div>
          <div style={{ color: '#888' }}>to {new Date(r.checkOut).toLocaleDateString()}</div>
        </div>
      ),
      responsive: ['lg'],
    },
    {
      title: 'Guests',
      dataIndex: 'guests',
      key: 'guests',
      responsive: ['lg'],
    },
    {
      title: 'Total',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      render: (v: number) => <span style={{ fontWeight: 500 }}>${v?.toLocaleString()}</span>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string, record) => (
        <Select
          value={statusMap[status]?.value ?? 0}
          options={statusOptions}
          onChange={(val) => handleStatusChange(record.id, val)}
          size="small"
          style={{ width: 120 }}
        />
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <Space>
          <Button type="text" icon={<EyeOutlined />} onClick={() => viewDetails(record)} />
          <Popconfirm title="Delete this reservation?" onConfirm={() => handleDelete(record.id)}>
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card
        title="Reservations"
        extra={
          <Space wrap>
            <Input
              placeholder="Search by guest name..."
              prefix={<SearchOutlined />}
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              allowClear
              style={{ width: 220 }}
            />
            <Select
              placeholder="All Statuses"
              allowClear
              value={statusFilter}
              onChange={(v) => { setStatusFilter(v); setPage(1); }}
              options={[
                { value: '0', label: 'In Progress' },
                { value: '1', label: 'Confirmed' },
                { value: '2', label: 'Cancelled' },
                { value: '3', label: 'Completed' },
              ]}
              style={{ width: 140 }}
            />
          </Space>
        }
      >
        <Table
          dataSource={reservations.data}
          columns={columns}
          rowKey="id"
          loading={loading.reservations}
          pagination={{
            current: reservations.page,
            pageSize: reservations.pageSize,
            total: reservations.total,
            onChange: (p) => setPage(p),
            showSizeChanger: false,
          }}
          scroll={{ x: 700 }}
        />
      </Card>

      <Modal
        title="Reservation Details"
        open={detailOpen}
        onCancel={() => setDetailOpen(false)}
        footer={null}
        width={600}
      >
        {selected && (
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="ID">{selected.id}</Descriptions.Item>
            <Descriptions.Item label="Guest">{selected.fullName}</Descriptions.Item>
            <Descriptions.Item label="Email">{selected.email}</Descriptions.Item>
            <Descriptions.Item label="Phone">{selected.phone || '—'}</Descriptions.Item>
            <Descriptions.Item label="Booking">{selected.package?.name ?? selected.hotel?.name ?? `#${selected.packageId || selected.hotelId}`}</Descriptions.Item>
            <Descriptions.Item label="Type">{selected.package ? 'Package' : 'Hotel room'}</Descriptions.Item>
            {selected.roomType ? <Descriptions.Item label="Room Type">{selected.roomType.name}</Descriptions.Item> : null}
            <Descriptions.Item label="Check-in">{new Date(selected.checkIn).toLocaleDateString()}</Descriptions.Item>
            <Descriptions.Item label="Check-out">{new Date(selected.checkOut).toLocaleDateString()}</Descriptions.Item>
            <Descriptions.Item label="Guests">{selected.guests}</Descriptions.Item>
            <Descriptions.Item label="Total Price">${selected.totalPrice?.toLocaleString()}</Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color={statusMap[selected.status]?.color || 'default'}>
                {(selected.status || 'pending').toUpperCase()}
              </Tag>
            </Descriptions.Item>
            {selected.notes && <Descriptions.Item label="Notes">{selected.notes}</Descriptions.Item>}
            <Descriptions.Item label="Booked">{new Date(selected.createdAt).toLocaleString()}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
}
