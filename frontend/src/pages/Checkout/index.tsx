import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Badge,
  Button,
  EmptyState,
  ErrorState,
  Icon,
  LinkButton,
  Loading,
  ProductImage,
  StatusBadge,
} from '../../components/common';
import { FormInput } from '../../components/forms/FormInput';
import { FormTextarea } from '../../components/forms/FormTextarea';
import { useCart } from '../../features/cart/useCart';
import { useCreateOrder } from '../../features/orders/useOrders';
import { useAppSelector } from '../../store/store';
import { calculateCartTotals, classNames, formatCurrency, formatDate } from '../../utils';
import type { Address, Order, PaymentMethod } from '../../types';

const STEPS = ['Shipping', 'Summary', 'Payment'] as const;

const PAYMENT_OPTIONS: Array<{ value: PaymentMethod; label: string; description: string }> = [
  { value: 'card', label: 'Credit or debit card', description: 'Visa, Mastercard, Amex' },
  { value: 'paypal', label: 'PayPal', description: 'Redirects to PayPal on confirm' },
  { value: 'bank_transfer', label: 'Bank transfer', description: 'Account details sent by email' },
  { value: 'cod', label: 'Cash on delivery', description: 'Pay the courier when it arrives' },
];

interface AddressErrors {
  [field: string]: string | undefined;
}

function validateAddress(address: Address): AddressErrors {
  const errors: AddressErrors = {};
  if (!address.firstName.trim()) errors.firstName = 'Required';
  if (!address.lastName.trim()) errors.lastName = 'Required';
  if (!address.addressLine1.trim()) errors.addressLine1 = 'Required';
  if (!address.city.trim()) errors.city = 'Required';
  if (!address.state.trim()) errors.state = 'Required';
  if (!/^\d{4,10}$/.test(address.postalCode.trim()))
    errors.postalCode = 'Enter a valid postal code';
  if (!address.country.trim()) errors.country = 'Required';
  return errors;
}

const EMPTY_ADDRESS: Address = {
  firstName: '',
  lastName: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  postalCode: '',
  country: '',
  phone: '',
};

