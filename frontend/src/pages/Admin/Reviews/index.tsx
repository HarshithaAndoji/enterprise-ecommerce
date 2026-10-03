import { useMemo, useState } from 'react';
import {
  Button,
  ErrorState,
  Icon,
  Loading,
  Modal,
  Rating,
} from '../../../components/common';
import { useAdminReviews, useDeleteAdminReview } from '../../../features/admin/useAdmin';
import { useProductsList } from '../../../features/products/useProducts';
import { formatDate, truncate } from '../../../utils';
import type { Review } from '../../../types';

/** Admin review moderation. */
export function AdminReviews() {
  const query = useAdminReviews();
  const products = useProductsList({ limit: 100 });
  const deleteReview = useDeleteAdminReview();
  const [pendingDelete, setPendingDelete] = useState<Review | null>(null);
  const [search, setSearch] = useState('');

  const reviews = query.data ?? [];

  const productName = (productId: string): string => {
    const match = products.data?.products.find((product) => product.id === productId);
    return match?.name ?? 'Unknown product';
  };

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return reviews;
    return reviews.filter(
      (review) =>
        review.comment.toLowerCase().includes(term) ||
        (review.user?.name ?? '').toLowerCase().includes(term) ||
        (review.title ?? '').toLowerCase().includes(term),
    );
  }, [reviews, search]);

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Reviews</h2>
          <p className="text-sm text-gray-500">
            {reviews.length} review(s) across the catalogue.
          </p>
        </div>
        <div className="w-full sm:w-72">
          <label htmlFor="admin-review-search" className="label">
            Search reviews
          </label>
          <input
            id="admin-review-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Comment, title or reviewer"
            className="input"
          />
        </div>
      </header>

      {query.isLoading ? (
        <Loading label="Loading reviews" rows={5} />
      ) : query.isError ? (
        <ErrorState error={query.error} onRetry={() => query.refetch()} />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <caption className="sr-only">Customer reviews</caption>
            <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">Product</th>
                <th scope="col" className="px-4 py-3 font-semibold">Reviewer</th>
                <th scope="col" className="px-4 py-3 font-semibold">Rating</th>
                <th scope="col" className="px-4 py-3 font-semibold">Comment</th>
                <th scope="col" className="px-4 py-3 font-semibold">Date</th>
                <th scope="col" className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((review) => (
                <tr key={review.id} className="align-top hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-800">{productName(review.productId)}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{review.user?.name ?? 'Customer'}</p>
                    <p className="text-xs text-gray-500">{review.user?.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <Rating value={review.rating} size="sm" showValue={false} />
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {review.title ? (
                      <p className="font-medium text-gray-900">{review.title}</p>
                    ) : null}
                    <p>{truncate(review.comment, 110)}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{formatDate(review.createdAt)}</td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:bg-red-50"
                      onClick={() => setPendingDelete(review)}
                      aria-label={`Delete review by ${review.user?.name ?? 'customer'}`}
                    >
                      <Icon name="trash" className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-gray-500">
              No reviews match your search.
            </p>
          ) : null}
        </div>
      )}

      <Modal
        open={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        title="Delete review"
        description="This cannot be undone."
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setPendingDelete(null)}>
              Keep review
            </Button>
            <Button
              variant="danger"
              isLoading={deleteReview.isPending}
              onClick={() => {
                if (!pendingDelete) return;
                deleteReview.mutate(pendingDelete.id, {
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
          Delete this review by {pendingDelete?.user?.name ?? 'the reviewer'}? The product
          rating will be recalculated.
        </p>
      </Modal>
    </div>
  );
}

export default AdminReviews;