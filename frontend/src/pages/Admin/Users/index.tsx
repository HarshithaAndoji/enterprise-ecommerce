import { useMemo, useState } from 'react';
import { Badge, Button, ErrorState, Loading } from '../../../components/common';
import { FormSelect } from '../../../components/forms/FormSelect';
import { useAdminUsers, useSetUserStatus } from '../../../features/admin/useAdmin';
import { useAppSelector } from '../../../store/store';
import { classNames, formatDate, getInitials } from '../../../utils';
import type { UserRole } from '../../../types';

const ROLE_OPTIONS: Array<{ value: UserRole | ''; label: string }> = [
  { value: '', label: 'All roles' },
  { value: 'customer', label: 'Customers' },
  { value: 'admin', label: 'Admins' },
];

/** Admin user management: role visibility plus activate/deactivate. */
export function AdminUsers() {
  const query = useAdminUsers();
  const setStatus = useSetUserStatus();
  const currentUser = useAppSelector((state) => state.auth.user);

  const [roleFilter, setRoleFilter] = useState<UserRole | ''>('');
  const [search, setSearch] = useState('');

  const users = query.data ?? [];

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return users.filter((user) => {
      const matchesRole = roleFilter ? user.role === roleFilter : true;
      const matchesTerm = term
        ? user.name.toLowerCase().includes(term) || user.email.toLowerCase().includes(term)
        : true;
      return matchesRole && matchesTerm;
    });
  }, [users, roleFilter, search]);

  return (
    <div className="space-y-4">
      <header>
        <h2 className="text-lg font-semibold text-gray-900">Users</h2>
        <p className="text-sm text-gray-500">{users.length} registered account(s).</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:max-w-xl">
        <div>
          <label htmlFor="admin-user-search" className="label">
            Search users
          </label>
          <input
            id="admin-user-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Name or email"
            className="input"
          />
        </div>
        <FormSelect
          label="Role"
          value={roleFilter}
          onChange={(value) => setRoleFilter(value as UserRole | '')}
          options={ROLE_OPTIONS}
        />
      </div>

      {query.isLoading ? (
        <Loading label="Loading users" rows={5} />
      ) : query.isError ? (
        <ErrorState error={query.error} onRetry={() => query.refetch()} />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <caption className="sr-only">Registered users</caption>
            <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">User</th>
                <th scope="col" className="px-4 py-3 font-semibold">Role</th>
                <th scope="col" className="px-4 py-3 font-semibold">Joined</th>
                <th scope="col" className="px-4 py-3 font-semibold">Status</th>
                <th scope="col" className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((user) => {
                const isSelf = user.id === currentUser?.id;
                return (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span
                          className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-200 text-xs font-bold text-gray-600"
                          aria-hidden="true"
                        >
                          {getInitials(user.name)}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-gray-900">{user.name}</p>
                          <p className="truncate text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={user.role === 'admin' ? 'accent' : 'info'} className="capitalize">
                        {user.role}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{formatDate(user.createdAt)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={classNames(
                          'text-sm font-medium',
                          user.isActive ? 'text-emerald-700' : 'text-red-600',
                        )}
                      >
                        {user.isActive ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant={user.isActive ? 'outline' : 'success'}
                        size="sm"
                        disabled={isSelf || setStatus.isPending}
                        isLoading={
                          setStatus.isPending && setStatus.variables?.id === user.id
                        }
                        onClick={() =>
                          setStatus.mutate({ id: user.id, isActive: !user.isActive })
                        }
                      >
                        {user.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                      {isSelf ? (
                        <p className="mt-1 text-xs text-gray-400">This is you</p>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filtered.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-gray-500">
              No users match the current filters.
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}

export default AdminUsers;