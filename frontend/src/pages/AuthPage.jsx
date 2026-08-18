import { useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  clearAuthError,
  register,
  signIn,
} from '../features/auth/authSlice';

const initialValues = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
};

function EyeIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <path d="M1 1l22 22" />
      <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
    </svg>
  );
}

function PasswordField({ label, value, onChange, autoComplete }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!value) {
      setVisible(false);
    }
  }, [value]);

  return (
    <label>
      {label}

      <span className="password-control">
        <input
          required
          type={visible ? 'text' : 'password'}
          minLength="8"
          autoComplete={autoComplete}
          value={value}
          onChange={onChange}
        />

        {value && (
          <button
            className="password-toggle"
            type="button"
            onClick={() => setVisible(!visible)}
            aria-label={
              visible
                ? `Hide ${label.toLowerCase()}`
                : `Show ${label.toLowerCase()}`
            }
            aria-pressed={visible}
          >
            {visible ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        )}
      </span>
    </label>
  );
}

export default function AuthPage({ mode }) {
  const [values, setValues] = useState(initialValues);

  const { user, status, error } = useSelector((state) => state.auth);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const isRegister = mode === 'register';

  useEffect(() => {
    setValues(initialValues);
    dispatch(clearAuthError());
  }, [mode, dispatch]);

  if (user) {
    return <Navigate to="/" replace />;
  }

  const update = (field) => (event) => {
    setValues((current) => ({
      ...current,
      [field]: event.target.value,
    }));
  };

  const submit = async (event) => {
    event.preventDefault();

    if (isRegister && values.password !== values.confirmPassword) {
      return;
    }

    const action = isRegister
      ? register({
          name: values.name,
          email: values.email,
          password: values.password,
        })
      : signIn({
          email: values.email,
          password: values.password,
        });

    const result = await dispatch(action);

    if (!result.error) {
      navigate(location.state?.from?.pathname || '/');
    }
  };

  const mismatch =
    isRegister &&
    values.confirmPassword &&
    values.password !== values.confirmPassword;

  const alternatePath = isRegister ? '/login' : '/register';

  return (
    <section className="auth-card">
      <h1>{isRegister ? 'Create your account' : 'Welcome back'}</h1>

      <p>Manage and search your own multimedia library.</p>

      <form onSubmit={submit} autoComplete="on">
        {isRegister && (
          <label>
            Name
            <input
              required
              minLength="2"
              autoComplete="name"
              value={values.name}
              onChange={update('name')}
            />
          </label>
        )}

        <label>
          Email
          <input
            required
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={update('email')}
          />
        </label>

        <PasswordField
          key={`${mode}-password`}
          label="Password"
          value={values.password}
          autoComplete={
            isRegister ? 'new-password' : 'current-password'
          }
          onChange={update('password')}
        />

        {isRegister && (
          <PasswordField
            key={`${mode}-confirm`}
            label="Confirm password"
            value={values.confirmPassword}
            autoComplete="new-password"
            onChange={update('confirmPassword')}
          />
        )}

        {mismatch && (
          <p className="error">Passwords do not match.</p>
        )}

        {error && <p className="error">{error}</p>}

        <button disabled={status === 'loading' || mismatch}>
          {status === 'loading'
            ? 'Please wait…'
            : isRegister
              ? 'Create account'
              : 'Log in'}
        </button>
      </form>

      <p>
        {isRegister ? 'Already registered?' : 'New here?'}{' '}
        <Link
          to={alternatePath}
          onClick={() => dispatch(clearAuthError())}
        >
          {isRegister ? 'Log in' : 'Create an account'}
        </Link>
      </p>
    </section>
  );
}
