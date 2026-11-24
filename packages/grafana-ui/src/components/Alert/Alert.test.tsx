import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { selectors } from '@grafana/e2e-selectors';

import { BannerActionButton } from '../BannerActionButton/BannerActionButton';
import { Button } from '../Button/Button';
import { LinkButton } from '../LinkButton/LinkButton';

import { Alert } from './Alert';

describe('Alert', () => {
  it('sets the accessible label correctly based on the title if there is no aria-label set', () => {
    render(<Alert title="Uh oh spagghettios!" />);
    expect(screen.getByRole('alert', { name: 'Uh oh spagghettios!' })).toBeInTheDocument();
  });

  it('prefers the aria-label attribute over the title if it is set', () => {
    render(<Alert title="Uh oh spagghettios!" aria-label="A fancy label" />);
    expect(screen.queryByRole('alert', { name: 'Uh oh spagghettios!' })).not.toBeInTheDocument();
    expect(screen.getByRole('alert', { name: 'A fancy label' })).toBeInTheDocument();
  });

  it('infers the role based on the severity in case it is not set manually', () => {
    render(<Alert title="Error message" severity="error" />);
    expect(screen.getByRole('alert', { name: 'Error message' })).toBeInTheDocument();

    render(<Alert title="Warning message" severity="warning" />);
    expect(screen.getByRole('alert', { name: 'Warning message' })).toBeInTheDocument();

    render(<Alert title="Success message" severity="success" />);
    expect(screen.getByRole('status', { name: 'Success message' })).toBeInTheDocument();

    render(<Alert title="Info message" severity="info" />);
    expect(screen.getByRole('status', { name: 'Info message' })).toBeInTheDocument();
  });

  it('is possible to set the role manually', () => {
    render(<Alert title="Error message" severity="error" role="status" />);
    expect(screen.queryByRole('alert', { name: 'Error message' })).not.toBeInTheDocument();
    expect(screen.getByRole('status', { name: 'Error message' })).toBeInTheDocument();
  });

  it('keeps the severity test id when a custom data-testid is passed', () => {
    render(<Alert title="Warning message" severity="warning" data-testid="custom-id" />);
    const alert = screen.getByRole('alert', { name: 'Warning message' });
    expect(screen.getByTestId('custom-id')).toBe(alert);
    expect(alert).toContainElement(screen.getByTestId(selectors.components.Alert.alertV2('warning')));
  });

  describe('action prop', () => {
    it.each(['error', 'warning', 'info', 'success'] as const)(
      'renders a Button action in a %s alert as an BannerActionButton of that severity',
      (severity) => {
        render(
          <>
            <Alert title="Test" severity={severity} action={<Button variant="primary">Action</Button>} />
            <BannerActionButton severity={severity}>Reference</BannerActionButton>
          </>
        );
        expect(screen.getByRole('button', { name: 'Action' })).toHaveClass(
          screen.getByRole('button', { name: 'Reference' }).className
        );
      }
    );

    it('keeps the click handler and icon of a Button action', async () => {
      const onClick = jest.fn();
      render(
        <Alert
          title="Test"
          severity="info"
          action={
            <Button icon="external-link-alt" onClick={onClick}>
              Action
            </Button>
          }
        />
      );
      const actionButton = screen.getByRole('button', { name: 'Action' });
      expect(actionButton).toContainElement(screen.getByTestId('icon-external-link-alt'));
      await userEvent.click(actionButton);
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('leaves an action that is not a Button unchanged', () => {
      render(
        <>
          <Alert title="Test" severity="warning" action={<LinkButton href="/docs">Read docs</LinkButton>} />
          <LinkButton href="/reference">Reference</LinkButton>
        </>
      );
      expect(screen.getByRole('link', { name: 'Read docs' })).toHaveClass(
        screen.getByRole('link', { name: 'Reference' }).className
      );
    });
    it('renders the provided action element', () => {
      render(
        <Alert
          title="Quota exceeded"
          severity="warning"
          action={<Button onClick={jest.fn()}>Request increase</Button>}
        />
      );
      expect(screen.getByRole('button', { name: 'Request increase' })).toBeInTheDocument();
    });

    it('renders both action element and dismiss button when onRemove is also set', () => {
      render(
        <Alert
          title="Quota exceeded"
          severity="warning"
          action={<Button onClick={jest.fn()}>Request increase</Button>}
          onRemove={jest.fn()}
        />
      );
      expect(screen.getByRole('button', { name: 'Request increase' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /close alert/i })).toBeInTheDocument();
    });

    it('calls the action handler when clicked', async () => {
      const user = userEvent.setup();
      const onAction = jest.fn();
      render(<Alert title="Test" severity="info" action={<Button onClick={onAction}>Do action</Button>} />);
      await user.click(screen.getByRole('button', { name: 'Do action' }));
      expect(onAction).toHaveBeenCalledTimes(1);
    });
  });

  it('passes isCompact to the banner, which reduces its padding', () => {
    render(<Alert title="Test" severity="info" isCompact />);
    expect(screen.getByTestId(selectors.components.Alert.alertV2('info'))).toHaveStyle({ padding: '4px 12px' });
  });

  describe('button accessible names and onRemove', () => {
    it.each(['error', 'warning', 'info', 'success'] as const)(
      'wraps buttonContent of a %s alert in a single dismiss button that calls onRemove',
      async (severity) => {
        const user = userEvent.setup();
        const onRemove = jest.fn();
        render(<Alert title="Test" severity={severity} buttonContent="Dismiss" onRemove={onRemove} />);
        expect(screen.getAllByRole('button')).toHaveLength(1);
        await user.click(screen.getByRole('button', { name: 'Dismiss' }));
        expect(onRemove).toHaveBeenCalledTimes(1);
      }
    );

    it('uses visible string buttonContent as the accessible name', () => {
      render(<Alert title="Test" buttonContent="Go back" onRemove={jest.fn()} />);
      expect(screen.getByRole('button', { name: 'Go back' })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /close alert/i })).not.toBeInTheDocument();
    });

    it('uses visible element buttonContent as the accessible name', () => {
      render(<Alert title="Test" buttonContent={<span>Go back</span>} onRemove={jest.fn()} />);
      expect(screen.getByRole('button', { name: 'Go back' })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /close alert/i })).not.toBeInTheDocument();
    });

    it('renders dismiss X icon when only onRemove is set and announces as Close alert', () => {
      render(<Alert title="Test" onRemove={jest.fn()} />);
      expect(screen.getByRole('button', { name: /close alert/i })).toBeInTheDocument();
    });

    it('calls onRemove when the dismiss X icon is clicked', async () => {
      const user = userEvent.setup();
      const onRemove = jest.fn();
      render(<Alert title="Test" onRemove={onRemove} />);
      await user.click(screen.getByRole('button', { name: /close alert/i }));
      expect(onRemove).toHaveBeenCalledTimes(1);
    });
  });
});
