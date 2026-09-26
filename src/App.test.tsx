import { describe, expect, it } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { App } from './App';

describe('City Home', () => {
  it('renders the city with all seven category markers', async () => {
    render(<App />);
    expect(await screen.findByLabelText('מפת העיר')).toBeInTheDocument();
    for (const label of ['טיסות', 'מלונות', 'מוניות', 'רכבות', 'אטרקציות', 'השכרת רכב', 'ביטוח', "צ'ק-ליסט"]) {
      expect(screen.getByRole('button', { name: new RegExp(`^${label}:`) })).toBeInTheDocument();
    }
    expect(document.querySelector('[data-board]')?.getAttribute('data-board')).toBe('paris');
  });

  it('opens the transport sheet on the taxi tab from the taxi stand', async () => {
    render(<App />);
    fireEvent.click(await screen.findByRole('button', { name: /^מוניות:/ }));
    const dialog = await screen.findByRole('dialog', { name: 'תחבורה' });
    expect(within(dialog).getByRole('tab', { name: 'מוניות' })).toHaveAttribute('aria-selected', 'true');
    expect(within(dialog).getByText(/Le Marais/)).toBeInTheDocument();
  });

  it('opens a flight ticket view and toggles checklist items', async () => {
    render(<App />);
    fireEvent.click(await screen.findByRole('button', { name: /^טיסות:/ }));
    const dialog = await screen.findByRole('dialog', { name: 'טיסות' });
    const pass = within(dialog).getAllByRole('button', { name: /LY381/ })[0];
    fireEvent.click(pass);
    expect(pass.className).toContain('is-flipped');
    expect(within(dialog).getAllByText('K7Q2LM').length).toBeGreaterThan(0);
  });

  it('opens a bottom sheet when a marker is tapped', async () => {
    render(<App />);
    fireEvent.click(await screen.findByRole('button', { name: /^מלונות:/ }));
    const dialog = await screen.findByRole('dialog', { name: 'מלונות' });
    expect(within(dialog).getByText('Hôtel Rue de Turenne')).toBeInTheDocument();
  });

  it('switches to itinerary mode and shows day progress', async () => {
    render(<App />);
    fireEvent.click(await screen.findByRole('tab', { name: 'מסלול' }));
    expect(screen.getByText(/יום 1 מתוך 5/)).toBeInTheDocument();
    expect(screen.getByText('13:45')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('tab', { name: 'יום 3 מתוך 5' }));
    expect(screen.getByRole('alert')).toHaveTextContent('ארמון ורסאי');
  });

  it('opens the AI planner sheet from the floating button', async () => {
    render(<App />);
    fireEvent.click(await screen.findByRole('button', { name: 'בנה לי את המסלול' }));
    expect(await screen.findByRole('dialog', { name: 'בניית מסלול חכמה' })).toBeInTheDocument();
  });
});
