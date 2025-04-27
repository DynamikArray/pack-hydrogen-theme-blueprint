import {useMemo} from 'react';
import {useInView} from 'react-intersection-observer';

import {Schema} from './FeaturedProducts.schema';
import {FeaturedProductsCms} from './FeaturedProducts.types';
import {FeaturedProductsContainer} from './FeaturedProductsContainer';

import {Container} from '~/components/Container';
import {useProductsByIds} from '~/hooks';
import type {ContainerSettings} from '~/settings/container';

export function FeaturedProducts({
  cms,
}: {
  cms: FeaturedProductsCms & {container: ContainerSettings};
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
        <FeaturedProductsContainer products={products} cms={cms} />
      </div>
    </Container>
  );
}

FeaturedProducts.displayName = 'FeaturedProducts';
FeaturedProducts.Schema = Schema;
