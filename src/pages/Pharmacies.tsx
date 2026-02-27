import { ShoppingBag, Search, MapPin, Phone, Clock, Star } from "lucide-react";

const mockPharmacies = [
  { id: 1, name: "City Health Pharmacy", address: "123 Main St, Downtown", phone: "(555) 123-4567", status: "Open Now", rating: 4.8, distance: "0.5 miles" },
  { id: 2, name: "MediCare Plus", address: "456 Oak Ave, Westside", phone: "(555) 987-6543", status: "Open Now", rating: 4.5, distance: "1.2 miles" },
  { id: 3, name: "24/7 Pharma", address: "789 Pine Rd, North End", phone: "(555) 456-7890", status: "Open 24 Hours", rating: 4.9, distance: "2.5 miles" },
];

export function Pharmacies() {
  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Pharmacies</h2>
          <p className="text-slate-500">Find and manage partner pharmacies</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col flex-1 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-white transition-colors" placeholder="Search pharmacies by name or location..." />
          </div>
          <div className="flex gap-2">
            <select className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-indigo-500">
              <option>Distance: Nearest First</option>
              <option>Rating: Highest First</option>
            </select>
          </div>
        </div>

        <div className="flex-1 p-6 overflow-y-auto bg-slate-50/30">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockPharmacies.map(pharmacy => (
              <div key={pharmacy.id} className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-all hover:border-indigo-200 group">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                    <Clock className="w-3 h-3" /> {pharmacy.status}
                  </span>
                </div>
                
                <h3 className="text-lg font-semibold text-slate-900 mb-1">{pharmacy.name}</h3>
                
                <div className="space-y-2 mb-4">
                  <p className="flex items-start gap-2 text-sm text-slate-600">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <span>{pharmacy.address} <span className="text-slate-400 block text-xs mt-0.5">{pharmacy.distance}</span></span>
                  </p>
                  <p className="flex items-center gap-2 text-sm text-slate-600">
                    <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                    {pharmacy.phone}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-sm font-medium text-slate-700">{pharmacy.rating}</span>
                  </div>
                  <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700">View Details</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
