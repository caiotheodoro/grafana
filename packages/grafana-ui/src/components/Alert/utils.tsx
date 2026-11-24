import { type AriaRole, isValidElement, type ReactNode } from 'react';

import { type IconName } from '../../types/icon';
import { BannerActionButton } from '../BannerActionButton/BannerActionButton';
import { Button, type ButtonProps } from '../Button/Button';

import { type AlertVariant } from './Alert';

export const rolesBySeverity: Record<AlertVariant, AriaRole> = {
  error: 'alert',
  warning: 'alert',
  info: 'status',
  success: 'status',
};

export const getIconFromSeverity = (severity: AlertVariant): IconName => {
  switch (severity) {
    case 'error':
      return 'exclamation-circle';
    case 'warning':
      return 'exclamation-triangle';
    case 'info':
      return 'info-circle';
    case 'success':
      return 'check';
  }
};

/**
 * Renders a Button action as an BannerActionButton in the colors of the severity. The Button keeps its other props, such
 * as onClick, icon and tooltip, but its variant, fill, size and fullWidth are dropped, as BannerActionButton sets its
 * own appearance. Any other action is rendered as passed.
 */
export const getSeverityAction = (action: ReactNode, severity: AlertVariant): ReactNode => {
  if (isValidElement<ButtonProps>(action) && action.type === Button) {
    const { variant, fill, size, fullWidth, ...buttonProps } = action.props;

    return <BannerActionButton {...buttonProps} severity={severity} />;
  }

  return action;
};
