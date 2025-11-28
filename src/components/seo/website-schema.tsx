import { JsonLd } from './json-ld';

interface WebsiteSchemaProps {
    name?: string;
    url?: string;
    searchUrl?: string;
}

export function WebsiteSchema({
    name = "Modest Wear",
    url = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
    searchUrl,
}: WebsiteSchemaProps) {
    const schema = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name,
        url,
        potentialAction: searchUrl
            ? {
                "@type": "SearchAction",
                target: {
                    "@type": "EntryPoint",
                    urlTemplate: searchUrl,
                },
                "query-input": "required name=search_term_string",
            }
            : undefined,
    };

    return <JsonLd data={schema} />;
}
