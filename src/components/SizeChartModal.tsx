import React, { useState } from 'react';
import { X, Ruler, HelpCircle } from 'lucide-react';

interface SizeChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: string;
}

export const SizeChartModal: React.FC<SizeChartModalProps> = ({ isOpen, onClose, category = 'Shirts' }) => {
  const [unit, setUnit] = useState<'inches' | 'cm'>('inches');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-stone-50/50">
          <div className="flex items-center gap-2">
            <Ruler className="w-5 h-5 text-rose-600" />
            <div>
              <h3 className="font-bold text-stone-900 text-lg">Garment Size & Measurement Guide</h3>
              <p className="text-xs text-stone-500">Standard Indian apparel sizing specifications</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Unit Toggle */}
        <div className="px-6 pt-4 flex items-center justify-between">
          <span className="text-xs font-semibold text-stone-600">
            Garment Category: <span className="text-stone-900 font-bold">{category}</span>
          </span>
          <div className="flex items-center bg-stone-100 p-1 rounded-lg text-xs font-semibold">
            <button
              onClick={() => setUnit('inches')}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                unit === 'inches' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500'
              }`}
            >
              Inches (in)
            </button>
            <button
              onClick={() => setUnit('cm')}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                unit === 'cm' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500'
              }`}
            >
              Centimeters (cm)
            </button>
          </div>
        </div>

        {/* Measurement Table */}
        <div className="p-6">
          <div className="overflow-x-auto rounded-xl border border-stone-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-100/80 text-stone-700 uppercase font-bold tracking-wider border-b border-stone-200">
                <tr>
                  <th className="py-3 px-4">Size</th>
                  <th className="py-3 px-4">Chest / Bust</th>
                  <th className="py-3 px-4">Shoulder</th>
                  <th className="py-3 px-4">Garment Length</th>
                  <th className="py-3 px-4">Sleeve</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700 font-medium">
                <tr className="hover:bg-stone-50/50">
                  <td className="py-2.5 px-4 font-bold text-stone-900 bg-stone-50/30">XS</td>
                  <td className="py-2.5 px-4">{unit === 'inches' ? '36 in' : '91 cm'}</td>
                  <td className="py-2.5 px-4">{unit === 'inches' ? '16.5 in' : '42 cm'}</td>
                  <td className="py-2.5 px-4">{unit === 'inches' ? '28 in' : '71 cm'}</td>
                  <td className="py-2.5 px-4">{unit === 'inches' ? '24 in' : '61 cm'}</td>
                </tr>
                <tr className="hover:bg-stone-50/50">
                  <td className="py-2.5 px-4 font-bold text-stone-900 bg-stone-50/30">S</td>
                  <td className="py-2.5 px-4">{unit === 'inches' ? '38 in' : '96 cm'}</td>
                  <td className="py-2.5 px-4">{unit === 'inches' ? '17.2 in' : '44 cm'}</td>
                  <td className="py-2.5 px-4">{unit === 'inches' ? '28.5 in' : '72 cm'}</td>
                  <td className="py-2.5 px-4">{unit === 'inches' ? '24.5 in' : '62 cm'}</td>
                </tr>
                <tr className="hover:bg-stone-50/50 bg-rose-50/30 font-semibold">
                  <td className="py-2.5 px-4 font-bold text-rose-700 bg-rose-50/60">M (Popular)</td>
                  <td className="py-2.5 px-4">{unit === 'inches' ? '40 in' : '101 cm'}</td>
                  <td className="py-2.5 px-4">{unit === 'inches' ? '18 in' : '46 cm'}</td>
                  <td className="py-2.5 px-4">{unit === 'inches' ? '29.5 in' : '75 cm'}</td>
                  <td className="py-2.5 px-4">{unit === 'inches' ? '25 in' : '63.5 cm'}</td>
                </tr>
                <tr className="hover:bg-stone-50/50">
                  <td className="py-2.5 px-4 font-bold text-stone-900 bg-stone-50/30">L</td>
                  <td className="py-2.5 px-4">{unit === 'inches' ? '42 in' : '106 cm'}</td>
                  <td className="py-2.5 px-4">{unit === 'inches' ? '18.8 in' : '48 cm'}</td>
                  <td className="py-2.5 px-4">{unit === 'inches' ? '30.5 in' : '77 cm'}</td>
                  <td className="py-2.5 px-4">{unit === 'inches' ? '25.5 in' : '65 cm'}</td>
                </tr>
                <tr className="hover:bg-stone-50/50">
                  <td className="py-2.5 px-4 font-bold text-stone-900 bg-stone-50/30">XL</td>
                  <td className="py-2.5 px-4">{unit === 'inches' ? '44 in' : '112 cm'}</td>
                  <td className="py-2.5 px-4">{unit === 'inches' ? '19.5 in' : '50 cm'}</td>
                  <td className="py-2.5 px-4">{unit === 'inches' ? '31.5 in' : '80 cm'}</td>
                  <td className="py-2.5 px-4">{unit === 'inches' ? '26 in' : '66 cm'}</td>
                </tr>
                <tr className="hover:bg-stone-50/50">
                  <td className="py-2.5 px-4 font-bold text-stone-900 bg-stone-50/30">XXL</td>
                  <td className="py-2.5 px-4">{unit === 'inches' ? '46 in' : '117 cm'}</td>
                  <td className="py-2.5 px-4">{unit === 'inches' ? '20.2 in' : '52 cm'}</td>
                  <td className="py-2.5 px-4">{unit === 'inches' ? '32.5 in' : '82 cm'}</td>
                  <td className="py-2.5 px-4">{unit === 'inches' ? '26.5 in' : '67 cm'}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 flex items-start gap-2.5">
            <HelpCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p>
              <strong>Fit Tip:</strong> For Indian ethnic wear and kurtas, if you prefer a relaxed or layered fit, we recommend selecting one size up. Sarees come in standard 5.5 meters length + 0.8 meter unstitched matching blouse fabric.
            </p>
          </div>
        </div>

        <div className="px-6 py-3 bg-stone-50 border-t border-stone-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-lg cursor-pointer"
          >
            Got it, Return to Garment
          </button>
        </div>
      </div>
    </div>
  );
};
