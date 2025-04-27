import type {LinkCms, ProductCms} from '~/lib/types';

export interface FeaturedSliderCms {
  heading: string;

  limit?: number;
  products: {
    product: ProductCms;
  }[];
  section: {
    buttonStyle: string;
    fullWidth: boolean;
    maxWidth: string;
  };
}
