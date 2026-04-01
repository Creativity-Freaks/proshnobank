import { useEffect } from "react";

type MetaConfig = {
  title: string;
  description: string;
};

const SITE_NAME = "প্রশ্নব্যাংক";

function upsertMeta(nameOrProperty: "name" | "property", key: string, content: string) {
  const selector = `meta[${nameOrProperty}="${key}"]`;
  let meta = document.querySelector(selector) as HTMLMetaElement | null;

  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute(nameOrProperty, key);
    document.head.appendChild(meta);
  }

  meta.setAttribute("content", content);
}

export function usePageMeta({ title, description }: MetaConfig) {
  useEffect(() => {
    const fullTitle = `${title} | ${SITE_NAME}`;
    document.title = fullTitle;

    upsertMeta("name", "description", description);
    upsertMeta("property", "og:title", fullTitle);
    upsertMeta("property", "og:description", description);
    upsertMeta("property", "og:type", "website");
    upsertMeta("name", "twitter:title", fullTitle);
    upsertMeta("name", "twitter:description", description);
  }, [title, description]);
}
