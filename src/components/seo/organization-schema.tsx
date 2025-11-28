import { JsonLd } from './json-ld';

interface OrganizationSchemaProps {
    name?: string;
    url?: string;
    logo?: string;
    description?: string;
    contactEmail?: string;
    socialProfiles?: string[];
}

export function OrganizationSchema({
    name = "Modest Wear",
    url = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
    logo = "/Storefront/images/logo%20(1).png",
    description = "Premium modest fashion and Islamic clothing online store offering elegant hijabs, abayas, modest dresses, and modern Islamic wear with worldwide delivery.",
    contactEmail = "info@modestwear.cloud",
    socialProfiles = [],
}: OrganizationSchemaProps) {
    const schema = {
        "@context": "https://schema.org",
        "@type": "Organization",
        name,
        url,
        logo: `${url}${logo}`,
        description,
        contactPoint: {
            "@type": "ContactPoint",
            email: contactEmail,
            contactType: "customer service",
            availableLanguage: ["English", "Arabic"],
        },
        sameAs: socialProfiles,
    };

    return <JsonLd data={schema} />;
}
