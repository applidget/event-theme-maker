# Eventmaker website theme squeleton

This is a starting point for an Eventmaker Website theme.

## Folder structure

    ├── themes
    │   ├── standard
    |   |   ├── assets
    |   |   |   ├── // fichier d'assets
    |   |   |   ├── ...
    |   |   ├── config
    |   |   |   ├── main_settings_schema.json
    |   |   |   ├── presets.en.json
    |   |   |   ├── presets.fr.json
    |   |   |   ├── sections-groups.json
    |   |   |   ├── translations.json
    |   |   ├── layouts
    |   |   |   ├── // fichier de layout
    |   |   |   ├── ...
    |   |   ├── sections
    |   |   |   ├── // fichier de section
    |   |   |   ├── ...
    |   |   ├── snippets
    |   |   |   ├── // fichier de snippet
    |   |   |   ├── ...
    |   |   ├── templates
    |   |   |   ├── // fichier pour les pages d'erreurs
    |   |   |   ├── ...
    |   |   ├── package.json
    |   |   ├── specs.yml
    └── README.md

# Working on a theme

Le language utilisé est le "Liquid" développé par Shopify, une doc est disponible [ici](https://shopify.github.io/liquid).

Vous avez accès aux paramètres de l'URL avec la variable liquid `url_params` (ex: avec https://www.monsite.eventmaker.io/index?superParams=true pour connaitre la valeur de `superParams` on fera `url_params.superParams` qui renverra une String `true`).

# Config

## spec.yml

Ce fichier de configuration est utilisé pour charger le thème ainsi que lors des mises à jour de celui-ci.

Il recense les chemins vers les fichiers du thème (sections, snippets, presets, traductions, layouts, etc...).

Lors de l'ajout d'une section par exemple, il ne faut pas oublier de l'ajouté dans le YAML pour qu'elle puisse être séléctionnée via l'interface de personnalisation du site web.

## package.json

Ce fichier permet de configurer l'exécution des script Yarn ainsi que d'installer des dépendances spécifiques au thèmes lors des builds Webpack.

## config\main_settings_schema.json

Ce fichier permet de créer les paramètres généraux du site (réseaux sociaux, couleur des titres, couleur du fond, couleur du texte, espacement des sections, police de caractères, etc...). Tout ce qui n'est pas propre à une seule section et/ou qui doit apparaitre dans le layout devra exister ici.

Pour réutiliser ces paramètres dans le HTML il faut faire `settings.id_of_setting` (ex: pour appeler la couleur du texte du site web: `settigns.color_body_text`).

## config\presets.fr.json et presets.en.json

Il s'agit des paramètres par défaut à la création d'un site web avec ce thème.

Afin d'avoir directement un site web fonctionel vous pouvez choisir les paramètres par défaut, comme les couleurs du site, les pages existantes et les sections présentent sainsi que leur contenu de chacune.

## config\sections-groups.json

Ce fichier permet de créer différents groupes de sections pour pouvoir les ordonners. Lors de l'ajout d'une section via l'interface de personnalisation les différentes sections sont alors regroupées par groupe (basique, média, inscription, etc...).

## config\translations.json

Ce fichier permet de configurer tous les textes qui ne sont pas personnalisables, mais qui doivent être traduit dans la langue du site web.

Chaque langue est représenté par sa clé ISO (fr pour français, it pour italien, etc...) et chaque traduction est sous la forme `"clé": "valeur"`.

Les traductions peuvent être utiliser partout sur le site en faisant `t.key_of_translation`.

Si vous souhaitez avoir un contenu dynamique dans une traduction celle-ci se présentera comme ceci: `"clé": "Mon nom est %{ texte_variable }"`. Pour que cela fonctionne il faut aussi que dans le fichier où cette traduction est appelée il existe une variable liquid dont la valeur est la partie changeante (`{% capture texte_variable %}{{ guest.first_name }}{% endcapture %}`).

# Assets

Ce dossier contient les ressources du thème fichiers Css et JS ils sont compilés par Webpacker et peuvent faire des appel dynamique à des fichiers contenu dans d'autre dossier du repo par @import (Css) ou import (JS).

# Layout

Les layouts sont des squelettes pour chaque page du site. On y retrouve les éléments qui doivent être présent à chaque fois (CSS, Js, Favicon, etc...).

# Sections

Les sections sont les éléments que l'on peut ajouter à une page via l'interface de personnalisation du site web.

Chaque section est constituée de deux parties distinctes: le code HTML et le schéma.

## Le code HTML d'une section

Dans le code HTML vous pouvez utiliser les paramètres généraux `settings.id_of_the_setting`. Mais aussi et surtout les paramètres de la section créer dans le schéma: `section.settings.id_of_the_section_setting`.

## Le schéma d'une section

Le schéma nous donne des informations sur la section et nous permet de créer les options que l'on souhaite pour personnalisé la section.

    {% schema %}
      {
        ...
      }
    {% endschema %}


Les premiers éléments du schéma sont des informations générales sur la section.

    {% schema %}
      {
        "name": "English title - show on the website builder",
        "name_translations": { "fr": "Titre en français - afficher dans l'interface de personnalisation du site web" },
        "icon": "fa fa-font", // Classes Font-awesome pour l'icone afficher dans l'interface de personnalisation. Ruby gems font-awesome-rails-4.7.0.5
        "hidden_from_user": false,
        "group_key": "basic", // Dans quel groupe la section sera affichée
        "group_rank": 1000, // Son ordre dans le groupe
        "settings": [
          ...
        ]
      }
    {% endschema %}

### Les settings

Comment se présentent les `settings` ?

`settings` est un tableau des différents paramètres de la section. De manière général un setting est présenté sous cette forme:

    {
      "type": "text",
      "id": "title",
      "label": "Title",
      "label_translations": { "fr": "Titre" },
      "info": "Info display under this setting",
      "info_translations": { "fr": "Info afficher sous ce paramètre" },
      "default": "Title",
      "default_translations": { "fr": "Titre" }
    }

- `type` au choix parmi la liste suivante:

| Type                    | Description |
| ----------------------- | ----------- |
| header                  | Renvois un titre pour une meilleure présentation des paramètres. |
| text                    | Renvois un champ texte simple. |
| paragraph               | Renvois un champ de type textarea. |
| rte                     | Renvois un RTE. |
| image\_picker           | Renvois un uploader d'image. |
| select                  | Renvois une liste déroulante des options qui lui sont fournit. |
| checkbox                | Renvois une case à cocher. |
| color                   | Renvois une palette de choix de couleur. |
| guest\_category\_picker | Renvois une liste déroulante des catégories de l'évènement. |
| segments\_picker        | Renvois une liste déroulante des segments de l'évènement. |
| website\_page\_picker   | Renvois une liste déroulante des pages du site. |
| guest\_field\_picker    | Renvois une liste déroulante des champs de participants. |

- `id` est la clé utilisée dans le code HTML pour utiliser la valeur de ce setting: `section.settings.title`.
- `label` est par défaut en anglais.
- `label_translations` est un tableau de traduction. La plateforme est disponible en français et en anglais uniquement.
- `info` information afficher sous le paramètre, si le back office est pas défaut en anglais.
- `info_translations` fonctionne de la même façon que `label_translation`.
- `default` est la valeur remplis par défaut si le back office est en anglais.
- `default_translations` fonctionne de la même façon que `label_translation`.

#### Spécificitées

Certains types de setting on besoin de plus qu'un `label`, un `id` et un `type` pour fonctionner.

- `select` : les settings de type _select_ on besoin d'options pour fonctionner. L'option vide est générée automatiquement.

Exemple:

    {
      "type": "select",
      "id": "text_size",
      "label": "Text size",
      "label_translations": { "fr": "Taille du texte" },
      "default": "medium",
      "options": [
        {
          "label": "Medium",
          "label_translations": { "fr": "Moyen" },
          "value": "medium"
        },
        {
          "label": "Large",
          "label_translations": { "fr": "Gros" },
          "value": "large"
        }
      ]
    }

- `checkbox` : sa valeur par défaut sera un booléen (`true` / `false`), pas une String.
- `color` : sa valeur par défaut doit être un code héxadécimal.

#### Condition d'affichage - Show_if

À chaque setting il est possible d'ajouter une condition d'affichage (`show_if`).

Par exemple on laissera la possibilité de personnaliser la **Couleur du bouton** seulement si la checkbox **"Appliquer un style personnalisé"** est cochée:

    {
      "type": "checkbox",
      "id": "enable_custom_css",
      "label": "Apply a custom style",
      "label_translations": { "fr": "Appliquer un style personnalisé" },
      "default": false
    },
    {
      "type": "color",
      "id": "button_color",
      "label": "Button color",
      "label_translations": { "fr": "Couleur du bouton" },
      "default": "#000",
      "show_if": [
        [
          {
            "source_id": "enable_custom_css",
            "operator": "==",
            "value": true
          }
        ]
      ]
    }

Il est possible de faire des conditions multiples avec des ET :

Si `checkbox_1` == true ET `checkbox_2` == true

    "show_if": [
      [
        {
          "source_id": "checkbox_1",
          "operator": "==",
          "value": true
        },
        {
          "source_id": "checkbox_1",
          "operator": "==",
          "value": true
        }
      ]
    ]

Mais aussi des OU:

Si `checkbox_1` == true OU `checkbox_2` == true

    "show_if": [
      [
        {
          "source_id": "checkbox_1",
          "operator": "==",
          "value": true
        }
      ],
      [
        {
          "source_id": "checkbox_1",
          "operator": "==",
          "value": true
        }
      ]
    ]

### Les blocs

Les blocs sont des éléments que l'utilisateur de l'interface de personnalisation peuvent ajouter dans la limite disponible (si `max_blocks` est définit). Cela permet de créer des éléments de même nature plusieurs fois (ex: dans la section `feature-colums.liquid` les blocs sont utilisé pour créer les différentes colones. Nous pouvons en faire 1, 2, 4, ou plus et gérer leur affichage sans faire plusieurs sections).

`"type": "text_block"` permet de faire des presets pour qu'un certain nombre de blocs soient créés au moment de l'ajout de la section à une page.

`display_property` prend comme valeur l'id d'un des settings de bloc pour en afficher la valeur dans l'interface de personnalisation (ex: `"display_property" : "title"` pour que le titre d'un bloc soit afficher pour le nommer et le retrouver plus facilement dans l'interface de personnalisation de la section).

    {% schema %}
      {
        "max_blocks": 4,
        "settings": [
          ...
        ],
        "blocks": [
          {
            "type": "text_block",
            "name": "Blocks",
            "name_translations": { "fr": "Blocs" },
            "add_block": "Text for a new block",
            "add_block_translations": { "fr": "Texte pour un Nnuveau bloc" },
            "remove_block": "Text to remove this block",
            "remove_block_translations": { "fr": "Texte pour retirer ce bloc" },
            "display_property": "id_of_block_settings",
            "settings": [
              ...
            ]
          }
        ],
        "presets": [
          {
            "name": "Name of the section",
            "name_translations": { "fr": "Nom de la section" },
            "blocks": [
              {
                "type": "text_block"
              },
              {
                "type": "text_block"
              },
              {
                "type": "text_block"
              }
            ]
          }
        ]
      }
    {% endschema %}

# Snippets

Les snippets sont des fragments de codes utilisables dans plusieurs sections ou layouts. Pour éviter d'avoir plusieurs fois le même code dans différentes sections, vous pouvez inclure un snippet.

Pour cela il suffit de faire `{% include "filename_of_the_snippet" %}`.

Vous pouvez aussi passer des paramètres à ce snippet: `{% include "filename_of_the_snippet", section_settings: section.settings %}`.
Et ainsi dans le snippet vous avez accès à ce paramètre `section_settings`.

Contrairement aux sections, les snippets n'ont pas de schéma.

# Templates

Le dossier `templates` contient des gabaries de pages pour différents cas (fonctionnement normal, erreur 401, erreur 404, Offline, etc...).

# Variables Liquid

Vous avez accès à différentes variables Liquid:

## Variables globales

Voici la liste des variables Liquid disponiblent sur le website.

    {
      "page" => {
        "name" => "Page name",
        "path_name" => "information",
        "registration_form_page?" => false,
        "registration_confirmation_page?" => false
      },
      "settings" => {},
      "pages" => {},
      "checkin_points" => [], // Tableau des accréditations de type checkin_points
      "products" => [], // Tableau des accréditations de type products
      "accommodations" => [], // Tableau des accréditations de type accommodations
      "accesspoints_by_id" => {},
      "event" => {},
      "menus" => {
        "name" => "Navigation",
        "key" => "navigation",
        "menu_items" => {
          "name" => "Let's go on Google",
          "type" => "external_link",
          "localized_name" => "Allons sur Google",
          "url" => "https://www.google.com/",
          "displayable?" => true
        },
      },
      "t" => {},
      "locale" => "en",
      "current_resource" => {} 
    }

## Évènement
    {{ event }}
    {
      "title" => "My Event Name",
      "organizer" => "Eventmaker Developers",
      "description" => "This event has not begun yet",
      "timezone" => "Paris",
      "id" => "5408886b4f6905cb83000001",
      "address" => "38 Rue Laffitte, 75009 Paris",
      "grey_label_enabled" => true,
      "primary_color" => nil,
      "secondary_color" => nil,
      "cover" => nil,
      "background_url" => nil
      "photo" => nil,
      "photo_original" => nil,
      "start_date" => Wed, 31 Dec 2014 22:00:00 CET +01:00,
      "end_date" => Thu, 01 Jan 2015 07:00:00 CET +01:00,
      "guest_categories" => {}
    }

## Catégories de participants

    {{ guest_category }}
    {
      "name" => "Catégorie 1",
      "id" => "5408886b4f6905cb83000002"
      "badge_enabled" => true,
      "traits" => {},
      "price" => 0.0,
      "vat" => 0.0,
      "price_without_vat" => 0.0,
      "price_with_vat" => 0.0,
      "vat_amount" => 0.0
    }

## Participants
    {{ guest }}
    {
      "uid" => "12345654324",
      "status" => "registered",
      "email" => "john.smith@gmail.com",
      "avatar" => nil,
      "first_name" => "John",
      "last_name" => "Smith",
      "position" => "Director",
      "company_name" => "Eventmaker",
      "phone_number" => "1234567890",
      "address" => "38 Rue Laffitte, 75009 Paris",
      "country_name" => "France",
      "country" => "FRA",
      "payment_promo_code" => "MY_PROMO_CODE",
      "utm_source" => "",
      "utm_medium" => "",
      "utm_campaign" => "",
      "event_id"  => "540f0cf24f6905a277000005",
      "guest_category_id" => "540992164f690552c7000004",
      "has_access_privileges" => true,
      "send_email_on_guest_category_change" => true,
      "confirmation_email_sent" => true,
      "discount_code_label" => "My discount code label",
      "price_incl_vat" => 120.00,
      "price_excl_vat" => 100.00,
      "total_vat" => 20.00,
      "guest_category" => "The associated guest category",
      "event" => "The associated event",
      "person_parent" => {},
      "guest_metadata" => {}
    }

## Sessions

    {{ session }}
    {
      "id" => "5e74f62a6864431d56271212",
      "name" => "Session title",
      "uid" => "SESSIONUID",
      "type" => "session",
      "session_type" => "conference",
      "session_type_label" => "Conférence",
      "description" => "<div><p>Ceci est la description de la session.</p></div>",
      "start_date" => "Wed, 31 Dec 2014 22:00:00 CET +01:00",
      "end_date" => "Wed, 31 Dec 2014 23:00:00 CET +01:00",
      "price" => "10.0",
      "vat" => "5.0",
      "location" => "Grande salle",
      "capacity_reached?" => false,
      "remaining_slots" => 249,
      "price_excluding_vat" => "9.5",
      "price_excluding_taxes" => "9.5",
      "traits" => {},
      "illustration_url" => nil,
      "formatted_start_day" => "31/12/2014",
      "speakers" => [],
      "exhibitors" => "[],
      "thematic_ids" => {},
      "thematics" => [],
      "speaker_roles" => [],
      "exhibitor_roles" => []
    }

# Liste de participants

Vous pouvez voir un exemple poussé de liste de participants dans le section `guests-list.liquid`.

Pour affiché la liste des guests de l'évènement il faut utiliser le tag `guests_paginate`:

    {% guests_paginate segment_id: section.settings.segment_id.first.segment_id, per_page: section.settings.per_page %}
      {% if paginate.total_entries > 0 %}
        {% for guest in guests %}
          <p>Hello, my name is {{ guest.first_name }} {{ guest.last_name }}.</p>
        {% endfor %}
      {% endif %}
    {% endguests_paginate %}

Le tag `guests_paginate` prend plusieurs arguments:

| Argument        | Description |
| --------------- | ----------- |
| segment\_id      | Prend l'ID de segment contenant les participants que l'on souhaite afficher. Provient d'un setting de type `segments_picker` prenant `.first.segment_id` pour obtenir l'ID. |
| per\_page        | Prend un chiffre entre 1 et 100 (si au delà de 100, seul les 100 premiers seront affichés). Par défaut à 20. |

Dans ce tag vous avez aussi accès à plusieurs variables liquid:

| Variable | Description |
| -------- | ----------- |
| paginate | Une hash renvoyant `current_page`, `previous_page`, `next_page`, `total_entries`, `total_pages`, `per_page`, `parts`. |
| guests   | Un tableau des participants sur lequel on peut boucler pour les afficher. |

# Liste des sessions du programme

Vous pouvez voir un exemple poussé de liste des session du programme dans le section `sessions-list.liquid`.

Pour affiché la liste des guests de l'évènement il faut utiliser le tag `sessions_list`:

    {% sessions_list session_type: section.settings.session_type_global_filter, display_speakers: section.settings.display_speakers, display_exhibitors: section.settings.display_exhibitors %}
      {% for session in sessions %}
        {{ session.name }}
      {% endfor %}
    {% endsessions_list %}

Le tag `sessions_list` prend plusieurs arguments:

| Argument            | Description |
| ------------------- | ----------- |
| session\_type       | Proviens d'un setting de type `accesspoint_session_type_picker`. Par défaut, affiche tous les types de session confondus. |
| display\_speakers   | Si `true`, cela renvoit `speaker_roles`, donc une hash qui renvoit la liste des ids de participants étant conférenciers pour une session. |
| display\_exhibitors | Si `true`, cela renvoit `exhibitor_roles`, donc une hash qui renvoit la liste des ids de participants étant exposants pour une session. |

Dans ce tag vous avez aussi accès à plusieurs variables liquid:

| Variable          | Description |
| ----------------- | ----------- |
| sessions          | Un tableau des sessions sur lequel on peut boucler pour les afficher. |
| speaker\_roles    | Si l'argument `display_speakers` de `sessions_list` est à `true`, cela retourne une hash qui renvoit la liste des ids de participants étant conférenciers pour une session. Sinon un tableau vide. |
| exhibitor\_roles  | Si l'argument `display_exhibitors` de `sessions_list` est à `true`, cela retourne une hash qui renvoit la liste des ids de participants étant exposants pour une session. Sinon un tableau vide. |
| guests            | Un tableau des participants sur lequel on peut boucler pour les afficher. |
| thematics\_by\_id | Une hash des ids de thématiques renvoyant les thématiques. |
