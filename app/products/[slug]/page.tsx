import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PRODUCTS_DATA, getProduct } from '../products-data';
import ProductPageClient from '../ProductPageClient';

export function generateStaticParams() {
  // /products/sdr has its own dedicated (rich) page — exclude it from the dynamic route.
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
  return <ProductPageClient product={product} />;
}
