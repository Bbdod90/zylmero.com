/** Maximaal aantal pagina’s per domein dat we opslaan (zelfde host). */
export const AI_KNOWLEDGE_MAX_PAGES = 350;

/** Maximaal aantal link-hops vanaf start / sitemap-seed (diep genoeg voor shops). */
export const AI_KNOWLEDGE_MAX_DEPTH = 10;

/** Max grootte van het gekoppelde crawl-document in de database (prioriteit: webshop-URL’s eerst). */
export const AI_KNOWLEDGE_CRAWLED_DOC_STORE_MAX_CHARS = 115_000;

/** Max grootte van crawl-tekst die naar het taalmodel gaat (tokenlimiet). */
export const AI_KNOWLEDGE_PROMPT_CRAWLED_MAX_CHARS = 72_000;
