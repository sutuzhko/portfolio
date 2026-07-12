import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useReveal } from './use-reveal';

// Детерминизм: подменяем gsap заглушкой, которая «мгновенно завершает» появление
// (снимает инлайновое скрытие), чтобы не гонять реальный rAF-тикер в jsdom.
vi.mock('gsap', () => ({
  gsap: {
    fromTo: (targets: readonly HTMLElement[]) => {
      for (const target of targets) {
        target.style.removeProperty('opacity');
        target.style.removeProperty('transform');
        target.style.removeProperty('will-change');
      }
      return { kill: () => {}, progress: () => {} };
    },
  },
}));

function Harness() {
  const ref = useReveal<HTMLDivElement>();
  return (
    <div ref={ref} data-testid="container">
      <section>Секция A</section>
      <section>Секция B</section>
    </div>
  );
}

const setReducedMotion = (reduced: boolean): void => {
  window.matchMedia = (query: string): MediaQueryList =>
    ({
      matches: reduced,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList;
};

describe('useReveal', () => {
  const realMatchMedia = window.matchMedia;
  const realIO = globalThis.IntersectionObserver;

  afterEach(() => {
    window.matchMedia = realMatchMedia;
    globalThis.IntersectionObserver = realIO;
  });

  it('рендерит детей контейнера', () => {
    render(<Harness />);
    expect(screen.getByText('Секция A')).toBeInTheDocument();
    expect(screen.getByText('Секция B')).toBeInTheDocument();
  });

  it('при prefers-reduced-motion не прячет контент', () => {
    setReducedMotion(true);
    render(<Harness />);
    expect(screen.getByText('Секция A').style.opacity).not.toBe('0');
  });

  it('прячет секции и наблюдает их, раскрывая при попадании в вид', async () => {
    setReducedMotion(false);
    let capturedCb: IntersectionObserverCallback | undefined;
    const observed: Element[] = [];
    class IntersectionObserverStub implements IntersectionObserver {
      readonly root = null;
      readonly rootMargin = '';
      readonly thresholds: readonly number[] = [];
      constructor(cb: IntersectionObserverCallback) {
        capturedCb = cb;
      }
      observe(target: Element): void {
        observed.push(target);
      }
      unobserve(): void {}
      disconnect(): void {}
      takeRecords(): IntersectionObserverEntry[] {
        return [];
      }
    }
    globalThis.IntersectionObserver = IntersectionObserverStub;

    render(<Harness />);
    const sectionA = screen.getByText('Секция A');
    // До попадания в кадр секция скрыта и передана под наблюдение.
    expect(sectionA.style.opacity).toBe('0');
    expect(observed).toHaveLength(2);

    // Имитируем вход секции в кадр — она должна раскрыться.
    capturedCb?.(
      [{ isIntersecting: true, target: sectionA } as unknown as IntersectionObserverEntry],
      { unobserve: () => {} } as unknown as IntersectionObserver,
    );
    await vi.waitFor(() => {
      expect(sectionA.style.opacity).not.toBe('0');
    });
  });

  it('не падает на пустом контейнере', () => {
    function Empty() {
      const ref = useReveal<HTMLDivElement>();
      return <div ref={ref} data-testid="empty" />;
    }
    expect(() => render(<Empty />)).not.toThrow();
    expect(screen.getByTestId('empty')).toBeInTheDocument();
  });
});
