import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import { ImageCropper } from './image-cropper';

// Пейзаж 600×400 — панорамирование по горизонтали имеет смысл.
const SAMPLE = `data:image/svg+xml;utf8,${encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' width='600' height='400'>" +
    "<defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>" +
    "<stop offset='0' stop-color='#3c97e8'/><stop offset='1' stop-color='#866cc7'/>" +
    '</linearGradient></defs>' +
    "<rect width='600' height='400' fill='url(#g)'/>" +
    "<circle cx='300' cy='200' r='120' fill='#238636'/>" +
    '</svg>',
)}`;

const meta = {
  title: 'Shared/components/ImageCropper',
  component: ImageCropper,
  parameters: { layout: 'centered', controls: { expanded: true } },
  args: { src: SAMPLE, zoomLabel: 'Масштаб', onChange: fn() },
  argTypes: {
    src: { control: false, table: { category: 'Данные' } },
    zoomLabel: { control: 'text', table: { category: 'Данные' } },
    viewport: {
      control: { type: 'range', min: 200, max: 360, step: 10 },
      table: { category: 'Размер' },
    },
    onChange: { control: false, table: { category: 'События' } },
  },
} satisfies Meta<typeof ImageCropper>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Перетаскивание + масштаб над круглой маской. */
export const Default: Story = {
  name: 'Кадрирование',
};
