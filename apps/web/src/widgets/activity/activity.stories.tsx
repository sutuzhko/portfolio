import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import type { CodewarsStats, GithubStats } from '@/entities/stats';

import { Activity } from './ui/activity';

const github: GithubStats = {
  handle: '@sutuzhko',
  url: 'https://github.com/sutuzhko',
  repos: 18,
  followers: 13,
  following: 27,
  since: '2020',
  topLanguages: ['JavaScript', 'TypeScript', 'React', 'Vue', 'Node'],
};

const codewars: CodewarsStats = {
  handle: 'sutuzhko',
  url: 'https://www.codewars.com/users/sutuzhko',
  kyu: 3,
  rankName: '3 kyu',
  honor: 1069,
  katas: 62,
  leaderboardPosition: 33322,
  nextKyu: 2,
  progress: 62,
};

const meta = {
  title: 'Widgets/Activity',
  component: Activity,
  parameters: { layout: 'padded', controls: { expanded: true } },
  args: { github, codewars },
  argTypes: {
    github: { control: 'object', table: { category: 'Данные' } },
    codewars: { control: 'object', table: { category: 'Данные' } },
    githubError: { control: 'boolean', table: { category: 'Состояние' } },
    codewarsError: { control: 'boolean', table: { category: 'Состояние' } },
    id: { control: false, table: { disable: true } },
    className: { control: false, table: { disable: true } },
  },
  decorators: [(Story) => <div style={{ maxWidth: 'var(--container-page)' }}>{Story()}</div>],
} satisfies Meta<typeof Activity>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Карточки GitHub + Codewars с реальными числами. */
export const Playground: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('GitHub')).toBeInTheDocument();
    await expect(canvas.getByText('Codewars')).toBeInTheDocument();
    await expect(canvas.getByText('3 kyu')).toBeInTheDocument();
    await expect(canvas.getByRole('link', { name: 'Профиль ↗' })).toHaveAttribute(
      'target',
      '_blank',
    );
  },
};

/** Обе карточки грузятся — независимые скелетоны. */
export const Loading: Story = {
  name: 'Скелетоны загрузки',
  args: { github: undefined, codewars: undefined },
};

/** GitHub недоступен (503) — карточка деградирует в фолбэк, соседняя работает. */
export const GithubUnavailable: Story = {
  name: 'GitHub недоступен',
  args: { github: undefined, githubError: true },
};

/** Codewars недоступен — независимая деградация второй карточки. */
export const CodewarsUnavailable: Story = {
  name: 'Codewars недоступен',
  args: { codewars: undefined, codewarsError: true },
};

/** Оба сервиса недоступны. */
export const BothUnavailable: Story = {
  name: 'Оба недоступны',
  args: { github: undefined, githubError: true, codewars: undefined, codewarsError: true },
};

/** Мобильная раскладка: две карточки в один столбец. */
export const Mobile: Story = {
  name: 'Мобильная раскладка',
  parameters: { viewport: { defaultViewport: 'mobile1' } },
};
