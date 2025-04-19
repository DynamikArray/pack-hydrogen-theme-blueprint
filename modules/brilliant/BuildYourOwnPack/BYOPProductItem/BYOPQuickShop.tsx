import {useMemo, useState} from 'react';

import type {BYOPQuickShopProps} from './BYOPProductItem.types';

import {QuantitySelector} from '~/components/QuantitySelector';
import {Svg} from '~/components/Svg';

export function BYOPQuickShop({
  bundle,
  bundleMapById,
  handleAddToBundle,
  handleRemoveFromBundle,
  incrementDisabled,
  product,
  selectedVariant,
}: BYOPQuickShopProps) {
  const [optionsVisible, setOptionsVisible] = useState(false);

  const variantToAdd = useMemo(() => {
    if (!selectedVariant) return undefined;
    return {
      ...selectedVariant,
      image: selectedVariant.image || product?.featuredImage,
    };
  }, [product?.featuredImage, selectedVariant]);

  const quantityInBundle = useMemo(() => {
    return bundle.filter(
      (variant) => variant.product.handle === product?.handle,
    ).length;
  }, [bundle, product]);

  const variantInBundle = bundleMapById[selectedVariant?.id || ''];

  const lastBundleIndexOfVariant =
    variantInBundle?.indexes[variantInBundle?.indexes.length - 1] || -1;

  const qualifiesForQuickShop = useMemo(() => {
    if (!product) return false;

    const initialOptions = product.options;
    const options = initialOptions;

    const hasOnlySingleValueOptions =
      options?.every((option) => {
        return option.optionValues.length === 1;
      }) || false;
    const hasOnlyOneOptionWithMultipleValues =
      options?.reduce((acc, option) => {
        return acc + (option.optionValues.length > 1 ? 1 : 0);
      }, 0) === 1 || false;

    return hasOnlySingleValueOptions || hasOnlyOneOptionWithMultipleValues;
  }, [product]);

  const hasOneVariant = product?.variants?.nodes?.length === 1;

  return qualifiesForQuickShop ? (
    <div className="flex flex-row justify-between gap-2">
      {!quantityInBundle && hasOneVariant && (
        <button
          aria-label={`Add one ${product?.title} to your bundle`}
          className="btn-primary size-9 p-2"
          disabled={!variantToAdd || incrementDisabled}
          onClick={() => {
            if (variantToAdd) handleAddToBundle(variantToAdd);
          }}
          type="button"
        >
          <Svg
            className="w-4 text-current"
            src="/svgs/plus.svg#plus"
            title="Plus"
            viewBox="0 0 24 24"
          />
        </button>
      )}

      {!quantityInBundle && product && !hasOneVariant && !optionsVisible && (
        <button
          aria-label={`Add one ${product?.title} to your bundle`}
          className="btn-primary !size-12 !p-0"
          disabled={!variantToAdd || incrementDisabled}
          onClick={() => setOptionsVisible(true)}
          type="button"
        >
          <Svg
            className="w-4 text-current"
            src="/svgs/plus.svg#plus"
            title="Plus"
            viewBox="0 0 24 24"
          />
        </button>
      )}

      {quantityInBundle > 0 && !optionsVisible && (
        <div className="flex items-center justify-center">
          <QuantitySelector
            disableIncrement={incrementDisabled}
            productTitle={product?.title}
            quantity={quantityInBundle}
            handleDecrement={() =>
              handleRemoveFromBundle(lastBundleIndexOfVariant)
            }
            handleIncrement={() => {
              if (variantToAdd) handleAddToBundle(variantToAdd);
            }}
          />
        </div>
      )}
    </div>
  ) : null;
}

BYOPQuickShop.displayName = 'BYOPQuickShop';
