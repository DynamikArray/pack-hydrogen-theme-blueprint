import {RenderSections} from '@pack/react';
import {useLoaderData} from '@remix-run/react';
import {Analytics, AnalyticsPageType, getSeoMeta} from '@shopify/hydrogen';
import type {ShopifyAnalyticsProduct} from '@shopify/hydrogen';
import {ProductProvider} from '@shopify/hydrogen-react';
import type {LoaderFunctionArgs, MetaArgs} from '@shopify/remix-oxygen';
import {BYOP_PRODUCT_HANDLE} from 'modules/brilliant/BuildYourOwnPack/BuildYourPackConfig';
import {Product} from 'modules/brilliant/Product/Product';

import {routeHeaders} from '~/data/cache';
import {ADMIN_PRODUCT_QUERY} from '~/data/graphql/admin/product';
import {PRODUCT_PAGE_QUERY} from '~/data/graphql/pack/product-page';
import {PRODUCT_QUERY} from '~/data/graphql/storefront/product';
import {useGlobal, useProductWithGrouping} from '~/hooks';
import {getGrouping, getSelectedProductOptions} from '~/lib/products.server';
import {seoPayload} from '~/lib/seo.server';
import type {ProductWithInitialGrouping} from '~/lib/types';
import {
  getProductGroupings,
  getShop,
  getSiteSettings,
  normalizeAdminProduct,
} from '~/lib/utils';

export const headers = routeHeaders;

/*
 * To add metafields to product object, update the PRODUCT_METAFIELDS_IDENTIFIERS
 * constant under lib/constants/product.ts
 */

export async function loader({params, context, request}: LoaderFunctionArgs) {
  const {handle} = params;
  const {admin, pack, storefront} = context;

  const storeDomain = storefront.getShopifyDomain();
  const isPreviewModeEnabled = pack.isPreviewModeEnabled();
  const selectedOptions = await getSelectedProductOptions({
    handle,
    context,
    request,
  });

  const [
    pageData,
    {product: storefrontProduct},
    productGroupings,
    shop,
    siteSettings,
  ] = await Promise.all([
    context.pack.query(PRODUCT_PAGE_QUERY, {
      variables: {handle},
      cache: context.storefront.CacheLong(),
    }),
    storefront.query(PRODUCT_QUERY, {
      variables: {
        handle,
        selectedOptions,
        country: storefront.i18n.country,
        language: storefront.i18n.language,
      },
      cache: storefront.CacheShort(),
    }),
    getProductGroupings(context),
    getShop(context),
    getSiteSettings(context),
  ]);

  let queriedProduct = storefrontProduct;
  let productStatus = 'ACTIVE';

  const productPage = pageData?.data?.productPage;

  if (admin && isPreviewModeEnabled) {
    if (!queriedProduct) {
      const {productByIdentifier: adminProduct} = await admin.query(
        ADMIN_PRODUCT_QUERY,
        {variables: {handle}, cache: admin.CacheShort()},
      );
      if (!adminProduct) return;
      queriedProduct = normalizeAdminProduct(adminProduct);
      productStatus = adminProduct.status;
    }
  }

  if (!queriedProduct) throw new Response(null, {status: 404});

  let grouping = undefined;
  let groupingProducts = undefined;

  if (productGroupings) {
    const groupingData = await getGrouping({
      context,
      handle,
      productGroupings,
    });
    grouping = groupingData.grouping;
    groupingProducts = groupingData.groupingProducts;
  }

  const product = {
    ...queriedProduct,
    ...(grouping
      ? {
          initialGrouping: {
            ...grouping,
            allProducts: [queriedProduct, ...(groupingProducts || [])],
          },
        }
      : null),
  } as ProductWithInitialGrouping;

  const selectedVariant = product.selectedVariant ?? product.variants?.nodes[0];

  const productAnalytics: ShopifyAnalyticsProduct = {
    productGid: product.id,
    variantGid: selectedVariant?.id || '',
    name: product.title,
    variantName: selectedVariant?.title || '',
    brand: product.vendor,
    price: selectedVariant?.price?.amount || '',
  };
  const analytics = {
    pageType: AnalyticsPageType.product,
    resourceId: product.id,
    products: [productAnalytics],
    totalValue: Number(selectedVariant?.price?.amount || 0),
  };
  const seo = seoPayload.product({
    product,
    selectedVariant,
    page: productPage,
    shop,
    siteSettings,
    url: request.url,
  });

  return {
    analytics,
    product,
    productPage,
    productStatus,
    selectedVariant,
    seo,
    storeDomain,
    url: request.url,
  };
}

export const meta = ({matches}: MetaArgs<typeof loader>) => {
  return getSeoMeta(...matches.map((match) => (match.data as any).seo));
};

export default function ProductRoute() {
  const {
    product: initialProduct,
    productPage,
    selectedVariant: initialSelectedVariant,
  } = useLoaderData<typeof loader>();
  const {isCartReady} = useGlobal();
  const product = useProductWithGrouping(initialProduct);

  return (
    <ProductProvider
      data={product}
      initialVariantId={initialSelectedVariant?.id || null}
    >
      <div data-comp={ProductRoute.displayName}>
        {/* BRILLIANT HANDLES LOADING OUR SINGLE PRODUCT THAT WE HAVE A CUSTOM SECTION TIED TO OUR BYOP STUFF - */}
        {!BYOP_PRODUCT_HANDLE.includes(product?.handle) && (
          <Product
            product={product}
            initialSelectedVariant={initialSelectedVariant}
          />
        )}

        {productPage && <RenderSections content={productPage} />}
      </div>

      {isCartReady && (
        <Analytics.ProductView
          data={{
            products: [
              {
                id: product.id,
                title: product.title,
                price: initialSelectedVariant?.price.amount || '0',
                vendor: product.vendor,
                variantId: initialSelectedVariant?.id || '',
                variantTitle: initialSelectedVariant?.title || '',
                quantity: 1,
              },
            ],
          }}
          customData={{product, selectedVariant: initialSelectedVariant}}
        />
      )}
    </ProductProvider>
  );
}

ProductRoute.displayName = 'ProductRoute';
