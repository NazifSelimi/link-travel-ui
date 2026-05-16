import { useEffect, useState, useCallback } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Input,
  Modal,
  Form,
  Switch,
  Tag,
  Rate,
  InputNumber,
  Select,
  Popconfirm,
  message,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchAdminHotels,
  createHotel,
  updateHotel,
  deleteHotel,
} from '@/store/slices/adminSlice';
import { useGetAdminDestinationsQuery } from '@/store/linktravelApi';
import { CitySelect } from '@/components/admin/CitySelect';
import { ImageGalleryField } from '@/components/admin/ImageGalleryField';
import { LocationPicker } from '@/components/admin/LocationPicker';
import { hotelAmenityOptions, normalizeTagValues } from '@/lib/adminFieldOptions';
import { countryOptions } from '@/lib/countries';
import type { Hotel } from '@/types';

const { TextArea } = Input;

export default function AdminHotelsPage() {
  const dispatch = useAppDispatch();
  const { hotels, loading } = useAppSelector((s) => s.admin);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Hotel | null>(null);
  const [form] = Form.useForm();
  const selectedCountryCode = Form.useWatch('countryCode', form);
  const galleryImages = Form.useWatch('images', form) ?? [];

  // Destinations dropdown via RTK Query (read-only consumer of the admin list).
  const { data: destinationsData } = useGetAdminDestinationsQuery({ per_page: 100 });
  const destinationItems = destinationsData?.items ?? [];
  const destinationOptions = destinationItems.map((destination) => ({
    value: destination.id,
    label: `${destination.name}, ${destination.country}`,
  }));

  const load = useCallback(() => {
    dispatch(fetchAdminHotels({ search: search || undefined, page, per_page: 15 }));
  }, [dispatch, search, page]);

  useEffect(() => { load(); }, [load]);

  const handleSearch = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  const handleCountryChange = (value: string, option?: { label?: string }) => {
    form.setFieldsValue({
      countryCode: value,
      city: undefined,
      region: undefined,
      district: undefined,
      formattedAddress: undefined,
      placeId: undefined,
      mapUrl: undefined,
      coordinates: { lat: undefined, lng: undefined },
    });
  };

  const handleDestinationChange = (destinationId: string) => {
    const destination = destinationItems.find((item) => item.id === destinationId);

    if (!destination) {
      form.setFieldValue('destinationId', destinationId);
      return;
    }

    form.setFieldsValue({
      destinationId,
      countryCode: destination.countryCode,
      region: destination.region,
      city: destination.city || destination.name,
      district: destination.district,
      currency: destination.currency,
    });
  };

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ publishStatus: 'draft', images: [] });
    setModalOpen(true);
  };

  const openEdit = (record: Hotel) => {
    setEditing(record);
    form.setFieldsValue({
      name: record.name,
      destinationId: record.destinationId,
      description: record.description,
      shortDescription: record.shortDescription,
      image: record.image,
      images: record.images ?? (record.image ? [record.image] : []),
      stars: record.stars,
      pricePerNight: record.pricePerNight,
      currency: record.currency,
      address: record.address,
      countryCode: record.countryCode,
      region: record.region,
      city: record.city,
      district: record.district,
      formattedAddress: record.formattedAddress,
      placeId: record.placeId,
      mapUrl: record.mapUrl,
      publishStatus: record.publishStatus ?? 'draft',
      coordinates: record.coordinates,
      featured: record.featured,
      amenities: record.amenities ?? [],
      checkIn: record.policies?.checkIn,
      checkOut: record.policies?.checkOut,
      cancellation: record.policies?.cancellation,
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const data = {
        ...values,
        image: values.images?.[0] || '',
        amenities: normalizeTagValues(values.amenities),
        policies: {
          checkIn: values.checkIn || null,
          checkOut: values.checkOut || null,
          cancellation: values.cancellation || null,
        },
      };
      delete data.checkIn;
      delete data.checkOut;
      delete data.cancellation;

      if (editing) {
        await dispatch(updateHotel({ id: editing.id, data })).unwrap();
        message.success('Hotel updated');
      } else {
        await dispatch(createHotel(data)).unwrap();
        message.success('Hotel created');
      }
      setModalOpen(false);
      load();
    } catch {
      message.error('Failed to save hotel');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await dispatch(deleteHotel(id)).unwrap();
      message.success('Hotel deleted');
    } catch {
      message.error('Failed to delete hotel');
    }
  };

  const columns: ColumnsType<Hotel> = [
    {
      title: 'Hotel',
      key: 'name',
      render: (_, r) => (
        <Space>
          {r.image && (
            <img src={r.image} alt={r.name} style={{ width: 48, height: 36, borderRadius: 4, objectFit: 'cover' }} />
          )}
          <div>
            <div style={{ fontWeight: 500 }}>{r.name}</div>
            <div style={{ fontSize: 12, color: '#888' }}>{r.address}</div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Stars',
      dataIndex: 'stars',
      key: 'stars',
      render: (v: number) => <Rate disabled defaultValue={v} count={5} style={{ fontSize: 14 }} />,
      responsive: ['md'],
    },
    {
      title: 'Price/Night',
      dataIndex: 'pricePerNight',
      key: 'pricePerNight',
      render: (v: number) => <span style={{ fontWeight: 500 }}>${v?.toLocaleString()}</span>,
    },
    {
      title: 'Rating',
      dataIndex: 'rating',
      key: 'rating',
      render: (v: number) => v?.toFixed(1) ?? '—',
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
          <Popconfirm title="Delete this hotel?" onConfirm={() => handleDelete(record.id)}>
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card
        title="Hotels"
        extra={
          <Space>
            <Input
              placeholder="Search hotels..."
              prefix={<SearchOutlined />}
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              allowClear
              style={{ width: 250 }}
            />
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              Add Hotel
            </Button>
          </Space>
        }
      >
        <Table
          dataSource={hotels.data}
          columns={columns}
          rowKey="id"
          loading={loading.hotels}
          pagination={{
            current: hotels.page,
            pageSize: hotels.pageSize,
            total: hotels.total,
            onChange: (p) => setPage(p),
            showSizeChanger: false,
          }}
          scroll={{ x: 600 }}
        />
      </Card>

      <Modal
        title={editing ? 'Edit Hotel' : 'Create Hotel'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSubmit}
        width={640}
        okText={editing ? 'Update' : 'Create'}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="destinationId" label="Destination" rules={[{ required: true }]}>
            <Select
              showSearch
              placeholder="Select destination"
              optionFilterProp="label"
              onChange={handleDestinationChange}
              filterSort={(left, right) =>
                String(left.label).localeCompare(String(right.label))
              }
              options={destinationOptions}
            />
          </Form.Item>
          <Form.Item name="shortDescription" label="Short Description">
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description" rules={[{ required: true }]}>
            <TextArea rows={3} />
          </Form.Item>
          <Form.Item name="countryCode" label="Country" rules={[{ required: true, message: 'Please select a country' }]}>
            <Select
              showSearch
              placeholder="Select country"
              optionFilterProp="label"
              options={countryOptions}
              filterSort={(left, right) => String(left.label).localeCompare(String(right.label))}
              onChange={(value, option) => handleCountryChange(value, Array.isArray(option) ? option[0] : option)}
            />
          </Form.Item>
          <CitySelect
            countryCode={selectedCountryCode}
            value={form.getFieldValue('city')}
            onSelect={(location) =>
              form.setFieldsValue({
                countryCode: location.countryCode,
                region: location.region,
                city: location.city,
                district: location.district,
                formattedAddress: location.formattedAddress,
                placeId: location.placeId,
                mapUrl: location.mapUrl,
                coordinates: location.coordinates,
              })
            }
          />
          <LocationPicker
            label="Exact hotel location"
            placeholder="Search hotel name or exact address"
            initialQuery={editing?.formattedAddress || editing?.address || editing?.name}
            countryRestriction={selectedCountryCode}
            onSelect={(location) =>
              form.setFieldsValue({
                address: location.formattedAddress,
                countryCode: location.countryCode,
                region: location.region,
                city: location.city,
                district: location.district,
                formattedAddress: location.formattedAddress,
                placeId: location.placeId,
                mapUrl: location.mapUrl,
                coordinates: location.coordinates,
              })
            }
          />
          <Form.Item name="image" hidden>
            <Input />
          </Form.Item>
          <Form.Item name="images" hidden>
            <Input />
          </Form.Item>
          <ImageGalleryField
            folder="hotels"
            value={galleryImages}
            onChange={(images) => {
              form.setFieldsValue({
                images,
                image: images[0] ?? '',
              });
            }}
          />
          <Space style={{ width: '100%' }} size={16}>
            <Form.Item name="stars" label="Stars" rules={[{ required: true }]}>
              <InputNumber min={1} max={5} />
            </Form.Item>
            <Form.Item name="pricePerNight" label="Price per Night" rules={[{ required: true }]}>
              <InputNumber min={0} prefix="$" />
            </Form.Item>
            <Form.Item name="currency" label="Currency">
              <Input placeholder="EUR" />
            </Form.Item>
          </Space>
          <Form.Item name="address" label="Address">
            <Input />
          </Form.Item>
          <Space style={{ width: '100%' }} size={16}>
            <Form.Item name="city" label="City" style={{ flex: 1 }}>
              <Input />
            </Form.Item>
            <Form.Item name="region" label="Region" style={{ flex: 1 }}>
              <Input />
            </Form.Item>
          </Space>
          <Form.Item name="formattedAddress" label="Formatted Address">
            <Input />
          </Form.Item>
          <Form.Item name="mapUrl" label="Map URL">
            <Input placeholder="https://maps.google.com/..." />
          </Form.Item>
          <Space style={{ width: '100%' }} size={16}>
            <Form.Item name={['coordinates', 'lat']} label="Latitude" style={{ flex: 1 }}>
              <InputNumber min={-90} max={90} step={0.000001} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name={['coordinates', 'lng']} label="Longitude" style={{ flex: 1 }}>
              <InputNumber min={-180} max={180} step={0.000001} style={{ width: '100%' }} />
            </Form.Item>
          </Space>
          <Form.Item name="amenities" label="Amenities">
            <Select
              mode="tags"
              showSearch
              placeholder="Choose presets or type custom amenities"
              optionFilterProp="label"
              options={hotelAmenityOptions}
              popupMatchSelectWidth={false}
            />
          </Form.Item>
          <Space style={{ width: '100%' }} size={16}>
            <Form.Item name="checkIn" label="Check-in Time">
              <Input placeholder="15:00" />
            </Form.Item>
            <Form.Item name="checkOut" label="Check-out Time">
              <Input placeholder="11:00" />
            </Form.Item>
          </Space>
          <Form.Item name="cancellation" label="Cancellation Policy">
            <Input />
          </Form.Item>
          <Form.Item name="publishStatus" label="Publish Status" initialValue="draft">
            <Select
              options={[
                { value: 'draft', label: 'Draft' },
                { value: 'published', label: 'Published' },
              ]}
            />
          </Form.Item>
          <Form.Item name="district" hidden>
            <Input />
          </Form.Item>
          <Form.Item name="placeId" hidden>
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
