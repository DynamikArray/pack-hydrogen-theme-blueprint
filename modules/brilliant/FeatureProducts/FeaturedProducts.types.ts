import type {ProductCms} from '~/lib/types';

export interface BrilliantFeaturedProductsCms {
  heading: string;
  design: 'normal' | 'expanded';
  extraSentence?: string;
  collection?: {
    title: string;
    handle: string;
  };
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
