export default function Navbar() {
  return (
    <header className="h-14 flex justify-between items-center px-6 bg-[#0e1423] border-b border-gray-800">
      <div>
        <h2 className="text-lg font-semibold text-white">Traffic Control Dashboard</h2>
        <p className="text-sm text-gray-400">Real-time monitoring and AI optimization</p>
      </div>
      <p className="text-teal-400 text-sm">Last Updated: {new Date().toLocaleTimeString()}</p>
    </header>
  );
}
