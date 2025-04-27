import {useMemo} from 'react';
import {useInView} from 'react-intersection-observer';

import {Schema} from './FeaturedSlider.schema';
import type {FeaturedSliderCms} from './FeaturedSlider.types';

import {Container} from '~/components/Container';
import {useProductsByIds} from '~/hooks';
import type {ContainerSettings} from '~/settings/container';

export function FeaturedSlider({
  cms,
}: {
  cms: FeaturedSliderCms & {container: ContainerSettings};
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
        <div> hello world</div>
      </div>
    </Container>
  );
}

FeaturedSlider.displayName = 'FeaturedSlider';
FeaturedSlider.Schema = Schema;
