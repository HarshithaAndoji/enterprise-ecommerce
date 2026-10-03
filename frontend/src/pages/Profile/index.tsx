import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  Badge,
  Button,
  ErrorState,
  Icon,
  Loading,
  SectionHeading,
} from '../../components/common';
import { FormInput } from '../../components/forms/FormInput';
import { useProfile, useUpdateProfile } from '../../features/auth/useAuth';
import { logout } from '../../store/slices/authSlice';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { showToast } from '../../store/slices/uiSlice';
import { classNames, formatDate, getInitials } from '../../utils';

interface PasswordFormState {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const EMPTY_PASSWORD_FORM: PasswordFormState = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
};

/** Profile overview, profile editing and password change. */
export function Profile() {
  const dispatch = useAppDispatch();
  const reduxUser = useAppSelector((state) => state.auth.user);
  const profileQuery = useProfile();
  const updateProfile = useUpdateProfile();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [profileErrors, setProfileErrors] = useState<Record<string, string | undefined>>({});

  const [passwordForm, setPasswordForm] = useState<PasswordFormState>(EMPTY_PASSWORD_FORM);
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string | undefined>>({});

  const user = profileQuery.data ?? reduxUser;

  useEffect(() => {
    if (!user) return;
    setName(user.name ?? '');
    setEmail(user.email ?? '');
    setPhone(user.phone ?? '');
  }, [user]);

  const submitProfile = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const errors: Record<string, string | undefined> = {};
    if (name.trim().length < 2) errors.name = 'Enter your full name';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      errors.email = 'Enter a valid email address';
    setProfileErrors(errors);
    if (Object.keys(errors).length > 0) return;

    updateProfile.mutate({ name: name.trim(), email: email.trim(), phone: phone.trim() });
  };

  const submitPassword = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const errors: Record<string, string | undefined> = {};
    if (!passwordForm.currentPassword) errors.currentPassword = 'Enter your current password';
    if (passwordForm.newPassword.length < 8)
      errors.newPassword = 'Use at least 8 characters';
    if (passwordForm.newPassword !== passwordForm.confirmPassword)
      errors.confirmPassword = 'Passwords do not match';
    setPasswordErrors(errors);
    if (Object.keys(errors).length > 0) return;

    // The password change endpoint arrives with the backend; until then the
    // form validates locally and clears without persisting anything.
    dispatch(
      showToast({
        message: 'Change password will be enabled once the account API is live.',
        type: 'info',
      }),
    );
    setPasswordForm(EMPTY_PASSWORD_FORM);
  };

  if (profileQuery.isLoading && !user) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <Loading label="Loading your profile" rows={5} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <ErrorState
          title="Profile unavailable"
          message="We could not load your profile. Try signing in again."
          onRetry={() => profileQuery.refetch()}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <header className="mb-8 flex flex-wrap items-center gap-4">
        <span
          className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-lg font-bold text-white"
          aria-hidden="true"
        >
          {getInitials(user.name)}
        </span>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">{user.name}</h1>
          <p className="text-sm text-gray-500">{user.email}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge tone={user.role === 'admin' ? 'accent' : 'info'} className="capitalize">
              {user.role}
            </Badge>
            <Badge tone={user.isActive ? 'success' : 'danger'}>
              {user.isActive ? 'Active' : 'Deactivated'}
            </Badge>
            <span className="text-xs text-gray-500">
              Member since {formatDate(user.createdAt)}
            </span>
          </div>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <section aria-labelledby="edit-profile-heading" className="rounded-lg border border-gray-200 bg-white p-5">
          <SectionHeading
            title="Profile details"
            description="Update the details shown on your orders and invoices."
            className="mb-4"
          />
          <h2 id="edit-profile-heading" className="sr-only">
            Profile details
          </h2>

          {profileQuery.isError ? (
            <div className="mb-4">
              <ErrorState
                error={profileQuery.error}
                title="Using cached profile"
                message="We could not refresh your profile, so these details may be out of date."
                onRetry={() => profileQuery.refetch()}
              />
            </div>
          ) : null}

          <form onSubmit={submitProfile} noValidate className="space-y-4">
            <FormInput
              label="Full name"
              required
              value={name}
              error={profileErrors.name}
              onChange={(event) => setName(event.target.value)}
            />
            <FormInput
              label="Email address"
              type="email"
              required
              value={email}
              error={profileErrors.email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <FormInput
              label="Phone number"
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
            />
            <Button type="submit" isLoading={updateProfile.isPending}>
              Save changes
            </Button>
          </form>
        </section>

        <div className="space-y-6">
          <section aria-labelledby="change-password-heading" className="rounded-lg border border-gray-200 bg-white p-5">
            <SectionHeading
              title="Change password"
              description="Choose a strong password you do not reuse elsewhere."
              className="mb-4"
            />
            <h2 id="change-password-heading" className="sr-only">
              Change password
            </h2>

            <form onSubmit={submitPassword} noValidate className="space-y-4">
              <FormInput
                label="Current password"
                type="password"
                autoComplete="current-password"
                required
                value={passwordForm.currentPassword}
                error={passwordErrors.currentPassword}
                onChange={(event) =>
                  setPasswordForm((current) => ({
                    ...current,
                    currentPassword: event.target.value,
                  }))
                }
              />
              <FormInput
                label="New password"
                type="password"
                autoComplete="new-password"
                required
                hint="At least 8 characters"
                value={passwordForm.newPassword}
                error={passwordErrors.newPassword}
                onChange={(event) =>
                  setPasswordForm((current) => ({
                    ...current,
                    newPassword: event.target.value,
                  }))
                }
              />
              <FormInput
                label="Confirm new password"
                type="password"
                autoComplete="new-password"
                required
                value={passwordForm.confirmPassword}
                error={passwordErrors.confirmPassword}
                onChange={(event) =>
                  setPasswordForm((current) => ({
                    ...current,
                    confirmPassword: event.target.value,
                  }))
                }
              />
              <Button
                type="submit"
                variant="outline"
                leftIcon="lock"
              >
                Update password
              </Button>
            </form>
          </section>

          <section className="rounded-lg border border-gray-200 bg-white p-5">
            <h2 className="text-base font-semibold text-gray-900">Saved addresses</h2>
            {(user.addresses ?? []).length === 0 ? (
              <p className="mt-2 text-sm text-gray-500">
                No saved addresses yet. You will be asked for one at checkout.
              </p>
            ) : (
              <ul className="mt-3 space-y-3">
                {(user.addresses ?? []).map((address) => (
                  <li key={address.id ?? address.addressLine1} className="text-sm text-gray-600">
                    <address className="not-italic leading-relaxed">
                      {address.firstName} {address.lastName}
                      <br />
                      {address.addressLine1}
                      <br />
                      {address.city}, {address.state} {address.postalCode}
                      <br />
                      {address.country}
                    </address>
                    {address.isDefault ? (
                      <Badge tone="info" className="mt-1">
                        Default
                      </Badge>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-lg border border-red-200 bg-red-50 p-5">
            <h2 className="text-base font-semibold text-red-900">Session</h2>
            <p className="mt-1 text-sm text-red-800">
              Signing out clears the stored token from this browser.
            </p>
            <div className="mt-3 flex flex-wrap gap-3">
              <Button
                variant="danger"
                leftIcon="logout"
                onClick={() => dispatch(logout())}
              >
                Sign out
              </Button>
              <Link
                to="/orders"
                className={classNames(
                  'inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-800 hover:underline',
                )}
              >
                <Icon name="truck" className="h-4 w-4" />
                View my orders
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default Profile;