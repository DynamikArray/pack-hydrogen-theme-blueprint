import {Product} from '@shopify/hydrogen/storefront-api-types';

import {getPriorityTag} from './tagPriority';

import type {ProductCms} from '~/lib/types';

export function FeaturedProductCard({
  product,
  displayMode,
}: {
  product: Product;
  displayMode: 'expanded' | 'normal';
}) {
  const priorityTag = getPriorityTag(product.tags);

  return (
    <div className="relative rounded-md border bg-white p-4 shadow-sm">
      {priorityTag && (
        <div className="absolute right-2 top-2 rounded-full bg-primary px-2 py-1 text-xs text-white">
          {priorityTag}
        </div>
      )}
      <h3 className="text-lg font-semibold">{product.title}</h3>

      {displayMode === 'expanded' && product.extraDescription && (
        <p className="mt-2 text-sm text-gray-600">{product.extraDescription}</p>
      )}
    </div>
  );
}
