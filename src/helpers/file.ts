import { App, CachedMetadata, TFile, Vault } from "obsidian";
import { getProp } from "./object";

export const getMarkdownFiles = (vault: Vault) => vault.getMarkdownFiles();

export const cachedRead = (vault: Vault) => (file: TFile) =>
    vault.cachedRead(file);

export const getFileCacheFromApp = (app: App) => (file: TFile) =>
    app.metadataCache.getFileCache(file);

export const getFrontmatter = getProp<CachedMetadata, "frontmatter">(
    "frontmatter"
);
