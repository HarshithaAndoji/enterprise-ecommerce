import { Link } from 'react-router-dom';
import {
  Button,
  ErrorState,
  Icon,
  LinkButton,
  Loading,
  ProductImage,
  SectionHeading,
} from '../../components/common';
import ProductGrid from '../../features/products/ProductGrid';
import { useCategories } from '../../features/categories/useCategories';
import {
  useFeaturedProducts,
  usePopularProducts,
  useRecentlyAdded,
} from '../../features/products/useProducts';
import { useAppDispatch } from '../../store/store';
import { showToast } from '../../store/slices/uiSlice';
import { classNames } from '../../utils';
// Placeholder marketing copy: swap for CMS content once the backend is live.
import { devHero, devPromoBanners } from '../../services/dev/mockData';
import type { UseQueryResult } from '@tanstack/react-query';
import type { Product } from '../../types';

interface ProductSectionProps {
  title: string;
  description?: string;
  eyebrow?: string;
  viewAllHref: string;
  viewAllLabel: string;
  query: UseQueryResult<Product[], unknown>;
}

function ProductSection({
  title,
  description,
  eyebrow,
  viewAllHref,
  viewAllLabel,
  query,
}: ProductSectionProps) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <SectionHeading
        title={title}
        description={description}
        eyebrow={eyebrow}
        viewAllHref={viewAllHref}
        viewAllLabel={viewAllLabel}
      />
      {query.isLoading ? (
        <Loading variant="cards" label={`Loading ${title.toLowerCase()}`} />
      ) : query.isError ? (
        <ErrorState error={query.error} onRetry={() => query.refetch()} />
      ) : (
        <ProductGrid products={query.data ?? []} />
      )}
    </section>
  );
}

/** Storefront landing page. */
export function Home() {
  const dispatch = useAppDispatch();
  const categories = useCategories();
  const featured = useFeaturedProducts();
  const popular = usePopularProducts();
  const recent = useRecentlyAdded();

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gray-900">
        <div className="absolute inset-0">
          <ProductImage
            src={devHero.image}
            alt=""
            loading="eager"
            className="h-full w-full object-cover opacity-35"
          />
        </div>
        <div className="relative mx-auto flex max-w-7xl flex-col gap-6 px-4 py-20 sm:px-6 lg:py-28">
          <p className="inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-blue-200">
            <Icon name="sparkles" className="h-4 w-4" />
            New season arrivals
          </p>
          <h1 className="max-w-2xl text-3xl font-bold leading-tight text-white sm:text-5xl">
            {devHero.title}
          </h1>
          <p className="max-w-xl text-base text-gray-300 sm:text-lg">{devHero.subtitle}</p>
          <div className="flex flex-wrap gap-3">
            <LinkButton to={devHero.cta.to} size="lg" rightIcon="arrow-right">
              {devHero.cta.label}
            </LinkButton>
            <LinkButton
              to={devHero.secondaryCta.to}
              size="lg"
              variant="outline"
              className="border-white/40 bg-transparent text-white hover:bg-white/10"
            >
              {devHero.secondaryCta.label}
            </LinkButton>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <SectionHeading
          title="Shop by category"
          description="Curated departments covering everything from audio to home."
          viewAllHref="/products"
          viewAllLabel="Browse all"
        />
        {categories.isLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="aspect-square animate-pulse rounded-lg bg-gray-200"
                aria-hidden="true"
              />
            ))}
          </div>
        ) : categories.isError ? (
          <ErrorState error={categories.error} onRetry={() => categories.refetch()} />
        ) : (
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {(categories.data ?? []).map((category) => (
              <li key={category.id}>
                <Link
                  to={`/categories/${category.slug}`}
                  className="group block overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="aspect-square overflow-hidden bg-gray-100">
                    <ProductImage
                      src={category.image}
                      alt={category.name}
                      seed={category.slug}
                      className="transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-3">
                    <h3 className="truncate text-sm font-semibold text-gray-900">
                      {category.name}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {category.productCount ?? 0} product(s)
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <ProductSection
        eyebrow="Handpicked"
        title="Featured products"
        description="Our editorial picks, refreshed every week."
        viewAllHref="/products?sort=rating"
        viewAllLabel="See all"
        query={featured}
      />

      {/* Promotion */}
      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <ul className="grid gap-4 md:grid-cols-2">
          {devPromoBanners.map((promo) => (
            <li
              key={promo.id}
              className={classNames(
                'relative overflow-hidden rounded-xl p-8',
                promo.tone === 'dark' ? 'bg-gray-900 text-white' : 'bg-blue-700 text-white',
              )}
            >
              <div className="relative z-10 max-w-sm">
                <p className="text-4xl font-bold">{promo.discount}</p>
                <h3 className="mt-2 text-lg font-semibold">{promo.title}</h3>
                <p className="mt-1 text-sm text-white/80">{promo.subtitle}</p>
                <p className="mt-4 inline-flex items-center gap-2 rounded-lg bg-white/15 px-3 py-1.5 text-xs font-semibold">
                  <Icon name="tag" className="h-4 w-4" />
                  Use code {promo.code}
                </p>
              </div>
              <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10" />
              <div className="absolute -bottom-12 -left-6 h-32 w-32 rounded-full bg-white/10" />
            </li>
          ))}
        </ul>
      </section>

      <ProductSection
        eyebrow="Trending"
        title="Popular right now"
        description="What other customers are buying most often."
        viewAllHref="/products?sort=popular"
        viewAllLabel="See all"
        query={popular}
      />

      <ProductSection
        eyebrow="Just in"
        title="Recently added"
        description="The newest additions to the catalogue."
        viewAllHref="/products?sort=newest"
        viewAllLabel="See all"
        query={recent}
      />

      {/* Newsletter */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="rounded-xl bg-gray-900 px-6 py-12 text-center sm:px-12">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            Get 10% off your first order
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-gray-300">
            Join the newsletter for early access to sales, product drops and
            practical buying guides. No spam, unsubscribe any time.
          </p>
          <div className="mx-auto mt-6 flex max-w-md flex-col gap-3 sm:flex-row">
            <label htmlFor="home-newsletter" className="sr-only">
              Email address
            </label>
            <input
              id="home-newsletter"
              type="email"
              placeholder="you@example.com"
              className="w-full rounded-md border border-transparent px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <Button
              size="lg"
              onClick={() =>
                dispatch(
                  showToast({ message: 'You are on the list. Welcome aboard!', type: 'success' }),
                )
              }
            >
              Subscribe
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}

export default Home;