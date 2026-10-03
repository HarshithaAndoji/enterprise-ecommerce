import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Badge,
  Button,
  ErrorState,
  Icon,
  Loading,
  ProductImage,
  Rating,
  SectionHeading,
} from '../../components/common';
import ProductGrid from '../../features/products/ProductGrid';
import { FormTextarea } from '../../components/forms/FormTextarea';
import { useProduct, useRelatedProducts } from '../../features/products/useProducts';
import { useProductReviews, useCreateReview } from '../../features/reviews/useReviews';
import { useAddToCart } from '../../features/cart/useCart';
import { useIsInWishlist, useToggleWishlist } from '../../features/wishlist/useWishlist';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { showToast } from '../../store/slices/uiSlice';
import {
  classNames,
  formatCurrency,
  formatDate,
  getDiscountPercentage,
  isLowStock,
} from '../../utils';

/** Star input used by the review form. */
function RatingInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div role="radiogroup" aria-label="Your rating" className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={value === star}
          aria-label={`${star} star${star > 1 ? 's' : ''}`}
          onClick={() => onChange(star)}
          className="rounded p-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          <Icon
            name="star"
            className={classNames(
              'h-5 w-5',
              star <= value ? 'text-amber-400' : 'text-gray-300',
            )}
          />
        </button>
      ))}
    </div>
  );
}

