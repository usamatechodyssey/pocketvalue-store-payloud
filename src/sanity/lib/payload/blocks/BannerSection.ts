import { Block } from 'payload'

export const BannerSection: Block = {
  slug: 'bannerSection', // Ye Sanity ke _type se match karega
  imageURL: 'https://via.placeholder.com/150', // Optional: Preview image
  fields: [
    // --- Layout Tab ---
    {
      name: 'desktopLayout',
      type: 'select',
      options:[
        { label: 'Simple Grid', value: 'grid' },
        { label: 'Mosaic: Big Left', value: 'mosaic-left' },
        { label: 'Mosaic: Big Right', value: 'mosaic-right' },
        { label: 'Hero Stack', value: 'hero-stack' },
      ],
      defaultValue: 'grid',
    },
    {
      name: 'gridColumns',
      type: 'number',
      admin: {
        condition: (data, siblingData) => siblingData.desktopLayout === 'grid',
      },
      defaultValue: 1,
      min: 1, max: 4,
    },
    
    // --- Height Settings ---
    {
      type: 'row',
      fields:[
        {
          name: 'heightMode',
          type: 'select',
          options:[
            { label: 'Auto', value: 'auto' },
            { label: 'Aspect Ratio', value: 'aspect' },
            { label: 'Fixed', value: 'fixed' },
            { label: 'Custom Pixel', value: 'custom' },
          ],
          defaultValue: 'auto',
        },
        {
          name: 'aspectRatio',
          type: 'select',
          options:[
            { label: '16:9', value: 'aspect-video' },
            { label: '4:3', value: 'aspect-[4/3]' },
            { label: '1:1', value: 'aspect-square' },
            { label: '21:9', value: 'aspect-[21/9]' },
          ],
          admin: { condition: (_, sibling) => sibling.heightMode === 'aspect' }
        },
        {
          name: 'fixedHeight',
          type: 'select',
          options:[
            { label: 'Small (300px)', value: 'h-[300px]' },
            { label: 'Medium (500px)', value: 'h-[500px]' },
            { label: 'Large (700px)', value: 'h-[700px]' },
          ],
          admin: { condition: (_, sibling) => sibling.heightMode === 'fixed' }
        },
        {
          name: 'customHeightPx',
          type: 'number',
          admin: { condition: (_, sibling) => sibling.heightMode === 'custom' }
        }
      ]
    },

    // --- Mobile Behavior ---
    {
      name: 'mobileBehavior',
      type: 'radio',
      options:[
        { label: 'Stack', value: 'stack' },
        { label: 'Swipe / Carousel', value: 'scroll' },
        { label: 'Grid (2 Columns)', value: 'grid-2' },
      ],
      defaultValue: 'stack',
    },

    // --- Container Settings ---
    {
      name: 'containerSettings',
      type: 'group',
      fields:[
        { name: 'fullWidth', type: 'checkbox', defaultValue: false },
        { name: 'gap', type: 'select', options: ['0', '2', '4', '8'], defaultValue: '4' },
        { name: 'roundedCorners', type: 'select', options: ['none', 'sm', 'xl', '2xl', 'full'], defaultValue: 'xl' },
      ]
    },

    // --- Banners List ---
    {
      name: 'banners',
      type: 'array',
      minRows: 1,
      fields:[
        {
          type: 'row',
          fields:[
             { name: 'desktopImage', type: 'upload', relationTo: 'media', required: true },
             { name: 'mobileImage', type: 'upload', relationTo: 'media' },
          ]
        },
        { name: 'altText', type: 'text', required: true },
        { name: 'link', type: 'text' },
        
        {
          type: 'collapsible',
          label: 'Text Overlay Settings',
          fields:[
             { name: 'heading', type: 'text' },
             { name: 'subheading', type: 'text' },
             { name: 'buttonText', type: 'text' },
             {
                type: 'row',
                fields:[
                    { name: 'contentPosition', type: 'select', options:['center', 'bottom-left', 'bottom-center', 'top-left'], defaultValue: 'center' },
                    { name: 'overlayOpacity', type: 'number', min: 0, max: 100, defaultValue: 20 },
                    { name: 'textColor', type: 'select', options:['text-white', 'text-black'], defaultValue: 'text-white' },
                ]
             }
          ]
        }
      ]
    }
  ]
}