import { useState } from 'react';
import { Button, Form, Input, Space, Upload, message } from 'antd';
import { InboxOutlined, DeleteOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { api } from '@/api/client';
import { resolveMediaUrl } from '@/lib/media';

type ImageGalleryFieldProps = {
  folder: 'destinations' | 'hotels' | 'packages' | 'room-types';
  label?: string;
  value?: string[];
  onChange?: (value: string[]) => void;
};

type UploadResponse = {
  url: string;
};

export function ImageGalleryField({
  folder,
  label = 'Image Gallery',
  value = [],
  onChange,
}: ImageGalleryFieldProps) {
  const [uploading, setUploading] = useState(false);
  const [manualUrl, setManualUrl] = useState('');

  const addImage = (url: string) => {
    const normalized = url.trim();
    if (!normalized) {
      return;
    }

    if (value.includes(normalized)) {
      message.info('That image is already in the gallery');
      return;
    }

    onChange?.([...value, normalized]);
    setManualUrl('');
  };

  const removeImage = (url: string) => {
    onChange?.(value.filter((item) => item !== url));
  };

  const moveImage = (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= value.length) {
      return;
    }

    const next = [...value];
    [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
    onChange?.(next);
  };

  const uploadProps: UploadProps = {
    name: 'image',
    accept: 'image/*',
    showUploadList: false,
    beforeUpload: async (file) => {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('folder', folder);

      setUploading(true);

      try {
        const response = await api.post<UploadResponse>('/admin/images/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        addImage(resolveMediaUrl(response.url) || response.url);
        message.success('Image uploaded');
      } catch (error) {
        message.error(error instanceof Error ? error.message : 'Image upload failed');
      } finally {
        setUploading(false);
      }

      return false;
    },
  };

  return (
    <Form.Item label={label}>
      <Space direction="vertical" style={{ width: '100%' }} size={12}>
        <Upload.Dragger {...uploadProps} disabled={uploading}>
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">{uploading ? 'Uploading image...' : 'Click or drag images here'}</p>
          <p className="ant-upload-hint">The first image becomes the cover image automatically.</p>
        </Upload.Dragger>

        <Space.Compact style={{ width: '100%' }}>
          <Input
            value={manualUrl}
            onChange={(event) => setManualUrl(event.target.value)}
            placeholder="Paste external image URL"
          />
          <Button
            onClick={() => {
              addImage(manualUrl);
              setManualUrl('');
            }}
          >
            Add URL
          </Button>
        </Space.Compact>

        <Space direction="vertical" style={{ width: '100%' }} size={8}>
          {value.length === 0 ? (
            <div
              style={{
                border: '1px dashed #d9d9d9',
                borderRadius: 8,
                padding: 16,
                textAlign: 'center',
                color: '#888',
              }}
            >
              Uploaded images will appear here.
            </div>
          ) : null}
          {value.map((url, index) => (
            <div
              key={url}
              style={{
                display: 'grid',
                gridTemplateColumns: '96px 1fr auto',
                gap: 12,
                alignItems: 'center',
                border: '1px solid #f0f0f0',
                borderRadius: 8,
                padding: 8,
              }}
            >
              <img
                src={url}
                alt={`Gallery item ${index + 1}`}
                style={{ width: 96, height: 72, objectFit: 'cover', borderRadius: 6 }}
              />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>
                  {index === 0 ? 'Cover image' : `Gallery image ${index + 1}`}
                </div>
                <div style={{ fontSize: 12, color: '#888', overflow: 'hidden', textOverflow: 'ellipsis' }}>{url}</div>
              </div>
              <Space direction="vertical" size={4}>
                <Button size="small" onClick={() => moveImage(index, -1)} disabled={index === 0}>
                  Up
                </Button>
                <Button size="small" onClick={() => moveImage(index, 1)} disabled={index === value.length - 1}>
                  Down
                </Button>
                <Button size="small" danger icon={<DeleteOutlined />} onClick={() => removeImage(url)} />
              </Space>
            </div>
          ))}
        </Space>
      </Space>
    </Form.Item>
  );
}
