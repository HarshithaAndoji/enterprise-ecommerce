import { useState } from 'react';
import type { FormEvent } from 'react';
import {
  Badge,
  Button,
  ErrorState,
  Icon,
  Loading,
  Modal,
  ProductImage,
} from '../../../components/common';
import { FormInput } from '../../../components/forms/FormInput';
import { FormTextarea } from '../../../components/forms/FormTextarea';
import {
  useAdminCategories,
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
} from '../../../features/admin/useAdmin';
import type { Category } from '../../../types';

interface CategoryFormState {
  name: string;
  description: string;
  image: string;
  isActive: boolean;
}

const EMPTY_FORM: CategoryFormState = {
  name: '',
  description: '',
  image: '',
  isActive: true,
};

/** Admin category management. */
export function AdminCategories() {
  const query = useAdminCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState<CategoryFormState>(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<Record<string, string | undefined>>({});
  const [pendingDelete, setPendingDelete] = useState<Category | null>(null);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openEdit = (category: Category) => {
    setEditing(category);
    setForm({
      name: category.name,
      description: category.description ?? '',
      image: category.image ?? '',
      isActive: category.isActive ?? true,
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const errors: Record<string, string | undefined> = {};
    if (form.name.trim().length < 2) errors.name = 'Enter a category name';
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const payload: Partial<Category> = {
      name: form.name.trim(),
      description: form.description.trim(),
      image: form.image.trim() || undefined,
      isActive: form.isActive,
    };

    if (editing) {
      updateCategory.mutate(
        { id: editing.id, payload },
        { onSuccess: () => setIsModalOpen(false) },
      );
    } else {
      createCategory.mutate(payload, { onSuccess: () => setIsModalOpen(false) });
    }
  };

  const categories = query.data ?? [];

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Categories</h2>
          <p className="text-sm text-gray-500">{categories.length} categor(y/ies) configured.</p>
        </div>
        <Button onClick={openCreate} leftIcon="plus">
          New category
        </Button>
      </header>

      {query.isLoading ? (
        <Loading label="Loading categories" rows={4} />
      ) : query.isError ? (
        <ErrorState error={query.error} onRetry={() => query.refetch()} />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <caption className="sr-only">Product categories</caption>
            <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">Category</th>
                <th scope="col" className="px-4 py-3 font-semibold">Slug</th>
                <th scope="col" className="px-4 py-3 font-semibold">Products</th>
                <th scope="col" className="px-4 py-3 font-semibold">Status</th>
                <th scope="col" className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {categories.map((category) => (
                <tr key={category.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md bg-gray-100">
                        <ProductImage
                          src={category.image}
                          alt=""
                          seed={category.slug || category.id}
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-gray-900">{category.name}</p>
                        <p className="truncate text-xs text-gray-500">
                          {category.description || 'No description'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{category.slug}</td>
                  <td className="px-4 py-3 text-gray-700">{category.productCount ?? 0}</td>
                  <td className="px-4 py-3">
                    <Badge tone={category.isActive ? 'success' : 'neutral'}>
                      {category.isActive ? 'Active' : 'Hidden'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEdit(category)}
                        aria-label={`Edit ${category.name}`}
                      >
                        <Icon name="pencil" className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => setPendingDelete(category)}
                        aria-label={`Delete ${category.name}`}
                      >
                        <Icon name="trash" className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editing ? 'Edit category' : 'New category'}
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              form="admin-category-form"
              isLoading={createCategory.isPending || updateCategory.isPending}
            >
              {editing ? 'Save changes' : 'Create category'}
            </Button>
          </>
        }
      >
        <form id="admin-category-form" onSubmit={submit} noValidate className="space-y-4">
          <FormInput
            label="Name"
            required
            value={form.name}
            error={formErrors.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
          />
          <FormTextarea
            label="Description"
            rows={3}
            value={form.description}
            onChange={(event) =>
              setForm((current) => ({ ...current, description: event.target.value }))
            }
          />
          <FormInput
            label="Image URL"
            value={form.image}
            hint="Leave blank to use a generated placeholder."
            onChange={(event) =>
              setForm((current) => ({ ...current, image: event.target.value }))
            }
          />
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(event) =>
                setForm((current) => ({ ...current, isActive: event.target.checked }))
              }
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            Visible in the storefront
          </label>
        </form>
      </Modal>

      <Modal
        open={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        title="Delete category"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setPendingDelete(null)}>
              Keep category
            </Button>
            <Button
              variant="danger"
              isLoading={deleteCategory.isPending}
              onClick={() => {
                if (!pendingDelete) return;
                deleteCategory.mutate(pendingDelete.id, {
                  onSuccess: () => setPendingDelete(null),
                });
              }}
            >
              Delete
            </Button>
          </>
        }
      >
        <p className="text-sm text-gray-700">
          Delete <span className="font-semibold">{pendingDelete?.name}</span>? Categories with
          products must be emptied first.
        </p>
      </Modal>
    </div>
  );
}

export default AdminCategories;