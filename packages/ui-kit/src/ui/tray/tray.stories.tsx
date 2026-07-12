import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, within } from 'storybook/test';

import { DockPill } from '../dock-pill';

import { TrayPortal } from './tray';

/**
 * Демонстрация трея: две свёрнутые пилюли, порталенные в один общий контейнер.
 * Трей фиксирован внизу справа окна, поэтому в доках он появляется в углу вьюпорта.
 */
function TrayDemo() {
  return (
    <>
      <TrayPortal>
        <DockPill label="bash — ~" onClose={fn()} onRestore={fn()} onMaximize={fn()} />
      </TrayPortal>
      <TrayPortal>
        <DockPill label="2048 — game" onClose={fn()} onRestore={fn()} onMaximize={fn()} />
      </TrayPortal>
    </>
  );
}

const meta = {
  title: 'Shared/components/Tray',
  component: TrayDemo,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof TrayDemo>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Две пилюли из разных источников стыкуются в один стек. */
export const Stacked: Story = {
  name: 'Стек пилюль',
  play: async () => {
    // Трей порталится в body, поэтому ищем по всему документу, а не по canvas.
    const body = within(document.body);
    await expect(body.getByRole('button', { name: 'bash — ~' })).toBeInTheDocument();
    await expect(body.getByRole('button', { name: '2048 — game' })).toBeInTheDocument();
  },
};
