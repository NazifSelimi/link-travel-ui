import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input, Button, Typography, Card, message, Alert } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { clearError, setSession } from '@/store/slices/authSlice';
import { useRegisterMutation } from '@/store/linktravelApi';

const { Text, Paragraph } = Typography;

interface RegisterFormValues {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function RegisterPage() {
  const { t } = useTranslation();
  const [submitting, setSubmitting] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const dispatch = useAppDispatch();
  const { error } = useAppSelector((s) => s.auth);
  const navigate = useNavigate();
  const [register] = useRegisterMutation();

  const handleSubmit = async (values: RegisterFormValues) => {
    if (!values.firstName || !values.lastName || !values.email || !values.password || !values.confirmPassword) {
      message.error(t('auth.completeRequired'));
      return;
    }

    if (values.password.length < 8) {
      message.error(t('auth.passwordTooShort'));
      return;
    }

    if (values.password !== values.confirmPassword) {
      message.error(t('auth.passwordsMismatch'));
      return;
    }

    setSubmitting(true);
    dispatch(clearError());
    try {
      const session = await register({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        password: values.password,
        confirmPassword: values.confirmPassword,
      }).unwrap();
      dispatch(setSession(session));
      message.success(t('auth.accountCreated'));
      navigate('/', { replace: true });
    } catch (submitError) {
      message.error((submitError as Error).message || t('auth.registrationFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  const submitCurrentValues = () =>
    handleSubmit({
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
    });

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #e8f4f8 0%, #d1e8f0 50%, #b8d4e3 100%)',
        padding: 24,
      }}
    >
      <Card
        style={{
          width: '100%',
          maxWidth: 480,
          boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
          borderRadius: 12,
        }}
        styles={{ body: { padding: 32 } }}
      >
        {/* Logo & Header */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }}>
            <img
              src="/images/logo-linktravel.png"
              alt="LinkTravel"
              style={{ height: 44, width: 'auto' }}
            />
          </Link>
          <Paragraph type="secondary" style={{ marginTop: 8, marginBottom: 0 }}>
            {t('auth.createAccount')}
          </Paragraph>
        </div>

        {error && (
          <Alert
            title={error}
            type="error"
            showIcon
            closable
            onClose={() => dispatch(clearError())}
            style={{ marginBottom: 16 }}
          />
        )}

        <div>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1, marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>{t('auth.firstName')}</label>
              <Input
                prefix={<UserOutlined style={{ color: '#bfbfbf' }} />}
                placeholder="John"
                size="large"
                autoComplete="given-name"
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
              />
            </div>
            <div style={{ flex: 1, marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>{t('auth.lastName')}</label>
              <Input
                placeholder="Doe"
                size="large"
                autoComplete="family-name"
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
              />
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>{t('auth.email')}</label>
            <Input
              prefix={<MailOutlined style={{ color: '#bfbfbf' }} />}
              placeholder={t('auth.emailPlaceholder')}
              size="large"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>{t('auth.password')}</label>
            <Input.Password
              prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
              placeholder={t('auth.newPasswordPlaceholder')}
              size="large"
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>{t('auth.confirmPassword')}</label>
            <Input.Password
              prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
              placeholder={t('auth.confirmPasswordPlaceholder')}
              size="large"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              onPressEnter={submitCurrentValues}
            />
          </div>

          <div style={{ marginBottom: 16, marginTop: 24 }}>
            <Button
              type="primary"
              htmlType="button"
              onClick={submitCurrentValues}
              block
              size="large"
              loading={submitting}
            >
              {t('auth.createAccountButton')}
            </Button>
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <Text type="secondary">
            {t('auth.alreadyHaveAccount')}{' '}
            <Link to="/login" style={{ fontWeight: 500 }}>
              {t('auth.signIn')}
            </Link>
          </Text>
        </div>
      </Card>
    </div>
  );
}
