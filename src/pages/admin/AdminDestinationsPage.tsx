import { useState } from 'react';
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
  Popconfirm,
  message,
  Rate,
  InputNumber,
  Select,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import {
  useGetAdminDestinationsQuery,
  useCreateAdminDestinationMutation,
  useUpdateAdminDestinationMutation,
  useDeleteAdminDestinationMutation,
} from '@/store/linktravelApi';
import { CitySelect } from '@/components/admin/CitySelect';
import { ImageGalleryField } from '@/components/admin/ImageGalleryField';
import { LocationPicker } from '@/components/admin/LocationPicker';
import { countryOptions, getCountryNameFromCode } from '@/lib/countries';
import {
  bestTimeToVisitOptions,
  destinationHighlightOptions,
  destinationTagOptions,
  getDestinationDefaultsForCountry,
  languageOptions,
  timezoneOptions,
} from '@/lib/destinationMetadata';
import { fetchTimezoneForCoordinates } from '@/lib/timezone';
import type { Destination } from '@/types';

const { TextArea } = Input;
const selectPopupStyles = {
  popup: {
    root: {
      minWidth: 320,
      maxWidth: 560,
    },
  },
} as const;

export default function AdminDestinationsPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Destination | null>(null);
  const [timezoneChoices, setTimezoneChoices] = useState(timezoneOptions);
  const [form] = Form.useForm();
  const selectedCountryCode = Form.useWatch('countryCode', form);
  const galleryImages = Form.useWatch('images', form) ?? [];

  const { data, isFetching } = useGetAdminDestinationsQuery({
    search: search || undefined,
    page,
    per_page: 15,
  });
  const [createDestination, { isLoading: isCreating }] = useCreateAdminDestinationMutation();
  const [updateDestination, { isLoading: isUpdating }] = useUpdateAdminDestinationMutation();
  const [deleteDestination] = useDeleteAdminDestinationMutation();

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const currentPage = data?.currentPage ?? page;
  const perPage = data?.perPage ?? 15;

  const handleSearch = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  const applyCountryDefaults = (countryCode?: string | null) => {
    const defaults = getDestinationDefaultsForCountry(countryCode);

    form.setFieldsValue({
      language: form.getFieldValue('language') || defaults.language,
      timezone: form.getFieldValue('timezone') || defaults.timezone,
      bestTimeToVisit: form.getFieldValue('bestTimeToVisit') || defaults.bestTimeToVisit,
      tags: (form.getFieldValue('tags')?.length ? form.getFieldValue('tags') : defaults.tags) ?? [],
      highlights: (form.getFieldValue('highlights')?.length ? form.getFieldValue('highlights') : defaults.highlights) ?? [],
    });
  };

  const applyTimezoneFromCoordinates = async (coordinates?: { lat?: number | null; lng?: number | null } | null) => {
    if (coordinates?.lat == null || coordinates?.lng == null) {
      return;
    }

    try {
      const timezone = await fetchTimezoneForCoordinates({
        lat: coordinates.lat,
        lng: coordinates.lng,
      });

      if (!timezone?.display) {
        return;
      }

      setTimezoneChoices((current) => {
        if (current.some((option) => option.value === timezone.display)) {
          return current;
        }

        return [{ value: timezone.display, label: timezone.display }, ...current];
      });

      form.setFieldValue('timezone', timezone.display);
    } catch {
      // Keep country default timezone when the live lookup is unavailable.
    }
  };

  const handleCountryChange = (value: string, option?: { label?: string }) => {

    form.setFieldsValue({
      country: option?.label ?? getCountryNameFromCode(value) ?? value,
      countryCode: value,
      city: undefined,
      region: undefined,
      district: undefined,
      formattedAddress: undefined,
      placeId: undefined,
      mapUrl: undefined,
      coordinates: { lat: undefined, lng: undefined },
    });

    applyCountryDefaults(value);
  };

  const openCreate = () => {
    setEditing(null);
    setTimezoneChoices(timezoneOptions);
    form.resetFields();
    form.setFieldsValue({ publishStatus: 'draft', images: [] });
    setModalOpen(true);
  };

  const openEdit = (record: Destination) => {
    setEditing(record);
    setTimezoneChoices((current) => {
      if (!record.timezone || current.some((option) => option.value === record.timezone)) {
        return current;
      }

      return [{ value: record.timezone, label: record.timezone }, ...current];
    });
    form.setFieldsValue({
      name: record.name,
      country: record.country,
      description: record.description,
      shortDescription: record.shortDescription,
      image: record.image,
      images: record.images ?? (record.image ? [record.image] : []),
      featured: record.featured,
      publishStatus: record.publishStatus ?? 'draft',
      countryCode: record.countryCode,
      region: record.region,
      city: record.city,
      district: record.district,
      formattedAddress: record.formattedAddress,
      placeId: record.placeId,
      mapUrl: record.mapUrl,
      climate: record.climate,
      bestTimeToVisit: record.bestTimeToVisit,
      language: record.language,
      timezone: record.timezone,
      priceFrom: record.priceFrom,
      tags: record.tags ?? [],
      highlights: record.highlights ?? [],
      coordinates: record.coordinates,
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        ...values,
        image: values.images?.[0] || '',
        tags: values.tags ?? [],
        highlights: values.highlights ?? [],
      };

      if (editing) {
        await updateDestination({ id: editing.id, data: payload }).unwrap();
        message.success('Destination updated');
      } else {
        await createDestination(payload).unwrap();
        message.success('Destination created');
      }
      setModalOpen(false);
      // Cache invalidation triggers the refetch automatically.
    } catch {
      message.error('Failed to save destination');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDestination(id).unwrap();
      message.success('Destination deleted');
    } catch {
      message.error('Failed to delete destination');
    }
  };

  const filterOption = (input: string, option?: { label?: unknown; value?: unknown; searchLabel?: unknown }) => {
    const label = String(option?.searchLabel ?? option?.label ?? '');
    const value = String(option?.value ?? '');
    const needle = input.toLowerCase();

    return label.toLowerCase().includes(needle) || value.toLowerCase().includes(needle);
  };

  const wrapSelectOptions = (options: Array<{ value: string; label: string }>) =>
    options.map((option) => ({
      ...option,
      searchLabel: option.label,
      label: (
        <div
          style={{
            whiteSpace: 'normal',
            lineHeight: 1.4,
            paddingRight: 8,
          }}
          title={option.label}
        >
          {option.label}
        </div>
      ),
    }));

  const columns: ColumnsType<Destination> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, r) => (
        <Space>
          {r.image && (
            <img
              src={r.image}
              alt={name}
              style={{ width: 40, height: 40, borderRadius: 4, objectFit: 'cover' }}
            />
          )}
          <div>
            <div style={{ fontWeight: 500 }}>{name}</div>
            <div style={{ fontSize: 12, color: '#888' }}>{r.country}</div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Rating',
      dataIndex: 'rating',
      key: 'rating',
      render: (v: number) => <Rate disabled defaultValue={v} allowHalf style={{ fontSize: 14 }} />,
      responsive: ['md'],
    },
    {
      title: 'Price From',
      dataIndex: 'priceFrom',
      key: 'priceFrom',
      render: (v: number) => v ? `$${v.toLocaleString()}` : '—',
      responsive: ['md'],
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
          <Popconfirm title="Delete this destination?" onConfirm={() => handleDelete(record.id)}>
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card
        title="Destinations"
        extra={
          <Space>
            <Input
              placeholder="Search destinations..."
              prefix={<SearchOutlined />}
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              allowClear
              style={{ width: 250 }}
            />
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              Add Destination
            </Button>
          </Space>
        }
      >
        <Table
          dataSource={items}
          columns={columns}
          rowKey="id"
          loading={isFetching}
          pagination={{
            current: currentPage,
            pageSize: perPage,
            total: total,
            onChange: (p) => setPage(p),
            showSizeChanger: false,
          }}
          scroll={{ x: 600 }}
        />
      </Card>

      <Modal
        title={editing ? 'Edit Destination' : 'Create Destination'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSubmit}
        width={640}
        okText={editing ? 'Update' : 'Create'}
        confirmLoading={isCreating || isUpdating}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input />
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
          <Form.Item name="country" hidden>
            <Input />
          </Form.Item>
          <CitySelect
            countryCode={selectedCountryCode}
            value={form.getFieldValue('city')}
            onSelect={async (location) => {
              applyCountryDefaults(location.countryCode ?? selectedCountryCode);
              form.setFieldsValue({
                country: location.country || getCountryNameFromCode(location.countryCode),
                countryCode: location.countryCode,
                region: location.region,
                city: location.city,
                district: location.district,
                formattedAddress: location.formattedAddress,
                placeId: location.placeId,
                mapUrl: location.mapUrl,
                coordinates: location.coordinates,
              });
              await applyTimezoneFromCoordinates(location.coordinates);
            }}
          />
          <LocationPicker
            label="Exact destination location"
            placeholder="Search city, island, region, or landmark"
            initialQuery={editing?.formattedAddress || editing?.name}
            countryRestriction={selectedCountryCode}
            onSelect={async (location) => {
              applyCountryDefaults(location.countryCode ?? selectedCountryCode);
              form.setFieldsValue({
                country: location.country || getCountryNameFromCode(location.countryCode),
                countryCode: location.countryCode,
                region: location.region,
                city: location.city,
                district: location.district,
                formattedAddress: location.formattedAddress,
                placeId: location.placeId,
                mapUrl: location.mapUrl,
                coordinates: location.coordinates,
              });
              await applyTimezoneFromCoordinates(location.coordinates);
            }}
          />
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
          <Form.Item name="shortDescription" label="Short Description">
            <Input />
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
            folder="destinations"
            value={galleryImages}
            onChange={(images) => {
              form.setFieldsValue({
                images,
                image: images[0] ?? '',
              });
            }}
          />
          <Space style={{ width: '100%' }} size={16}>
            <Form.Item name="priceFrom" label="Price From">
              <InputNumber min={0} prefix="$" style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="climate" label="Climate">
              <Input />
            </Form.Item>
          </Space>
          <Space style={{ width: '100%' }} size={16}>
            <Form.Item name="bestTimeToVisit" label="Best Time to Visit">
              <Select
                showSearch
                allowClear
                placeholder="Select best travel period"
                options={wrapSelectOptions(bestTimeToVisitOptions)}
                filterOption={filterOption}
                popupMatchSelectWidth={false}
                styles={selectPopupStyles}
              />
            </Form.Item>
            <Form.Item name="language" label="Language">
              <Select
                showSearch
                allowClear
                placeholder="Select primary language"
                options={wrapSelectOptions(languageOptions)}
                filterOption={filterOption}
                popupMatchSelectWidth={false}
                styles={selectPopupStyles}
              />
            </Form.Item>
            <Form.Item name="timezone" label="Timezone">
              <Select
                showSearch
                allowClear
                placeholder="Select timezone"
                options={wrapSelectOptions(timezoneChoices)}
                filterOption={filterOption}
                popupMatchSelectWidth={false}
                styles={selectPopupStyles}
              />
            </Form.Item>
          </Space>
          <Form.Item name="tags" label="Tags">
            <Select
              mode="tags"
              showSearch
              placeholder="Choose or type tags"
              options={wrapSelectOptions(destinationTagOptions)}
              filterOption={filterOption}
              tokenSeparators={[',']}
              popupMatchSelectWidth={false}
              styles={selectPopupStyles}
            />
          </Form.Item>
          <Form.Item name="highlights" label="Highlights">
            <Select
              mode="tags"
              showSearch
              placeholder="Choose or type highlights"
              options={wrapSelectOptions(destinationHighlightOptions)}
              filterOption={filterOption}
              tokenSeparators={[',']}
              popupMatchSelectWidth={false}
              styles={selectPopupStyles}
            />
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
