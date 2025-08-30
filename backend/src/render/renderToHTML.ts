import { renderToPipeableStream } from "react-dom/server";
import { Readable } from "stream";

interface RenderOptions {
  bootstrapScripts?: string[];
  onShellReady?: () => void;
  onError?: (error: unknown) => void;
}

export function renderToHTML(
  element: React.ReactElement,
  options: RenderOptions = {}
): Promise<string> {
  return new Promise((resolve, reject) => {
    let didError = false;
    let html = "";

    const { pipe } = renderToPipeableStream(element, {
      bootstrapScripts: options.bootstrapScripts || [],
      onShellReady() {
        // The shell is ready, but we want to collect the entire HTML
        const writable = new Readable({
          read() {
            // This is a no-op read function
          },
        });

        const stream = pipe(writable as any);

        writable.on("data", (chunk) => {
          html += chunk.toString();
        });

        writable.on("end", () => {
          if (didError) {
            reject(new Error("Rendering failed"));
          } else {
            resolve(html);
          }
        });

        writable.on("error", (error) => {
          didError = true;
          reject(error);
        });
      },
      onError(error: unknown) {
        didError = true;
        console.error("RSC rendering error:", error);
        if (options.onError) {
          options.onError(error);
        }
        reject(error);
      },
    });
  });
}

export function renderToStream(
  element: React.ReactElement,
  res: any,
  options: RenderOptions = {}
): void {
  let didError = false;

  const { pipe } = renderToPipeableStream(element, {
    bootstrapScripts: options.bootstrapScripts || ["/static/js/main.js"],
    onShellReady() {
      res.setHeader("content-type", "text/html");
      if (options.onShellReady) {
        options.onShellReady();
      }
      pipe(res);
    },
    onError(error: unknown) {
      didError = true;
      console.error("RSC rendering error:", error);
      if (options.onError) {
        options.onError(error);
      }
      // Send error response
      if (!res.headersSent) {
        res.status(500).send("Internal Server Error");
      }
    },
  });
}
