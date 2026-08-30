import Skeleton from '@/components/Skeleton';

export default function Loading() {
  return (
    <div className="max-w-[820px] mx-auto px-5 md:px-10 pt-12">
      <Skeleton className="h-10 w-56 mb-8" />
      <div className="flex gap-2 mb-6">
        <Skeleton className="h-9 w-24 rounded-full" />
        <Skeleton className="h-9 w-24 rounded-full" />
      </div>
      {[0, 1, 2, 3, 4].map((i) => (
        <Skeleton key={i} className="h-24 w-full mb-3" />
      ))}
    </div>
  );
}
