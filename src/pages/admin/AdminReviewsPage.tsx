import { useEffect, useState, useCallback } from 'react';
import { Button, Card, Input, message, Popconfirm, Space, Table, Tag } from 'antd';
import { CheckOutlined, CloseOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { approveReview, deleteReview, fetchAdminReviews, rejectReview } from '@/store/slices/adminSlice';
import type { Review } from '@/types';

export default function AdminReviewsPage() {
  const dispatch = useAppDispatch();
  const { reviews, loading } = useAppSelector((state) => state.admin);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const load = useCallback(() => {
    dispatch(fetchAdminReviews({ search: search || undefined, page, per_page: 15 }));
  }, [dispatch, search, page]);

  useEffect(() => { load(); }, [load]);

  const handleApprove = async (id: string) => {
    try {
      await dispatch(approveReview(id)).unwrap();
      message.success('Review approved');
    } catch {
      message.error('Failed to approve review');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await dispatch(rejectReview(id)).unwrap();
      message.success('Review rejected');
    } catch {
      message.error('Failed to reject review');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await dispatch(deleteReview(id)).unwrap();
      message.success('Review deleted');
    } catch {
      message.error('Failed to delete review');
    }
  };

  const columns: ColumnsType<Review> = [
    {
      title: 'Review',
      key: 'review',
      render: (_, review) => (
        <div>
          <div style={{ fontWeight: 600 }}>{review.title || 'Untitled review'}</div>
          <div style={{ fontSize: 12, color: '#888' }}>{review.comment || 'No comment provided.'}</div>
        </div>
      ),
    },
    {
      title: 'Target',
      key: 'target',
      render: (_, review) => (
        <div>
          <div>{review.reviewableName || `#${review.reviewableId}`}</div>
          <div style={{ fontSize: 12, color: '#888' }}>{review.reviewableType || 'Unknown'}</div>
        </div>
      ),
      responsive: ['md'],
    },
    {
      title: 'Rating',
      dataIndex: 'rating',
      key: 'rating',
      render: (value: number) => `${value}/5`,
      responsive: ['md'],
    },
    {
      title: 'Status',
      dataIndex: 'approved',
      key: 'approved',
      render: (approved: boolean) => (
        <Tag color={approved ? 'green' : 'orange'}>
          {approved ? 'Approved' : 'Pending'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 160,
      render: (_, review) => (
        <Space>
          {!review.approved ? (
            <Button type="text" icon={<CheckOutlined />} onClick={() => handleApprove(review.id)} />
          ) : (
            <Button type="text" icon={<CloseOutlined />} onClick={() => handleReject(review.id)} />
          )}
          <Popconfirm title="Delete this review?" onConfirm={() => handleDelete(review.id)}>
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card
      title="Reviews"
      extra={(
        <Input
          placeholder="Search reviews..."
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
        dataSource={reviews.data}
        columns={columns}
        loading={loading.reviews}
        pagination={{
          current: reviews.page,
          pageSize: reviews.pageSize,
          total: reviews.total,
          onChange: (nextPage) => setPage(nextPage),
          showSizeChanger: false,
        }}
        scroll={{ x: 720 }}
      />
    </Card>
  );
}
