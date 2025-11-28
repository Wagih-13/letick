import { JsonLd } from './json-ld';

interface ProductSchemaProps {
    name: string;
    description: string;
    image: string[];
    sku: string;
    brand?: string;
    price: number;
    currency?: string;
    availability?: 'InStock' | 'OutOfStock' | 'PreOrder' | 'Discontinued';
    condition?: 'NewCondition' | 'UsedCondition' | 'RefurbishedCondition';
    url: string;
    rating?: {
        value: number;
        count: number;
    };
}

export function ProductSchema({
    name,
    description,
    image,
    sku,
    brand = "Modest Wear",
    price,
    currency = "EGP",
    availability = "InStock",
    condition = "NewCondition",
    url,
    rating,
}: ProductSchemaProps) {
    const schema = {
        "@context": "https://schema.org",
        "@type": "Product",
        name,
        description,
        image,
        sku,
        brand: {
            "@type": "Brand",
            name: brand,
        },
        offers: {
            "@type": "Offer",
            url,
            priceCurrency: currency,
            price: price.toFixed(2),
            availability: `https://schema.org/${availability}`,
            itemCondition: `https://schema.org/${condition}`,
            priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
        },
        ...(rating && rating.count > 0
            ? {
                aggregateRating: {
                    "@type": "AggregateRating",
                    ratingValue: rating.value.toFixed(1),
                    reviewCount: rating.count,
                    bestRating: 5,
                    worstRating: 1,
                },
            }
            : {}),
    };

    return <JsonLd data={schema} />;
}
