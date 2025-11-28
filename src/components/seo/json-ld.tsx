import Script from 'next/script';

interface JsonLdProps {
    data: object;
}

export function JsonLd({ data }: JsonLdProps) {
    return (
        <Script
            id={`json-ld-${JSON.stringify(data).substring(0, 20)}`}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
    );
}
