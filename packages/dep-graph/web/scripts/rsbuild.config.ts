import tailwindcss from 'tailwindcss';
import getPort from 'get-port';
import { pluginReact } from '@rsbuild/plugin-react';
import { defineConfig } from '@rsbuild/core';
import { type DepGraph } from '@demo/dep-graph-core';

export default async ({
  readStats,
}: {
  readStats: () => Promise<DepGraph>;
}) => {
  const handleStatsRequest = async (req, res, next) => {
    if (req.url === '/api/graph' && req.method === 'GET') {
      try {
        res.writeHead(200, {
          'Content-Type': 'application/json; charset=utf-8',
        });
        const stats = await readStats();
        res.write(JSON.stringify(stats));
        res.end();
      } catch (e) {
        res.writeHead(500);

        res.write((e as Error).message);
        res.end();
      }
    } else {
      next();
    }
  };

  return defineConfig({
    plugins: [pluginReact()],
    html: {
      template: './index.html',
    },
    dev: {
      startUrl: true,
      setupMiddlewares: [
        middlewares => {
          middlewares.unshift(handleStatsRequest);
        },
      ],
    },
    server: {
      port: await getPort({ port: [3000, 3001, 3002] }),
    },
    tools: {
      postcss(config) {
        // @ts-expect-error
        config.postcssOptions?.plugins?.push(tailwindcss);
      },
    },
  });
};
