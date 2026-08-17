import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const templateRoot = new URL("../", import.meta.url);

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the interactive five-layer supply-chain map", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /ATLAS FORGE/);
  assert.match(html, /五层供应链树/);
  assert.match(html, /大语言模型能力提升/);
  assert.match(html, /HBM/);
  assert.match(html, /可展开至五层/);
  assert.doesNotMatch(html, /Your site is taking shape|Building your site|codex-preview/);
});

test("keeps the tree data and interaction model explicit", async () => {
  const [page, layout, css, packageJson] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.match(page, /function TreeBranch/);
  assert.match(page, /node\.layer < 5/);
  assert.match(page, /展开当前子树/);
  assert.match(page, /setExpanded/);
  assert.match(page, /sourceLinks/);
  assert.match(page, /NVDA/);
  assert.match(page, /CRDO/);
  assert.match(page, /GFS/);
  assert.match(page, /KLAC/);
  assert.match(page, /scenarioId/);
  assert.match(layout, /title: "Atlas Forge/);
  assert.match(layout, /lang="zh-CN"/);
  assert.match(css, /\.tree-children/);
  assert.match(css, /\.tree-node--root/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);

  await assert.rejects(
    access(new URL("app/_sites-preview/SkeletonPreview.tsx", templateRoot)),
  );
});
