import { Style } from "hono/css";
import { styles } from "../styles/layout.style.ts";
import type { FC } from "hono/jsx";

type LayoutProps = {
  title: string;
  lang?: string;
  children: unknown;
};

export const Layout: FC<LayoutProps> = ({
  title,
  lang = "en",
  children,
}: LayoutProps) => (
  <html lang={lang}>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>{ title }</title>
      <Style>{ styles }</Style>
    </head>

    <body>
      { children }
    </body>
  </html>
);
