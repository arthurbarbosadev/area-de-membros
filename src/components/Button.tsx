import { forwardRef, type ButtonHTMLAttributes } from "react";

type Variant = "glow" | "ghost";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
};

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { variant = "glow", className = "", children, ...rest },
  ref,
) {
  const cls = variant === "glow" ? "btn-glow" : "btn-ghost";
  return (
    <button ref={ref} {...rest} className={`${cls} ${className}`.trim()}>
      {children}
    </button>
  );
});
