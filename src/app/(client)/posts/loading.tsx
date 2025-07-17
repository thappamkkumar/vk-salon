// app/posts/loading.tsx 

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center fixed top-0 left-0   bg-white  w-full h-screen z-150">
      <div className="animate-spin rounded-full h-20 w-20 border-t-6 border-b-6 border-yellow-600 mb-6"></div>
      <p className="text-sm text-gray-500 animate-pulse tracking-widest">Preparing Our Posts</p>
    </div>
  );
}
