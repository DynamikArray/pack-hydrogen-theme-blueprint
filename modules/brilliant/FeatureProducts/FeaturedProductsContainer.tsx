import {Product} from '@shopify/hydrogen/storefront-api-types';
/*
import type {BrilliantFeaturedProductsCms} from './FeaturedProducts.types';
import {FeaturedProductCard} from './FeaturedProductCard';
*/

export function FeaturedProductsContainer({
  products,
  cms,
}: {
  products: Product[];
  cms: any;
}) {
  const numberOfProducts = products.length;

  const gridCols = numberOfProducts <= 3 ? 'grid-cols-3' : 'grid-cols-4';
  const mobileGrid =
    cms.displayMode === 'expanded' ? 'grid-cols-1' : 'grid-cols-2';

  return (
    <div className={`grid gap-4 ${mobileGrid} md:${gridCols}`}>
      {/*


      {products.map((product) => (
        <FeaturedProductCard
          key={product.id}
          product={product}
          displayMode={cms.displayMode}
        />
      ))}

    */}
    </div>
  );
}
