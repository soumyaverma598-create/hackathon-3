import React from 'react';
import { createUseStyles } from 'react-jss';

const useStyles = createUseStyles({
  buttonBase: {
    border: 'none',
    fontWeight: 700,
    cursor: 'pointer',
    borderRadius: '12px',
    transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
    outline: 'none',
    width: '100%',
    padding: '12px 20px',
    fontSize: '14px',
    '&:disabled': {
      opacity: 0.6,
      cursor: 'not-allowed',
      transform: 'none !important',
    },
    '&:active:not(:disabled)': {
      transform: 'scale(0.98)',
    },
  },

  primary: {
    extend: 'buttonBase',
    background: 'linear-gradient(135deg, #0B3D91 0%, #1565C0 50%, #0D47A1 100%)',
    color: '#ffffff',
    boxShadow: '0 8px 16px rgba(11, 61, 145, 0.35), inset 0 2px 4px rgba(255, 255, 255, 0.2)',
    '&:hover:not(:disabled)': {
      boxShadow: '0 12px 24px rgba(11, 61, 145, 0.5), inset 0 2px 4px rgba(255, 255, 255, 0.3)',
      transform: 'translateY(-2px)',
    },
    '&:active:not(:disabled)': {
      boxShadow: '0 4px 12px rgba(11, 61, 145, 0.3), inset 0 3px 6px rgba(0, 0, 0, 0.1)',
      transform: 'scale(0.98)',
    },
  },

  secondary: {
    extend: 'buttonBase',
    background: 'linear-gradient(135deg, #E3F2FD 0%, #F0F9FF 100%)',
    color: '#0B3D91',
    boxShadow: '0 4px 12px rgba(11, 61, 145, 0.15), inset 0 1px 3px rgba(255, 255, 255, 0.6)',
    border: '2px solid rgba(11, 61, 145, 0.2)',
    '&:hover:not(:disabled)': {
      boxShadow: '0 8px 16px rgba(11, 61, 145, 0.25), inset 0 1px 3px rgba(255, 255, 255, 0.8)',
      transform: 'translateY(-2px)',
      borderColor: 'rgba(11, 61, 145, 0.4)',
    },
  },

  social: {
    extend: 'buttonBase',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    background: '#ffffff',
    color: '#374151',
    border: '2px solid #E5E7EB',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.08), inset 0 1px 2px rgba(255, 255, 255, 0.9)',
    justifyContent: 'flex-start',
    fontSize: '13px',
    fontWeight: 600,
    paddingLeft: '16px',
    '& svg': {
      flexShrink: 0,
      width: '20px',
      height: '20px',
    },
    '&:hover:not(:disabled)': {
      boxShadow: '0 6px 12px rgba(0, 0, 0, 0.12), inset 0 1px 2px rgba(255, 255, 255, 0.95)',
      transform: 'translateY(-1px)',
      borderColor: '#CBD5E1',
      backgroundColor: '#F8FAFC',
    },
  },

  demoCredential: {
    extend: 'buttonBase',
    padding: '16px 12px',
    fontSize: '12px',
    textAlign: 'left',
    background: 'linear-gradient(135deg, #ffffff 0%, #F0F9FF 100%)',
    color: '#164e63',
    border: '2px solid #E5E7EB',
    boxShadow: '0 4px 8px rgba(22, 78, 99, 0.1), inset 0 1px 3px rgba(255, 255, 255, 0.8)',
    '&:hover:not(:disabled)': {
      boxShadow: '0 8px 16px rgba(22, 78, 99, 0.2), inset 0 1px 3px rgba(255, 255, 255, 0.9)',
      transform: 'translateY(-3px)',
      borderColor: '#164e63',
      background: 'linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%)',
    },
  },

  tab: {
    extend: 'buttonBase',
    background: '#ffffff',
    color: '#6B7280',
    border: 'none',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
    padding: '10px 16px',
    fontSize: '13px',
    fontWeight: 600,
    borderRadius: '14px',
    width: 'auto',
    flex: 1,
    '&[data-active="true"]': {
      background: 'linear-gradient(135deg, #0B3D91 0%, #1565C0 100%)',
      color: '#ffffff',
      boxShadow: '0 4px 12px rgba(11, 61, 145, 0.3), inset 0 1px 3px rgba(255, 255, 255, 0.2)',
    },
    '&:not([data-active="true"]):hover': {
      background: '#F3F4F6',
      color: '#374151',
    },
  },

  back: {
    extend: 'buttonBase',
    background: 'transparent',
    color: '#164e63',
    border: 'none',
    boxShadow: 'none',
    width: 'auto',
    padding: '6px 8px',
    fontSize: '13px',
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    '&:hover:not(:disabled)': {
      color: '#0f3650',
      transform: 'translateX(-2px)',
      textDecoration: 'underline',
      textDecorationThickness: '2px',
      textUnderlineOffset: '4px',
    },
  },

  roleLabel: {
    fontSize: '10px',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
    opacity: 0.7,
    marginBottom: '4px',
  },

  emailText: {
    fontSize: '11px',
    fontWeight: 600,
    marginTop: '8px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
});

export const PrimaryButton = React.forwardRef(({ children, className = '', style, ...props }, ref) => {
  const classes = useStyles();
  return (
    <button
      ref={ref}
      className={`${classes.primary} ${className}`}
      style={style}
      {...props}
    >
      {children}
    </button>
  );
});
PrimaryButton.displayName = 'PrimaryButton';

export const SecondaryButton = React.forwardRef(({ children, className = '', ...props }, ref) => {
  const classes = useStyles();
  return (
    <button
      ref={ref}
      className={`${classes.secondary} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
});
SecondaryButton.displayName = 'SecondaryButton';

export const SocialButton = React.forwardRef(({ children, icon, className = '', ...props }, ref) => {
  const classes = useStyles();
  return (
    <button
      ref={ref}
      className={`${classes.social} ${className}`}
      {...props}
    >
      {icon && <span>{icon}</span>}
      <span>{children}</span>
    </button>
  );
});
SocialButton.displayName = 'SocialButton';

export const DemoCredentialButton = React.forwardRef(({ role, email, className = '', style, ...props }, ref) => {
  const classes = useStyles();
  return (
    <button
      ref={ref}
      className={`${classes.demoCredential} animate-fade-slide-up ${className}`}
      style={style}
      {...props}
    >
      <div className={classes.roleLabel}>{role}</div>
      <div className={classes.emailText}>{email}</div>
    </button>
  );
});
DemoCredentialButton.displayName = 'DemoCredentialButton';

export const TabButton = React.forwardRef(({ children, active = false, className = '', ...props }, ref) => {
  const classes = useStyles();
  return (
    <button
      ref={ref}
      className={`${classes.tab} ${className}`}
      data-active={active}
      {...props}
    >
      {children}
    </button>
  );
});
TabButton.displayName = 'TabButton';

export const BackButton = React.forwardRef(({ children, className = '', ...props }, ref) => {
  const classes = useStyles();
  return (
    <button
      ref={ref}
      className={`${classes.back} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
});
BackButton.displayName = 'BackButton';
