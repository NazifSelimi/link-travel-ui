import { useEffect, useMemo, useState, useCallback } from 'react';
import {
  Alert,
  Card,
  Table,
  Button,
  Space,
  Input,
  Modal,
  Form,
  Switch,
  Tag,
  InputNumber,
  Select,
  Popconfirm,
  message,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchAdminPackages,
  createPackage,
  updatePackage,
  deletePackage,
} from '@/store/slices/adminSlice';
import { useGetAdminDestinationsQuery, useGetAdminHotelsQuery } from '@/store/linktravelApi';
import { LocationPicker } from '@/components/admin/LocationPicker';
import { ImageGalleryField } from '@/components/admin/ImageGalleryField';
import { normalizeTagValues, packageIncludeOptions } from '@/lib/adminFieldOptions';
import type { TravelPackage } from '@/types';

const { TextArea } = Input;
const packageCategoryOptions = [
  { value: 'city-break', label: 'City Break' },
  { value: 'cultural', label: 'Cultural Tour' },
  { value: 'beach', label: 'Beach Holiday' },
  { value: 'family', label: 'Family Trip' },
  { value: 'adventure', label: 'Adventure' },
  { value: 'wellness', label: 'Wellness & Spa' },
  { value: 'seasonal-offer', label: 'Seasonal Offer' },
];

