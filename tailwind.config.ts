import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}", "./docs/**/*.{md,mdx}"],
  theme: {
    extend: {
      colors: {
        "layer-0": "var(--color-layer-0)",
        "layer-1": "var(--color-layer-1)",
        "layer-2": "var(--color-layer-2)",
        "layer-3": "var(--color-layer-3)",
        primary: "var(--color-primary)",
        "primary-hover": "var(--color-primary-hover)",
        "primary-soft": "var(--color-primary-soft)",
        "border-primary": "var(--color-border-primary)",
        "border-secondary": "var(--color-border-secondary)",
        "text-primary": "var(--color-text-primary)",
        "text-secondary": "var(--color-text-secondary)",
        "text-tertiary": "var(--color-text-tertiary)",
        success: "var(--color-success)",
        warning: "var(--color-warning)",
        danger: "var(--color-danger)",
        "handle-text": "var(--color-handle-text)",
        "handle-image": "var(--color-handle-image)",
        "handle-any": "var(--color-handle-any)",
      },
      boxShadow: {
        panel: "0 10px 30px rgba(24, 27, 35, 0.08)",
        node: "0 18px 38px rgba(24, 27, 35, 0.12)",
        floating: "0 12px 28px rgba(24, 27, 35, 0.14)",
      },
      borderRadius: {
        control: "8px",
        panel: "8px",
      },
      spacing: {
        "control-x": "0.875rem",
        "control-y": "0.625rem",
        "panel-x": "1rem",
        "panel-y": "0.875rem",
      },
    },
  },
};

export default config;

