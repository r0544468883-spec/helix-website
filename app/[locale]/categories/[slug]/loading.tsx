import Skeleton from '@/components/Skeleton';

export default function Loading() {
  return (
    <div className="max-w-[1280px] mx-auto px-5 md:px-10 pt-12">
      <Skeleton className="h-10 w-64 mb-10" />
      <Skeleton className="h-[300px] w-full max-w-[420px] mx-auto mb-14" />
      <div className="max-w-[820px] mx-auto">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-24 w-full mb-3" />
        ))}
      </div>
    </div>
  );
}
