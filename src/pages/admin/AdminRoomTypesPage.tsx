import { useCallback, useEffect, useState } from 'react';
import { Button, Card, Form, Input, InputNumber, message, Modal, Popconfirm, Select, Space, Switch, Table, Tag } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { ImageGalleryField } from '@/components/admin/ImageGalleryField';
import { normalizeTagValues, roomAmenityOptions } from '@/lib/adminFieldOptions';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  createRoomType,
  deleteRoomType,
  fetchAdminHotels,
  fetchAdminRoomTypes,
  updateRoomType,
} from '@/store/slices/adminSlice';
import type { RoomType } from '@/types';

const { TextArea } = Input;

export default function AdminRoomTypesPage() {
  const dispatch = useAppDispatch();
  const { roomTypes, hotels, loading } = useAppSelector((state) => state.admin);
  const [form] = Form.useForm();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<RoomType | null>(null);
  const galleryImages = Form.useWatch('images', form) ?? [];

  const load = useCallback(() => {
    dispatch(fetchAdminRoomTypes({ search: search || undefined, page, per_page: 15 }));
  }, [dispatch, search, page]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (hotels.data.length === 0) {
      dispatch(fetchAdminHotels({ per_page: 200 }));
    }
  }, [dispatch, hotels.data.length]);

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ available: true, images: [] });
    setOpen(true);
  };

  const openEdit = (roomType: RoomType) => {
    setEditing(roomType);
    form.setFieldsValue({
      hotelId: roomType.hotelId,
      name: roomType.name,
      description: roomType.description,
      maxGuests: roomType.maxGuests,
      bedType: roomType.bedType,
      size: roomType.size,
      pricePerNight: roomType.pricePerNight,
      amenities: roomType.amenities ?? [],
      images: roomType.images ?? [],
      available: roomType.available,
    });
    setOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        ...values,
        amenities: normalizeTagValues(values.amenities),
      };

      if (editing) {
        await dispatch(updateRoomType({ id: editing.id, data: payload })).unwrap();
        message.success('Room type updated');
      } else {
        await dispatch(createRoomType(payload)).unwrap();
        message.success('Room type created');
      }

      setOpen(false);
      load();
    } catch {
      message.error('Failed to save room type');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await dispatch(deleteRoomType(id)).unwrap();
      message.success('Room type deleted');
    } catch {
      message.error('Failed to delete room type');
    }
  };

  const columns: ColumnsType<RoomType> = [
    {
      title: 'Room Type',
      key: 'roomType',
      render: (_, roomType) => (
        <Space>
          {roomType.images?.[0] ? (
            <img
              src={roomType.images[0]}
              alt={roomType.name}
              style={{ width: 56, height: 42, objectFit: 'cover', borderRadius: 6 }}
            />
          ) : null}
          <div>
            <div style={{ fontWeight: 600 }}>{roomType.name}</div>
            <div style={{ fontSize: 12, color: '#888' }}>{roomType.hotelName || `Hotel #${roomType.hotelId}`}</div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Guests',
      dataIndex: 'maxGuests',
      key: 'maxGuests',
      responsive: ['md'],
    },
    {
      title: 'Price / Night',
      dataIndex: 'pricePerNight',
      key: 'pricePerNight',
      render: (value: number) => `€${value?.toLocaleString()}`,
    },
    {
      title: 'Availability',
      dataIndex: 'available',
      key: 'available',
      render: (available: boolean) => (
        <Tag color={available ? 'green' : 'default'}>
          {available ? 'Available' : 'Unavailable'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_, roomType) => (
        <Space>
          <Button type="text" icon={<EditOutlined />} onClick={() => openEdit(roomType)} />
          <Popconfirm title="Delete this room type?" onConfirm={() => handleDelete(roomType.id)}>
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Card
        title="Room Types"
        extra={(
          <Space>
            <Input
              placeholder="Search room types..."
              prefix={<SearchOutlined />}
              value={search}
              onChange={(event) => { setSearch(event.target.value); setPage(1); }}
              allowClear
              style={{ width: 240 }}
            />
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              Add Room Type
            </Button>
          </Space>
        )}
      >
        <Table
          rowKey="id"
          dataSource={roomTypes.data}
          columns={columns}
          loading={loading.roomTypes}
          pagination={{
            current: roomTypes.page,
            pageSize: roomTypes.pageSize,
            total: roomTypes.total,
            onChange: (nextPage) => setPage(nextPage),
            showSizeChanger: false,
          }}
          scroll={{ x: 720 }}
        />
      </Card>

      <Modal
        title={editing ? 'Edit Room Type' : 'Create Room Type'}
        open={open}
        onCancel={() => setOpen(false)}
        onOk={handleSubmit}
        width={720}
        okText={editing ? 'Update' : 'Create'}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="hotelId" label="Hotel" rules={[{ required: true }]}>
            <Select
              showSearch
              optionFilterProp="label"
              options={hotels.data.map((hotel) => ({
                value: hotel.id,
                label: hotel.destination?.name ? `${hotel.name} (${hotel.destination.name})` : hotel.name,
              }))}
            />
          </Form.Item>
          <Form.Item name="name" label="Room Type Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <TextArea rows={3} />
          </Form.Item>
          <Space style={{ width: '100%' }} size={16}>
            <Form.Item name="maxGuests" label="Max Guests" style={{ flex: 1 }}>
              <InputNumber min={1} max={20} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="bedType" label="Bed Type" style={{ flex: 1 }}>
              <Input placeholder="Double bed, Twin beds..." />
            </Form.Item>
            <Form.Item name="size" label="Size" style={{ flex: 1 }}>
              <Input placeholder="28 m²" />
            </Form.Item>
          </Space>
          <Form.Item name="pricePerNight" label="Price per Night" rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: '100%' }} prefix="€" />
          </Form.Item>
          <Form.Item name="amenities" label="Amenities">
            <Select
              mode="tags"
              showSearch
              placeholder="Choose presets or type custom room amenities"
              optionFilterProp="label"
              options={roomAmenityOptions}
              popupMatchSelectWidth={false}
            />
          </Form.Item>
          <Form.Item name="images" hidden>
            <Input />
          </Form.Item>
          <ImageGalleryField
            folder="room-types"
            value={galleryImages}
            onChange={(images) => form.setFieldsValue({ images })}
          />
          <Form.Item name="available" label="Available" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