/** Product detail page: gallery, purchase controls, reviews and related items. */
export function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();

  const productQuery = useProduct(id);
  const relatedQuery = useRelatedProducts(id);
  const reviewsQuery = useProductReviews(id);

  const addToCart = useAddToCart();
  const wishlistQuery = useIsInWishlist(id ?? '');
  const wishlist = useToggleWishlist();

  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const user = useAppSelector((state) => state.auth.user);

  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');

  const product = productQuery.data;

  useEffect(() => {
    setActiveImage(0);
    setQuantity(1);
  }, [id]);

  const createReview = useCreateReview(id ?? '');
  const canReview =
    isAuthenticated && Boolean(id) && reviewComment.trim().length >= 5 && reviewRating > 0;

  const discount = useMemo(
    () => getDiscountPercentage(product?.price ?? 0, product?.compareAtPrice),
    [product],
  );

  if (productQuery.isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <Loading label="Loading product" rows={6} />
      </div>
    );
  }

  if (productQuery.isError || !product) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <ErrorState
          error={productQuery.error}
          title="Product not available"
          message="We could not load this product. It may have been removed from the catalogue."
          onRetry={() => productQuery.refetch()}
        />
        <div className="mt-6 text-center">
          <Link to="/products" className="text-sm font-semibold text-blue-700 hover:underline">
            Back to all products
          </Link>
        </div>
      </div>
    );
  }

  const outOfStock = product.stock <= 0;
  const lowStock = isLowStock(product);
  const inWishlist = wishlistQuery.data ?? false;

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      dispatch(showToast({ message: 'Sign in to start shopping', type: 'info' }));
      return;
    }
    addToCart.mutate({ productId: product.id, quantity });
  };

  const handleWishlist = () => {
    if (!isAuthenticated) {
      dispatch(showToast({ message: 'Sign in to save items', type: 'info' }));
      return;
    }
    if (inWishlist) wishlist.remove.mutate(product.id);
    else wishlist.add.mutate(product.id);
  };

  const submitReview = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    createReview.mutate(
      {
        rating: reviewRating,
        title: reviewTitle.trim() || undefined,
        comment: reviewComment.trim(),
      },
      {
        onSuccess: () => {
          setReviewComment('');
          setReviewTitle('');
          setReviewRating(5);
        },
      },
    );
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <nav aria-label="Breadcrumb" className="mb-6 text-xs text-gray-500">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link to="/" className="hover:text-blue-700 hover:underline">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link to="/products" className="hover:text-blue-700 hover:underline">
              Products
            </Link>
          </li>
          {product.category ? (
            <>
              <li aria-hidden="true">/</li>
              <li>
                <Link
                  to={`/categories/${product.category.slug}`}
                  className="hover:text-blue-700 hover:underline"
                >
                  {product.category.name}
                </Link>
              </li>
            </>
          ) : null}
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="truncate font-medium text-gray-700">
            {product.name}
          </li>
        </ol>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Gallery */}
        <section aria-label="Product images" className="flex flex-col-reverse gap-4 sm:flex-row">
          {product.images.length > 1 ? (
            <ul className="flex gap-3 sm:flex-col">
              {product.images.map((image, index) => (
                <li key={image}>
                  <button
                    type="button"
                    onClick={() => setActiveImage(index)}
                    aria-label={`Show image ${index + 1} of ${product.images.length}`}
                    aria-current={index === activeImage}
                    className={classNames(
                      'h-16 w-16 overflow-hidden rounded-lg border-2 bg-gray-100 transition sm:h-20 sm:w-20',
                      index === activeImage ? 'border-blue-600' : 'border-transparent',
                    )}
                  >
                    <ProductImage src={image} alt="" seed={`${product.slug}-${index}`} />
                  </button>
                </li>
              ))}
            </ul>
          ) : null}

          <div className="relative flex-1 overflow-hidden rounded-xl border border-gray-200 bg-gray-100">
            <ProductImage
              src={product.images[activeImage]}
              alt={product.name}
              loading="eager"
              seed={product.slug}
              className="aspect-square"
            />
            {discount > 0 ? (
              <span className="absolute left-3 top-3">
                <Badge tone="danger">Save {discount}%</Badge>
              </span>
            ) : null}
          </div>
        </section>

        {/* Info */}
        <section aria-label="Product details" className="flex flex-col gap-5">
          <div>
            {product.category ? (
              <Link
                to={`/categories/${product.category.slug}`}
                className="text-xs font-semibold uppercase tracking-wide text-blue-700 hover:underline"
              >
                {product.category.name}
              </Link>
            ) : null}
            <h1 className="mt-1 text-2xl font-bold text-gray-900 sm:text-3xl">
              {product.name}
            </h1>
            <div className="mt-2 flex items-center gap-3">
              <Rating value={product.rating} count={product.reviewCount} />
              {product.brand ? (
                <span className="text-xs text-gray-500">by {product.brand}</span>
              ) : null}
            </div>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-gray-900">
              {formatCurrency(product.price)}
            </span>
            {product.compareAtPrice ? (
              <span className="text-lg text-gray-400 line-through">
                {formatCurrency(product.compareAtPrice)}
              </span>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {outOfStock ? (
              <Badge tone="danger">Out of stock</Badge>
            ) : lowStock ? (
              <Badge tone="warning">Only {product.stock} left</Badge>
            ) : (
              <Badge tone="success">In stock</Badge>
            )}
            {product.isFeatured ? <Badge tone="accent">Featured</Badge> : null}
            {product.sku ? <Badge tone="neutral">SKU {product.sku}</Badge> : null}
          </div>

          <p className="text-sm leading-relaxed text-gray-600">{product.description}</p>

          <div className="flex flex-wrap items-center gap-3">
            <div>
              <label htmlFor="quantity" className="label">
                Quantity
              </label>
              <select
                id="quantity"
                value={quantity}
                onChange={(event) => setQuantity(Number(event.target.value))}
                className="input w-24"
              >
                {Array.from({ length: Math.min(product.stock || 1, 10) }).map((_, index) => (
                  <option key={index + 1} value={index + 1}>
                    {index + 1}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              size="lg"
              onClick={handleAddToCart}
              isLoading={addToCart.isPending}
              disabled={outOfStock}
              leftIcon="cart"
              className="flex-1"
            >
              {outOfStock ? 'Out of stock' : 'Add to cart'}
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={handleWishlist}
              aria-pressed={inWishlist}
              leftIcon="heart"
              className={classNames(inWishlist && 'border-red-300 text-red-600')}
            >
              {inWishlist ? 'Saved' : 'Add to wishlist'}
            </Button>
          </div>

          <ul className="grid gap-2 border-t border-gray-100 pt-5 text-sm text-gray-600 sm:grid-cols-2">
            <li className="flex items-center gap-2">
              <Icon name="truck" className="h-4 w-4 text-blue-600" />
              Free delivery over {formatCurrency(100)}
            </li>
            <li className="flex items-center gap-2">
              <Icon name="check" className="h-4 w-4 text-emerald-600" />
              30 day returns
            </li>
            <li className="flex items-center gap-2">
              <Icon name="lock" className="h-4 w-4 text-gray-600" />
              Secure checkout
            </li>
            <li className="flex items-center gap-2">
              <Icon name="calendar" className="h-4 w-4 text-gray-600" />
              Added {formatDate(product.createdAt)}
            </li>
          </ul>
        </section>
      </div>

      {/* Reviews */}
      <section className="mt-14" aria-labelledby="reviews-heading">
        <SectionHeading
          title="Customer reviews"
          description={`${product.reviewCount} review(s) for this product`}
        />
        <h2 id="reviews-heading" className="sr-only">
          Customer reviews
        </h2>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {reviewsQuery.isLoading ? (
              <Loading label="Loading reviews" rows={4} />
            ) : reviewsQuery.isError ? (
              <ErrorState error={reviewsQuery.error} onRetry={() => reviewsQuery.refetch()} />
            ) : (reviewsQuery.data ?? []).length === 0 ? (
              <p className="rounded-lg border border-dashed border-gray-300 bg-white p-6 text-sm text-gray-500">
                No reviews yet. Be the first to share your experience.
              </p>
            ) : (
              <ul className="space-y-4">
                {(reviewsQuery.data ?? []).map((review) => (
                  <li key={review.id} className="rounded-lg border border-gray-200 bg-white p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {review.user?.name ?? 'Verified customer'}
                        </p>
                        <Rating value={review.rating} size="sm" showValue={false} />
                      </div>
                      <time className="text-xs text-gray-500" dateTime={review.createdAt}>
                        {formatDate(review.createdAt)}
                      </time>
                    </div>
                    {review.title ? (
                      <p className="mt-2 text-sm font-semibold text-gray-800">{review.title}</p>
                    ) : null}
                    <p className="mt-1 text-sm text-gray-600">{review.comment}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <aside className="h-fit rounded-lg border border-gray-200 bg-white p-5">
            <h3 className="text-base font-semibold text-gray-900">Write a review</h3>

            {!isAuthenticated ? (
              <p className="mt-3 text-sm text-gray-600">
                <Link to="/login" className="font-semibold text-blue-700 hover:underline">
                  Sign in
                </Link>{' '}
                to share your experience with this product.
              </p>
            ) : (
              <form onSubmit={submitReview} className="mt-4 space-y-3">
                <div>
                  <span className="label">Rating</span>
                  <RatingInput value={reviewRating} onChange={setReviewRating} />
                </div>
                <div>
                  <label htmlFor="review-title" className="label">
                    Title <span className="font-normal text-gray-400">(optional)</span>
                  </label>
                  <input
                    id="review-title"
                    value={reviewTitle}
                    onChange={(event) => setReviewTitle(event.target.value)}
                    className="input"
                    placeholder="Sum it up in a few words"
                  />
                </div>
                <FormTextarea
                  label="Your review"
                  required
                  rows={4}
                  value={reviewComment}
                  onChange={(event) => setReviewComment(event.target.value)}
                  placeholder="What did you like or dislike? How did you use it?"
                />
                <Button
                  type="submit"
                  fullWidth
                  disabled={!canReview}
                  isLoading={createReview.isPending}
                >
                  Submit review
                </Button>
                <p className="text-xs text-gray-500">
                  Posting as {user?.name ?? 'customer'}.
                </p>
              </form>
            )}
          </aside>
        </div>
      </section>

      {/* Related */}
      {relatedQuery.data && relatedQuery.data.length > 0 ? (
        <section className="mt-14">
          <SectionHeading title="You may also like" viewAllHref="/products" />
          <ProductGrid products={relatedQuery.data} columns={4} />
        </section>
      ) : null}
    </div>
  );
}

export default ProductDetails;