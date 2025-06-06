import type {ProductVariant} from '@shopify/hydrogen-react/storefront-api-types';

import type {ProductCms} from '~/lib/types';
import type {ContainerSettings} from '~/settings/container';

export interface ProductGrouping {
  name: string;
  products: {
    product: ProductCms;
  }[];
  subnavName: string;
}

export interface Tier {
  heading: string;
  message: string;
  percent: number;
  type: 'none' | 'percent' | 'buyXGetYFree';
}

type ProductVariantWithIndexes = ProductVariant & {indexes: number[]};

export type BundleMapById = Record<string, ProductVariantWithIndexes>;

export interface BuildYourOwnPackCms {
  container: ContainerSettings;
  defaultHeading: string;
  preselects: {
    product: ProductCms;
  }[];
  productGroupings: ProductGrouping[];
  tiers: Tier[];
}

export interface BYOPSummaryProps {
  bundle: ProductVariant[];
  defaultHeading: string;
  handleRemoveFromBundle: (index: number) => void;
  //tiers: Tier[];
  clid: string;
  selectedVariant: ProductVariant | undefined;
}

export interface BYOPSubnavProps {
  activeTabIndex: number;
  className?: string;
  productGroupings: ProductGrouping[];
  setActiveTabIndex: (index: number) => void;
}

export interface BYOPAddToCartProps {
  addToCartUnlocked: boolean;
  bundle: ProductVariant[];
  clid: string;
  selectedVariant: ProductVariant | undefined;
}

export interface AddToCartProps {
  addToCartUnlocked: boolean;
  bundle: ProductVariant[];
  clid: string;
  selectedBundle: ProductVariant | undefined;
  afterAdd?: () => void;
}
