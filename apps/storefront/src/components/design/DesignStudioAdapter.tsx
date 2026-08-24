import React, { useState, useEffect, useRef } from 'react';
import { Stage, Layer, Image as KonvaImage, Text as KonvaText, Rect as KonvaRect, Transformer } from 'react-konva';
import { apiPost } from '../../services/api';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface DesignStudioAdapterProps {
  productId: string;
  productName: string;
  colourName: string | null;
  colourImage: string | null;
  selectedLocations: {
    locationId: string;
    locationName: string;
    colourCount: number;
  }[];
  designId: string | null;
  onSave: (designId: string, designsData: Record<string, any>) => void;
  onBack: () => void;
}

interface CanvasElement {
  id: string;
  type: 'text' | 'image';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  text?: string;
  fontSize?: number;
  fill?: string;
  src?: string;
}

// ── Helper Component to render Konva image element
const ElementImage = ({ element, onSelect, onChange }: {
  element: CanvasElement;
  onSelect: () => void;
  onChange: (newAttrs: Partial<CanvasElement>) => void;
}) => {
  const imageRef = useRef<any>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    if (element.src) {
      const img = new window.Image();
      img.src = element.src;
      img.onload = () => setImage(img);
    }
  }, [element.src]);

  return (
    <>
      {image && (
        <KonvaImage
          ref={imageRef}
          image={image}
          x={element.x}
          y={element.y}
          width={element.width}
          height={element.height}
          rotation={element.rotation}
          draggable
          onClick={onSelect}
          onTap={onSelect}
          onDragEnd={(e) => {
            onChange({
              x: e.target.x(),
              y: e.target.y(),
            });
          }}
          onTransformEnd={() => {
            const node = imageRef.current;
            const scaleX = node.scaleX();
            const scaleY = node.scaleY();
            node.scaleX(1);
            node.scaleY(1);
            onChange({
              x: node.x(),
              y: node.y(),
              width: Math.max(5, node.width() * scaleX),
              height: Math.max(5, node.height() * scaleY),
              rotation: node.rotation(),
            });
          }}
        />
      )}
    </>
  );
};

// ── Helper Component to render Konva text element
const ElementText = ({ element, onSelect, onChange }: {
  element: CanvasElement;
  onSelect: () => void;
  onChange: (newAttrs: Partial<CanvasElement>) => void;
}) => {
  const textRef = useRef<any>(null);

  return (
    <KonvaText
      ref={textRef}
      text={element.text || ''}
      x={element.x}
      y={element.y}
      fontSize={element.fontSize || 20}
      fill={element.fill || '#FFFFFF'}
      rotation={element.rotation}
      fontFamily="sans-serif"
      draggable
      onClick={onSelect}
      onTap={onSelect}
      onDragEnd={(e) => {
        onChange({
          x: e.target.x(),
          y: e.target.y(),
        });
      }}
      onTransformEnd={() => {
        const node = textRef.current;
        const scaleX = node.scaleX();
        node.scaleX(1);
        node.scaleY(1);
        onChange({
          x: node.x(),
          y: node.y(),
          fontSize: Math.max(8, (node.fontSize() * scaleX)),
          rotation: node.rotation(),
        });
      }}
    />
  );
};

