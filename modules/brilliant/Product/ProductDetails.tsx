import {ProductOptionValue} from '@shopify/hydrogen/storefront-api-types';
import {useProduct} from '@shopify/hydrogen-react';
import {QuantitySelector} from 'modules/brilliant/components/QuantitySelector';
import {useCallback, useEffect, useMemo, useState} from 'react';

import {BundleSelection} from '../Bundle/BundleConfig.types';
import {BundlePicker} from '../Bundle/BundlePicker';

import type {
  ProductDetailsProps,
  ProductOptionVariantImageMap,
} from './Product.types';
import {ProductOptions} from './ProductOptions/ProductOptions';

import {AddToCart} from '~/components/AddToCart';
import {useColorSwatches} from '~/hooks';

const sizes = ['Small /', 'Medium /', 'Large /'];

export function ProductDetails({
  enabledQuantitySelector,
  isModalProduct,
  product,
  selectedVariant,
  bundleConfig,
}: ProductDetailsProps) {
  const {setSelectedOption} = useProduct();
  const swatchesMap = useColorSwatches();

  const [quantity, setQuantity] = useState(1);

  //Brilliant Bundle Handling
  const [bundleSelection, setBundleSelection] =
    useState<BundleSelection | null>(null);

  const hasBundle =
    !!bundleConfig &&
    bundleConfig.enabled &&
    bundleConfig.requiredCount > 0 &&
    bundleConfig.options.length > 0;

  const isBundleIncomplete = hasBundle && !bundleSelection?.isComplete;
  const lineItemAttributes = bundleSelection?.attributes ?? [];
  // END Brilliant Bundle Handling

  const selectedOptionsMap = useMemo(() => {
    if (!selectedVariant) return null;
    return selectedVariant.selectedOptions.reduce(
      (acc: Record<string, string>, {name, value}) => ({...acc, [name]: value}),
      {},
    );
  }, [selectedVariant]);

  const handleDecrement = useCallback(() => {
    if (quantity === 1) return;
    setQuantity(quantity - 1);
  }, [quantity]);

  const handleIncrement = useCallback(() => {
    setQuantity(quantity + 1);
  }, [quantity]);

  useEffect(() => {
    if (!enabledQuantitySelector) return undefined;
    return () => {
      setQuantity(1);
    };
  }, [enabledQuantitySelector]);

  const hideOptions =
    product.variants?.nodes?.length === 1 &&
    product.variants?.nodes?.[0]?.title === 'Default Title';

  const stripSizes = useCallback((title: string) => {
    // 1) remove each size-marker
    let result = title;
    sizes.forEach((size) => {
      result = result.replaceAll(size, '');
    });
    return result
      .split(' ')
      .filter((token) => token !== '')
      .join(' ');
  }, []);

  const optionsImageVariantMap = useMemo<ProductOptionVariantImageMap>(() => {
    // 1. Flatten all option‐values
    const allValues = product.options.flatMap((o) => o.optionValues);

    // 2. Build a quick lookup by exact name
    const nameLookup = new Map<string, ProductOptionValue>(
      allValues.map((v) => [v.name, v]),
    );
    // 3. Reduce variants into a map of optionValueId → image
    return product.variants.nodes.reduce((map, variant) => {
      // try exact match
      //Lets remove our size strings from the title to see how that plays out?
      // const match = nameLookup.get(stripSizes(variant.title));
      const match = nameLookup.get(variant.title);

      // fallback to fuzzy match if needed
      /*
      if (!match) {
        match = allValues.find(
          (v) =>
            v.name.includes(variant.title) || variant.title.includes(v.name),
        );
      }
      */

      if (match) {
        map[match.id] = variant.image;
      }
      return map;
    }, {} as ProductOptionVariantImageMap);
  }, [product.options, product.variants.nodes]);

  return (
    <div className="flex flex-col gap-5">
      {!hideOptions && (
        <ProductOptions
          isModalProduct={isModalProduct}
          product={product}
          selectedOptionsMap={selectedOptionsMap}
          setSelectedOption={setSelectedOption}
          swatchesMap={swatchesMap}
          optionsImageVariantMap={optionsImageVariantMap}
        />
      )}

      {/* NEW: bundle picker, right after other product options */}
      {hasBundle && bundleConfig && (
        <BundlePicker config={bundleConfig} onChange={setBundleSelection} />
      )}

      <div className="flex flex-row gap-8 p-4">
        {enabledQuantitySelector && (
          <QuantitySelector
            disableDecrement={quantity === 1}
            handleDecrement={handleDecrement}
            handleIncrement={handleIncrement}
            productTitle={product.title}
            quantity={quantity}
          />
        )}

        <div className="flex-1">
          <AddToCart
            isPdp
            quantity={quantity}
            selectedVariant={selectedVariant}
            disabled={isBundleIncomplete}
            lineItemAttributes={lineItemAttributes}
          />
        </div>
      </div>

      <div
        dangerouslySetInnerHTML={{__html: product.descriptionHtml}}
        className="text-sm [&>:last-child]:mb-0 [&_a]:underline [&_blockquote]:pl-8 [&_h1]:mb-3 [&_h2]:mb-3 [&_h3]:mb-3 [&_h4]:mb-3 [&_h5]:mb-3 [&_h6]:mb-3 [&_li>p]:mb-0 [&_li]:mb-2 [&_ol>li]:list-decimal [&_ol]:mb-3 [&_ol]:pl-8 [&_p]:mb-3 [&_ul>li]:list-disc [&_ul]:mb-3 [&_ul]:pl-8"
      />
    </div>
  );
}

ProductDetails.displayName = 'ProductDetails';
