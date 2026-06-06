import { mkdir, readdir } from 'node:fs/promises';
import { dirname, join, relative } from 'node:path';

import { parsePropertyPageMarkdown } from '../infrastructure/property-page-markdown-parser';
import { PropertyPageJsonCodec } from '../infrastructure/property-page-json-codec';

function normalizePath(pathName: string): string {
  return pathName.replace(/\\/g, '/');
}

function isPropertyPageMarkdownPath(pathName: string): boolean {
  return /(^|\/)[^/]+_MD\/[^/]+\.md$/i.test(normalizePath(pathName));
}

async function ensureParentDirectory(filePath: string): Promise<void> {
  await mkdir(dirname(filePath), { recursive: true });
}

async function readTextPreservingBom(filePath: string): Promise<string> {
  const bytes = await Bun.file(filePath).arrayBuffer();
  return new TextDecoder('utf-8', { ignoreBOM: true }).decode(bytes);
}

async function collectMarkdownFiles(rootPath: string): Promise<readonly string[]> {
  const discovered: string[] = [];

  async function walk(currentPath: string): Promise<void> {
    const entries = await readdir(currentPath, { withFileTypes: true });
    for (const entry of entries) {
      const entryPath = join(currentPath, entry.name);
      if (entry.isDirectory()) {
        await walk(entryPath);
        continue;
      }

      if (entry.isFile() && entry.name.toLowerCase().endsWith('.md')) {
        discovered.push(entryPath);
      }
    }
  }

  await walk(rootPath);
  discovered.sort((left, right) => {
    if (left === right) {
      return 0;
    }

    return left < right ? -1 : 1;
  });
  return discovered.filter((filePath) => isPropertyPageMarkdownPath(relative(rootPath, filePath)));
}

function mapMarkdownPathToJsonPath(inputMarkdownPath: string, inputRootPath: string, outputRootPath: string): string {
  const relativePath = relative(inputRootPath, inputMarkdownPath);
  if (relativePath.startsWith('..')) {
    throw new Error(`Markdown file is outside the source root: ${inputMarkdownPath}`);
  }

  return join(outputRootPath, relativePath.replace(/\.md$/i, '.json'));
}

export class PropertyPageConverter {
  async markdownFileToJsonFile(inputMarkdownPath: string, outputJsonPath: string): Promise<void> {
    const markdownText = await readTextPreservingBom(inputMarkdownPath);
    const page = parsePropertyPageMarkdown(markdownText);

    await ensureParentDirectory(outputJsonPath);
    await Bun.write(outputJsonPath, PropertyPageJsonCodec.serialize(page));
  }

  async markdownTreeToJsonTree(inputRootPath: string, outputRootPath: string): Promise<readonly string[]> {
    const inputMarkdownPaths = await collectMarkdownFiles(inputRootPath);
    const outputJsonPaths: string[] = [];

    for (const inputMarkdownPath of inputMarkdownPaths) {
      const outputJsonPath = mapMarkdownPathToJsonPath(inputMarkdownPath, inputRootPath, outputRootPath);
      await this.markdownFileToJsonFile(inputMarkdownPath, outputJsonPath);
      outputJsonPaths.push(outputJsonPath);
    }

    return outputJsonPaths;
  }
}
