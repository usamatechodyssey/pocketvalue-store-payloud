import type { StructureResolver } from "sanity/structure";
import { Ticket as TicketIcon, BookText, CogIcon } from "lucide-react";

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Content Management")
    .items([
      // Site-wide Settings
      S.listItem()
        .title("Site Settings")
        .icon(CogIcon)
        .id("settings")
        .child(
          S.document()
            .schemaType("settings")
            .documentId("settings")
            .title("Edit Site-wide Settings"),
        ),

      S.divider(),
      // Blog Content
      S.listItem()
        .title("Blog Content")
        .icon(BookText)
        .child(
          S.list()
            .title("Blog Management")
            .items([
              S.listItem()
                .title("All Posts")
                .schemaType("post")
                .child(S.documentTypeList("post").title("Blog Posts")),
              S.listItem()
                .title("Authors")
                .schemaType("author")
                .child(S.documentTypeList("author").title("Authors")),
            ]),
        ),

      S.divider(),
      // Filter out explicitly structured items
      ...S.documentTypeListItems().filter(
        (listItem) =>
          !["settings", "post", "author"].includes(listItem.getId()!),
      ),
    ]);
