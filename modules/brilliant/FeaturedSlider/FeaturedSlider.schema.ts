import {containerSettings} from '~/settings/container';

export function Schema() {
  return {
    category: 'Product',
    label: 'Brilliant - Featured Slider',
    key: 'featured-slider',
    previewSrc:
      'https://cdn.shopify.com/s/files/1/0739/0258/8119/files/Featured_Slider.png?v=1745731484',
    fields: [
      {
        label: 'Heading',
        name: 'heading',
        component: 'text',
        defaultValue: 'Products Slider Heading',
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
            description:
              'If the selected product does display in the frontend, check it is on the Hydrogen sales channel.',
          },
        ],
        defaultValue: [{handle: ''}, {handle: ''}, {handle: ''}, {handle: ''}],
      },
      containerSettings(),
    ],
  };
}
