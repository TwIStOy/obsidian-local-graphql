alias b:= build
alias w:= watch

build:
	npm run build

watch:
	npm run dev

cp: build
	cp main.js ~/Projects/obsidian-data/Main/.obsidian/plugins/obsidian-local-graphql
	cp manifest.json ~/Projects/obsidian-data/Main/.obsidian/plugins/obsidian-local-graphql

