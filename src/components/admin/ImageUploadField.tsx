import { useState } from 'react';
import { Button, Form, Input, Space, Upload, message } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { api } from '@/api/client';
import { resolveMediaUrl } from '@/lib/media';

type ImageUploadFieldProps = {
  folder: 'destinations' | 'hotels' | 'packages';
  label?: string;
  value?: string;
  onChange?: (value: string) => void;
};

type UploadResponse = {
  url: string;
  path: string;
  filename: string;
  disk: string;
};

export function ImageUploadField({
  folder,
  label = 'Primary Image',
  value,
  onChange,
}: ImageUploadFieldProps) {
  const [uploading, setUploading] = useState(false);

  const uploadProps: UploadProps = {
    name: 'image',
    accept: 'image/*',
    maxCount: 1,
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

        onChange?.(resolveMediaUrl(response.url) || response.url);
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
          <p className="ant-upload-text">{uploading ? 'Uploading image...' : 'Click or drag an image here'}</p>
          <p className="ant-upload-hint">Images are optimized and stored in the LinkTravel media library.</p>
        </Upload.Dragger>
        <Input
          value={value}
          onChange={(event) => onChange?.(event.target.value)}
          placeholder="https://... or upload above"
        />
        {value ? (
          <div style={{ overflow: 'hidden', borderRadius: 8, border: '1px solid #f0f0f0' }}>
            <img
              src={value}
              alt="Selected upload"
              style={{ width: '100%', maxHeight: 220, objectFit: 'cover', display: 'block' }}
            />
          </div>
        ) : null}
        {value ? (
          <Button onClick={() => onChange?.('')} danger ghost>
            Remove image
          </Button>
        ) : null}
      </Space>
    </Form.Item>
  );
}
