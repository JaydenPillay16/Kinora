// Minimal runtime surface for local TypeScript checks; deployed functions run on Deno.
declare const Deno: {
  env: { get(name: string): string | undefined };
  serve(handler: (request: Request) => Response | Promise<Response>): void;
};
