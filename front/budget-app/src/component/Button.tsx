import { type ButtonHTMLAttributes } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  text: string;
  className?: string;
}

const Button = (props: ButtonProps) => {
  const { text, className, ...rest } = props;
  return (
    <button className={`${className} button`} {...rest}>
      {text}
    </button>
  );
};

export default Button;
