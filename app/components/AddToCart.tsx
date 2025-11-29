import type {
  AttributeInput,
  SellingPlan,
} from '@shopify/hydrogen/storefront-api-types';
import {useEffect, useMemo} from 'react';

import {LoadingDots} from '~/components/Animations';
import {BackInStockModal} from '~/components/BackInStockModal';
import {useAddToCart} from '~/hooks';
import type {SelectedVariant} from '~/lib/types';

interface AddToCartProps {
  addToCartText?: string;
  attributes?: AttributeInput[];
  className?: string;
  containerClassName?: string;
  enabledInlinePrice?: boolean;
  isPdp?: boolean;
  quantity?: number;
  onAddToCart?: () => void;
  price?: string;
  selectedVariant: SelectedVariant;
  sellingPlanId?: SellingPlan['id'];
  disabled?: boolean;
  lineItemAttributes?: AttributeInput[];
}

export function AddToCart({
  addToCartText = '',
  attributes,
  className = '',
  containerClassName = '',
  enabledInlinePrice,
  isPdp = false,
  quantity = 1,
  onAddToCart,
  price,
  selectedVariant,
  sellingPlanId,
  disabled,
  lineItemAttributes,
}: AddToCartProps) {
  // Merge any "global" attributes with extra line item attributes (e.g. bundle)
  const mergedAttributes = useMemo(
    () => [...(attributes ?? []), ...(lineItemAttributes ?? [])],
    [attributes, lineItemAttributes],
  );

  const {
    buttonText,
    cartIsUpdating,
    isAdded,
    isAdding,
    isNotifyMe,
    isSoldOut,
    subtext,
    handleAddToCart,
    handleNotifyMe,
  } = useAddToCart({
    addToCartText,
    attributes: mergedAttributes,
    quantity,
    selectedVariant,
    sellingPlanId,
  });

  useEffect(() => {
    if (isAdded && onAddToCart) {
      onAddToCart();
    }
  }, [isAdded, onAddToCart]);

  const isUpdatingClass = isAdding || cartIsUpdating ? 'cursor-default' : '';
  const isNotifyMeClass = isNotifyMe ? 'btn-inverse-dark' : 'btn-primary';

  const isButtonDisabled =
    (!!isSoldOut && !isNotifyMe) || !!disabled || isAdding || cartIsUpdating;

  return (
    <div className={`${containerClassName}`}>
      <button
        aria-label={buttonText}
        className={`${isNotifyMeClass} relative w-full ${isUpdatingClass} ${className}`}
        disabled={isButtonDisabled}
        onClick={() => {
          if (isNotifyMe) {
            handleNotifyMe(
              <BackInStockModal selectedVariant={selectedVariant} />,
            );
          } else {
            handleAddToCart();
          }
        }}
        type="button"
      >
        <span className={`${isAdding || isAdded ? 'invisible' : 'visible'}`}>
          {buttonText}
          {!isSoldOut && (
            <span className="font-normal">
              {enabledInlinePrice && price ? ` - ${price}` : ''}
            </span>
          )}
        </span>

        {isAdding && (
          <LoadingDots
            status="Adding to cart"
            withAbsolutePosition
            withStatusRole
          />
        )}

        {isAdded && (
          <span aria-live="assertive" className="absolute-center" role="status">
            Added To Cart
          </span>
        )}
      </button>

      {isPdp && subtext && (
        <p className="mt-1 text-center text-xs">{subtext}</p>
      )}
    </div>
  );
}

AddToCart.displayName = 'AddToCart';
