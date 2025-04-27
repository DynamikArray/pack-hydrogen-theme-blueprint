import type {ProductCms} from '~/lib/types';

export interface FeaturedProductsCms {
  heading: string;
  design: 'normal' | 'expanded';
  extraSentence?: string;
  products: {
    product: ProductCms;
  }[];
  section: {
    fullWidth: boolean;
  };
}

/*
import type {LinkCms, ProductCms} from '~/lib/types';

export interface BrilliantFeaturedProductsCms {
  heading: string;
  products: {
    product: ProductCms & {
      extraDescription?: string; // 👈 New!
    };
  }[];
  displayMode: 'expanded' | 'normal'; // 👈 New!
}
*/
