import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import {
  Badge,
  Button,
  ErrorState,
  Icon,
  Loading,
  Modal,
  ProductImage,
  Rating,
} from '../../../components/common';
import { FormInput } from '../../../components/forms/FormInput';
import { FormSelect } from '../../../components/forms/FormSelect';
import { FormTextarea } from '../../../components/forms/FormTextarea';
import {
  useAdminProducts,
  useCreateProduct,
  useDeleteProduct,
  useUpdateProduct,
} from '../../../features/admin/useAdmin';
import { useCategories } from '../../../features/categories/useCategories';
import { classNames, formatCurrency, truncate } from '../../../utils';
import type { Product } from '../../../types';

interface ProductFormState {
  name: string;
  description: string;
  price: string;
  compareAtPrice: string;
  categoryId: string;
  brand: string;
  sku: string;
  stock: string;
  isFeatured: boolean;
  isActive: boolean;
}

const EMPTY_FORM: ProductFormState = {
  name: '',
  description: '',
  price: '',
  compareAtPrice: '',
  categoryId: '',
  brand: '',
  sku: '',
  stock: '0',
  isFeatured: false,
  isActive: true,
};

function toFormState(product?: Product): ProductFormState {
  if (!product) return EMPTY_FORM;
  return {
    name: product.name,
    description: product.description,
    price: String(product.price),
    compareAtPrice: product.compareAtPrice ? String(product.compareAtPrice) : '',
    categoryId: product.categoryId,
    brand: product.brand ?? '',
    sku: product.sku ?? '',
    stock: String(product.stock),
    isFeatured: product.isFeatured,
    isActive: product.isActive,
  };
}

