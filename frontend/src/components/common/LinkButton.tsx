import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { classNames } from '../../utils';
import { Icon } from './Icon';
import type { IconName } from './Icon';
import { buttonClasses } from './Button';
import type { ButtonSize, ButtonVariant } from './Button';

export interface LinkButtonProps {
  to: string;
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  leftIcon?: IconName;
  rightIcon?: IconName;
  className?: string;
  onClick?: () => void;
  'aria-label'?: string;
}

/**
 * Router link that looks like a Button. Use this instead of nesting a <Link>
 * inside a <button>, which produces invalid markup for assistive tech.
 */
export function LinkButton({
  to,
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  leftIcon,
  rightIcon,
  className,
  ...rest
}: LinkButtonProps) {
  return (
    <Link to={to} className={classNames(buttonClasses(variant, size, fullWidth), className)} {...rest}>
      {leftIcon ? <Icon name={leftIcon} className="h-4 w-4" /> : null}
      {children}
      {rightIcon ? <Icon name={rightIcon} className="h-4 w-4" /> : null}
    </Link>
  );
}

export default LinkButton;