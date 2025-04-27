import {useMemo} from 'react';
import {useInView} from 'react-intersection-observer';

import {Schema} from './BrilliantProductsSlider.schema';

import {Container} from '~/components/Container';
import {ProductsSlider as ProductsSliderComponent} from '~/components/ProductsSlider';
import type {ProductsSliderCms} from '~/components/ProductsSlider';
import {useProductsByIds} from '~/hooks';
import type {ContainerSettings} from '~/settings/container';

export function BrilliantProductsSlider({
  cms,
}: {
  cms: ProductsSliderCms & {container: ContainerSettings};
}) {
  const {ref, inView} = useInView({
    rootMargin: '200px',
    triggerOnce: true,
  });

  const productIds = useMemo(() => {
    return (
      cms.products?.reduce((acc: string[], {product}) => {
        if (!product?.id) return acc;
        return [...acc, product.id];
      }, []) || []
    );
  }, [cms.products]);

  const products = useProductsByIds(productIds, inView);

  return (
    <Container container={cms.container}>
      <div ref={ref}>
        <ProductsSliderComponent cms={cms} products={products} />
      </div>
    </Container>
  );
}

BrilliantProductsSlider.displayName = 'BrilliantProductsSlider';
BrilliantProductsSlider.Schema = Schema;