/** Multi-step checkout: shipping address, review, payment and confirmation. */
export function Checkout() {
  const navigate = useNavigate();
  const { cart, isLoading, isError, error, refetch } = useCart();
  const createOrder = useCreateOrder();
  const user = useAppSelector((state) => state.auth.user);

  const [step, setStep] = useState(0);
  const [address, setAddress] = useState<Address>(() => ({
    ...EMPTY_ADDRESS,
    firstName: user?.name?.split(' ')[0] ?? '',
    lastName: user?.name?.split(' ').slice(1).join(' ') ?? '',
  }));
  const [addressErrors, setAddressErrors] = useState<AddressErrors>({});
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [notes, setNotes] = useState('');
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);

  const totals = useMemo(() => calculateCartTotals(cart.items), [cart.items]);

  const updateAddress = (field: keyof Address, value: string) =>
    setAddress((current) => ({ ...current, [field]: value }));

  const submitShipping = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const errors = validateAddress(address);
    setAddressErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setStep(1);
  };

  const placeOrder = () => {
    createOrder.mutate(
      {
        items: cart.items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
        shippingAddress: address,
        paymentMethod,
        notes: notes.trim() || undefined,
      },
      { onSuccess: (order) => setPlacedOrder(order) },
    );
  };

  if (placedOrder) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <div className="rounded-xl border border-emerald-200 bg-white p-8 text-center shadow-sm">
          <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <Icon name="check" className="h-7 w-7" />
          </span>
          <h1 className="text-2xl font-bold text-gray-900">Order confirmed</h1>
          <p className="mt-2 text-sm text-gray-600">
            Thanks{user?.name ? `, ${user.name.split(' ')[0]}` : ''}! Your order{' '}
            <span className="font-semibold text-gray-900">{placedOrder.orderNumber}</span> is
            now being prepared. A confirmation email is on its way.
          </p>

          <dl className="mx-auto mt-6 grid max-w-md gap-2 rounded-lg bg-gray-50 p-4 text-left text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-600">Order total</dt>
              <dd className="font-semibold text-gray-900">
                {formatCurrency(placedOrder.total)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Payment method</dt>
              <dd className="font-medium capitalize text-gray-900">
                {placedOrder.paymentMethod.replace('_', ' ')}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Status</dt>
              <dd>
                <StatusBadge status={placedOrder.status} />
              </dd>
            </div>
          </dl>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <LinkButton to={`/orders/${placedOrder.id}`} rightIcon="arrow-right">
              View order
            </LinkButton>
            <LinkButton to="/products" variant="outline">
              Continue shopping
            </LinkButton>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <Loading label="Preparing checkout" rows={5} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <ErrorState error={error} onRetry={() => refetch()} />
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <EmptyState
          title="Nothing to check out"
          description="Add a few items to your cart first."
          icon="cart"
          action={<LinkButton to="/products">Browse products</LinkButton>}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Checkout</h1>
        <nav aria-label="Checkout progress" className="mt-4">
          <ol className="flex flex-wrap items-center gap-2 text-sm">
            {STEPS.map((label, index) => (
              <li key={label} className="flex items-center gap-2">
                <span
                  aria-current={index === step ? 'step' : undefined}
                  className={classNames(
                    'flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold',
                    index < step
                      ? 'bg-emerald-600 text-white'
                      : index === step
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-600',
                  )}
                >
                  {index < step ? <Icon name="check" className="h-4 w-4" /> : index + 1}
                </span>
                <span
                  className={classNames(
                    'font-medium',
                    index === step ? 'text-gray-900' : 'text-gray-500',
                  )}
                >
                  {label}
                </span>
                {index < STEPS.length - 1 ? (
                  <Icon name="chevron-right" className="h-4 w-4 text-gray-300" />
                ) : null}
              </li>
            ))}
          </ol>
        </nav>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <section aria-label="Checkout form" className="rounded-lg border border-gray-200 bg-white p-5">
          {step === 0 ? (
            <form onSubmit={submitShipping} noValidate className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Shipping address</h2>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormInput
                  label="First name"
                  required
                  value={address.firstName}
                  error={addressErrors.firstName}
                  onChange={(event) => updateAddress('firstName', event.target.value)}
                />
                <FormInput
                  label="Last name"
                  required
                  value={address.lastName}
                  error={addressErrors.lastName}
                  onChange={(event) => updateAddress('lastName', event.target.value)}
                />
              </div>

              <FormInput
                label="Address line 1"
                required
                value={address.addressLine1}
                error={addressErrors.addressLine1}
                onChange={(event) => updateAddress('addressLine1', event.target.value)}
              />
              <FormInput
                label="Address line 2 (optional)"
                value={address.addressLine2}
                onChange={(event) => updateAddress('addressLine2', event.target.value)}
              />

              <div className="grid gap-4 sm:grid-cols-3">
                <FormInput
                  label="City"
                  required
                  value={address.city}
                  error={addressErrors.city}
                  onChange={(event) => updateAddress('city', event.target.value)}
                />
                <FormInput
                  label="State / Region"
                  required
                  value={address.state}
                  error={addressErrors.state}
                  onChange={(event) => updateAddress('state', event.target.value)}
                />
                <FormInput
                  label="Postal code"
                  required
                  value={address.postalCode}
                  error={addressErrors.postalCode}
                  onChange={(event) => updateAddress('postalCode', event.target.value)}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormInput
                  label="Country"
                  required
                  value={address.country}
                  error={addressErrors.country}
                  onChange={(event) => updateAddress('country', event.target.value)}
                />
                <FormInput
                  label="Phone (optional)"
                  type="tel"
                  value={address.phone}
                  onChange={(event) => updateAddress('phone', event.target.value)}
                />
              </div>

              <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
                <Button variant="ghost" onClick={() => navigate('/cart')}>
                  Back to cart
                </Button>
                <Button type="submit" rightIcon="arrow-right">
                  Continue to summary
                </Button>
              </div>
            </form>
          ) : null}

          {step === 1 ? (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Review your order</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Confirm the items and totals before choosing a payment method.
                </p>
              </div>

              <ul className="divide-y divide-gray-100 rounded-lg border border-gray-100">
                {cart.items.map((item) => (
                  <li key={item.id} className="flex items-center gap-4 p-3">
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-md bg-gray-100">
                      <ProductImage
                        src={item.product.images[0]}
                        alt={item.product.name}
                        seed={item.product.slug || item.product.id}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900">
                        {item.product.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        Qty {item.quantity} &middot; {formatCurrency(item.price ?? item.product.price)}{' '}
                        each
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">
                      {formatCurrency((item.price ?? item.product.price) * item.quantity)}
                    </p>
                  </li>
                ))}
              </ul>

              <div className="rounded-lg bg-gray-50 p-4 text-sm">
                <p className="font-semibold text-gray-900">Delivering to</p>
                <address className="mt-1 not-italic text-gray-600">
                  {address.firstName} {address.lastName}, {address.addressLine1}
                  {address.addressLine2 ? `, ${address.addressLine2}` : ''}, {address.city},{' '}
                  {address.state} {address.postalCode}, {address.country}
                </address>
              </div>

              <FormTextarea
                label="Delivery notes (optional)"
                rows={3}
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Gate code, preferred delivery window, ..."
              />

              <div className="flex justify-between gap-3 border-t border-gray-100 pt-4">
                <Button variant="ghost" onClick={() => setStep(0)}>
                  Back to address
                </Button>
                <Button onClick={() => setStep(2)} rightIcon="arrow-right">
                  Continue to payment
                </Button>
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Payment method</h2>
                <p className="mt-1 text-sm text-gray-500">
                  This is a reference checkout - no card details are collected.
                </p>
              </div>

              <fieldset className="space-y-3">
                <legend className="sr-only">Choose a payment method</legend>
                {PAYMENT_OPTIONS.map((option) => (
                  <label
                    key={option.value}
                    className={classNames(
                      'flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition',
                      paymentMethod === option.value
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300',
                    )}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={option.value}
                      checked={paymentMethod === option.value}
                      onChange={() => setPaymentMethod(option.value)}
                      className="mt-1 h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>
                      <span className="block text-sm font-semibold text-gray-900">
                        {option.label}
                      </span>
                      <span className="block text-xs text-gray-500">{option.description}</span>
                    </span>
                  </label>
                ))}
              </fieldset>

              <p className="flex items-center gap-2 rounded-md bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
                <Icon name="lock" className="h-4 w-4" />
                Payment details are handled by the backend gateway in production.
              </p>

              {createOrder.isError ? (
                <ErrorState error={createOrder.error} onRetry={placeOrder} />
              ) : null}

              <div className="flex justify-between gap-3 border-t border-gray-100 pt-4">
                <Button variant="ghost" onClick={() => setStep(1)}>
                  Back to summary
                </Button>
                <Button onClick={placeOrder} isLoading={createOrder.isPending} size="lg">
                  Place order &middot; {formatCurrency(totals.total)}
                </Button>
              </div>
            </div>
          ) : null}
        </section>

        <aside className="h-fit space-y-4 lg:sticky lg:top-32 lg:self-start">
          <section aria-label="Order totals" className="rounded-lg border border-gray-200 bg-white p-5">
            <h2 className="text-base font-semibold text-gray-900">Totals</h2>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-600">Subtotal</dt>
                <dd className="font-medium text-gray-900">{formatCurrency(totals.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Tax (8%)</dt>
                <dd className="font-medium text-gray-900">{formatCurrency(totals.tax)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Delivery</dt>
                <dd className="font-medium text-gray-900">
                  {totals.shipping === 0 ? 'Free' : formatCurrency(totals.shipping)}
                </dd>
              </div>
              <div className="flex justify-between border-t border-gray-100 pt-2 text-base">
                <dt className="font-semibold text-gray-900">Total</dt>
                <dd className="font-bold text-gray-900">{formatCurrency(totals.total)}</dd>
              </div>
            </dl>
          </section>

          <section className="rounded-lg border border-gray-200 bg-white p-5 text-sm">
            <h2 className="text-base font-semibold text-gray-900">Order placed on</h2>
            <p className="mt-1 text-gray-500">{formatDate(new Date())}</p>
            <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
              <Badge tone="info">Encrypted</Badge>
              <Badge tone="neutral">{cart.items.length} line item(s)</Badge>
            </div>
          </section>
        </aside>
      </div>

      <p className="mt-6 text-center text-xs text-gray-500">
        Prefer to review first?{' '}
        <Link to="/cart" className="font-semibold text-blue-700 hover:underline">
          Back to cart
        </Link>
      </p>
    </div>
  );
}

export default Checkout;