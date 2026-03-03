'use client';

import { useEffect, useState, useRef } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'sonner';

interface RentalItem {
  id: string;
  item_id: string;
  quantity: number;
  inventory_items: { name: string; daily_rate: number };
}

export default function MobileChecklistPage({ params }: { params: { id: string } }) {
  const [loading, setLoading] = useState(true);
  const [rental, setRental] = useState<any>(null);
  const [items, setItems] = useState<RentalItem[]>([]);
  const [checklistType, setChecklistType] = useState<'delivery' | 'return'>('delivery');

  // State for items condition
  const [itemConditions, setItemConditions] = useState<Record<string, { status: string; notes: string; photo_url: string | null }>>({});
  const [signatureData, setSignatureData] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchData();
  }, [params.id]);

  async function fetchData() {
    setLoading(true);
    // Fetch rental details
    const { data: rentalData } = await supabase
      .from('rentals')
      .select('*, clients(*)')
      .eq('id', params.id)
      .single();

    if (rentalData) setRental(rentalData);

    // Fetch items
    const { data: itemsData } = await supabase
      .from('rental_items')
      .select('*, inventory_items(name, daily_rate)')
      .eq('rental_id', params.id);

    if (itemsData) {
      setItems(itemsData as RentalItem[]);
      // Init conditions
      const initialConditions: Record<string, any> = {};
      itemsData.forEach((item: any) => {
        initialConditions[item.id] = { status: 'ok', notes: '', photo_url: null };
      });
      setItemConditions(initialConditions);
    }

    setLoading(false);
  }

  // Handle photo upload
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, rentalItemId: string) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    // Convert to base64 for demo purposes / fallback
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;

      try {
        // Try uploading to Supabase Storage (requires 'checklists' public bucket)
        const fileExt = file.name.split('.').pop();
        const fileName = `${params.id}_${rentalItemId}_${Date.now()}.${fileExt}`;
        const { data, error } = await supabase.storage.from('checklists').upload(fileName, file);

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage.from('checklists').getPublicUrl(fileName);

        setItemConditions(prev => ({
          ...prev,
          [rentalItemId]: { ...prev[rentalItemId], photo_url: publicUrl }
        }));
        toast.success('Foto subida exitosamente');

      } catch (err) {
        console.warn('Could not upload to storage bucket, using Base64 fallback for demo:', err);
        // Fallback for MVP demo without storage bucket
        setItemConditions(prev => ({
          ...prev,
          [rentalItemId]: { ...prev[rentalItemId], photo_url: base64String }
        }));
        toast.success('Foto guardada (Modo Demo)');
      }
    };
    reader.readAsDataURL(file);
  };

  // Simple Drawing for Signature
  let isDrawing = false;

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    isDrawing = true;
    draw(e);
  };

  const stopDrawing = () => {
    isDrawing = false;
    const canvas = canvasRef.current;
    if (canvas) {
      setSignatureData(canvas.toDataURL());
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000';

    let x, y;
    if ('touches' in e) {
      const rect = canvas.getBoundingClientRect();
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      const rect = canvas.getBoundingClientRect();
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();
      setSignatureData(null);
    }
  };

  async function handleSubmit() {
    if (!signatureData) {
      alert('Se requiere la firma del cliente/responsable.');
      return;
    }

    // Create Checklist record
    const { data: checklist, error: clError } = await supabase
      .from('delivery_checklists')
      .insert({
        rental_id: params.id,
        type: checklistType,
        signature_url: signatureData, // Base64 signature for MVP
        notes: `Checklist ${checklistType} procesado.`
      })
      .select()
      .single();

    if (clError || !checklist) {
      toast.error('Error al guardar el checklist');
      return;
    }

    // Insert Items
    const clItemsData = items.map(item => ({
      checklist_id: checklist.id,
      item_id: item.item_id,
      status: itemConditions[item.id].status,
      notes: itemConditions[item.id].notes || null,
      photo_url: itemConditions[item.id].photo_url
    }));

    await supabase.from('checklist_items').insert(clItemsData);

    // If return & damages, calculate penalty
    if (checklistType === 'return') {
      let extraPenalty = 0;
      items.forEach(item => {
        const cond = itemConditions[item.id];
        if (cond.status === 'damaged' || cond.status === 'missing') {
          // Basic logic: Charge 5 days rental as penalty for damage/loss for demo
          extraPenalty += item.inventory_items.daily_rate * item.quantity * 5;
        }
      });

      if (extraPenalty > 0) {
        await supabase.rpc('increment_penalty', { row_id: params.id, amount: extraPenalty });
        toast.warning(`Retención calculada: $${extraPenalty.toLocaleString()} por daños/faltantes.`);
      }
    }

    toast.success('Checklist guardado y firmado correctamente.');
    setTimeout(() => {
      window.close(); // or redirect
      window.location.href = '/dashboard/rentals';
    }, 2000);
  }

  if (loading) return <div className="p-8 text-center bg-gray-50 min-h-screen">Cargando checklist...</div>;
  if (!rental) return <div className="p-8 text-center bg-gray-50 min-h-screen">Renta no encontrada</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-red-600 text-white p-4 shadow-md sticky top-0 z-10">
        <h1 className="text-xl font-bold">Checklist de Operación</h1>
        <p className="text-sm opacity-90">{rental.clients?.name} - {rental.event_name}</p>
      </div>

      <div className="p-4">
        {/* Type Selector */}
        <div className="flex bg-gray-200 rounded-lg p-1 mb-6">
          <button
            onClick={() => setChecklistType('delivery')}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${checklistType === 'delivery' ? 'bg-white shadow text-gray-900' : 'text-gray-500'
              }`}
          >
            🚚 Entrega (Salida)
          </button>
          <button
            onClick={() => setChecklistType('return')}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${checklistType === 'return' ? 'bg-white shadow text-gray-900' : 'text-gray-500'
              }`}
          >
            📥 Recepción (Retorno)
          </button>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-900 border-b pb-2">Equipos en Renta</h2>

          {items.map(item => (
            <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-start mb-3">
                <div className="font-medium text-gray-900">{item.inventory_items?.name}</div>
                <div className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">Cant: {item.quantity}</div>
              </div>

              {/* Status Buttons */}
              <div className="grid grid-cols-3 gap-2 mb-3">
                <button
                  onClick={() => setItemConditions(prev => ({ ...prev, [item.id]: { ...prev[item.id], status: 'ok' } }))}
                  className={`py-2 px-1 text-xs font-medium rounded-lg border flex flex-col items-center justify-center gap-1 ${itemConditions[item.id].status === 'ok' ? 'bg-green-50 border-green-500 text-green-700' : 'border-gray-200 text-gray-600'
                    }`}
                >
                  <span className="text-lg">✅</span> OK
                </button>
                <button
                  onClick={() => setItemConditions(prev => ({ ...prev, [item.id]: { ...prev[item.id], status: 'damaged' } }))}
                  className={`py-2 px-1 text-xs font-medium rounded-lg border flex flex-col items-center justify-center gap-1 ${itemConditions[item.id].status === 'damaged' ? 'bg-orange-50 border-orange-500 text-orange-700' : 'border-gray-200 text-gray-600'
                    }`}
                >
                  <span className="text-lg">⚠️</span> Dañado
                </button>
                <button
                  onClick={() => setItemConditions(prev => ({ ...prev, [item.id]: { ...prev[item.id], status: 'missing' } }))}
                  className={`py-2 px-1 text-xs font-medium rounded-lg border flex flex-col items-center justify-center gap-1 ${itemConditions[item.id].status === 'missing' ? 'bg-red-50 border-red-500 text-red-700' : 'border-gray-200 text-gray-600'
                    }`}
                >
                  <span className="text-lg">❌</span> Falta
                </button>
              </div>

              {/* Notes & Photo Input if not OK */}
              {itemConditions[item.id].status !== 'ok' && (
                <div className="space-y-3 bg-gray-50 p-3 rounded-lg border border-gray-100 mt-3">
                  <input
                    type="text"
                    placeholder="Describe el daño o situación..."
                    value={itemConditions[item.id].notes}
                    onChange={(e) => setItemConditions(prev => ({ ...prev, [item.id]: { ...prev[item.id], notes: e.target.value } }))}
                    className="w-full text-sm border border-gray-300 rounded p-2"
                  />

                  <div className="flex items-center gap-3">
                    <label className="flex-1 cursor-pointer bg-white border border-gray-300 text-gray-700 py-2 px-3 rounded text-sm font-medium text-center flex items-center justify-center gap-2">
                      <span>📸 Tomar Foto Evidencia</span>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="hidden"
                        onChange={(e) => handlePhotoUpload(e, item.id)}
                      />
                    </label>
                  </div>

                  {itemConditions[item.id].photo_url && (
                    <div className="mt-2 text-sm text-green-600 font-medium flex items-center gap-1">
                      <span>✓</span> Evidencia adjuntada
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Signature Pad */}
        <div className="mt-8 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-1">Firma de Conformidad</h2>
          <p className="text-xs text-gray-500 mb-4">Confirmo que el equipo ha sido {checklistType === 'delivery' ? 'entregado' : 'recibido'} en las condiciones marcadas.</p>

          <div className="border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 relative h-48 w-full overflow-hidden touch-none">
            <canvas
              ref={canvasRef}
              width={350}
              height={190}
              onMouseDown={startDrawing}
              onMouseUp={stopDrawing}
              onMouseOut={stopDrawing}
              onMouseMove={draw}
              onTouchStart={startDrawing}
              onTouchEnd={stopDrawing}
              onTouchMove={draw}
              className="absolute inset-0 w-full h-full cursor-crosshair touch-none"
            />
          </div>
          <div className="flex justify-end mt-2">
            <button
              onClick={clearSignature}
              className="text-xs text-red-600 font-medium hover:underline"
            >
              Borrar Firma
            </button>
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20">
        <button
          onClick={handleSubmit}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-transform active:scale-95"
        >
          Guardar y Finalizar Checklist
        </button>
      </div>
    </div>
  );
}
