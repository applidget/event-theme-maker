# event-theme-maker

The Eventmaker themes developers tool belt !

## Usage

In a repository containing Eventmaker themes run:

`npm i event-theme-maker --save-dev`

Then run:
- `start help`
- `release help`
- `release_email help`
- `release_document help`
- `validate help`
- `new_theme help`
- `new_repository help`

All arguments can be set by a json config file or by an environment variable prefixed by `ETM_`.

## Important options

### SSL Certificate Verification (`--insecure`)

The `--insecure` (or `-i`) option disables SSL certificate verification for HTTPS requests. This is useful when working behind corporate firewalls with self-signed certificates.

**⚠️ WARNING: This option should ONLY be used in development environments. NEVER use it in production.**

Example usage:
```bash
release --theme my-theme --token YOUR_TOKEN --insecure
```

When this option is enabled, you will see a warning message to remind you that SSL verification is disabled.

## How it works ?

When you run `start`
- A webpack dev server start to compile assets (in `theme/*/assets/{js|css}/main.{js|css}`)
- A local server starts to serve assets
- A local tunnel starts so your assets are accessible to the outside world
- Your theme layouts are sent over to Eventmaker to include your local assets URL in it
- A watcher will start so when you edit a liquid file it's automatically synchronized on Eventmaker

When you run `release`
- Your assets are built by webpack
- Your theme is bundled
- Development environment variables are replaced by production environment variables
- Your theme is published to the official Eventmaker theme repository
- Your theme is available to use on your production event on Eventmaker

When you run `release_email`
- Your email template is published to the official Eventmaker theme repository
- Your email template is available to use on your production event on Eventmaker

When you run `release_document`
- Your document template is published to the official Eventmaker theme repository
- Your document template is available to use on your production event on Eventmaker

When you run `validate` we perform a bunch of validations to help you build themes that runs nicely on Eventmaker

When you run `new_theme` we create an empty theme based on the one you chose.

Only a member of Eventmaker's team should run `new_repository`. It's used to create a new repository for customers wishing to develop their own Eventmaker themes 😊.

For email themes development, you can add your theme in the `email_themes` folder.
For document themes development, you can add your theme in the `document_themes` folder.

## Requirements

- You will need a **theme developer account on Eventmaker** ! Contact-us 😊.
- The port 9999 must be free (the webpack dev server will run on this port)
- `tar` must be installed (for the release command)
- The release command can only be used in a git repository (it will run `git rev` to version assets)
- This should be used in a repository that follows the structure for Eventmaker themes:


```
/
  shared/
  themes/
    my-theme-1/
      assets/
        js/
          main.js
        css/
          main.css
      config/
        translations.json
      layouts/
        embed.liquid
        theme.liquid
      sections/
      snippets/
      templates/
      specs.yml
    my-other-themes/
      ...
  email_themes/
    my-theme-1/
      config/
        *.json
      layouts/
        theme.liquid
      sections/
      snippets/
      specs.yml
    my-other-themes/
      ...
      specs.yml
  document_themes/
    my-theme-1/
      config/
        *.json
      layouts/
        theme.liquid
      sections/
      snippets/
      specs.yml
    my-other-theme/
      ...
      specs.yml
  package.json
```

- all commands (start, release and validate) must be run from the root of the repository

## For developers working on event-theme-maker

To work on this package, clone the repository and run `npm install`.
Then you can use your local version in a repositoy containging Eventmaker themes by modifying in the package.json:

`"event-theme-maker": "^x.y.z"`

by

`"event-theme-maker": "file:/path/to/the/root/of/this/repository"`
