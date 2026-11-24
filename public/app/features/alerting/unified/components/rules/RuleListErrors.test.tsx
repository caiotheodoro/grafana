import { render, screen } from 'test/test-utils';

import { configureStore } from 'app/store/configureStore';

import { fetchRulesSourceListAction } from '../../state/actions';

import { RuleListErrors } from './RuleListErrors';

describe('RuleListErrors', () => {
  it('shows nothing when no request failed', () => {
    render(<RuleListErrors />, { store: configureStore() });

    expect(screen.queryByText('Errors loading rules')).not.toBeInTheDocument();
  });

  it('shows the error when the rules source list failed to load', () => {
    const store = configureStore();
    const pending = fetchRulesSourceListAction.pending('request-id');
    store.dispatch(pending);
    store.dispatch(fetchRulesSourceListAction.rejected(new Error('list failed'), 'request-id'));

    render(<RuleListErrors />, { store });

    expect(screen.getByText('Errors loading rules')).toBeInTheDocument();
    expect(screen.getByText(/Failed to load the list of rules sources:/)).toBeInTheDocument();
    expect(screen.getByText(/list failed/)).toBeInTheDocument();
  });
});
