import { ApolloServer } from "apollo-server";
import {
    App,
    debounce,
    Editor,
    MarkdownView,
    Modal,
    Notice,
    Plugin,
    PluginSettingTab,
    Setting,
} from "obsidian";

import { schema } from "./schema";
import { Context } from "./context";

export interface LocalGraphQLSettings {
    httpPort: number;
}

const DEFAULT_SETTINGS: LocalGraphQLSettings = {
    httpPort: 28123,
};

export default class LocalGraphQL extends Plugin {
    settings: LocalGraphQLSettings;

    refreshServerState: () => void;

    async onload() {
        this.refreshServerState = debounce(
            this._restartServer.bind(this),
            1000
        );

        await this.loadSettings();

        this.addSettingTab(new LocalGraphQLSettingsTab(this.app, this));

        this.refreshServerState();
    }

    onunload() {
        if (this.server) {
            console.log("Stop graphql-server");
            this.server.stop();
            this.server = null;
        }
    }

    debounce<F extends (...args: any[]) => any>(
        func: F,
        delay: number
    ): (...args: Parameters<F>) => void {
        let debounceTimer: NodeJS.Timeout;
        return (...args: Parameters<F>): void => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => func(...args), delay);
        };
    }

    async loadSettings() {
        this.settings = Object.assign(
            {},
            DEFAULT_SETTINGS,
            await this.loadData()
        );
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }

    server: ApolloServer | null = null;

    _restartServer() {
        if (this.server) {
            this.server.stop();
            this.server = null;
        }

        const context: Context = {
            app: this.app,
        };

        this.server = new ApolloServer({
            schema,
            context,
        });
        this.server.listen({ port: this.settings.httpPort }).then(({ url }) => {
            console.log(`🚀  Server ready at ${url}`);
        });
    }
}

class LocalGraphQLSettingsTab extends PluginSettingTab {
    plugin: LocalGraphQL;

    constructor(app: App, plugin: LocalGraphQL) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;

        containerEl.empty();

        new Setting(containerEl).setName("Server port").addText((text) =>
            text
                .onChange((value) => {
                    this.plugin.settings.httpPort = parseInt(value);
                    this.plugin.saveSettings();
                    this.plugin.refreshServerState();
                })
                .setValue(this.plugin.settings.httpPort.toString())
        );
    }
}
