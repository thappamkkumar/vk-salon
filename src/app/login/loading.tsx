// app/loading.tsx
export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-white">
     
			<div className="animate-spin rounded-full h-20 w-20 border-t-6 border-b-6 border-yellow-600 mb-6"></div>
      <div className="text-4xl font-bold text-gray-800 mb-4">VK Hair</div>
      <p className="text-sm text-gray-500 animate-pulse tracking-widest">Your Hair, Our Passion</p>
    </div>
  );
}
