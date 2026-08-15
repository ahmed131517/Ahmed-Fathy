import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import { 
  Pill, AlertTriangle, CheckCircle, ShieldAlert, Search, Plus, 
  Trash2, Sparkles, BookOpen, Activity, Info, X, ChevronRight, Stethoscope
} from 'lucide-react';
import { CLINICAL_KNOWLEDGE_BASE, findClinicalMedicationByName } from '@/database/medications';
import { evaluateDetailedDrugInteractions, DetailedInteraction } from '@/database/engines/interactionDetailEngine';
import { cn } from '@/lib/utils';

interface DDINetworkMapProps {
  activeMedications: string[];
  onMedicationsChange: (meds: string[]) => void;
}

interface NetworkNode extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  drugClass: string;
  severityMax: 'Major' | 'Moderate' | 'Minor' | 'Safe';
}

interface NetworkLink extends d3.SimulationLinkDatum<NetworkNode> {
  id: string;
  source: string | NetworkNode;
  target: string | NetworkNode;
  severity: '★★★★★ Major' | '★★★ Moderate' | '★ Minor';
  severityLevel: 'Major' | 'Moderate' | 'Minor';
  mechanism: string;
  clinicalRisk: string;
  management: string;
}

// Preset Clinical Scenarios
const PRESETS = [
  {
    name: "Triple Whammy (Renal Hazard)",
    description: "NSAID + ACE Inhibitor + Diuretic. Synergistic hazard leading to acute kidney injury.",
    meds: ["Enalapril", "Ibuprofen", "Furosemide"]
  },
  {
    name: "Cardio Hyperkalemia",
    description: "ACE Inhibitor + Aldosterone Antagonist. Major risk of severe cardiac arrhythmias.",
    meds: ["Enalapril", "Spironolactone", "Metformin Hydrochloride"]
  },
  {
    name: "Statin Rhabdomyolysis",
    description: "Statin + Strong CYP3A4 Inhibitor. Causes severe skeletal muscle breakdown.",
    meds: ["Atorvastatin", "Clarithromycin / Erythromycin", "Amoxicillin"]
  }
];

