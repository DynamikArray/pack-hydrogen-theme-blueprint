import type {ProductCms} from '~/lib/types';

export interface FeaturedSliderCms {
  heading: string;
  design: string;
  limit?: number;
  products: {
    product: ProductCms;
  }[];
}
