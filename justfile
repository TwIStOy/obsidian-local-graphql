build:
	npm run build

cp: build
	cp main.js ~/Projects/obsidian-data/Main/.obsidian/plugins/obsidian-local-graphql
	cp manifest.json ~/Projects/obsidian-data/Main/.obsidian/plugins/obsidian-local-graphql

