import type {ProductVariant} from '@shopify/hydrogen-react/storefront-api-types';
import {useEffect, useMemo, useState} from 'react';
import {useInView} from 'react-intersection-observer';

import type {BYOPProductItemProps} from './BYOPProductItem.types';
import {BYOPProductItemMedia} from './BYOPProductItemMedia';
import {BYOPQuickShop} from './BYOPQuickShop';

import {useProductByHandle} from '~/hooks';
import {COLOR_OPTION_NAME} from '~/lib/constants';

export function BYOPProductItem({
  bundle,
  bundleMapById,
  handle,
  index,
  incrementDisabled,
  handleRemoveFromBundle,
  handleAddToBundle,
}: BYOPProductItemProps) {
  const {ref, inView} = useInView({
    rootMargin: '400px',
    triggerOnce: true,
  });
  const product = useProductByHandle(handle, inView);

  const [selectedVariant, setSelectedVariant] = useState<
    ProductVariant | undefined
  >(product?.variants?.nodes?.[0]);

  const primaryOptionValue = useMemo(() => {
    if (!product) return null;
    return (
      product.options.find((option) => option.name === COLOR_OPTION_NAME)
        ?.optionValues?.[0] || null
    );
  }, [product]);

  const isSoldOut = useMemo(() => {
    return (
      !!product &&
      product.variants.nodes.every((variant) => !variant.availableForSale)
    );
  }, [product]);

  /* Default BYOB item logic only set up for selecting the first variant
   * if an options selector is needed, change selectedVariant to a useState and add in an options selector below
   */
  const isSecondCol = index % 2 === 1;
  const isThirdCol = index % 3 === 2;
  const isFourthCol = index % 4 === 3;

  useEffect(() => {
    if (!product) return;
    setSelectedVariant(product?.variants?.nodes?.[0]);
  }, [product]);

  // grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4

  return (
    <div
      className={`flex h-full flex-col rounded-lg border-2 border-gray-200`}
      ref={ref}
    >
      <BYOPProductItemMedia
        media={product?.media?.nodes}
        productTitle={product?.title}
      />

      <div className="flex flex-1 flex-col justify-between gap-2.5 px-2.5 pb-5 pt-2.5">
        <div className="text-center">
          <h3 className="text-h5">{product?.title}</h3>

          {primaryOptionValue && (
            <p className="text-sm">{primaryOptionValue.name}</p>
          )}
        </div>

        <div className="flex min-h-12 w-full flex-col items-center">
          {isSoldOut ? (
            <button
              disabled
              type="button"
              className="btn-primary !h-12 !py-0 text-sm"
            >
              Sold Out
            </button>
          ) : (
            <BYOPQuickShop
              bundle={bundle}
              bundleMapById={bundleMapById}
              incrementDisabled={incrementDisabled}
              handleRemoveFromBundle={handleRemoveFromBundle}
              handleAddToBundle={handleAddToBundle}
              product={product}
              selectedVariant={selectedVariant}
            />
          )}
        </div>
      </div>
    </div>
  );
}

BYOPProductItem.displayName = 'BYOPProductItem';
