import {Product} from '@shopify/hydrogen/storefront-api-types';
import {useMemo} from 'react';

import {ProductItemPrice} from '../../brilliant/ProductItem/ProductItemPrice';
import {AddToCart} from '../AddToCart/AddToCart';

import {getPriorityTag} from './tagPriority';

import {ProductItemMedia} from '~/components/ProductItem/ProductItemMedia';
import {Card} from '~/components/ui/card';
import {useParsedProductMetafields} from '~/hooks';
import {SelectedVariant} from '~/lib/types';

//import type {ProductCms} from '~/lib/types';

export function FeaturedSliderCard({
  product,
  design,
}: {
  product: Product;
  design: 'expanded' | 'normal';
}) {
  const priorityTag = getPriorityTag(product.tags);

  const selectedVariant = useMemo((): SelectedVariant => {
    return product?.variants?.nodes?.[0];
  }, [product]);

  const metafields = useParsedProductMetafields(product);

  const productExtraDescription = useMemo(
    () => metafields?.['custom.featured_description']?.value,
    [metafields],
  );

  return (
    <Card className="flex h-full flex-col overflow-hidden rounded-md border bg-white">
      {/* Top section: Product Image */}
      <div className="relative">
        {priorityTag && design === 'expanded' && (
          <div className="absolute left-2 top-2 z-10 rounded-full bg-primary px-2 py-1 text-xs text-white">
            {priorityTag}
          </div>
        )}

        <ProductItemMedia
          hasGrouping={false}
          selectedProduct={product}
          selectedVariant={selectedVariant}
        />
      </div>

      {/* Bottom section: Content */}
      <div className="flex flex-1 flex-col p-3">
        {design === 'normal' && product.title && (
          <h3 className="text-base font-normal">{product.title}</h3>
        )}

        {design === 'expanded' && product.title && (
          <h3 className="text-lg font-semibold">{product.title}</h3>
        )}

        {design === 'expanded' && productExtraDescription && (
          <p className="mt-1 text-sm text-gray-600">
            {productExtraDescription}
          </p>
        )}

        {/* Push the price/cart to bottom */}
        <div className="flex-1" />

        <div className="flex flex-row items-center justify-between pt-2">
          <div
            className={`${design === 'expanded' ? 'text-lg' : 'text-sm'}  font-bold`}
          >
            <ProductItemPrice selectedVariant={selectedVariant} />
          </div>
          <div>
            <AddToCart
              size={`${design === 'expanded' ? 'default' : 'sm'}`}
              addToCartText="Add to Cart"
              selectedVariant={selectedVariant}
            />
          </div>
        </div>
      </div>
    </Card>
  );
}
