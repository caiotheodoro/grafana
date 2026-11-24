import { type StoryFn, type Meta } from '@storybook/react';
import { useState } from 'react';
import { action } from 'storybook/actions';

import { useTheme2 } from '../../themes/ThemeContext';
import { type IconName } from '../../types/icon';
import { StoryExample } from '../../utils/storybook/StoryExample';
import { type HardCodedColors, hardCodedPalettes } from '../../utils/storybook/hardCodedPalettes';
import { BannerActionButton } from '../BannerActionButton/BannerActionButton';
import { Button } from '../Button/Button';
import { Stack } from '../Layout/Stack/Stack';

import { Banner, type BannerProps } from './Banner';
import { getOpaqueBackgroundColor } from './Banner.styles';

type Severity = 'error' | 'warning' | 'info' | 'success';

const severities: Severity[] = ['error', 'warning', 'info', 'success'];

const iconsBySeverity: Record<Severity, IconName> = {
  error: 'exclamation-circle',
  warning: 'exclamation-triangle',
  info: 'info-circle',
  success: 'check',
};

const rolesBySeverity: Record<Severity, BannerProps['role']> = {
  error: 'alert',
  warning: 'alert',
  info: 'status',
  success: 'status',
};

type ExplicitColorProps =
  | 'role'
  | 'icon'
  | 'backgroundColor'
  | 'borderColor'
  | 'iconColor'
  | 'textColor'
  | 'dismissButtonBackgroundColor'
  | 'dismissButtonTextColor';

type ThemeColor = 'primary' | 'secondary' | 'tertiary' | 'accent' | Severity;

type ThemeColorBannerProps = Omit<BannerProps, ExplicitColorProps> & {
  themeColor: ThemeColor;
  icon: IconName;
  role: BannerProps['role'];
};

// Derives Banner's explicit color props from a color in the active theme.
const ThemeColorBanner = ({ themeColor, ...props }: ThemeColorBannerProps) => {
  const theme = useTheme2();
  const color = theme.colors[themeColor];
  const visualRefreshEnabled = theme.flags.visualDesignRefresh;
  const backgroundColor = visualRefreshEnabled ? color.subtleBackground : color.transparent;

  return (
    <Banner
      backgroundColor={backgroundColor}
      borderColor={visualRefreshEnabled ? color.subtleBorder : color.borderTransparent}
      iconColor={color.text}
      textColor={visualRefreshEnabled ? color.textEmphasis : theme.colors.text.primary}
      dismissButtonBackgroundColor={color.text}
      dismissButtonTextColor={visualRefreshEnabled ? backgroundColor : getOpaqueBackgroundColor(theme, backgroundColor)}
      {...props}
    />
  );
};

type SeverityBannerProps = Omit<BannerProps, ExplicitColorProps> & {
  severity: Severity;
};

const SeverityBanner = ({ severity, ...props }: SeverityBannerProps) => (
  <ThemeColorBanner
    themeColor={severity}
    role={rolesBySeverity[severity]}
    icon={iconsBySeverity[severity]}
    {...props}
  />
);

const otherThemeColors: Array<{ themeColor: ThemeColor; icon: IconName }> = [
  { themeColor: 'primary', icon: 'rocket' },
  { themeColor: 'secondary', icon: 'bell' },
  { themeColor: 'tertiary', icon: 'star' },
  { themeColor: 'accent', icon: 'ai-sparkle' },
];

const HardCodedBanner = ({
  palette,
  ...props
}: Omit<BannerProps, keyof HardCodedColors | 'role' | 'icon'> & { palette: (typeof hardCodedPalettes)[number] }) => {
  const theme = useTheme2();

  return <Banner role="status" icon={palette.icon} {...(theme.isDark ? palette.dark : palette.light)} {...props} />;
};

const meta: Meta = {
  title: 'Information/Banner',
  component: Banner,
  parameters: {
    controls: { exclude: ['onRemove', 'action'] },
  },
  argTypes: {
    severity: {
      control: { type: 'select', options: severities },
    },
  },
};

export const Basic: StoryFn<SeverityBannerProps> = (args) => {
  return (
    <div>
      <SeverityBanner {...args}>
        Child content that includes some banner details, like maybe what actually happened.
      </SeverityBanner>
    </div>
  );
};

Basic.args = {
  severity: 'error',
  title: 'Basic',
};

