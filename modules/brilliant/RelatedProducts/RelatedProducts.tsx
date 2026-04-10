import {Product} from '@shopify/hydrogen/storefront-api-types';
import {useMemo} from 'react';
import {useInView} from 'react-intersection-observer';

import type {RelatedProductsCmsLink} from './RelatedProducts.types';
import {RelatedProductsContainer} from './RelatedProductsContainer';

import {useProductMetafields, useProductsByIds} from '~/hooks';
import type {MetafieldIdentifier} from '~/lib/types';

const RELATED_PRODUCTS_METAFIELD_IDENTIFIERS: MetafieldIdentifier[] = [
  {namespace: 'custom', key: 'related_products'},
  {namespace: 'custom', key: 'related_products_heading'},
  {namespace: 'custom', key: 'related_products_link'},
  {namespace: 'custom', key: 'related_products_design'},
];

const DEFAULT_LINK: RelatedProductsCmsLink = {
  url: '/collections/all',
  text: 'View All',
  newTab: false,
  type: 'isPage',
};

const isProductGid = (value: unknown): value is string => {
  return (
    typeof value === 'string' && value.startsWith('gid://shopify/Product/')
  );
};

const parseRelatedProductIds = (
  rawValue: string | undefined | null,
): string[] => {
  if (!rawValue) return [];

  try {
    const parsedValue = JSON.parse(rawValue);

    if (Array.isArray(parsedValue)) {
      return [...new Set(parsedValue.filter(isProductGid))];
    }

    if (isProductGid(parsedValue)) {
      return [parsedValue];
    }
  } catch (error) {
    if (isProductGid(rawValue)) {
      return [rawValue];
    }
  }

  return [];
};

const parseLink = (
  rawValue: string | undefined | null,
): RelatedProductsCmsLink => {
  const value = rawValue?.trim();
  if (!value) return DEFAULT_LINK;

  if (value.startsWith('mailto:')) {
    return {
      url: value,
      text: 'View All',
      newTab: false,
      type: 'isEmail',
    };
  }

  if (value.startsWith('tel:')) {
    return {
      url: value,
      text: 'View All',
      newTab: false,
      type: 'isPhone',
    };
  }

  if (value.startsWith('http://') || value.startsWith('https://')) {
    return {
      url: value,
      text: 'View All',
      newTab: true,
      type: 'isExternal',
    };
  }

  return {
    url: value,
    text: 'View All',
    newTab: false,
    type: 'isPage',
  };
};

const parseDesign = (
  rawValue: string | undefined | null,
): 'expanded' | 'normal' => {
  if (!rawValue) return 'normal';

  const normalizedRaw = rawValue.trim().toLowerCase();
  if (normalizedRaw === 'expanded') return 'expanded';

  try {
    const parsedValue = JSON.parse(rawValue);

    if (typeof parsedValue === 'string') {
      return parsedValue.trim().toLowerCase() === 'expanded'
        ? 'expanded'
        : 'normal';
    }

    if (Array.isArray(parsedValue)) {
      const firstValue = parsedValue.find(
        (value): value is string => typeof value === 'string',
      );
      return firstValue?.trim().toLowerCase() === 'expanded'
        ? 'expanded'
        : 'normal';
    }
  } catch (error) {
    return 'normal';
  }

  return 'normal';
};

export function RelatedProducts({product}: {product: Product}) {
  const {ref, inView} = useInView({
    rootMargin: '200px',
    triggerOnce: true,
  });

  const metafields = useProductMetafields(
    product.handle,
    RELATED_PRODUCTS_METAFIELD_IDENTIFIERS,
  );

  const relatedProductIds = useMemo(() => {
    return parseRelatedProductIds(
      metafields?.['custom.related_products']?.value,
    );
  }, [metafields]);

  const relatedProducts = useProductsByIds(relatedProductIds, inView);

  const heading = useMemo(() => {
    const metafieldHeading =
      metafields?.['custom.related_products_heading']?.value?.trim();
    return metafieldHeading || 'Related Products';
  }, [metafields]);

  const design = useMemo(() => {
    return parseDesign(metafields?.['custom.related_products_design']?.value);
  }, [metafields]);

  const link = useMemo(() => {
    return parseLink(metafields?.['custom.related_products_link']?.value);
  }, [metafields]);

  if (!relatedProductIds.length) return null;

  return (
    <section className="mt-4 w-full bg-white py-4" ref={ref}>
      <div className="mx-auto max-w-screen-xl">
        <RelatedProductsContainer
          products={relatedProducts}
          cms={{heading, design, link}}
        />
      </div>
    </section>
  );
}