export function DesignStudioAdapter({
  productId,
  productName,
  colourName,
  colourImage,
  selectedLocations,
  onSave,
  onBack,
}: DesignStudioAdapterProps) {
  const [activeTab, setActiveTab] = useState<string>(selectedLocations[0]?.locationId || '');
  const [designs, setDesigns] = useState<Record<string, { elements: CanvasElement[]; previewUrl: string }>>({});
  
  // Canvas editing state
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // New element creation states
  const [newText, setNewText] = useState('My Custom Print');
  const [newColor, setNewColor] = useState('#FF007F');
  const [newFontSize, setNewFontSize] = useState(14);
  const [saving, setSaving] = useState(false);

  const stageRef = useRef<any>(null);
  const transformerRef = useRef<any>(null);
  const [garmentBg, setGarmentBg] = useState<HTMLImageElement | null>(null);

  // Load garment background image
  useEffect(() => {
    if (colourImage) {
      const img = new window.Image();
      img.src = colourImage;
      img.crossOrigin = 'anonymous'; // Avoid canvas pollution
      img.onload = () => setGarmentBg(img);
    } else {
      setGarmentBg(null);
    }
  }, [colourImage]);

  // Load elements when changing tab
  useEffect(() => {
    if (activeTab) {
      setElements(designs[activeTab]?.elements || []);
      setSelectedId(null);
    }
  }, [activeTab]);

  // Attach/detach transformer
  useEffect(() => {
    if (transformerRef.current) {
      const stage = stageRef.current;
      const selectedNode = stage.findOne('#' + selectedId);
      if (selectedNode) {
        transformerRef.current.nodes([selectedNode]);
      } else {
        transformerRef.current.nodes([]);
      }
      transformerRef.current.getLayer().batchDraw();
    }
  }, [selectedId, elements]);

  // Keyboard shortcut: Delete/Backspace removes selected element
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
        // Only fire if not typing in an input/textarea
        const tag = (e.target as HTMLElement).tagName;
        if (tag !== 'INPUT' && tag !== 'TEXTAREA') {
          e.preventDefault();
          setElements(prev => prev.filter(el => el.id !== selectedId));
          setSelectedId(null);
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedId]);

  const handleStageClick = (e: any) => {
    if (e.target === e.target.getStage() || e.target.name() === 'background') {
      setSelectedId(null);
    }
  };

  // Add text element
  const handleAddText = () => {
    const el: CanvasElement = {
      id: 'text_' + Date.now(),
      type: 'text',
      x: 155,
      y: 225,
      width: 90,
      height: 20,
      rotation: 0,
      text: newText,
      fontSize: newFontSize,
      fill: newColor,
    };
    setElements([...elements, el]);
  };

  // Handle file/image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const el: CanvasElement = {
        id: 'image_' + Date.now(),
        type: 'image',
        x: 155,
        y: 185,
        width: 80,
        height: 80,
        rotation: 0,
        src: reader.result as string,
      };
      setElements([...elements, el]);
    };
    reader.readAsDataURL(file);
  };

  // Delete element
  const handleDeleteSelected = () => {
    if (selectedId) {
      setElements(elements.filter(el => el.id !== selectedId));
      setSelectedId(null);
    }
  };

  // Update elements
  const handleElementChange = (id: string, newAttrs: Partial<CanvasElement>) => {
    setElements(elements.map(el => el.id === id ? { ...el, ...newAttrs } : el));
  };

  // Capture current canvas preview and save elements to store map
  const saveCurrentTabState = () => {
    if (!activeTab || !stageRef.current) return;

    // Deselect first to make clean screenshot
    setSelectedId(null);

    // Give Konva a frame to render without selector handle before generating URL
    const previewUrl = stageRef.current.toDataURL({ pixelRatio: 1.5 });
    
    setDesigns(prev => ({
      ...prev,
      [activeTab]: {
        elements,
        previewUrl,
      }
    }));
  };

  // Save all designs configuration to backend Design model
  const handleSaveAll = async () => {
    setSaving(true);
    try {
      // First save active tab's final edits
      saveCurrentTabState();

      // We compose a configuration package with all design tabs/locations
      const currentDesigns = {
        ...designs,
        [activeTab]: {
          elements,
          // Generate direct preview URL
          previewUrl: stageRef.current ? stageRef.current.toDataURL({ pixelRatio: 1.5 }) : '',
        }
      };

      // Call API to create/update Design configuration
      const result = await apiPost<{ _id: string }>('/designs', {
        productId,
        configuration: {
          locations: currentDesigns,
        },
        previewUrl: currentDesigns[selectedLocations[0]?.locationId]?.previewUrl || '',
        status: 'saved',
      });

      onSave(result._id, currentDesigns);
    } catch (err) {
      console.error('Failed to save designs', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white border border-neutral-200 p-6 lg:p-8">
      {/* Printable Area Location Tabs */}
      <div className="flex border-b border-neutral-200 mb-6 overflow-x-auto gap-2">
        {selectedLocations.map((loc) => {
          const isActive = activeTab === loc.locationId;
          return (
            <button
              key={loc.locationId}
              onClick={() => {
                saveCurrentTabState();
                setActiveTab(loc.locationId);
              }}
              className={`font-mono text-[11px] uppercase tracking-[0.15em] px-4 py-3 border-b-2 transition-all whitespace-nowrap ${
                isActive
                  ? 'border-black text-black font-bold'
                  : 'border-transparent text-neutral-400 hover:text-black'
              }`}
            >
              {loc.locationName} ({loc.colourCount} Col)
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Toolbar Controls */}
        <div className="lg:col-span-4 space-y-6">
          <div>
            <h3 className="font-display font-black text-lg text-black uppercase tracking-tight mb-2">Design Tools</h3>
            <p className="font-mono text-[10px] text-neutral-400 uppercase tracking-wider">
              Garment: {productName} ({colourName})
            </p>
          </div>

          {/* Add Text Element */}
          <div className="border border-neutral-200 bg-neutral-50 p-4">
            <h4 className="font-mono text-[10px] uppercase tracking-[0.15em] text-magenta mb-3">Add Custom Text</h4>
            <div className="space-y-3">
              <input
                type="text"
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                placeholder="Enter custom text"
                className="w-full bg-white border border-neutral-300 text-black font-mono text-[11px] p-2 focus:outline-none focus:border-black transition-colors placeholder-neutral-300"
              />
              {/* Font size slider */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-neutral-400">Font Size</span>
                  <span className="font-mono text-[10px] font-bold text-black">{newFontSize}px</span>
                </div>
                <input
                  type="range"
                  min={8}
                  max={48}
                  step={1}
                  value={newFontSize}
                  onChange={(e) => setNewFontSize(Number(e.target.value))}
                  className="w-full h-1.5 accent-black cursor-pointer"
                />
                <div className="flex justify-between">
                  <span className="font-mono text-[8px] text-neutral-300">8</span>
                  <span className="font-mono text-[8px] text-neutral-300">48</span>
                </div>
              </div>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                  className="w-10 h-8 bg-white border border-neutral-300 cursor-pointer"
                />
                <button 
                  onClick={handleAddText}
                  className="flex-1 bg-black hover:bg-neutral-800 text-white font-mono text-[10px] uppercase tracking-[0.15em] py-2 transition-colors"
                >
                  Place Text
                </button>
              </div>
            </div>
          </div>

          {/* Add Logo / Upload Artwork */}
          <div className="border border-neutral-200 bg-neutral-50 p-4">
            <h4 className="font-mono text-[10px] uppercase tracking-[0.15em] text-magenta mb-3">Upload Artwork</h4>
            <label className="block w-full border border-dashed border-neutral-300 hover:border-black transition-colors text-center p-6 cursor-pointer group">
              <svg className="w-8 h-8 text-neutral-300 group-hover:text-black mx-auto mb-2 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-neutral-400 group-hover:text-black transition-colors block">
                Select Logo Image
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Placed Elements List with individual delete buttons */}
          {elements.length > 0 && (
            <div className="border border-neutral-200 bg-neutral-50 p-3">
              <h4 className="font-mono text-[9px] uppercase tracking-[0.15em] text-neutral-400 mb-2">Placed Elements</h4>
              <div className="divide-y divide-neutral-100">
                {elements.map((el, i) => (
                  <div
                    key={el.id}
                    className={`flex items-center justify-between py-2 gap-2 cursor-pointer group ${
                      selectedId === el.id ? 'opacity-100' : 'opacity-70 hover:opacity-100'
                    }`}
                    onClick={() => setSelectedId(el.id)}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {/* Icon */}
                      <span className={`flex-shrink-0 w-6 h-6 flex items-center justify-center rounded ${
                        selectedId === el.id ? 'bg-black text-white' : 'bg-neutral-200 text-neutral-500'
                      }`}>
                        {el.type === 'text' ? (
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h8m-8 6h16" />
                          </svg>
                        ) : (
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        )}
                      </span>
                      <span className="font-mono text-[10px] text-black truncate">
                        {el.type === 'text' ? `"${el.text?.slice(0, 18)}${(el.text?.length ?? 0) > 18 ? '…' : ''}"` : `Artwork ${i + 1}`}
                      </span>
                    </div>
                    {/* Delete button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setElements(prev => prev.filter(item => item.id !== el.id));
                        if (selectedId === el.id) setSelectedId(null);
                      }}
                      className="flex-shrink-0 w-6 h-6 bg-red-100 hover:bg-red-500 text-red-500 hover:text-white flex items-center justify-center transition-colors rounded"
                      title="Delete"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
              <p className="font-mono text-[8px] text-neutral-300 mt-2 uppercase tracking-[0.1em]">Click row to select · Del key to remove</p>
            </div>
          )}
        </div>

        {/* Center Canvas Designer */}
        <div className="lg:col-span-8 flex flex-col items-center">
          <div className="border border-[#222] bg-[#0d0d0d] p-3 shadow-inner relative select-none">
            {/* Stage Canvas */}
            <Stage
              width={400}
              height={500}
              onMouseDown={handleStageClick}
              onTouchStart={handleStageClick}
              ref={stageRef}
            >
              <Layer>
                {/* Garment background image */}
                {garmentBg ? (
                  <KonvaImage
                    image={garmentBg}
                    width={400}
                    height={500}
                    name="background"
                  />
                ) : (
                  // Fallback plain bg
                  <KonvaRect
                    width={400}
                    height={500}
                    fill="#151515"
                    name="background"
                  />
                )}

                {/* Printable Boundary Box */}
                <KonvaRect
                  x={148}
                  y={165}
                  width={104}
                  height={140}
                  stroke="#FF007F"
                  strokeWidth={2}
                  dash={[5, 3]}
                  opacity={0.9}
                  listening={false}
                />

                {/* User Elements */}
                {elements.map((el) => {
                  if (el.type === 'image') {
                    return (
                      <ElementImage
                        key={el.id}
                        element={el}
                        onSelect={() => setSelectedId(el.id)}
                        onChange={(newAttrs) => handleElementChange(el.id, newAttrs)}
                      />
                    );
                  } else {
                    return (
                      <ElementText
                        key={el.id}
                        element={el}
                        onSelect={() => setSelectedId(el.id)}
                        onChange={(newAttrs) => handleElementChange(el.id, newAttrs)}
                      />
                    );
                  }
                })}

                {/* Selection Transformer handles */}
                <Transformer
                  ref={transformerRef}
                  boundBoxFunc={(oldBox, newBox) => {
                    // Allow scaling down to 2px minimum
                    if (newBox.width < 2 || newBox.height < 2) {
                      return oldBox;
                    }
                    return newBox;
                  }}
                />
              </Layer>
            </Stage>

            {/* Printable Area hint overlay */}
            <span className="absolute bottom-5 left-0 right-0 text-center font-mono text-[9px] uppercase tracking-[0.2em] text-[#444] pointer-events-none">
              Printable boundary area
            </span>
          </div>

          <p className="mt-3 font-mono text-[9px] uppercase tracking-[0.1em] text-neutral-400 text-center max-w-sm">
            Drag, resize, or rotate elements on the garment. Elements will stay linked to your selected print area.
          </p>
        </div>
      </div>

      {/* Save / Back navigation */}
      <div className="mt-8 pt-6 border-t border-neutral-200 flex justify-between">
        <button
          onClick={onBack}
          className="border border-neutral-300 text-neutral-500 font-mono text-[11px] uppercase tracking-[0.15em] px-5 py-2.5 hover:border-black hover:text-black transition-all"
        >
          Back
        </button>
        <button
          onClick={handleSaveAll}
          disabled={saving}
          className="bg-black text-white font-mono text-[11px] uppercase tracking-[0.15em] px-8 py-3 hover:bg-neutral-800 transition-colors disabled:opacity-30 flex items-center gap-2"
        >
          {saving ? <LoadingSpinner label="Saving..." /> : 'Confirm & Review Order →'}
        </button>
      </div>
    </div>
  );
}
