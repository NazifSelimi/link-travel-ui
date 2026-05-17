import { useState, useEffect, useMemo } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Layout, Menu, Typography, Button, Space, Avatar, Dropdown, Badge, Drawer } from 'antd';
import {
  DashboardOutlined,
  GlobalOutlined,
  HomeOutlined as HotelIcon,
  GiftOutlined,
  FileTextOutlined,
  AppstoreOutlined,
  UserOutlined,
  MessageOutlined,
  CommentOutlined,
  ArrowLeftOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined,
  BellOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';
import { useGetAdminDashboardQuery } from '@/store/linktravelApi';
import { LocaleSwitcher } from '@/components/LocaleSwitcher';

const { Sider, Content, Header } = Layout;
const { Title, Text } = Typography;

// Map admin routes to translation keys; the rendered title is resolved per
// render in the component body so it tracks the active locale.
const pageTitleKeys: Record<string, string> = {
  '/admin':              'admin.menu.dashboard',
  '/admin/destinations': 'admin.menu.destinations',
  '/admin/hotels':       'admin.menu.hotels',
  '/admin/packages':     'admin.menu.packages',
  '/admin/room-types':   'admin.menu.roomTypes',
  '/admin/reservations': 'admin.menu.reservations',
  '/admin/reviews':      'admin.menu.reviews',
  '/admin/contacts':     'admin.menu.contacts',
  '/admin/users':        'admin.menu.users',
};

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const { user } = useAppSelector((s) => s.auth);
  const { data: dashboard } = useGetAdminDashboardQuery();
  const pendingCount = dashboard?.stats.pending_reservations ?? 0;

  const menuItems = useMemo(
    () => [
      { key: '/admin',              icon: <DashboardOutlined />, label: <Link to="/admin">{t('admin.menu.dashboard')}</Link> },
      { key: '/admin/destinations', icon: <GlobalOutlined />,    label: <Link to="/admin/destinations">{t('admin.menu.destinations')}</Link> },
      { key: '/admin/hotels',       icon: <HotelIcon />,         label: <Link to="/admin/hotels">{t('admin.menu.hotels')}</Link> },
      { key: '/admin/room-types',   icon: <AppstoreOutlined />,  label: <Link to="/admin/room-types">{t('admin.menu.roomTypes')}</Link> },
      { key: '/admin/packages',     icon: <GiftOutlined />,      label: <Link to="/admin/packages">{t('admin.menu.packages')}</Link> },
      {
        key: '/admin/reservations',
        icon: <FileTextOutlined />,
        label: (
          <Link to="/admin/reservations">
            <Space>
              {t('admin.menu.reservations')}
              {pendingCount > 0 && <Badge count={pendingCount} size="small" />}
            </Space>
          </Link>
        ),
      },
      { key: '/admin/reviews',   icon: <CommentOutlined />, label: <Link to="/admin/reviews">{t('admin.menu.reviews')}</Link> },
      { key: '/admin/contacts',  icon: <MessageOutlined />, label: <Link to="/admin/contacts">{t('admin.menu.contacts')}</Link> },
      { key: '/admin/users',     icon: <UserOutlined />,    label: <Link to="/admin/users">{t('admin.menu.users')}</Link> },
    ],
    [pendingCount, t],
  );

  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => {
      setIsMobile(window.innerWidth < 992);
      if (window.innerWidth < 992) setCollapsed(true);
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const currentTitleKey = pageTitleKeys[location.pathname];
  const currentTitle = currentTitleKey ? t(currentTitleKey) : t('admin.panel');

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/');
  };

  const userMenuItems = [
    { key: 'profile', icon: <UserOutlined />, label: t('nav.myAccount'), onClick: () => navigate('/') },
    { type: 'divider' as const },
    { key: 'logout',  icon: <LogoutOutlined />, label: t('auth.logout'), danger: true, onClick: handleLogout },
  ];

  const SidebarContent = () => (
    <>
      <div
        style={{
          padding: collapsed && !isMobile ? '20px 12px' : '20px 24px',
          borderBottom: '1px solid #f0f0f0',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <img
          src="/images/logo-linktravel.png"
          alt="LinkTravel"
          style={{
            height: collapsed && !isMobile ? 28 : 32,
            width: 'auto',
            maxWidth: collapsed && !isMobile ? 42 : 140,
            objectFit: 'contain',
          }}
        />
        {(!collapsed || isMobile) && (
          <div>
            <Text strong style={{ fontSize: 16 }}>LinkTravel</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 11 }}>{t('admin.panel')}</Text>
          </div>
        )}
      </div>

      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems}
        onClick={() => isMobile && setMobileMenuOpen(false)}
        style={{ borderRight: 'none', padding: '12px 8px', flex: 1 }}
      />

      <div style={{ padding: collapsed && !isMobile ? '16px 8px' : '16px', borderTop: '1px solid #f0f0f0' }}>
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/')}
          block
          style={{ justifyContent: collapsed && !isMobile ? 'center' : 'flex-start' }}
        >
          {(!collapsed || isMobile) && t('admin.backToSite')}
        </Button>
      </div>
    </>
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {!isMobile && (
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={setCollapsed}
          trigger={null}
          width={260}
          collapsedWidth={80}
          style={{
            background: '#fff',
            position: 'fixed',
            left: 0,
            top: 0,
            bottom: 0,
            zIndex: 100,
            display: 'flex',
            flexDirection: 'column',
            borderRight: '1px solid #f0f0f0',
          }}
        >
          <SidebarContent />
        </Sider>
      )}

      {isMobile && (
        <Drawer
          title={null}
          placement="left"
          open={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          size="large"
          closeIcon={<CloseOutlined />}
          styles={{ body: { padding: 0, display: 'flex', flexDirection: 'column' }, header: { display: 'none' } }}
        >
          <SidebarContent />
        </Drawer>
      )}

      <Layout
        style={{
          marginLeft: isMobile ? 0 : collapsed ? 80 : 260,
          transition: 'margin-left 0.2s',
        }}
      >
        <Header
          style={{
            background: '#fff',
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #f0f0f0',
            position: 'sticky',
            top: 0,
            zIndex: 99,
          }}
        >
          <Space size="middle">
            <Button
              type="text"
              icon={isMobile ? <MenuFoldOutlined /> : collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => (isMobile ? setMobileMenuOpen(true) : setCollapsed(!collapsed))}
              style={{ fontSize: 16 }}
            />
            <Title level={4} style={{ margin: 0, fontSize: isMobile ? 16 : 20 }}>
              {currentTitle}
            </Title>
          </Space>

          <Space size={isMobile ? 'small' : 'middle'}>
            <LocaleSwitcher className="text-foreground" />

            <Badge count={pendingCount} size="small">
              <Button
                type="text"
                icon={<BellOutlined style={{ fontSize: 18 }} />}
                onClick={() => navigate('/admin/reservations')}
              />
            </Badge>

            <Dropdown menu={{ items: userMenuItems }} trigger={['click']} placement="bottomRight">
              <Space style={{ cursor: 'pointer' }}>
                <Avatar size={36} style={{ background: '#1677ff' }}>
                  {user?.firstName?.charAt(0).toUpperCase() || 'A'}
                </Avatar>
                {!isMobile && (
                  <div style={{ lineHeight: 1.2 }}>
                    <Text strong style={{ display: 'block', fontSize: 13 }}>
                      {user?.firstName} {user?.lastName}
                    </Text>
                    <Text type="secondary" style={{ fontSize: 11 }}>{t('admin.administrator')}</Text>
                  </div>
                )}
              </Space>
            </Dropdown>
          </Space>
        </Header>

        <Content style={{ padding: 24, background: '#f5f5f5', minHeight: 'calc(100vh - 64px)' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
