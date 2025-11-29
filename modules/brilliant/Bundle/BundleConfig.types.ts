// modules/brilliant/Bundle/BundleConfig.types.ts
import type {AttributeInput} from '@shopify/hydrogen/storefront-api-types';

export type BrilliantBundleOption = {
  id: string;
  label: string;
  imageUrl?: string;
  imageAlt?: string | null;
};

export type BundleConfig = {
  enabled: boolean;
  label: string; // e.g. "Animal"
  requiredCount: number; // e.g. 2
  options: BrilliantBundleOption[];
};

export type BundleSelection = {
  isComplete: boolean;
  attributes: AttributeInput[]; // { key, value } pair for line item properties
};
