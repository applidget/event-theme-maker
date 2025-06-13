const { Liquid } = require("liquidjs");

const customTags = [
  "batch_import_guest_products",
  "book_meeting",
  "bookmark_exhibitor_button",
  "bookmark_product_button",
  "bookmark_session_button",
  "checkin_point_register_button",
  "checkin_point",
  "comments",
  "cookies_consent_banner",
  "country_select_options",
  "consent_notice",
  "download_leads_button",
  "endunless",
  "exhibitor_lead_qualification_fields",
  "guest_calendar",
  "guest_field_name",
  "guest_field",
  "guest_meeting_availabilities",
  "guest_select_options",
  "guests_picker",
  "liquid_template",
  "live",
  "meetings",
  "phone_prefix_select_options",
  "product_like_button",
  "propose_to_go_to_registration_form_modal",
  "section",
  "segment_id",
  "thematics_dropdown",
  "website_css_bundle",
  "website_js_bundle",
  "website_url",
  "rich_text_editor",
  "i18n_path_name",
  "program",
  "text_generator_button",
  "guest_profile",
  "wallet_pass_button",
  "invitation_email_configuration_form",
  "guest_product_information_requests"
];

const customBlockTags = [
  "accommodation_list",
  "blog_articles_paginate",
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
  "open_consent_preferences",
  "account_events"
];

module.exports = () => {
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
