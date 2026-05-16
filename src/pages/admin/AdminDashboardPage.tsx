import { Link } from 'react-router-dom';
import {
  Typography,
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Tag,
  Button,
  Space,
  Spin,
  Alert,
} from 'antd';
import {
  GlobalOutlined,
  UserOutlined,
  FileTextOutlined,
  DollarOutlined,
  GiftOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useGetAdminDashboardQuery } from '@/store/linktravelApi';
import type { AdminReservation } from '@/types';

const { Text } = Typography;

const statusColors: Record<string, string> = {
  pending: 'orange',
  confirmed: 'blue',
  cancelled: 'red',
  completed: 'green',
};

export default function AdminDashboardPage() {
  const { data: dashboard, isLoading, isError } = useGetAdminDashboardQuery();

  const stats = dashboard?.stats;

  const columns: ColumnsType<AdminReservation> = [
    {
      title: 'Guest',
      key: 'guest',
      render: (_, r) => (
        <div>
          <Text strong>{r.fullName}</Text>
          <div><Text type="secondary" style={{ fontSize: 12 }}>{r.email}</Text></div>
        </div>
      ),
    },
    {
      title: 'Booking',
      key: 'booking',
      render: (_, r) => <Text>{r.package?.name ?? r.hotel?.name ?? `#${r.packageId || r.hotelId}`}</Text>,
      responsive: ['md'],
    },
    {
      title: 'Check-in',
      dataIndex: 'checkIn',
      key: 'checkIn',
      render: (v: string) => new Date(v).toLocaleDateString(),
      responsive: ['lg'],
    },
    {
      title: 'Estimated Quote',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      render: (v: number) => <Text strong>${v?.toLocaleString()}</Text>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (s: string) => (
        <Tag color={statusColors[s] || 'default'}>{(s || 'pending').toUpperCase()}</Tag>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (isError || !dashboard) {
    return (
      <Alert
        title="Error Loading Dashboard"
        description="Failed to load dashboard statistics. Please try again later."
        type="error"
        showIcon
      />
    );
  }

  return (
    <div>
      {/* KPI Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={8} md={4}>
          <Card>
            <Statistic
              title="Quoted Requests"
              value={stats?.total_revenue ?? 0}
              prefix={<DollarOutlined style={{ color: '#52c41a' }} />}
              precision={0}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card>
            <Statistic
              title="Reservations"
              value={stats?.total_reservations ?? 0}
              prefix={<FileTextOutlined style={{ color: '#1677ff' }} />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card>
            <Statistic
              title="Pending"
              value={stats?.pending_reservations ?? 0}
              styles={{ content: stats?.pending_reservations ? { color: '#faad14' } : undefined }}
              prefix={<FileTextOutlined style={{ color: '#faad14' }} />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card>
            <Statistic
              title="Users"
              value={stats?.total_users ?? 0}
              prefix={<UserOutlined style={{ color: '#722ed1' }} />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card>
            <Statistic
              title="Destinations"
              value={stats?.total_destinations ?? 0}
              prefix={<GlobalOutlined style={{ color: '#13c2c2' }} />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card>
            <Statistic
              title="Hotels"
              value={stats?.total_hotels ?? 0}
              prefix={<GiftOutlined style={{ color: '#eb2f96' }} />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        {/* Recent Reservations */}
        <Col xs={24} xl={16}>
          <Card
            title={
              <Space>
                <FileTextOutlined />
                <span>Recent Reservation Requests</span>
              </Space>
            }
            extra={
              <Link to="/admin/reservations">
                <Button type="link">View All</Button>
              </Link>
            }
            styles={{ body: { padding: 0 } }}
          >
            <Table
              dataSource={dashboard?.recentReservations ?? []}
              columns={columns}
              rowKey="id"
              pagination={false}
              size="small"
              scroll={{ x: 400 }}
            />
          </Card>
        </Col>

        {/* Quick Actions */}
        <Col xs={24} xl={8}>
          <Card title="Quick Actions" style={{ marginBottom: 16 }}>
            <Space orientation="vertical" style={{ width: '100%' }} size={12}>
              <Link to="/admin/destinations" style={{ display: 'block' }}>
                <Button icon={<GlobalOutlined />} block>Manage Destinations</Button>
              </Link>
              <Link to="/admin/hotels" style={{ display: 'block' }}>
                <Button icon={<GiftOutlined />} block>Manage Hotels</Button>
              </Link>
              <Link to="/admin/packages" style={{ display: 'block' }}>
                <Button icon={<GiftOutlined />} block>Manage Packages</Button>
              </Link>
              <Link to="/admin/reservations" style={{ display: 'block' }}>
                <Button
                  icon={<FileTextOutlined />}
                  block
                  type={stats?.pending_reservations ? 'primary' : 'default'}
                >
                  Reservations {stats?.pending_reservations ? `(${stats.pending_reservations} pending)` : ''}
                </Button>
              </Link>
              <Link to="/admin/users" style={{ display: 'block' }}>
                <Button icon={<UserOutlined />} block>User Management</Button>
              </Link>
            </Space>
          </Card>

          {/* Quote value by month */}
          {dashboard?.revenueByMonth && dashboard.revenueByMonth.length > 0 && (
            <Card title="Quoted Value by Month">
              <Space orientation="vertical" style={{ width: '100%' }} size={8}>
                {dashboard.revenueByMonth.slice(0, 6).map((m) => (
                  <div key={`${m.year}-${m.month}`} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text type="secondary">
                      {new Date(m.year, m.month - 1).toLocaleDateString('en', { month: 'short', year: 'numeric' })}
                    </Text>
                    <Text strong>${m.revenue.toLocaleString()}</Text>
                  </div>
                ))}
              </Space>
            </Card>
          )}

          {/* Popular Destinations */}
          {dashboard?.popularDestinations && dashboard.popularDestinations.length > 0 && (
            <Card title="Popular Destinations" style={{ marginTop: 16 }}>
              <Space orientation="vertical" style={{ width: '100%' }} size={8}>
                {dashboard.popularDestinations.slice(0, 5).map((d) => (
                  <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text>{d.name}</Text>
                    <Tag color="blue">{d.country}</Tag>
                  </div>
                ))}
              </Space>
            </Card>
          )}
        </Col>
      </Row>
    </div>
  );
}
