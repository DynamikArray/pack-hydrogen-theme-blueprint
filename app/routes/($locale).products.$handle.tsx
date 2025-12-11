import { RenderSections } from "@pack/react";
import { useLoaderData } from "@remix-run/react";
import {
  Analytics,
  AnalyticsPageType,
  getSeoMeta,
  storefrontRedirect,
} from "@shopify/hydrogen";
import type { ShopifyAnalyticsProduct } from "@shopify/hydrogen";
import { ProductProvider } from "@shopify/hydrogen-react";
import type { LoaderFunctionArgs, MetaArgs } from "@shopify/remix-oxygen";
import { BYOP_PRODUCT_HANDLE } from "modules/brilliant/BuildYourOwnPack/BuildYourPackConfig";
import type {
  BrilliantBundleOption,
  BundleConfig,
} from "modules/brilliant/Bundle/BundleConfig.types";
import { Product } from "modules/brilliant/Product/Product";

// import { Product } from "~/components/Product";
import { routeHeaders } from "~/data/cache";
import { ADMIN_PRODUCT_QUERY } from "~/data/graphql/admin/product";
import { PRODUCT_PAGE_QUERY } from "~/data/graphql/pack/product-page";
import { PRODUCT_QUERY } from "~/data/graphql/storefront/product";
import { useGlobal, useProductWithGrouping } from "~/hooks";
//import { getGrouping, getSelectedProductOptions } from "~/lib/products.server";
import { checkForTrailingEncodedSpaces } from "~/lib/server-utils/app.server";
import { getPage, getProductGroupings } from "~/lib/server-utils/pack.server";
import {
  getGrouping,
  getSelectedProductOptions,
} from "~/lib/server-utils/product.server";
import { seoPayload } from "~/lib/server-utils/seo.server";
import { getShop, getSiteSettings } from "~/lib/server-utils/settings.server";
import type {
  Page,
  ProductWithInitialGrouping,
  SelectedVariant,
} from "~/lib/types";
import { normalizeAdminProduct } from "~/lib/utils";

export const headers = routeHeaders;

/*
 * To add metafields to product object, update the PRODUCT_METAFIELDS_IDENTIFIERS
 * constant under lib/constants/product.ts
 */

export async function loader({ params, context, request }: LoaderFunctionArgs) {
  const { handle } = params;
  const { admin, pack, storefront } = context;

  if (!handle) throw new Response(null, { status: 404 });

  // Check for trailing encoded spaces and redirect if needed
  const urlRedirect = checkForTrailingEncodedSpaces(request);
  if (urlRedirect) return urlRedirect;

  const storeDomain = storefront.getShopifyDomain();
  const isPreviewModeEnabled = pack.isPreviewModeEnabled();
  const selectedOptions = await getSelectedProductOptions({
    handle,
    context,
    request,
  });

  const [
    { productPage },
    { product: storefrontProduct },
    productGroupings,
    shop,
    siteSettings,
  ] = await Promise.all([
    getPage({
      context,
      handle,
      pageKey: "productPage",
      query: PRODUCT_PAGE_QUERY,
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
  let productStatus = "ACTIVE";

  if (admin && isPreviewModeEnabled) {
    if (!queriedProduct) {
      const { productByIdentifier: adminProduct } = await admin.query(
        ADMIN_PRODUCT_QUERY,
        { variables: { handle }, cache: admin.CacheShort() },
      );
      if (adminProduct) {
        queriedProduct = normalizeAdminProduct(adminProduct);
        productStatus = adminProduct.status;
      }
    }
  }

  if (!queriedProduct) {
    const redirect = await storefrontRedirect({ request, storefront });
    if (redirect.status === 301) return redirect;
    throw new Response(null, { status: 404 });
  }

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
    variantGid: selectedVariant?.id || "",
    name: product.title,
    variantName: selectedVariant?.title || "",
    brand: product.vendor,
    price: selectedVariant?.price?.amount || "",
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

  // BRILLIANT CUSTOM BUNDLE CONFIG FROM METAFIELDS
  // --- build bundleConfig from the raw storefront product (queriedProduct) ---
  let bundleConfig: BundleConfig | null = null;

  const brilliantBundleIsEnabled =
    queriedProduct.brilliantBundleEnabled?.value === "true";

  if (brilliantBundleIsEnabled) {
    const label =
      queriedProduct.brilliantBundleLabel?.value?.trim() || "Option";

    const requiredCount = queriedProduct.brilliantBundleRequiredCount?.value
      ? parseInt(queriedProduct.brilliantBundleRequiredCount.value, 10)
      : 0;

    const options: BrilliantBundleOption[] = [];

    const optsField = queriedProduct.brilliantBundleOptions;

    const nodes = optsField?.references?.nodes ?? [];

    for (const node of nodes) {
      if (!node) continue;

      // node is a Metaobject as per your fragment
      let optionLabel = "";
      let imageUrl: string | undefined;
      let imageAlt: string | null | undefined;

      for (const field of node.fields ?? []) {
        if (field.key === "title") {
          optionLabel = field.value ?? "";
        }
        if (field.key === "image" && field.reference?.image) {
          imageUrl = field.reference.image.url;
          imageAlt = field.reference.image.altText;
        }
      }

      if (optionLabel) {
        options.push({
          id: node.id,
          label: optionLabel,
          imageUrl,
          imageAlt,
        });
      }
    }

    if (requiredCount > 0 && options.length > 0) {
      bundleConfig = {
        enabled: true,
        label,
        requiredCount,
        options,
      };
    }
  }

  return {
    analytics,
    product,
    bundleConfig,
    productPage,
    productStatus,
    selectedVariant,
    seo,
    storeDomain,
    url: request.url,
  };
}

export const meta = ({ matches }: MetaArgs<typeof loader>) => {
  return getSeoMeta(...matches.map((match) => (match.data as any).seo));
};

export default function ProductRoute() {
  const {
    product: initialProduct,
    productPage,
    selectedVariant: initialSelectedVariant,
    bundleConfig,
  } = useLoaderData<{
    product: ProductWithInitialGrouping;
    productPage?: Page;
    selectedVariant?: SelectedVariant;
    bundleConfig?: BundleConfig;
  }>();
  const { isCartReady } = useGlobal();
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
            bundleConfig={bundleConfig}
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
                price: initialSelectedVariant?.price.amount || "0",
                vendor: product.vendor,
                variantId: initialSelectedVariant?.id || "",
                variantTitle: initialSelectedVariant?.title || "",
                quantity: 1,
              },
            ],
          }}
          customData={{ product, selectedVariant: initialSelectedVariant }}
        />
      )}
    </ProductProvider>
  );
}

ProductRoute.displayName = "ProductRoute";
