export default function Spinner() {
  return (
    <div className="flex  flex-col  justify-center items-center       bg-white  w-full h-auto ">
      <div className="animate-spin rounded-full h-15 w-15 border-t-6 border-b-6 border-yellow-600 mb-6"></div>
			<p className="text-sm text-gray-500 animate-pulse tracking-widest">Loading...</p>
    </div>
  );
}
