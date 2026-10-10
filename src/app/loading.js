import Spinner from "@/components/Spinner";

export default function Loading() {
  return (
    <div role="status" aria-label="Loading" className="flex justify-center py-32 text-brand">
      <Spinner className="h-7 w-7" />
    </div>
  );
}