export function DDINetworkMap({ activeMedications, onMedicationsChange }: DDINetworkMapProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  
  // Selected elements in the network
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [selectedLink, setSelectedLink] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);

  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const simulationRef = useRef<d3.Simulation<NetworkNode, NetworkLink> | null>(null);

  // Filter clinical database for autocomplete
  const filteredSuggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return CLINICAL_KNOWLEDGE_BASE.filter(med => 
      (med.generic_name.toLowerCase().includes(q) || 
       med.brand_names.some(b => b.toLowerCase().includes(q))) &&
      !activeMedications.some(active => active.toLowerCase() === med.generic_name.toLowerCase())
    ).slice(0, 5);
  }, [searchQuery, activeMedications]);

  // Evaluate current interactions
  const detailedInteractions = useMemo(() => {
    return evaluateDetailedDrugInteractions(activeMedications);
  }, [activeMedications]);

  // Prepare D3 Graph Data
  const graphData = useMemo(() => {
    const nodes: NetworkNode[] = activeMedications.map(med => {
      const dbMed = findClinicalMedicationByName(med);
      const drugClass = dbMed?.Drug_Class || 'Therapeutic Agent';
      
      // Determine max interaction severity for this drug
      let severityMax: 'Major' | 'Moderate' | 'Minor' | 'Safe' = 'Safe';
      const drugInters = detailedInteractions.filter(inter => 
        inter.drug1.toLowerCase() === med.toLowerCase() || 
        inter.drug2.toLowerCase() === med.toLowerCase() ||
        med.toLowerCase().includes(inter.drug1.toLowerCase()) ||
        med.toLowerCase().includes(inter.drug2.toLowerCase())
      );

      if (drugInters.some(i => i.severityLevel === 'Major')) {
        severityMax = 'Major';
      } else if (drugInters.some(i => i.severityLevel === 'Moderate')) {
        severityMax = 'Moderate';
      } else if (drugInters.some(i => i.severityLevel === 'Minor')) {
        severityMax = 'Minor';
      }

      return { id: med, name: med, drugClass, severityMax, x: 0, y: 0 };
    });

    // Helper to find exact node ID match for matching interactions
    const findNodeId = (name: string) => {
      const match = nodes.find(n => 
        n.id.toLowerCase().includes(name.toLowerCase()) || 
        name.toLowerCase().includes(n.id.toLowerCase())
      );
      return match ? match.id : name;
    };

    const links: NetworkLink[] = detailedInteractions.map(inter => {
      const sourceId = findNodeId(inter.drug1);
      const targetId = findNodeId(inter.drug2);
      return {
        id: `${sourceId}::${targetId}`,
        source: sourceId,
        target: targetId,
        severity: inter.severity,
        severityLevel: inter.severityLevel,
        mechanism: inter.mechanism,
        clinicalRisk: inter.clinicalRisk,
        management: inter.management
      };
    });

    return { nodes, links };
  }, [activeMedications, detailedInteractions]);

  // React state mirroring D3 positions to trigger React rendering
  const [renderedNodes, setRenderedNodes] = useState<NetworkNode[]>([]);
  const [renderedLinks, setRenderedLinks] = useState<NetworkLink[]>([]);

  const width = 480;
  const height = 300;
  const nodeRadius = 22;

  // Run D3 Force Simulation
  useEffect(() => {
    if (graphData.nodes.length === 0) {
      setRenderedNodes([]);
      setRenderedLinks([]);
      return;
    }

    // Clone graph data to avoid direct mutation of useMemo variables
    const nodesCloned: NetworkNode[] = graphData.nodes.map(n => ({ ...n }));
    const linksCloned: NetworkLink[] = graphData.links.map(l => ({
      ...l,
      source: nodesCloned.find(n => n.id === (typeof l.source === 'object' ? l.source.id : l.source)) || l.source as any,
      target: nodesCloned.find(n => n.id === (typeof l.target === 'object' ? l.target.id : l.target)) || l.target as any
    }));

    // Seed positions on a circle to prevent overlap and make it pretty on start
    nodesCloned.forEach((node, i) => {
      const angle = (i / nodesCloned.length) * 2 * Math.PI;
      node.x = width / 2 + Math.cos(angle) * 110;
      node.y = height / 2 + Math.sin(angle) * 110;
    });

    const simulation = d3.forceSimulation<NetworkNode>(nodesCloned)
      .force("link", d3.forceLink<NetworkNode, NetworkLink>(linksCloned)
        .id(d => d.id)
        .distance(110)
      )
      .force("charge", d3.forceManyBody().strength(-280))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide(nodeRadius + 15));

    simulationRef.current = simulation;

    simulation.on("tick", () => {
      // Bound nodes inside container
      nodesCloned.forEach(n => {
        if (n.x !== undefined) n.x = Math.max(nodeRadius + 10, Math.min(width - nodeRadius - 10, n.x));
        if (n.y !== undefined) n.y = Math.max(nodeRadius + 10, Math.min(height - nodeRadius - 10, n.y));
      });
      setRenderedNodes([...nodesCloned]);
      setRenderedLinks([...linksCloned]);
    });

    return () => {
      simulation.stop();
      simulationRef.current = null;
    };
  }, [graphData]);

  // Handle Dragging
  const [draggedNode, setDraggedNode] = useState<string | null>(null);

  const handlePointerDown = (e: React.PointerEvent<SVGGElement>, nodeId: string) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setDraggedNode(nodeId);
    setSelectedNode(nodeId);
    setSelectedLink(null);

    const node = renderedNodes.find(n => n.id === nodeId);
    if (node && simulationRef.current) {
      node.fx = node.x;
      node.fy = node.y;
      simulationRef.current.alpha(0.1).restart();
    }
  };

  const handlePointerMove = (e: React.PointerEvent<SVGGElement>, nodeId: string) => {
    if (draggedNode !== nodeId) return;
    if (!svgRef.current) return;

    const rect = svgRef.current.getBoundingClientRect();
    const xCoord = e.clientX - rect.left;
    const yCoord = e.clientY - rect.top;

    // Scale back coordinates from CSS size to viewBox size
    const x = (xCoord / rect.width) * width;
    const y = (yCoord / rect.height) * height;

    const node = renderedNodes.find(n => n.id === nodeId);
    if (node && simulationRef.current) {
      node.fx = Math.max(nodeRadius + 10, Math.min(width - nodeRadius - 10, x));
      node.fy = Math.max(nodeRadius + 10, Math.min(height - nodeRadius - 10, y));
      simulationRef.current.alpha(0.1).restart();
    }
  };

  const handlePointerUp = (e: React.PointerEvent<SVGGElement>, nodeId: string) => {
    setDraggedNode(null);
    const node = renderedNodes.find(n => n.id === nodeId);
    if (node) {
      node.fx = null;
      node.fy = null;
    }
    if (simulationRef.current) {
      simulationRef.current.alpha(0.1).restart();
    }
  };

  const handleAddMedication = (medName: string) => {
    if (!activeMedications.some(m => m.toLowerCase() === medName.toLowerCase())) {
      onMedicationsChange([...activeMedications, medName]);
    }
    setSearchQuery('');
    setShowDropdown(false);
  };

  const handleRemoveMedication = (medName: string) => {
    onMedicationsChange(activeMedications.filter(m => m !== medName));
    if (selectedNode === medName) setSelectedNode(null);
    if (selectedLink?.includes(medName)) setSelectedLink(null);
  };

  const handleLoadPreset = (meds: string[]) => {
    onMedicationsChange(meds);
    setSelectedNode(null);
    setSelectedLink(null);
  };

  // Node highlighting calculations
  const isNodeDimmed = (nodeId: string) => {
    if (hoveredNode) {
      if (hoveredNode === nodeId) return false;
      // Is connected to hovered node?
      const isConnected = detailedInteractions.some(inter => 
        (inter.drug1.toLowerCase() === hoveredNode.toLowerCase() && inter.drug2.toLowerCase() === nodeId.toLowerCase()) ||
        (inter.drug2.toLowerCase() === hoveredNode.toLowerCase() && inter.drug1.toLowerCase() === nodeId.toLowerCase()) ||
        (hoveredNode.toLowerCase().includes(nodeId.toLowerCase()) || nodeId.toLowerCase().includes(hoveredNode.toLowerCase()))
      );
      return !isConnected;
    }

    if (selectedNode) {
      if (selectedNode === nodeId) return false;
      const isConnected = detailedInteractions.some(inter => 
        (inter.drug1.toLowerCase() === selectedNode.toLowerCase() && inter.drug2.toLowerCase() === nodeId.toLowerCase()) ||
        (inter.drug2.toLowerCase() === selectedNode.toLowerCase() && inter.drug1.toLowerCase() === nodeId.toLowerCase()) ||
        (selectedNode.toLowerCase().includes(nodeId.toLowerCase()) || nodeId.toLowerCase().includes(selectedNode.toLowerCase()))
      );
      return !isConnected;
    }

    if (selectedLink) {
      const [s, t] = selectedLink.split('::');
      return s !== nodeId && t !== nodeId;
    }

    return false;
  };

  const isLinkDimmed = (link: NetworkLink) => {
    const sId = typeof link.source === 'object' ? link.source.id : link.source;
    const tId = typeof link.target === 'object' ? link.target.id : link.target;

    if (hoveredLink) {
      return hoveredLink !== link.id;
    }
    if (hoveredNode) {
      return sId !== hoveredNode && tId !== hoveredNode;
    }
    if (selectedLink) {
      return selectedLink !== link.id;
    }
    if (selectedNode) {
      return sId !== selectedNode && tId !== selectedNode;
    }
    return false;
  };

  // Find currently selected link details
  const activeLinkDetails = useMemo(() => {
    if (!selectedLink) return null;
    return renderedLinks.find(l => l.id === selectedLink) || null;
  }, [selectedLink, renderedLinks]);

  // Find currently selected node details
  const activeNodeDetails = useMemo(() => {
    if (!selectedNode) return null;
    const dbMed = findClinicalMedicationByName(selectedNode);
    const drugInters = detailedInteractions.filter(inter => 
      inter.drug1.toLowerCase() === selectedNode.toLowerCase() || 
      inter.drug2.toLowerCase() === selectedNode.toLowerCase() ||
      selectedNode.toLowerCase().includes(inter.drug1.toLowerCase()) ||
      selectedNode.toLowerCase().includes(inter.drug2.toLowerCase())
    );
    return {
      name: selectedNode,
      dbMed,
      interactions: drugInters
    };
  }, [selectedNode, detailedInteractions]);

  return (
    <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-5" ref={containerRef}>
      
      {/* Title Header */}
      <div className="flex justify-between items-start flex-wrap gap-3">
        <div>
          <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            Interactive Drug-Drug Interaction (DDI) Network Map
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">
            Dynamic node layout of active medications. Hover/drag drugs, click connections to view therapeutic mitigations.
          </p>
        </div>

        {/* Legend */}
        <div className="flex gap-3 text-[10px] font-bold text-slate-400 bg-slate-900/60 px-2.5 py-1 rounded-md border border-slate-800/80">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_4px_rgba(239,68,68,0.5)]" /> Major
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_4px_rgba(245,158,11,0.5)]" /> Moderate
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400" /> Medication Node
          </span>
        </div>
      </div>

      {/* Preset Clinical Scenarios */}
      <div className="space-y-1.5">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-cyan-400" />
          Interactive Demo Presets
        </span>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleLoadPreset(p.meds)}
              className="text-left bg-slate-900 hover:bg-slate-800/80 border border-slate-800 px-3 py-1.5 rounded-lg transition-all group flex-1 min-w-[140px]"
            >
              <div className="text-[11px] font-bold text-cyan-400 flex items-center justify-between group-hover:text-cyan-300">
                {p.name}
                <ChevronRight className="w-3 h-3 text-slate-500 group-hover:text-cyan-400 transition-transform" />
              </div>
              <p className="text-[9px] text-slate-400 leading-tight mt-0.5 group-hover:text-slate-300">
                {p.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Map & Controls / Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        
        {/* Left: Interactive Map Canvas */}
        <div className="lg:col-span-7 bg-slate-900/40 border border-slate-800 rounded-xl relative overflow-hidden flex flex-col justify-between min-h-[360px]">
          
          {/* Autocomplete & Add bar */}
          <div className="p-3 bg-slate-950/80 border-b border-slate-800/80 relative z-10 flex items-center gap-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-2.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-3.5 h-3.5" />
              </div>
              <input
                type="text"
                placeholder="Search medication to add (e.g. Ibuprofen, Furosemide, Atorvastatin)..."
                value={searchQuery}
                onChange={e => {
                  setSearchQuery(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
              />
              
              {showDropdown && filteredSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-slate-950 border border-slate-800 rounded-lg shadow-2xl z-20 overflow-hidden divide-y divide-slate-900">
                  {filteredSuggestions.map(med => (
                    <button
                      key={med.id}
                      onClick={() => handleAddMedication(med.generic_name)}
                      className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-slate-900 flex items-center justify-between"
                    >
                      <div>
                        <span className="font-bold text-slate-100">{med.generic_name}</span>
                        <span className="text-[10px] text-slate-400 ml-2">({med.Drug_Class})</span>
                      </div>
                      <Plus className="w-3.5 h-3.5 text-cyan-400" />
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {searchQuery && (
              <button 
                onClick={() => { setSearchQuery(''); setShowDropdown(false); }}
                className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* SVG Map Container */}
          <div className="flex-1 relative flex items-center justify-center min-h-[300px]">
            {activeMedications.length === 0 ? (
              <div className="text-center p-6 space-y-2">
                <Pill className="w-10 h-10 text-slate-600 mx-auto animate-pulse" />
                <p className="text-xs text-slate-400">No active medications loaded in map.</p>
                <p className="text-[10px] text-slate-500 max-w-[280px]">
                  Select a clinical preset above or search a drug to construct your interactive network.
                </p>
              </div>
            ) : (
              <svg
                ref={svgRef}
                width="100%"
                height="100%"
                viewBox={`0 0 ${width} ${height}`}
                className="select-none touch-none"
                onClick={() => {
                  setSelectedNode(null);
                  setSelectedLink(null);
                }}
              >
                <defs>
                  {/* Glowing Connection Filters */}
                  <filter id="glow-Major" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                  <filter id="glow-Moderate" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="3.5" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                  <filter id="glow-node-Major" x="-30%" y="-30%" width="160%" height="160%">
                    <feGaussianBlur stdDeviation="6" result="blur" />
                    <feComponentTransfer in="blur" result="boost">
                      <feFuncA type="linear" slope="0.6" />
                    </feComponentTransfer>
                    <feMerge>
                      <feMergeNode in="boost" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {/* Draw Connecting Links */}
                <g className="links">
                  {renderedLinks.map((link) => {
                    const sourceNode = link.source as NetworkNode;
                    const targetNode = link.target as NetworkNode;
                    
                    if (!sourceNode.x || !targetNode.x) return null;

                    const isDimmed = isLinkDimmed(link);
                    const isSelected = selectedLink === link.id;
                    const isHovered = hoveredLink === link.id;

                    const color = link.severityLevel === 'Major' ? '#ef4444' : '#f59e0b';
                    const strokeWidth = isSelected ? 4 : isHovered ? 3.5 : 2.5;

                    return (
                      <g 
                        key={link.id}
                        className="cursor-pointer"
                        onPointerDown={(e) => {
                          e.stopPropagation();
                          setSelectedLink(link.id);
                          setSelectedNode(null);
                        }}
                        onPointerOver={() => setHoveredLink(link.id)}
                        onPointerOut={() => setHoveredLink(null)}
                      >
                        {/* Interactive fat transparent bridge for easier clicking */}
                        <line
                          x1={sourceNode.x}
                          y1={sourceNode.y}
                          x2={targetNode.x}
                          y2={targetNode.y}
                          stroke="transparent"
                          strokeWidth="15"
                        />
                        {/* Glow Line */}
                        <line
                          x1={sourceNode.x}
                          y1={sourceNode.y}
                          x2={targetNode.x}
                          y2={targetNode.y}
                          stroke={color}
                          strokeWidth={strokeWidth}
                          opacity={isDimmed ? 0.12 : isSelected || isHovered ? 1.0 : 0.75}
                          filter={`url(#glow-${link.severityLevel})`}
                          className="transition-all duration-200"
                        />
                      </g>
                    );
                  })}
                </g>

                {/* Draw Nodes */}
                <g className="nodes">
                  {renderedNodes.map((node) => {
                    if (!node.x || !node.y) return null;

                    const isDimmed = isNodeDimmed(node.id);
                    const isSelected = selectedNode === node.id;
                    const isHovered = hoveredNode === node.id;

                    // Node color based on severe interactions
                    const ringColor = 
                      node.severityMax === 'Major' ? 'stroke-rose-500' :
                      node.severityMax === 'Moderate' ? 'stroke-amber-500' :
                      'stroke-cyan-500';

                    const fillBg = isSelected ? 'fill-slate-800' : 'fill-slate-900';

                    return (
                      <g
                        key={node.id}
                        className="cursor-grab active:cursor-grabbing"
                        transform={`translate(${node.x}, ${node.y})`}
                        onPointerDown={(e) => handlePointerDown(e, node.id)}
                        onPointerMove={(e) => handlePointerMove(e, node.id)}
                        onPointerUp={(e) => handlePointerUp(e, node.id)}
                        onPointerOver={() => setHoveredNode(node.id)}
                        onPointerOut={() => setHoveredNode(null)}
                      >
                        {/* Node Halo / Glow */}
                        {node.severityMax === 'Major' && !isDimmed && (
                          <circle
                            r={nodeRadius + 4}
                            fill="none"
                            className="stroke-rose-500/20"
                            strokeWidth="3"
                          />
                        )}

                        {/* Node Outer Ring */}
                        <circle
                          r={nodeRadius}
                          className={cn(
                            "stroke-2 transition-all duration-200", 
                            ringColor, 
                            isSelected ? 'stroke-[3px]' : 'stroke-2'
                          )}
                          fill="#0f172a"
                        />

                        {/* Node Base Fill */}
                        <circle
                          r={nodeRadius - 2}
                          className={cn(
                            "transition-all duration-200",
                            fillBg
                          )}
                        />

                        {/* Dynamic Drug Icon or Initial */}
                        <g transform="translate(-6, -6) scale(0.8)">
                          <Pill className={cn(
                            "w-4 h-4",
                            node.severityMax === 'Major' ? 'text-rose-400' :
                            node.severityMax === 'Moderate' ? 'text-amber-400' :
                            'text-cyan-400'
                          )} />
                        </g>

                        {/* Node Label Card (Beautiful rounded background with text) */}
                        <g transform="translate(0, 31)">
                          {/* Label backdrop rect to guarantee absolute readability */}
                          <rect
                            x={-Math.min(node.name.length * 3.5 + 8, 70)}
                            y="-9"
                            width={Math.min(node.name.length * 7 + 16, 140)}
                            height="16"
                            rx="4"
                            fill="#020617"
                            fillOpacity="0.85"
                            className={cn(
                              "stroke transition-all duration-200",
                              isSelected ? 'stroke-cyan-500/40' : 'stroke-slate-800/60'
                            )}
                            strokeWidth="1"
                          />
                          <text
                            textAnchor="middle"
                            className={cn(
                              "text-[10px] font-bold select-none transition-colors",
                              isSelected ? 'fill-cyan-300' : isDimmed ? 'fill-slate-500' : 'fill-slate-200'
                            )}
                          >
                            {node.name.length > 18 ? `${node.name.substring(0, 15)}...` : node.name}
                          </text>
                        </g>
                      </g>
                    );
                  })}
                </g>
              </svg>
            )}
          </div>

          {/* Quick Clear & Helper tip */}
          <div className="p-3 bg-slate-950/40 border-t border-slate-800/60 flex justify-between items-center text-[10px] text-slate-400">
            <span>💡 Try dragging nodes to organize layout.</span>
            <button
              onClick={() => handleLoadPreset([])}
              className="text-slate-400 hover:text-rose-400 font-bold transition-colors flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear Regimen
            </button>
          </div>
        </div>

        {/* Right: Rich Clinical Mitigation details */}
        <div className="lg:col-span-5 bg-slate-900/30 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="space-y-4">
            
            {/* Header Title */}
            <div className="border-b border-slate-800 pb-2.5 flex justify-between items-center">
              <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-cyan-400" />
                Interactions Intelligence
              </span>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-medium">
                Active: {activeMedications.length} meds
              </span>
            </div>

            {/* CASE 1: Connection (Link) Selected */}
            {activeLinkDetails && (
              <div className="space-y-3.5 animate-fadeIn">
                <div className={cn(
                  "p-3 rounded-lg border",
                  activeLinkDetails.severityLevel === 'Major' 
                    ? 'bg-rose-950/20 border-rose-500/20 text-rose-300' 
                    : 'bg-amber-950/20 border-amber-500/20 text-amber-300'
                )}>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1">
                      <ShieldAlert className="w-4 h-4" />
                      {activeLinkDetails.severity} Interaction
                    </span>
                    <button 
                      onClick={() => setSelectedLink(null)}
                      className="p-1 hover:bg-slate-800 rounded text-slate-400"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                  <h4 className="text-sm font-bold text-slate-100 mt-1.5">
                    {typeof activeLinkDetails.source === 'object' ? activeLinkDetails.source.name : activeLinkDetails.source} + {typeof activeLinkDetails.target === 'object' ? activeLinkDetails.target.name : activeLinkDetails.target}
                  </h4>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-900">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wide">Physiological Mechanism:</span>
                    <p className="text-slate-300 mt-1 leading-relaxed">{activeLinkDetails.mechanism}</p>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-900">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wide">Clinical Hazards & Risks:</span>
                    <p className="text-slate-300 mt-1 leading-relaxed">{activeLinkDetails.clinicalRisk}</p>
                  </div>

                  <div className="bg-cyan-500/5 p-3.5 rounded-lg border border-cyan-500/10">
                    <span className="text-[10px] text-cyan-400 block uppercase font-extrabold tracking-wide flex items-center gap-1">
                      <Stethoscope className="w-3.5 h-3.5" />
                      Therapeutic Mitigation & Management:
                    </span>
                    <p className="text-slate-200 mt-1.5 leading-relaxed font-medium">
                      {activeLinkDetails.management}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* CASE 2: Medication Node Selected */}
            {activeNodeDetails && !activeLinkDetails && (
              <div className="space-y-3.5 animate-fadeIn">
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Pill className="w-4 h-4 text-cyan-400" />
                    <div>
                      <h4 className="text-sm font-bold text-slate-100">{activeNodeDetails.name}</h4>
                      <span className="text-[10px] text-slate-400">{activeNodeDetails.dbMed?.Drug_Class || 'Unspecified class'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button 
                      onClick={() => handleRemoveMedication(activeNodeDetails.name)}
                      className="p-1.5 hover:bg-rose-950/30 border border-slate-800 hover:border-rose-900/30 rounded text-slate-400 hover:text-rose-400 transition-colors"
                      title="Remove from regimen"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => setSelectedNode(null)}
                      className="p-1.5 hover:bg-slate-800 rounded text-slate-400"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2.5 text-xs">
                  {activeNodeDetails.dbMed?.Pregnancy && (
                    <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-900">
                      <span className="text-[9px] text-slate-400 block uppercase font-bold">Pregnancy & Lactation warning:</span>
                      <p className="text-slate-300 mt-0.5 leading-relaxed text-[11px]">
                        {activeNodeDetails.dbMed.Pregnancy.recommendation}
                      </p>
                    </div>
                  )}

                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-900">
                    <span className="text-[9px] text-slate-400 block uppercase font-bold mb-1.5">Regimen Interactions ({activeNodeDetails.interactions.length}):</span>
                    {activeNodeDetails.interactions.length === 0 ? (
                      <p className="text-emerald-400 text-[11px] font-medium flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" /> No pairwise drug interactions found for this drug.
                      </p>
                    ) : (
                      <div className="space-y-2 max-h-[140px] overflow-y-auto custom-scrollbar">
                        {activeNodeDetails.interactions.map((inter, interIdx) => {
                          const otherDrug = inter.drug1.toLowerCase() === activeNodeDetails.name.toLowerCase() ? inter.drug2 : inter.drug1;
                          return (
                            <button
                              key={interIdx}
                              onClick={() => {
                                setSelectedLink(inter.drug1.toLowerCase().includes(inter.drug2.toLowerCase()) || inter.drug2.toLowerCase().includes(inter.drug1.toLowerCase()) ? null : `${findClinicalMedicationByName(inter.drug1)?.generic_name || inter.drug1}::${findClinicalMedicationByName(inter.drug2)?.generic_name || inter.drug2}`);
                                // Let's find the link ID
                                const matchingLink = renderedLinks.find(l => 
                                  (l.id.toLowerCase().includes(inter.drug1.toLowerCase()) && l.id.toLowerCase().includes(inter.drug2.toLowerCase()))
                                );
                                if (matchingLink) {
                                  setSelectedLink(matchingLink.id);
                                  setSelectedNode(null);
                                }
                              }}
                              className="w-full text-left p-2 bg-slate-900 hover:bg-slate-800 rounded border border-slate-800/60 flex items-start gap-2 text-[11px]"
                            >
                              <AlertTriangle className={cn(
                                "w-3.5 h-3.5 shrink-0 mt-0.5",
                                inter.severityLevel === 'Major' ? 'text-rose-400' : 'text-amber-400'
                              )} />
                              <div>
                                <span className="font-bold text-slate-200">With {otherDrug}:</span>
                                <p className="text-slate-400 text-[10px] leading-tight mt-0.5">{inter.mechanism}</p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* CASE 3: Safe Overall Regimen (No active interactions and no selection) */}
            {!activeLinkDetails && !activeNodeDetails && detailedInteractions.length === 0 && activeMedications.length > 0 && (
              <div className="text-center p-6 bg-emerald-950/10 border border-emerald-500/20 rounded-xl space-y-3 animate-fadeIn">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-emerald-300">Drug-Drug Interactions Cleared</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed mt-1">
                    No critical pairwise drug-drug interactions detected between any of your <span className="font-bold text-slate-200">{activeMedications.length} active medications</span> in our clinical knowledge base.
                  </p>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-900 text-[10px] text-left text-slate-400">
                  <span className="font-bold text-slate-300 block mb-1">Current safe list:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {activeMedications.map(m => (
                      <span key={m} className="bg-slate-900 px-2 py-0.5 rounded text-slate-300 border border-slate-800">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* CASE 4: Some interactions exist, but no selection */}
            {!activeLinkDetails && !activeNodeDetails && detailedInteractions.length > 0 && (
              <div className="space-y-3 animate-fadeIn">
                <div className="p-3 bg-amber-950/20 border border-amber-500/20 rounded-xl flex items-start gap-2.5">
                  <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wide">Hazards Detected ({detailedInteractions.length})</h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5">
                      The medication regimen contains active interactions. Select any glowing connection line or drug node on the map to reveal clinical details and mitigation strategies.
                    </p>
                  </div>
                </div>

                <div className="bg-slate-950 p-3 rounded-lg border border-slate-900 space-y-2">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">List of Interactions:</span>
                  <div className="space-y-1.5 max-h-[160px] overflow-y-auto custom-scrollbar">
                    {detailedInteractions.map((inter, idx) => {
                      // Find matching link
                      const linkId = renderedLinks.find(l => 
                        (l.id.toLowerCase().includes(inter.drug1.toLowerCase()) && l.id.toLowerCase().includes(inter.drug2.toLowerCase()))
                      )?.id || null;

                      return (
                        <button
                          key={idx}
                          onClick={() => {
                            if (linkId) setSelectedLink(linkId);
                          }}
                          className="w-full text-left p-2.5 bg-slate-900 hover:bg-slate-800/80 rounded border border-slate-800/80 flex items-start gap-2 transition-colors"
                        >
                          <span className={cn(
                            "w-2 h-2 rounded-full mt-1.5 shrink-0",
                            inter.severityLevel === 'Major' ? 'bg-rose-500' : 'bg-amber-500'
                          )} />
                          <div className="text-[11px]">
                            <div className="font-bold text-slate-200">
                              {inter.drug1} + {inter.drug2}
                            </div>
                            <span className={cn(
                              "text-[9px] font-bold",
                              inter.severityLevel === 'Major' ? 'text-rose-400' : 'text-amber-400'
                            )}>
                              {inter.severity}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* CASE 5: Empty regimen guidance */}
            {activeMedications.length === 0 && (
              <div className="text-center p-6 bg-slate-950/40 border border-slate-900 rounded-xl space-y-2">
                <Info className="w-8 h-8 text-slate-600 mx-auto" />
                <h4 className="text-xs font-bold text-slate-400 uppercase">Interactive Network Map</h4>
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  Click on one of the demonstration presets above, or search for a generic drug in the search bar to populate nodes and reveal drug-drug interactions.
                </p>
              </div>
            )}

          </div>

          {/* Bottom active drugs bar */}
          {activeMedications.length > 0 && (
            <div className="pt-3 border-t border-slate-800/80 space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Regimen Drugs:</span>
              <div className="flex flex-wrap gap-1.5 max-h-[85px] overflow-y-auto custom-scrollbar">
                {activeMedications.map(med => (
                  <div
                    key={med}
                    className="bg-slate-950 border border-slate-800/80 text-slate-300 text-[10px] font-medium pl-2.5 pr-1 py-0.5 rounded-full flex items-center gap-1.5"
                  >
                    <span>{med}</span>
                    <button
                      onClick={() => handleRemoveMedication(med)}
                      className="p-0.5 hover:bg-slate-800 rounded-full text-slate-500 hover:text-rose-400 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
