import {containerSettings} from '~/settings/container';

export function Schema() {
  return {
    category: 'Product',
    label: 'Brilliant Featured Products',
    key: 'brilliant-featured-products',
    previewSrc:
      'https://cdn.shopify.com/s/files/1/0629/5519/2520/files/products-slider-preview.jpg?v=1710957354',
    fields: [
      {
        label: 'Heading',
        name: 'heading',
        component: 'text',
        defaultValue: 'Featured Products',
      },
      {
        label: 'Design Layout',
        name: 'design',
        component: 'select',
        options: [
          {label: 'Normal', value: 'normal'},
          {label: 'Expanded', value: 'expanded'},
        ],
        defaultValue: 'normal',
        description: 'Expanded layout shows extra sentence and product tags.',
      },
      {
        label: 'Extra Sentence',
        name: 'extraSentence',
        component: 'textarea',
        condition: {
          when: 'design',
          is: 'expanded',
        },
        description: 'Optional extra sentence shown in Expanded layout.',
      },
      {
        label: 'Products',
        name: 'products',
        component: 'group-list',
        itemProps: {
          label: '{{item.product.handle}}',
        },
        fields: [
          {
            name: 'product',
            component: 'productSearch',
            label: 'Product',
          },
        ],
        defaultValue: [],
      },
      {
        label: 'Section Settings',
        name: 'section',
        component: 'group',
        description: 'Section display controls',
        fields: [
          {
            label: 'Full Width',
            name: 'fullWidth',
            component: 'toggle',
            toggleLabels: {
              true: 'On',
              false: 'Off',
            },
          },
        ],
        defaultValue: {
          fullWidth: false,
        },
      },
      containerSettings(),
    ],
  };
}
