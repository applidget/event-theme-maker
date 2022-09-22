# Eventmaker themes

## Tech stack

Eventmaker themes are built with:

- HTML
- [Liquid](https://shopify.github.io/liquid/) as the template language
- CSS / SCSS
- Modern Javascript ([Webpack](https://webpack.js.org/) is running behind the hood)

## Repository structure

This repository can host several Eventmaker themes. The repository structure is:

```
/
  shared/                       => any shared assets to use in multiple themes
  themes/                       => root folder for all your themes
    my-theme-1/                 => root folder of a theme
      assets/
        js/
          main.js
        css/
          main.scss
      config/
        translations.json
      layouts/
        embed.liquid
        theme.liquid
      sections/
      snippets/
      templates/
      specs.yml
    my-other-themes/            => another theme
      ...
  package.json                  => here you can add external JS dependencies
```

Make sure you respect the theme structure.

## Theme structure

Zooming in to a theme:

```
my-theme-1/              => root folder must have the same name than the theme
  assets/
    js/
      main.js            => the JS entry point. Webpack will bundle all the JS starting from this file
    css/
      main.scss          => the CSS entry point. Webpack will bundle all the CSS starting from this file
  config/
    translations.json
  layouts/               => mandatory layouts files
    embed.liquid
    theme.liquid
  sections/              => theme sections (liquid)
  snippets/              => theme snippets (liquid)
  templates/
  specs.yml              => file describing your theme
```

[Full documentation about theming environement](docs/theming.md)

## Working on a theme

You can use both `yarn` or `npm`. In the readme we will use `yarn`, if you use `npm`, remember to escape command line arguments:

```
yarn start -e XXX -n YYY
```

would translate to:

```
npm run start -- -e XXX -n YYY
```

### 1️⃣ Eventmaker theme developer

You will need an account on Eventmaker and you should contact Eventmaker so they allow you to work on themes.

⚠️ When working on a theme, you should use an event dedicated for themes building and never use a production event.

### 2️⃣ Create a new theme

Run `yarn create-theme -n theme-name -b BASE_THEME` to create a new theme.

Eventmaker themes can depend on other themes. We will provide you with existing Eventmaker themes so you don't have to start from scratch. **Do not edit thoses themes**. Instead run the command above and you can start on a clean state. The base themes you are building on will have a `.locked` file at their root.

### 3️⃣ Start

Once you have a developer account, you can run `yarn install` to pull up initial dependencies.
Then run:

```
yarn start -e EVENT_ID -t TOKEN -n THEME_NAME
```

This will start the development environment and the website of the event you specified will be bound to your development environment. From here you can start editing liquid, js and css the website of your event will update with your changes.

Run `yarn start help` to see the full list of options.

### 4️⃣ Validate

Run `yarn valiate -n THEME_NAME` to run validations. This will perform a bunch of checks to make sure your theme is valid.

### 5️⃣ Release

Run `yarn release -n THEME_NAME -t TOKEN` to publish your theme. Once published your theme may be used by your other events.

