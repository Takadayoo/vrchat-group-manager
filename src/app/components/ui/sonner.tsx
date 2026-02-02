import "@/styles/ui/sonner.css";
import type { ToasterProps } from "sonner";
import { Toaster as Sonner } from "sonner";

type Props = ToasterProps & {
  theme?: ToasterProps["theme"];
};

const Toaster = ({ theme = "system", ...props }: Props) => {
  return <Sonner theme={theme} className="toaster group" {...props} />;
};

export { Toaster };
