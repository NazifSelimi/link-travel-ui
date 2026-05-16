import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input, Button, Typography, Card, message, Alert } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined } from '@ant-design/icons';
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
      message.error('Please complete all required fields.');
      return;
    }

    if (values.password.length < 8) {
      message.error('Password must be at least 8 characters.');
      return;
    }

    if (values.password !== values.confirmPassword) {
      message.error('Passwords do not match.');
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
      message.success('Account created! Welcome to LinkTravel.');
      navigate('/', { replace: true });
    } catch (submitError) {
      message.error((submitError as Error).message || 'Registration failed. Please try again.');
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
            Create your account
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
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>First Name</label>
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
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Last Name</label>
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
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Email</label>
            <Input
              prefix={<MailOutlined style={{ color: '#bfbfbf' }} />}
              placeholder="you@example.com"
              size="large"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Password</label>
            <Input.Password
              prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
              placeholder="At least 8 characters"
              size="large"
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Confirm Password</label>
            <Input.Password
              prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
              placeholder="Confirm your password"
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
              Create Account
            </Button>
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <Text type="secondary">
            Already have an account?{' '}
            <Link to="/login" style={{ fontWeight: 500 }}>
              Sign in
            </Link>
          </Text>
        </div>
      </Card>
    </div>
  );
}