/** Admin product management: table, search and create/edit/delete. */
export function AdminProducts() {
  const query = useAdminProducts();
  const { data: categories = [] } = useCategories();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState<ProductFormState>(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<Record<string, string | undefined>>({});
  const [pendingDelete, setPendingDelete] = useState<Product | null>(null);

  const products = query.data ?? [];

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return products;
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(term) ||
        (product.brand ?? '').toLowerCase().includes(term) ||
        (product.sku ?? '').toLowerCase().includes(term),
    );
  }, [products, search]);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...EMPTY_FORM, categoryId: categories[0]?.id ?? '' });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditing(product);
    setForm(toFormState(product));
    setFormErrors({});
    setIsModalOpen(true);
  };

  const updateField = <K extends keyof ProductFormState>(
    key: K,
    value: ProductFormState[K],
  ) => setForm((current) => ({ ...current, [key]: value }));

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const errors: Record<string, string | undefined> = {};
    if (form.name.trim().length < 2) errors.name = 'Enter a product name';
    if (!form.categoryId) errors.categoryId = 'Choose a category';
    const price = Number(form.price);
    if (!Number.isFinite(price) || price <= 0) errors.price = 'Enter a price above 0';
    const stock = Number(form.stock);
    if (!Number.isFinite(stock) || stock < 0) errors.stock = 'Enter a valid stock level';
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const payload: Partial<Product> = {
      name: form.name.trim(),
      description: form.description.trim(),
      price,
      compareAtPrice: form.compareAtPrice ? Number(form.compareAtPrice) : null,
      categoryId: form.categoryId,
      brand: form.brand.trim(),
      sku: form.sku.trim(),
      stock,
      isFeatured: form.isFeatured,
      isActive: form.isActive,
    };

    if (editing) {
      updateProduct.mutate(
        { id: editing.id, payload },
        { onSuccess: () => setIsModalOpen(false) },
      );
    } else {
      createProduct.mutate(payload, { onSuccess: () => setIsModalOpen(false) });
    }
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;
    deleteProduct.mutate(pendingDelete.id, { onSuccess: () => setPendingDelete(null) });
  };

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Products</h2>
          <p className="text-sm text-gray-500">
            {products.length} product(s) in the catalogue.
          </p>
        </div>
        <Button onClick={openCreate} leftIcon="plus">
          New product
        </Button>
      </header>

      <div className="max-w-sm">
        <label htmlFor="admin-product-search" className="label">
          Search products
        </label>
        <input
          id="admin-product-search"
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Name, brand or SKU"
          className="input"
        />
      </div>

      {query.isLoading ? (
        <Loading label="Loading products" rows={6} />
      ) : query.isError ? (
        <ErrorState error={query.error} onRetry={() => query.refetch()} />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <caption className="sr-only">Product catalogue</caption>
            <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">Product</th>
                <th scope="col" className="px-4 py-3 font-semibold">Category</th>
                <th scope="col" className="px-4 py-3 font-semibold">Price</th>
                <th scope="col" className="px-4 py-3 font-semibold">Stock</th>
                <th scope="col" className="px-4 py-3 font-semibold">Rating</th>
                <th scope="col" className="px-4 py-3 font-semibold">Status</th>
                <th scope="col" className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md bg-gray-100">
                        <ProductImage
                          src={product.images[0]}
                          alt=""
                          seed={product.slug || product.id}
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-gray-900">
                          {truncate(product.name, 40)}
                        </p>
                        <p className="text-xs text-gray-500">{product.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{product.category?.name ?? '-'}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {formatCurrency(product.price)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={classNames(
                        'font-medium',
                        product.stock === 0
                          ? 'text-red-600'
                          : product.stock <= 10
                            ? 'text-amber-600'
                            : 'text-gray-700',
                      )}
                    >
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Rating value={product.rating} size="sm" showValue={false} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      <Badge tone={product.isActive ? 'success' : 'neutral'}>
                        {product.isActive ? 'Active' : 'Draft'}
                      </Badge>
                      {product.isFeatured ? <Badge tone="accent">Featured</Badge> : null}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEdit(product)}
                        aria-label={`Edit ${product.name}`}
                      >
                        <Icon name="pencil" className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => setPendingDelete(product)}
                        aria-label={`Delete ${product.name}`}
                      >
                        <Icon name="trash" className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-gray-500">
              No products match "{search}".
            </p>
          ) : null}
        </div>
      )}

      {/* Create / edit */}
      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editing ? 'Edit product' : 'New product'}
        description="Fields marked with an asterisk are required."
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              form="admin-product-form"
              isLoading={createProduct.isPending || updateProduct.isPending}
            >
              {editing ? 'Save changes' : 'Create product'}
            </Button>
          </>
        }
      >
        <form id="admin-product-form" onSubmit={submit} noValidate className="space-y-4">
          <FormInput
            label="Name"
            required
            value={form.name}
            error={formErrors.name}
            onChange={(event) => updateField('name', event.target.value)}
          />
          <FormTextarea
            label="Description"
            rows={3}
            value={form.description}
            onChange={(event) => updateField('description', event.target.value)}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <FormInput
              label="Price"
              type="number"
              step="0.01"
              min="0"
              required
              value={form.price}
              error={formErrors.price}
              onChange={(event) => updateField('price', event.target.value)}
            />
            <FormInput
              label="Compare at price"
              type="number"
              step="0.01"
              min="0"
              value={form.compareAtPrice}
              onChange={(event) => updateField('compareAtPrice', event.target.value)}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormSelect
              label="Category"
              required
              value={form.categoryId}
              error={formErrors.categoryId}
              placeholder="Choose a category"
              options={categories.map((category) => ({
                value: category.id,
                label: category.name,
              }))}
              onChange={(value) => updateField('categoryId', value)}
            />
            <FormInput
              label="Brand"
              value={form.brand}
              onChange={(event) => updateField('brand', event.target.value)}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormInput
              label="SKU"
              value={form.sku}
              onChange={(event) => updateField('sku', event.target.value)}
            />
            <FormInput
              label="Stock"
              type="number"
              min="0"
              value={form.stock}
              error={formErrors.stock}
              onChange={(event) => updateField('stock', event.target.value)}
            />
          </div>

          <fieldset className="flex flex-wrap gap-4">
            <legend className="sr-only">Product flags</legend>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={(event) => updateField('isFeatured', event.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              Featured on the home page
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(event) => updateField('isActive', event.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              Published in the catalogue
            </label>
          </fieldset>
        </form>
      </Modal>

      {/* Delete confirmation */}
      <Modal
        open={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        title="Delete product"
        description="This cannot be undone."
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setPendingDelete(null)}>
              Keep product
            </Button>
            <Button variant="danger" onClick={confirmDelete} isLoading={deleteProduct.isPending}>
              Delete
            </Button>
          </>
        }
      >
        <p className="text-sm text-gray-700">
          Delete <span className="font-semibold">{pendingDelete?.name}</span>? It will also be
          removed from customer carts and wishlists.
        </p>
      </Modal>
    </div>
  );
}

export default AdminProducts;