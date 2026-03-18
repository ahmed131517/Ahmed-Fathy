import { Link } from "react-router-dom";
import { 
  ShoppingBag, Search, MapPin, Phone, Clock, Star, Plus, Map as MapIcon, 
  History, ExternalLink, Navigation, Send, Trash2, Edit2, X, Package, Eye, RefreshCw,
  Sparkles, Loader2, Globe
} from "lucide-react";
import { useState, useEffect } from "react";
import { usePatient } from "../lib/PatientContext";
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { GoogleGenAI } from "@google/genai";
import { toast } from "sonner";
import Markdown from "react-markdown";

interface Pharmacy {
  id: number;
  name: string;
  address: string;
  phone: string;
  openingTime: string;
  closingTime: string;
  isOpen: boolean;
  rating: number;
  distance: string;
  lat?: number;
  lng?: number;
}

interface Order {
  id: string;
  status: "Processing" | "Ready for Pickup" | "Completed" | "Cancelled";
  pharmacy: string;
  patient: string;
  orderTime: string;
  items: number;
}

const initialPharmacies: Pharmacy[] = [
  { id: 1, name: "City Health Pharmacy", address: "123 Main St, Downtown", phone: "(555) 123-4567", openingTime: "08:00", closingTime: "20:00", isOpen: true, rating: 4.8, distance: "0.5 miles", lat: 37.7749, lng: -122.4194 },
  { id: 2, name: "MediCare Plus", address: "456 Oak Ave, Westside", phone: "(555) 987-6543", openingTime: "09:00", closingTime: "18:00", isOpen: true, rating: 4.5, distance: "1.2 miles", lat: 37.7849, lng: -122.4094 },
  { id: 3, name: "24/7 Pharma", address: "789 Pine Rd, North End", phone: "(555) 456-7890", openingTime: "00:00", closingTime: "23:59", isOpen: true, rating: 4.9, distance: "2.5 miles", lat: 37.7649, lng: -122.4294 },
  { id: 4, name: "Community Health Pharmacy", address: "321 Healing Road, West Side", phone: "(555) 234-5678", openingTime: "08:30", closingTime: "17:30", isOpen: false, rating: 4.2, distance: "3.1 miles", lat: 37.7549, lng: -122.4394 },
  { id: 5, name: "FamilyCare Pharma", address: "654 Remedy Lane, East End", phone: "(555) 345-6789", openingTime: "08:00", closingTime: "19:00", isOpen: true, rating: 4.7, distance: "4.0 miles", lat: 37.7949, lng: -122.3994 }
];

const initialOrders: Order[] = [
  { id: "ORD-12345", status: "Ready for Pickup", pharmacy: "MediCare Plus", patient: "John Smith", orderTime: "Today, 10:30 AM", items: 3 },
  { id: "ORD-12346", status: "Processing", pharmacy: "City Health Pharmacy", patient: "Emily Davis", orderTime: "Today, 09:15 AM", items: 2 },
  { id: "ORD-12347", status: "Completed", pharmacy: "24/7 Pharma", patient: "Michael Brown", orderTime: "Yesterday, 4:45 PM", items: 1 },
  { id: "ORD-12348", status: "Processing", pharmacy: "FamilyCare Pharma", patient: "Sarah Wilson", orderTime: "Yesterday, 2:20 PM", items: 4 }
];

const mapContainerStyle = {
  width: '100%',
  height: '100%'
};

const center = {
  lat: 37.7749,
  lng: -122.4194
};

const PharmacyMap = ({ pharmacies }: { pharmacies: Pharmacy[] }) => {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ""
  });

  if (loadError) {
    return (
      <div className="text-center text-red-500 p-8">
        <MapIcon className="w-16 h-16 mx-auto mb-4 text-slate-300" />
        <p className="font-medium">Error loading map</p>
        <p className="text-xs mt-2">{loadError.message}</p>
      </div>
    );
  }

  return isLoaded ? (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={center}
      zoom={12}
      options={{
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
      }}
    >
      {pharmacies.map((pharmacy) => (
        pharmacy.lat && pharmacy.lng && (
          <Marker
            key={pharmacy.id}
            position={{ lat: pharmacy.lat, lng: pharmacy.lng }}
            title={pharmacy.name}
            onClick={() => {
              alert(`Selected: ${pharmacy.name}`);
            }}
          />
        )
      ))}
    </GoogleMap>
  ) : (
    <div className="text-center text-slate-500 p-8">
      <MapIcon className="w-16 h-16 mx-auto mb-4 text-slate-300" />
      <p className="font-medium">Map is loading...</p>
    </div>
  );
};

