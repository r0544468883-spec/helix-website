import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PRODUCTS_DATA, getProduct } from '../products-data';
import ProductPageClient from '../ProductPageClient';

export function generateStaticParams() {
  return PRODUCTS_DATA.map((p) => ({ slug: p.slug }));
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
