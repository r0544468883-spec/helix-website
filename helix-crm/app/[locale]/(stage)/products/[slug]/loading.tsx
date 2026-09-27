import Skeleton from '@/components/Skeleton';

export default function Loading() {
  return (
    <div className="max-w-[820px] mx-auto px-5 md:px-10 pt-12">
      <div className="flex items-start gap-5">
        <Skeleton className="w-20 h-20" />
        <div className="flex-1 flex flex-col gap-3">
          <Skeleton className="h-9 w-1/2" />
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-4 w-1/3" />
        </div>
      </div>
      <Skeleton className="h-32 w-full mt-10" />
      <Skeleton className="h-12 w-44 rounded-[10px] mt-8" />
    </div>
  );
}
