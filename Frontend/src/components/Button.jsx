// import React, { useState } from 'react'

// const variantStyles = {
//   primaryBorder: {
//     base: { backgroundColor: 'transparent', color: 'var(--color-primary)', borderColor: 'var(--color-primary)' },
//     hover: { backgroundColor: 'var(--color-primary)', color: 'white' }
//   },
//   secondaryBorder: {
//     base: { backgroundColor: 'transparent', color: 'var(--color-secondaryd)', borderColor: 'var(--color-secondaryd)' },
//     hover: { backgroundColor: 'var(--color-secondaryd)', color: 'white' }
//   },
//   primary: {
//     base: { backgroundColor: 'var(--color-primary)', color: 'white', borderColor: 'var(--color-primary)' },
//     hover: { backgroundColor: 'var(--color-primary-hover, #)', color: 'white', borderColor: 'var(--color-primary-hover, #)' }
//   },
//   secondary: {
//     base: { backgroundColor: 'var(--color-secondaryd)', color: 'white', borderColor: 'var(--color-secondaryd)' },
//     hover: { backgroundColor: 'var(--color-secondaryd-hover, #4b5563)', color: 'white', borderColor: 'var(--color-secondaryd-hover, #4b5563)' }
//   },
//   blank: {
//     base: { backgroundColor: 'transparent', color: 'var(--color-primary)', border: 'none' },
//     hover: { backgroundColor: 'var(--color-neutral2)', color: 'var(--color-primary-hover)', border: 'none'}
//   },
// }

// const sizeStyles = {
//   small: { padding: '0.5rem 1rem', fontSize: '0.85rem' },
//   medium: { padding: '0.75rem 1.25rem', fontSize: '0.95rem' },
//   large: { padding: '1rem 1.75rem', fontSize: '1.05rem' },
// }

// const Button = ({ children, variant = 'primaryBorder', size = 'medium', className = '', style = {}, ...rest }) => {
//   // Track hover state locally for inline styles
//   const [isHovered, setIsHovered] = useState(false)

//   const baseStyle = {
//     display: 'inline-flex',
//     alignItems: 'center',
//     justifyContent: 'center',
//     gap: '0.5rem',

//     fontFamily: 'var(--font-primary, sans-serif)',
//     fontWeight: 700,
//     cursor: 'pointer',
//     transition: 'background-color 150ms ease, color 150ms ease, border-color 150ms ease',
//     textDecoration: 'none',
//     minWidth: 'fit-content',
//     lineHeight: 1.2,
//     borderStyle: 'solid',
//     borderWidth: '2px', 
//   }

//   // Fallback to primaryBorder if the variant name doesn't exist
//   const variantConfig = variantStyles[variant] ?? variantStyles.primaryBorder
  
//   // Extract base or hover styles depending on current active state
//   const buttonVariant = isHovered ? variantConfig.hover : variantConfig.base
//   const buttonSize = sizeStyles[size] ?? sizeStyles.medium

//   return (
//     <button
//       className={className}
//       onMouseEnter={() => setIsHovered(true)}
//       onMouseLeave={() => setIsHovered(false)}
//       style={{ ...baseStyle, ...buttonVariant, ...buttonSize, ...style }}
//       {...rest}
//     >
//       {children}
//     </button>
//   )
// }

// export default Button


import React, { useState } from 'react'

const variantStyles = {
  primaryBorder: {
    base: { backgroundColor: 'transparent', color: 'var(--color-primary)', borderColor: 'var(--color-primary)' },
    hover: { backgroundColor: 'var(--color-primary)', color: 'white' }
  },
  secondaryBorder: {
    base: { backgroundColor: 'transparent', color: 'var(--color-secondaryd)', borderColor: 'var(--color-secondaryd)' },
    hover: { backgroundColor: 'var(--color-secondaryd)', color: 'white' }
  },
  primary: {
    base: { backgroundColor: 'var(--color-primary)', color: 'white', borderColor: 'var(--color-primary)' },
    hover: { backgroundColor: 'var(--color-primary-hover, #)', color: 'white', borderColor: 'var(--color-primary-hover, #)' }
  },
  secondary: {
    base: { backgroundColor: 'var(--color-secondaryd)', color: 'white', borderColor: 'var(--color-secondaryd)' },
    hover: { backgroundColor: 'var(--color-secondaryd-hover, #4b5563)', color: 'white', borderColor: 'var(--color-secondaryd-hover, #4b5563)' }
  },
  blank: {
    base: { backgroundColor: 'transparent', color: 'var(--color-primary)', border: 'none' },
    hover: { backgroundColor: 'var(--color-neutral2)', color: 'var(--color-primary-hover)', border: 'none'}
  },
}

const sizeStyles = {
  small: { padding: '0.6rem 1rem', fontSize: '1rem' },
  medium: { padding: '0.85rem 1.3rem', fontSize: '1.1rem' },
  large: { padding: '1.1rem 1.9rem', fontSize: '1.2rem' },
}

const Button = ({ children, variant = 'primaryBorder', size = 'medium', className = '', style = {}, ...rest }) => {
  // Track hover state locally for inline styles
  const [isHovered, setIsHovered] = useState(false)

  const baseStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',

    // fontFamily: 'var(--font-primary, sans-serif)',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'background-color 150ms ease, color 150ms ease, border-color 150ms ease',
    textDecoration: 'none',
    minWidth: '7rem',
    lineHeight: 1.2,
    borderStyle: 'solid',
    borderWidth: '2px', 
  }

  // Fallback to primaryBorder if the variant name doesn't exist
  const variantConfig = variantStyles[variant] ?? variantStyles.primaryBorder
  
  // Extract base or hover styles depending on current active state
  const buttonVariant = isHovered ? variantConfig.hover : variantConfig.base
  const buttonSize = sizeStyles[size] ?? sizeStyles.medium

  return (
    <button
      className={className}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ ...baseStyle, ...buttonVariant, ...buttonSize, ...style }}
      {...rest}
    >
      {children}
    </button>
  )
}

export default Button
