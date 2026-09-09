import Skeleton from '@/components/Skeleton';

export default function Loading() {
  return (
    <div className="max-w-[900px] mx-auto px-5 md:px-10 pt-12">
      <Skeleton className="h-10 w-56 mb-8" />
      <div className="grid grid-cols-3 gap-4 mb-10">
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </div>
      {[0, 1, 2].map((i) => (
        <Skeleton key={i} className="h-32 w-full mb-4" />
      ))}
    </div>
  );
}