export default function AdminPackagesPage() {
  const dispatch = useAppDispatch();
  const { packages, loading } = useAppSelector((s) => s.admin);

  // Destinations + Hotels dropdowns via RTK Query (read-only consumers).
  const { data: destinationsData } = useGetAdminDestinationsQuery({ per_page: 100 });
  const destinationItems = useMemo(() => destinationsData?.items ?? [], [destinationsData]);
  const { data: hotelsData } = useGetAdminHotelsQuery({ per_page: 200 });
  const hotelItems = useMemo(() => hotelsData?.items ?? [], [hotelsData]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<TravelPackage | null>(null);
  const [form] = Form.useForm();
  const galleryImages = Form.useWatch('images', form) ?? [];
  const selectedDestinationId = Form.useWatch('destinationId', form);
  const selectedHotelId = Form.useWatch('hotelId', form);

  const load = useCallback(() => {
    dispatch(fetchAdminPackages({ search: search || undefined, page, per_page: 15 }));
  }, [dispatch, search, page]);

  useEffect(() => { load(); }, [load]);

  const destinationOptions = destinationItems.map((destination) => ({
    value: destination.id,
    label: `${destination.name}, ${destination.country}`,
  }));

  const hotelOptions = hotelItems
    .filter((hotel) => !selectedDestinationId || hotel.destinationId === selectedDestinationId)
    .map((hotel) => ({
      value: hotel.id,
      label: hotel.destination?.name ? `${hotel.name} (${hotel.destination.name})` : hotel.name,
    }));

  useEffect(() => {
    if (!selectedDestinationId || !selectedHotelId) {
      return;
    }

    const selectedHotelBelongsToDestination = hotelItems.some(
      (hotel) => hotel.id === selectedHotelId && hotel.destinationId === selectedDestinationId,
    );

    if (!selectedHotelBelongsToDestination) {
      form.setFieldValue('hotelId', undefined);
    }
  }, [form, hotelItems, selectedDestinationId, selectedHotelId]);

  const handleSearch = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ featured: false, publishStatus: 'draft', images: [] });
    setModalOpen(true);
  };

  const openEdit = (record: TravelPackage) => {
    setEditing(record);
    form.setFieldsValue({
      name: record.name,
      destinationId: record.destinationId,
      hotelId: record.hotelId ?? undefined,
      description: record.description,
      duration: record.duration,
      groupSize: record.groupSize,
      price: record.price,
      originalPrice: record.originalPrice,
      image: record.image,
      images: record.images ?? (record.image ? [record.image] : []),
      category: record.category,
      featured: record.featured,
      includes: record.includes ?? [],
      itineraryHighlights: record.itineraryHighlights?.join('\n'),
      meetingPoint: record.meetingPoint,
      meetingMapUrl: record.meetingMapUrl,
      meetingCoordinates: record.meetingCoordinates,
      publishStatus: record.publishStatus ?? 'draft',
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const data = {
        ...values,
        image: values.images?.[0] || '',
        includes: normalizeTagValues(values.includes),
        itineraryHighlights: values.itineraryHighlights
          ? values.itineraryHighlights.split('\n').map((item: string) => item.trim()).filter(Boolean)
          : [],
      };

      if (editing) {
        await dispatch(updatePackage({ id: editing.id, data })).unwrap();
        message.success('Package updated');
      } else {
        await dispatch(createPackage(data)).unwrap();
        message.success('Package created');
      }
      setModalOpen(false);
      load();
    } catch {
      message.error('Failed to save package');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await dispatch(deletePackage(id)).unwrap();
      message.success('Package deleted');
    } catch {
      message.error('Failed to delete package');
    }
  };

  const columns: ColumnsType<TravelPackage> = [
    {
      title: 'Package',
      key: 'name',
      render: (_, r) => (
        <Space>
          {r.image && (
            <img src={r.image} alt={r.name} style={{ width: 48, height: 36, borderRadius: 4, objectFit: 'cover' }} />
          )}
          <div>
            <div style={{ fontWeight: 500 }}>{r.name}</div>
            <div style={{ fontSize: 12, color: '#888' }}>{r.destinationName || `Destination #${r.destinationId}`}</div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Duration',
      dataIndex: 'duration',
      key: 'duration',
      responsive: ['md'],
    },
    {
      title: 'Price',
      key: 'price',
      render: (_, r) => (
        <Space orientation="vertical" size={0}>
          <span style={{ fontWeight: 500 }}>${r.price?.toLocaleString()}</span>
          {r.originalPrice && (
            <span style={{ fontSize: 12, textDecoration: 'line-through', color: '#888' }}>
              ${r.originalPrice.toLocaleString()}
            </span>
          )}
        </Space>
      ),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (v: string) => v ? <Tag>{v}</Tag> : '—',
      responsive: ['lg'],
    },
    {
      title: 'Status',
      dataIndex: 'publishStatus',
      key: 'publishStatus',
      render: (value?: string) => (
        <Tag color={value === 'published' ? 'green' : 'default'}>
          {value === 'published' ? 'Published' : 'Draft'}
        </Tag>
      ),
      responsive: ['lg'],
    },
    {
      title: 'Featured',
      dataIndex: 'featured',
      key: 'featured',
      render: (v: boolean) => v ? <Tag color="green">Yes</Tag> : <Tag>No</Tag>,
      responsive: ['lg'],
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button type="text" icon={<EditOutlined />} onClick={() => openEdit(record)} />
          <Popconfirm title="Delete this package?" onConfirm={() => handleDelete(record.id)}>
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card
        title="Travel Packages"
        extra={
          <Space>
            <Input
              placeholder="Search packages..."
              prefix={<SearchOutlined />}
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              allowClear
              style={{ width: 250 }}
            />
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              Add Package
            </Button>
          </Space>
        }
      >
        <Table
          dataSource={packages.data}
          columns={columns}
          rowKey="id"
          loading={loading.packages}
          pagination={{
            current: packages.page,
            pageSize: packages.pageSize,
            total: packages.total,
            onChange: (p) => setPage(p),
            showSizeChanger: false,
          }}
          scroll={{ x: 600 }}
        />
      </Card>

      <Modal
        title={editing ? 'Edit Package' : 'Create Package'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSubmit}
        width={640}
        okText={editing ? 'Update' : 'Create'}
      >
        <Form form={form} layout="vertical">
          <Alert
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
            message="Publishing checklist"
            description="Published packages should point to a published destination, optionally a matching published hotel, and include a real meeting point, image, duration, category, and includes list."
          />
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="destinationId" label="Destination" rules={[{ required: true }]}>
            <Select
              showSearch
              placeholder="Select destination"
              optionFilterProp="label"
              onChange={() => form.setFieldValue('hotelId', undefined)}
              filterSort={(left, right) =>
                String(left.label).localeCompare(String(right.label))
              }
              options={destinationOptions}
            />
          </Form.Item>
          <Form.Item name="hotelId" label="Linked Hotel (optional)">
            <Select
              allowClear
              showSearch
              placeholder={selectedDestinationId ? 'Select hotel for this destination' : 'Select destination first'}
              optionFilterProp="label"
              disabled={!selectedDestinationId}
              options={hotelOptions}
            />
          </Form.Item>
          <Form.Item name="description" label="Description" rules={[{ required: true }]}>
            <TextArea rows={4} />
          </Form.Item>
          <Form.Item name="image" hidden>
            <Input />
          </Form.Item>
          <Form.Item name="images" hidden>
            <Input />
          </Form.Item>
          <ImageGalleryField
            folder="packages"
            value={galleryImages}
            onChange={(images) => {
              form.setFieldsValue({
                images,
                image: images[0] ?? '',
              });
            }}
          />
          <Space style={{ width: '100%' }} size={16}>
            <Form.Item name="duration" label="Duration" rules={[{ required: true }]}>
              <Input placeholder="7 days" />
            </Form.Item>
            <Form.Item name="groupSize" label="Group Size">
              <Input placeholder="2-8" />
            </Form.Item>
            <Form.Item name="category" label="Category">
              <Select
                showSearch
                placeholder="Choose a category"
                optionFilterProp="label"
                options={packageCategoryOptions}
              />
            </Form.Item>
          </Space>
          <Space style={{ width: '100%' }} size={16}>
            <Form.Item name="price" label="Price" rules={[{ required: true }]}>
              <InputNumber min={0} prefix="$" style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="originalPrice" label="Original Price">
              <InputNumber min={0} prefix="$" style={{ width: '100%' }} />
            </Form.Item>
          </Space>
          <Form.Item name="includes" label="Includes">
            <Select
              mode="tags"
              showSearch
              placeholder="Choose presets or type custom inclusions"
              optionFilterProp="label"
              options={packageIncludeOptions}
              popupMatchSelectWidth={false}
            />
          </Form.Item>
          <Form.Item name="itineraryHighlights" label="Itinerary Highlights">
            <TextArea rows={4} placeholder={'One highlight per line\nAirport pickup\nGuided city tour'} />
          </Form.Item>
          <LocationPicker
            label="Meeting point"
            placeholder="Search departure point, airport, or pickup address"
            initialQuery={editing?.meetingPoint || editing?.name}
            onSelect={(location) =>
              form.setFieldsValue({
                meetingPoint: location.formattedAddress,
                meetingMapUrl: location.mapUrl,
                meetingCoordinates: location.coordinates,
              })
            }
          />
          <Form.Item name="meetingPoint" label="Meeting Point">
            <Input placeholder="Airport terminal, agency office, hotel lobby..." />
          </Form.Item>
          <Form.Item name="meetingMapUrl" label="Meeting Point Map URL">
            <Input placeholder="https://maps.google.com/..." />
          </Form.Item>
          <Form.Item name="publishStatus" label="Publish Status" initialValue="draft">
            <Select
              options={[
                { value: 'draft', label: 'Draft' },
                { value: 'published', label: 'Published' },
              ]}
            />
          </Form.Item>
          <Form.Item name={['meetingCoordinates', 'lat']} hidden>
            <Input />
          </Form.Item>
          <Form.Item name={['meetingCoordinates', 'lng']} hidden>
            <Input />
          </Form.Item>
          <Form.Item name="featured" label="Featured" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
