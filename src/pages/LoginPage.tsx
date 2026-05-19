import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Input, Button, Typography, Card, Checkbox, message, Alert } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { clearError, setSession } from '@/store/slices/authSlice';
import { useLoginMutation } from '@/store/linktravelApi';

const { Text, Paragraph } = Typography;

interface LoginFormValues {
  email: string;
  password: string;
  remember: boolean;
}

export default function LoginPage() {
  const { t } = useTranslation();
  const [submitting, setSubmitting] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const dispatch = useAppDispatch();
  const { error } = useAppSelector((s) => s.auth);
  const navigate = useNavigate();
  const location = useLocation();
  const [login] = useLoginMutation();

  const from = (location.state as { from?: string })?.from || '/';

  const handleSubmit = async (values: LoginFormValues) => {
    setSubmitting(true);
    dispatch(clearError());
    try {
      const session = await login({ email: values.email, password: values.password }).unwrap();
      dispatch(setSession(session));
      message.success(t('auth.welcomeBack'));
      navigate(from, { replace: true });
    } catch (submitError) {
      message.error((submitError as Error).message || t('auth.loginFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  const submitCurrentValues = () =>
    handleSubmit({
      email,
      password,
      remember,
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
          maxWidth: 420,
          boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
          borderRadius: 12,
        }}
        styles={{ body: { padding: 32 } }}
      >
        {/* Logo & Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }}>
            <img
              src="/images/logo-linktravel.png"
              alt="LinkTravel"
              style={{ height: 44, width: 'auto' }}
            />
          </Link>
          <Paragraph type="secondary" style={{ marginTop: 8, marginBottom: 0 }}>
            {t('auth.signInToAccount')}
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
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>{t('auth.email')}</label>
            <Input
              prefix={<MailOutlined style={{ color: '#bfbfbf' }} />}
              placeholder={t('auth.emailPlaceholder')}
              size="large"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              onPressEnter={submitCurrentValues}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>{t('auth.password')}</label>
            <Input.Password
              prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
              placeholder={t('auth.passwordPlaceholder')}
              size="large"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              onPressEnter={submitCurrentValues}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Checkbox checked={remember} onChange={(event) => setRemember(event.target.checked)}>
                {t('auth.rememberMe')}
              </Checkbox>
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <Button
              type="primary"
              htmlType="button"
              onClick={submitCurrentValues}
              block
              size="large"
              loading={submitting}
            >
              {t('auth.signIn')}
            </Button>
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <Text type="secondary">
            {t('auth.dontHaveAccount')}{' '}
            <Link to="/register" style={{ fontWeight: 500 }}>
              {t('auth.signUp')}
            </Link>
          </Text>
        </div>
      </Card>
    </div>
  );
}
