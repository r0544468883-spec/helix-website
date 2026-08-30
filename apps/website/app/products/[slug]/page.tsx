import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PRODUCTS_DATA, getProduct } from '../products-data';
import ProductPageClient from '../ProductPageClient';
import JsonLd from '@/app/components/JsonLd';
import { SITE } from '@/lib/site';
import { softwareApplicationSchema, faqSchema, breadcrumbSchema } from '@/lib/schema';

export function generateStaticParams() {
  // /products/sdr has its own dedicated (rich) page, exclude it from the dynamic route.
  return PRODUCTS_DATA.filter((p) => p.slug !== 'sdr').map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return {};
  return {
    title: `${product.name} | HELIX`,
    description: product.subtitle,
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  const path = `/products/${product.slug}`;
  const appSchema = softwareApplicationSchema({
    name: product.name,
    description: product.subtitle,
    path,
    price: product.price,
  });
  const crumbs = breadcrumbSchema([
    { name: 'בית', url: SITE.url },
    { name: 'התוכנות של HELIX', url: `${SITE.url}/products` },
    { name: product.name, url: `${SITE.url}${path}` },
  ]);
  const schemas: object[] = [appSchema, crumbs];
  if (product.faq?.length) schemas.push(faqSchema(product.faq));

  return (
    <>
      <JsonLd data={schemas} />
      <ProductPageClient product={product} />
    </>
  );
}