const DismissibleExample = () => {
  const [visible, setVisible] = useState(true);

  if (!visible) {
    return <Button onClick={() => setVisible(true)}>Show banner again</Button>;
  }

  return (
    <SeverityBanner title="Dismissible banner" severity="info" onRemove={() => setVisible(false)}>
      Click the X icon to dismiss this banner.
    </SeverityBanner>
  );
};

// Example actions in the banner's colors: a severity's BannerActionButton, or one in the banner's icon color.
const SeverityAction = ({ severity }: { severity: Severity }) => (
  <BannerActionButton severity={severity} onClick={action('Action button clicked')}>
    Learn more
  </BannerActionButton>
);

const ThemeColorAction = ({ themeColor }: { themeColor: ThemeColor }) => {
  const theme = useTheme2();

  return (
    <BannerActionButton customColor={theme.colors[themeColor].text} onClick={action('Action button clicked')}>
      Learn more
    </BannerActionButton>
  );
};

const HardCodedAction = ({ palette }: { palette: (typeof hardCodedPalettes)[number] }) => {
  const theme = useTheme2();

  return (
    <BannerActionButton
      customColor={(theme.isDark ? palette.dark : palette.light).iconColor}
      onClick={action('Action button clicked')}
    >
      Learn more
    </BannerActionButton>
  );
};

export const Examples: StoryFn<SeverityBannerProps> = () => {
  return (
    <Stack direction="column">
      <StoryExample name="With buttonContent and children">
        <SeverityBanner
          title={'The title of the banner'}
          severity={'error'}
          buttonContent={<span>Close</span>}
          onRemove={action('Remove button clicked')}
        >
          Child content that includes some banner details, like maybe what actually happened
        </SeverityBanner>
      </StoryExample>
      <StoryExample name="Dismissible with X icon">
        <DismissibleExample />
      </StoryExample>
      <StoryExample name="Loading">
        <SeverityBanner title="Loading data" severity="info" isLoading>
          The spinner replaces the icon while something loads.
        </SeverityBanner>
      </StoryExample>
      <StoryExample name="Single line with X icon">
        <SeverityBanner
          title="A single line of text with a dismiss icon"
          severity="warning"
          onRemove={action('Remove button clicked')}
        />
      </StoryExample>
      <StoryExample name="No dismiss">
        <SeverityBanner title={'No dismiss'} severity={'success'} />
      </StoryExample>
      <StoryExample name="Severities">
        <Stack direction="column">
          {severities.map((severity) => (
            <SeverityBanner
              title={`Severity: ${severity}`}
              severity={severity}
              action={<SeverityAction severity={severity} />}
              buttonContent="Dismiss"
              onRemove={action('Dismiss button clicked')}
              key={severity}
            >
              Child content
            </SeverityBanner>
          ))}
        </Stack>
      </StoryExample>
      <StoryExample name="Compact">
        <Stack direction="column">
          {severities.map((severity) => (
            <SeverityBanner
              title={`Severity: ${severity.charAt(0).toUpperCase()}${severity.slice(1)}`}
              severity={severity}
              isCompact
              buttonContent="Dismiss"
              onRemove={action('Dismiss button clicked')}
              key={severity}
            />
          ))}
        </Stack>
      </StoryExample>
      <StoryExample name="Other theme colors">
        <Stack direction="column">
          {otherThemeColors.map(({ themeColor, icon }) => (
            <ThemeColorBanner
              title={`Theme color: ${themeColor}`}
              themeColor={themeColor}
              icon={icon}
              role="status"
              action={<ThemeColorAction themeColor={themeColor} />}
              buttonContent="Dismiss"
              onRemove={action('Dismiss button clicked')}
              key={themeColor}
            >
              Child content
            </ThemeColorBanner>
          ))}
        </Stack>
      </StoryExample>
      <StoryExample name="Hard-coded colors (light and dark palettes)">
        <Stack direction="column">
          {hardCodedPalettes.map((palette) => (
            <HardCodedBanner
              title={`Hard-coded: ${palette.name}`}
              palette={palette}
              action={<HardCodedAction palette={palette} />}
              buttonContent="Dismiss"
              onRemove={action('Dismiss button clicked')}
              key={palette.name}
            >
              Child content
            </HardCodedBanner>
          ))}
        </Stack>
      </StoryExample>
    </Stack>
  );
};

export default meta;
