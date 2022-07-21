const { Liquid } = require("liquidjs");
const fs = require("fs");
const yaml = require("js-yaml");
const { logError } = require("../utils/log");

const customTags = [
  "bookmark_exhibitor_button",
  "bookmark_product_button",
  "bookmark_session_button",
  "checkin_point_register_button",
  "checkin_point",
  "comments",
  "cookies_consent_banner",
  "country_select_options",
  "download_leads_button",
  "endunless",
  "guest_field_name",
  "guest_field",
  "guest_meeting_availabilities",
  "guest_select_options",
  "guests_picker",
  "liquid_template",
  "live",
  "phone_prefix_select_options",
  "product_like_button",
  "propose_to_go_to_registration_form_modal",
  "section",
  "segment_id",
  "thematics_dropdown",
  "website_css_bundle",
  "website_js_bundle",
  "website_url",
];

const customBlockTags = [
  "accommodation_list",
  "button_settings",
  "foreach_linked_guest",
  "guest_checkout_form",
  "guest_from_order_uid_form",
  "guest_invitation_form",
  "guest_invitations_import_form",
  "guest_product_form",
  "guest_products_paginate",
  "guests_paginate",
  "magic_link_request_form",
  "meeting_button",
  "meeting_form",
  "meetings_list",
  "messages_list",
  "messages_rooms_paginate",
  "product_quantity_select",
  "registration_form",
  "schema",
  "search_form",
  "session_form",
  "session_replays_list",
  "sessions_list",
  "sessions_search_form",
  "sponsorship_form",
  "translations_form",
  "with_guest_third_party_analytics_consent",
];

const liquidEngine = () => {
  const engine = new Liquid();

  const customTag = {
    parse: () => null,
  };

  customTags.forEach(tag => {
    engine.registerTag(tag, customTag);
  });

  customBlockTags.forEach(tag => {
    engine.registerTag(tag, customTag);
    engine.registerTag(`end${tag}`, customTag);
  });

  return engine;
}

const isValidLiquid = (str) => {
  try {
    liquidEngine().parse(str);
  } catch (e) {
    // number_with_precision precision: 2 can't be supported by liquidJS
    if (e.message.includes("precision: 2")) { return true; }

    logError(e);
    return false;
  }
  return true;
}

const liquidFiles = () => {
  const themes = fs.readdirSync("./themes");

  const localPaths = [];
  themes.forEach(theme => {
    const specs = yaml.load(fs.readFileSync(`./themes/${theme}/specs.yml`, "utf8"));

    ["sections", "layouts", "page_templates", "snippets"].forEach(resource => {
      specs[resource].forEach(file => {
        localPaths.push(file.body_url.replace("https://GH_PAGES_ROOT", "themes"));
      });
    });
  });

  return [...new Set(localPaths)];
}

const isValidJSON = (str) => {
  try {
    const json = JSON.parse(str);
    if (Object.prototype.toString.call(json).slice(8, -1) !== "Object") {
      return false;
    }
  } catch (e) {
    return false;
  }
  return true;
}

module.exports = {
  isValidLiquid,
  liquidFiles,
  isValidJSON,
};
