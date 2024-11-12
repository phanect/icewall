import { html } from "hono/html";

type LayoutProps = {
  title: string;
  children: unknown;
}

export const Layout = ({ title, children }: LayoutProps) => html`
  <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>${ title }</title>
    </head>
    <body>
      ${ children }
    </body>
  </html>
`;
