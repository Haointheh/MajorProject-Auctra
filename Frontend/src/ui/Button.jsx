import React from "react";

/* ---------------- VARIANTS (ONLY COLORS) ---------------- */
const variants = {
  primaryBorder: {
    base: {
      backgroundColor: "transparent",
      color: "var(--color-primary)",
      borderColor: "var(--color-primary)",
    },
    hover: {
      backgroundColor: "var(--color-primary)",
      color: "white",
      borderColor: "var(--color-primary)",
    },
  },

  secondaryBorder: {
    base: {
      backgroundColor: "transparent",
      color: "var(--color-secondaryd)",
      borderColor: "var(--color-secondaryd)",
    },
    hover: {
      backgroundColor: "var(--color-secondaryd)",
      color: "white",
      borderColor: "var(--color-secondaryd)",
    },
  },

  primary: {
    base: {
      backgroundColor: "var(--color-primary)",
      color: "white",
      borderColor: "var(--color-primary)",
    },
    hover: {
      backgroundColor: "var(--color-primary-hover)",
      color: "white",
      borderColor: "var(--color-primary-hover)",
    },
  },

  secondary: {
    base: {
      backgroundColor: "var(--color-secondaryd)",
      color: "white",
      borderColor: "var(--color-secondaryd)",
    },
    hover: {
      backgroundColor: "var(--color-secondaryd-hover)",
      color: "white",
      borderColor: "var(--color-secondaryd-hover)",
    },
  },

  blank: {
    base: {
      backgroundColor: "transparent",
      color: "var(--color-primary)",
      border: "none",
    },
    hover: {
      backgroundColor: "var(--color-neutral2)",
      color: "var(--color-primary-hover)",
      border: "none",
    },
  },
};

/* ---------------- SIZES (ONLY SPACING) ---------------- */
const sizes = {
  xs: {
    padding: "0.3rem 0.65rem",
    fontSize: "0.7rem",
    lineHeight: "1",
  },
  sm: {
    padding: "0.5rem 1rem",
    fontSize: "0.85rem",
  },
  md: {
    padding: "0.8rem 1.4rem",
    fontSize: "1rem",
  },
  lg: {
    padding: "1.1rem 2rem",
    fontSize: "1.15rem",
  },
};

/* ---------------- BASE STYLE (SHARED) ---------------- */
const baseStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  alignItems: "center",
  gap: "0.5rem",

  fontWeight: 700,
  cursor: "pointer",
  lineHeight: "normal",

  borderStyle: "solid",
  borderWidth: "2px",

  /* 🔥 your "unrounded / sharp" style */
  borderRadius: "0px",

  transition:
    "background-color 150ms ease, color 150ms ease, border-color 150ms ease",
};

/* ---------------- BUTTON COMPONENT ---------------- */
export default function Button({
  children,
  variant = "primaryBorder",
  size = "md",
  className = "",
  style = {},
  ...rest
}) {
  const [isHovered, setIsHovered] = React.useState(false);

  const variantConfig =
    variants[variant] || variants.primaryBorder;

  const sizeConfig = sizes[size] || sizes.md;

  const finalStyle = {
    ...baseStyle,
    ...sizeConfig,
    ...(isHovered ? variantConfig.hover : variantConfig.base),
    ...style,
  };

  return (
    <button
      className={className}
      style={finalStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...rest}
    >
      {children}
    </button>
  );
}