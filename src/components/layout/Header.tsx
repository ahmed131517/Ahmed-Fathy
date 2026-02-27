import { Search, Bell, Mic, Menu } from "lucide-react";

export function Header() {
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-6 z-10">
      <div className="flex items-center flex-1">
        <button className="md:hidden p-2 -ml-2 mr-2 text-slate-500 hover:bg-slate-100 rounded-lg">
          <Menu className="w-5 h-5" />
        </button>
        <div className="relative w-full max-w-md hidden md:block">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
            placeholder="Search patients or records..."
          />
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <select className="text-sm border-slate-200 rounded-md py-1.5 pl-3 pr-8 focus:ring-indigo-500 focus:border-indigo-500 hidden sm:block">
          <option value="en">English</option>
          <option value="ar">العربية</option>
        </select>
        <button className="relative p-2 text-slate-400 hover:text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
          <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
          <Bell className="h-5 w-5" />
        </button>
        <div className="flex items-center space-x-3 border-l border-slate-200 pl-4">
          <button className="p-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-full transition-colors" title="Voice Command">
            <Mic className="h-4 w-4" />
          </button>
          <div className="flex items-center space-x-2 cursor-pointer">
            <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold text-sm">
              DR
            </div>
            <span className="text-sm font-medium text-slate-700 hidden sm:block">Dr. Ahmed Fathy</span>
          </div>
        </div>
      </div>
    </header>
  );
}