export function Pharmacies() {
  const { selectedPatient } = usePatient();
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>(initialPharmacies);
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [editingPharmacy, setEditingPharmacy] = useState<Pharmacy | null>(null);

  // AI Search State
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [groundingChunks, setGroundingChunks] = useState<any[]>([]);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    openingTime: "",
    closingTime: ""
  });

  const filteredPharmacies = pharmacies.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSavePharmacy = () => {
    if (!formData.name || !formData.address) return;

    if (editingPharmacy) {
      setPharmacies(pharmacies.map(p => p.id === editingPharmacy.id ? { ...p, ...formData } : p));
    } else {
      setPharmacies([{
        id: Date.now(),
        ...formData,
        isOpen: true,
        rating: 0,
        distance: "Unknown",
        lat: center.lat + (Math.random() - 0.5) * 0.05,
        lng: center.lng + (Math.random() - 0.5) * 0.05
      }, ...pharmacies]);
    }
    setIsAddModalOpen(false);
    setEditingPharmacy(null);
    setFormData({ name: "", address: "", phone: "", openingTime: "", closingTime: "" });
  };

  const handleDeletePharmacy = (id: number) => {
    if (window.confirm("Are you sure you want to delete this pharmacy?")) {
      setPharmacies(pharmacies.filter(p => p.id !== id));
    }
  };

  const handleSendPrescription = (pharmacy: Pharmacy) => {
    if (!selectedPatient) {
      alert("Please select a patient first.");
      return;
    }
    
    const message = `Prescription for ${selectedPatient.name} from Physician Hiclinic. Please prepare for pickup.`;
    const encodedMessage = encodeURIComponent(message);
    const phoneNumber = pharmacy.phone.replace(/\D/g, "");
    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, "_blank");
  };

  const handleAiSearch = async () => {
    setIsAiSearching(true);
    setAiResponse(null);
    setGroundingChunks([]);

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        toast.error("Gemini API key is missing");
        setIsAiSearching(false);
        return;
      }

      const ai = new GoogleGenAI({ apiKey });
      
      let location = null;
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        location = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude
        };
      } catch (err) {
        console.warn("Geolocation failed, using default center", err);
      }

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: "Find 5 good pharmacies nearby and provide their details including address and rating.",
        config: {
          tools: [{ googleMaps: {} }],
          toolConfig: {
            retrievalConfig: {
              latLng: location || center
            }
          }
        },
      });

      setAiResponse(response.text);
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      setGroundingChunks(chunks);
      
      toast.success("Nearby pharmacies found!");
    } catch (error) {
      console.error("AI Search failed:", error);
      toast.error("Failed to find pharmacies with AI");
    } finally {
      setIsAiSearching(false);
    }
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Pharmacies</h2>
          <p className="text-slate-500">Find and manage partner pharmacies</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className={`flex flex-wrap gap-3 p-4 bg-white rounded-xl border border-slate-200 shadow-sm transition-opacity ${!selectedPatient ? 'opacity-50 pointer-events-none' : ''}`}>
        <button 
          onClick={() => {
            setEditingPharmacy(null);
            setFormData({ name: "", address: "", phone: "", openingTime: "", closingTime: "" });
            setIsAddModalOpen(true);
          }}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add New Pharmacy
        </button>
        <button 
          onClick={handleAiSearch}
          disabled={isAiSearching}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 flex items-center gap-2 transition-colors shadow-sm disabled:opacity-50"
        >
          {isAiSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          Find Nearby (AI)
        </button>
        <button 
          onClick={() => setIsMapModalOpen(true)}
          className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 flex items-center gap-2 transition-colors"
        >
          <MapIcon className="w-4 h-4" /> View Map
        </button>
        <button 
          onClick={() => setIsHistoryModalOpen(true)}
          className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 flex items-center gap-2 transition-colors"
        >
          <History className="w-4 h-4" /> Order History
        </button>
        <Link to="/pharmacy-system" className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 flex items-center gap-2 transition-colors ml-auto">
          <ExternalLink className="w-4 h-4" /> Pharmacy System
        </Link>
      </div>

      <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0 transition-opacity ${!selectedPatient ? 'opacity-50 pointer-events-none' : ''}`}>
        {/* Pharmacy List */}
        <div className="lg:col-span-2 flex flex-col gap-4 min-h-0">
          {aiResponse && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 mb-4 animate-in fade-in slide-in-from-top-4">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-sm font-bold text-indigo-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> AI Recommendations
                </h3>
                <button onClick={() => setAiResponse(null)} className="text-indigo-400 hover:text-indigo-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="markdown-body prose prose-sm max-w-none text-indigo-800 mb-4">
                <Markdown>{aiResponse}</Markdown>
              </div>
              {groundingChunks.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Sources & Maps Links</p>
                  <div className="flex flex-wrap gap-2">
                    {groundingChunks.map((chunk, idx) => (
                      chunk.maps && (
                        <a 
                          key={idx} 
                          href={chunk.maps.uri} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-[10px] flex items-center gap-1 px-2 py-1 bg-white border border-indigo-200 rounded text-indigo-600 hover:bg-indigo-100 transition-colors"
                        >
                          <Globe className="w-3 h-3" /> {chunk.maps.title || "View on Maps"}
                        </a>
                      )
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col flex-1 overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="font-semibold text-slate-800">Nearby Pharmacies</h3>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-white transition-colors" 
                  placeholder="Search pharmacies..." 
                />
              </div>
            </div>
            
            <div className="flex-1 p-4 overflow-y-auto bg-slate-50/30">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredPharmacies.map(pharmacy => (
                  <div key={pharmacy.id} className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-all hover:border-indigo-200 group flex flex-col">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-bold text-slate-900">{pharmacy.name}</h4>
                        <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                          <MapPin className="w-3 h-3" /> {pharmacy.address}
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        pharmacy.isOpen ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {pharmacy.isOpen ? 'Open' : 'Closed'}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs text-slate-600 mb-4 flex-1">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {pharmacy.openingTime} - {pharmacy.closingTime}
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {pharmacy.phone}
                      </div>
                      <div className="flex items-center gap-1 text-amber-500">
                        <Star className="w-3 h-3 fill-current" />
                        <span className="font-medium text-slate-700">{pharmacy.rating}</span>
                        <span className="text-slate-400">• {pharmacy.distance}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-auto pt-3 border-t border-slate-100">
                      <button 
                        onClick={() => handleSendPrescription(pharmacy)}
                        disabled={!pharmacy.isOpen}
                        className="flex-1 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Send className="w-3 h-3" /> Send Rx
                      </button>
                      <button className="px-2 py-1.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors" title="Get Directions">
                        <Navigation className="w-3 h-3" />
                      </button>
                      <button 
                        onClick={() => {
                          setEditingPharmacy(pharmacy);
                          setFormData(pharmacy);
                          setIsAddModalOpen(true);
                        }}
                        className="px-2 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors" 
                        title="Edit"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button 
                        onClick={() => handleDeletePharmacy(pharmacy.id)}
                        className="px-2 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors" 
                        title="Delete"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="lg:col-span-1 flex flex-col gap-4 min-h-0">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col flex-1 overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50">
              <h3 className="font-semibold text-slate-800">Recent Orders</h3>
            </div>
            <div className="flex-1 p-4 overflow-y-auto">
              <div className="space-y-3">
                {orders.map(order => (
                  <div key={order.id} className="border border-slate-200 rounded-lg p-3 hover:border-indigo-200 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-mono text-slate-500">{order.id}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        order.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                        order.status === 'Ready for Pickup' ? 'bg-indigo-100 text-indigo-700' :
                        order.status === 'Processing' ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-800 text-sm mb-1">{order.pharmacy}</h4>
                    <p className="text-xs text-slate-600 mb-2">Patient: {order.patient}</p>
                    <div className="flex justify-between items-center text-[10px] text-slate-500 border-t border-slate-100 pt-2">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {order.orderTime}</span>
                      <span className="flex items-center gap-1"><Package className="w-3 h-3" /> {order.items} items</span>
                    </div>
                    <div className="mt-2 flex gap-2">
                      <button className="flex-1 py-1 bg-indigo-50 text-indigo-600 rounded text-xs font-medium hover:bg-indigo-100 transition-colors">Track</button>
                      {order.status === 'Processing' && (
                        <button className="flex-1 py-1 bg-red-50 text-red-600 rounded text-xs font-medium hover:bg-red-100 transition-colors">Cancel</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center">
              <h3 className="font-bold text-slate-900">{editingPharmacy ? 'Edit Pharmacy' : 'Add New Pharmacy'}</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Pharmacy Name</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Enter pharmacy name"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Address</label>
                <input 
                  type="text" 
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Enter address"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Opening Time</label>
                  <input 
                    type="time" 
                    value={formData.openingTime}
                    onChange={(e) => setFormData({...formData, openingTime: e.target.value})}
                    className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Closing Time</label>
                  <input 
                    type="time" 
                    value={formData.closingTime}
                    onChange={(e) => setFormData({...formData, closingTime: e.target.value})}
                    className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Phone Number</label>
                <input 
                  type="tel" 
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="(555) 000-0000"
                />
              </div>
            </div>
            <div className="p-4 border-t border-slate-200 flex justify-end gap-2 bg-slate-50 rounded-b-xl">
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 text-slate-600 font-medium text-sm hover:bg-slate-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSavePharmacy}
                className="px-4 py-2 bg-indigo-600 text-white font-medium text-sm rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Save Pharmacy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Map Modal */}
      {isMapModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl h-[600px] flex flex-col">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center">
              <h3 className="font-bold text-slate-900">Pharmacy Locations</h3>
              <button onClick={() => setIsMapModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 bg-slate-100 flex items-center justify-center overflow-hidden rounded-b-xl relative">
              {import.meta.env.VITE_GOOGLE_MAPS_API_KEY ? (
                <PharmacyMap pharmacies={pharmacies} />
              ) : (
                <div className="text-center text-slate-500 p-8">
                  <MapIcon className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                  <p className="font-medium">Map cannot be loaded.</p>
                  <p className="text-xs text-red-500 mt-2 bg-red-50 p-2 rounded border border-red-100">
                    Error: Google Maps API Key is missing.<br/>
                    Please add VITE_GOOGLE_MAPS_API_KEY to your environment variables.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* History Modal Placeholder */}
      {isHistoryModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[80vh] flex flex-col">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center">
              <h3 className="font-bold text-slate-900">Order History</h3>
              <button onClick={() => setIsHistoryModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 flex-1 overflow-y-auto">
              {/* Reuse Order List Logic or Expanded View */}
              <p className="text-center text-slate-500 py-12">Full order history would be displayed here.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
