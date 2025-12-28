import React, { useState } from 'react';
import { X } from 'lucide-react';

const YesterdayHealthDiary = () => {
  const [weight, setWeight] = useState('65.0');
  const [height, setHeight] = useState('170');
  const [riskFactors, setRiskFactors] = useState([]);
  const [positiveHabits, setPositiveHabits] = useState([]);
  const [exerciseDuration, setExerciseDuration] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const calculateBMI = () => {
    const weightKg = parseFloat(weight) || 0;
    const heightCm = parseFloat(height) || 0;
    if (weightKg > 0 && heightCm > 0) {
      const heightM = heightCm / 100;
      const bmi = weightKg / (heightM * heightM);
      return bmi.toFixed(1);
    }
    return '-';
  };

  const getBMIColor = () => {
    const bmi = parseFloat(calculateBMI());
    if (isNaN(bmi)) {
      return {
        bg: 'from-gray-100 to-gray-200',
        border: 'border-gray-300',
        text: 'text-gray-500'
      };
    }

    // BMI categories for Asian population
    if (bmi < 18.5) {
      return {
        bg: 'from-blue-100 to-blue-200',
        border: 'border-blue-300',
        text: 'text-blue-600'
      }; // Underweight
    } else if (bmi < 23) {
      return {
        bg: 'from-green-100 to-green-200',
        border: 'border-green-300',
        text: 'text-green-600'
      }; // Normal
    } else if (bmi < 25) {
      return {
        bg: 'from-yellow-100 to-yellow-200',
        border: 'border-yellow-300',
        text: 'text-yellow-600'
      }; // Overweight
    } else if (bmi < 30) {
      return {
        bg: 'from-orange-100 to-orange-200',
        border: 'border-orange-300',
        text: 'text-orange-600'
      }; // Obese I
    } else {
      return {
        bg: 'from-red-200 to-red-300',
        border: 'border-red-400',
        text: 'text-red-700'
      }; // Obese II
    }
  };

  const getBMIStatus = () => {
    const bmi = parseFloat(calculateBMI());
    if (isNaN(bmi)) return '';

    if (bmi < 18.5) return 'น้ำหนักน้อย/ผอม';
    if (bmi < 23) return 'ปกติ (สมส่วน)';
    if (bmi < 25) return 'น้ำหนักเกิน';
    if (bmi < 30) return 'โรคอ้วนระดับ 1';
    return 'โรคอ้วนระดับ 2';
  };

  const getBMITip = () => {
    const bmi = parseFloat(calculateBMI());
    if (isNaN(bmi)) return '';

    if (bmi < 18.5) {
      const targetWeight = ((18.5 * Math.pow(parseInt(height) / 100, 2))).toFixed(1);
      return `💪 พยายามกินอาหารให้เพียงพอ`;
    } else if (bmi < 23) {
      return '🎉 ยอดเยี่ยม! รักษาน้ำหนักให้อยู่ในเขตสุขภาพดีนะ';
    } else if (bmi < 25) {
      const targetWeight = ((23 * Math.pow(parseInt(height) / 100, 2))).toFixed(1);
      const weightToLose = (parseFloat(weight) - parseFloat(targetWeight)).toFixed(1);
      return `🎯 ลดน้ำหนักอีก ${weightToLose} กก. เพื่อสุขภาพที่ดีขึ้น!`;
    } else if (bmi < 30) {
      const targetWeight = ((23 * Math.pow(parseInt(height) / 100, 2))).toFixed(1);
      const weightToLose = (parseFloat(weight) - parseFloat(targetWeight)).toFixed(1);
      return `💪 ลดน้ำหนักอีก ${weightToLose} กก. เพื่อลดความเสี่ยงต่อโรค!`;
    } else {
      const targetWeight = ((23 * Math.pow(parseInt(height) / 100, 2))).toFixed(1);
      const weightToLose = (parseFloat(weight) - parseFloat(targetWeight)).toFixed(1);
      return `⚠️ ควรปรึกษาแพทย์ ลดน้ำหนักอีก ${weightToLose} กก. เพื่อสุขภาพระยะยาว`;
    }
  };

  const getBMIEmoji = () => {
    const bmi = parseFloat(calculateBMI());
    if (isNaN(bmi)) return '😊';

    if (bmi < 18.5) return '😊';
    if (bmi < 23) return '💪';
    if (bmi < 25) return '🙂';
    if (bmi < 30) return '😰';
    return '😟';
  };

  const handleWeightChange = (value) => {
    // Allow only numbers and one decimal point
    const cleaned = value.replace(/[^\d.]/g, '');
    // Ensure only one decimal point
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      return;
    }
    // Limit to 1 decimal place
    const formatted = parts.length === 2
      ? `${parts[0]}.${parts[1].slice(0, 1)}`
      : cleaned;
    setWeight(formatted || '');
  };

  const adjustWeight = (delta) => {
    const current = parseFloat(weight) || 0;
    const newWeight = Math.max(0, current + delta);
    setWeight(newWeight.toFixed(1));
  };

  const handleHeightChange = (value) => {
    // Allow only numbers
    const cleaned = value.replace(/[^\d]/g, '');
    if (cleaned.length <= 3) {
      setHeight(cleaned || '');
    }
  };

  const adjustHeight = (delta) => {
    const current = parseInt(height) || 0;
    const newHeight = Math.max(0, Math.min(300, current + delta));
    setHeight(newHeight.toString());
  };

  const riskOptions = [
    { id: 'forgotMedicine', icon: '💊', label: 'ลืมกินยา', description: '' },
    { id: 'saltyFood', icon: '🧂', label: 'ทานเค็มจัด', description: 'ทานอาหารรสจัด เช่น ส้มตำปลาร้า บะหมี่กึ่งสำเร็จรูป น้ำซุป ขนมขบเคี้ยว' },
    { id: 'notEnoughSleep', icon: '😴', label: 'นอนไม่พอ', description: 'นอนน้อยกว่า 7 ชั่วโมง หรือหลับๆ ตื่นๆ' },
    { id: 'alcohol', icon: '🍷', label: 'ดื่มเหล้า', description: 'ดื่มเครื่องดื่มแอลกอฮอล์ทุกชนิด เช่น เบียร์ ไวน์ เหล้า' },
    { id: 'smoking', icon: '🚬', label: 'สูบบุหรี่', description: '' },
    { id: 'stress', icon: '🤯', label: 'เครียดมาก', description: 'รู้สึกเครียด กดดัน หรือกังวลกับเรื่องงาน/เรื่องส่วนตัว' },
  ];

  const positiveOptions = [
    { id: 'meditation', icon: '🧘', label: 'นั่งสมาธิ', description: '' },
    { id: 'vegetables', icon: '🥗', label: 'ทานผักเยอะ', description: 'เน้นทานผัก ผลไม้ ธัญพืช หรือถั่วต่างๆ' },
  ];

  const toggleRiskFactor = (id) => {
    setRiskFactors(prev =>
      prev.includes(id)
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const togglePositiveHabit = (id) => {
    setPositiveHabits(prev =>
      prev.includes(id)
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const toggleExerciseDuration = (value) => {
    setExerciseDuration(prev =>
      prev === value ? null : value
    );
  };

  const handleSave = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    const data = {
      weight,
      height,
      riskFactors,
      positiveHabits,
      exerciseDuration,
      bmi: calculateBMI(),
      date: new Date().toISOString()
    };

    try {
      const response = await fetch('https://n8n.srv1159869.hstgr.cloud/webhook-test/LSM', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        alert('บันทึกข้อมูลเรียบร้อยแล้ว! 🎉');
        // Optional: Reset form after successful submission
        // setRiskFactors([]);
        // setPositiveHabits([]);
        // setExerciseDuration(null);
      } else {
        alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง');
      }
    } catch (error) {
      console.error('Error saving health diary:', error);
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาตรวจสอบอินเทอร์เน็ตและลองใหม่');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/30 to-amber-50/30 pb-40">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-orange-100 shadow-sm">
        <div className="max-w-2xl mx-auto p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 p-0.5 shadow-lg">
                <img
                  src="/Nurse.png"
                  alt="ปลาท๊องง"
                  className="w-full h-full rounded-full bg-white p-0.5"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800 leading-tight">บันทึกสุขภาพ</h1>
                <p className="text-sm text-slate-500">เมื่อวานคุณดูแลตัวเองยังไงบ้าง?</p>
              </div>
            </div>
            <button className="p-2.5 bg-slate-100 hover:bg-slate-200 rounded-full transition-all">
              <X size={24} strokeWidth={2.5} className="text-slate-600" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-4">
        {/* BMI Hero Card */}
        <section className={`bg-gradient-to-br ${getBMIColor().bg} rounded-3xl p-5 shadow-xl border-2 ${getBMIColor().border} relative overflow-hidden`}>
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/10 rounded-full -ml-10 -mb-10 blur-xl"></div>

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-base font-semibold text-slate-700 mb-1">ดัชนีมวลกาย (BMI)</p>
                <p className={`text-5xl font-bold ${getBMIColor().text} tracking-tight`}>
                  {calculateBMI()}
                </p>
              </div>
              <div className="text-5xl transform scale-125">{getBMIEmoji()}</div>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-3 border border-white/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-lg font-bold ${getBMIColor().text} mb-1`}>{getBMIStatus()}</p>
                  <p className="text-sm text-slate-600 leading-relaxed">{getBMITip()}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Stats - Weight & Height */}
        <section className="grid grid-cols-2 gap-4">
          {/* Weight Card */}
          <div className="bg-white rounded-3xl p-4 shadow-lg border border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <p className="text-base font-semibold text-slate-700">น้ำหนัก</p>
              <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-full">กก.</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => adjustWeight(-0.5)}
                className="w-11 h-11 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 rounded-xl text-xl font-semibold transition-all flex items-center justify-center"
              >
                −
              </button>
              <div className="flex-1">
                <input
                  type="text"
                  inputMode="decimal"
                  value={weight}
                  onChange={(e) => handleWeightChange(e.target.value)}
                  className="w-full text-center text-3xl font-bold text-slate-800 bg-transparent border-0 focus:outline-none focus:ring-0"
                  placeholder="0.0"
                />
              </div>
              <button
                onClick={() => adjustWeight(0.5)}
                className="w-11 h-11 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 rounded-xl text-xl font-semibold transition-all flex items-center justify-center"
              >
                +
              </button>
            </div>
          </div>

          {/* Height Card - Collapsible */}
          <details className="bg-white rounded-3xl shadow-lg border border-slate-100 group">
            <summary className="p-4 cursor-pointer hover:bg-slate-50 rounded-3xl transition-colors">
              <div className="flex items-center justify-between">
                <p className="text-base font-semibold text-slate-700">ส่วนสูง</p>
                <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-full">ซม.</span>
              </div>
            </summary>
            <div className="px-4 pb-4">
              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  onClick={() => adjustHeight(-1)}
                  className="w-11 h-11 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 rounded-xl text-xl font-semibold transition-all flex items-center justify-center"
                >
                  −
                </button>
                <div className="flex-1">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={height}
                    onChange={(e) => handleHeightChange(e.target.value)}
                    className="w-full text-center text-3xl font-bold text-slate-800 bg-transparent border-0 focus:outline-none focus:ring-0"
                    placeholder="0"
                    maxLength={3}
                  />
                </div>
                <button
                  onClick={() => adjustHeight(1)}
                  className="w-11 h-11 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 rounded-xl text-xl font-semibold transition-all flex items-center justify-center"
                >
                  +
                </button>
              </div>
            </div>
          </details>
        </section>

        {/* Health Habits */}
        <section className="bg-white rounded-3xl p-5 shadow-lg border border-slate-100">
          <h2 className="text-xl font-bold text-slate-800 mb-2">เมื่อวานทำอะไรบ้าง?</h2>
          <p className="text-sm text-slate-500 mb-4">ข้อไหนไม่มีข้ามได้เลยฮะ</p>

          <div className="space-y-3">
            {/* Risk Factors */}
            <div className="grid grid-cols-1 gap-3">
              {riskOptions.map(option => {
                const isSelected = riskFactors.includes(option.id);
                return (
                  <button
                    key={option.id}
                    onClick={() => toggleRiskFactor(option.id)}
                    className={`p-4 rounded-2xl text-left transition-all border-2 ${
                      isSelected
                        ? 'bg-rose-500 border-rose-600 text-white shadow-md'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{option.icon}</span>
                      <div className="flex-1">
                        <p className="text-base font-semibold leading-tight mb-1">{option.label}</p>
                        {option.description && (
                          <p className={`text-xs leading-relaxed ${isSelected ? 'text-rose-100' : 'text-slate-500'}`}>
                            {option.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Positive Habits */}
            <div className="grid grid-cols-1 gap-3 pt-3 border-t border-slate-100">
              {positiveOptions.map(option => {
                const isSelected = positiveHabits.includes(option.id);
                return (
                  <button
                    key={option.id}
                    onClick={() => togglePositiveHabit(option.id)}
                    className={`p-4 rounded-2xl text-left transition-all border-2 ${
                      isSelected
                        ? 'bg-emerald-500 border-emerald-600 text-white shadow-md'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{option.icon}</span>
                      <div className="flex-1">
                        <p className="text-base font-semibold leading-tight mb-1">{option.label}</p>
                        {option.description && (
                          <p className={`text-xs leading-relaxed ${isSelected ? 'text-emerald-100' : 'text-slate-500'}`}>
                            {option.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Exercise */}
        <section className="bg-white rounded-3xl p-5 shadow-lg border border-slate-100">
          <h2 className="text-xl font-bold text-slate-800 mb-2 flex items-center gap-2">
            <span className="text-2xl">🏃‍♂️</span>
            ออกกำลังกาย
          </h2>
          <p className="text-sm text-slate-500 mb-4">เช่น เดินเร็ว วิ่งเหยาะ ขี่จักรยาน เต้นแอโรบิค ว่ายน้ำ เป็นต้น</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => toggleExerciseDuration('lessThan30')}
              className={`p-4 rounded-2xl text-center transition-all border-2 ${
                exerciseDuration === 'lessThan30'
                  ? 'bg-orange-500 border-orange-600 text-white shadow-md'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span className="text-lg font-bold">น้อยกว่า 30 นาที</span>
            </button>
            <button
              onClick={() => toggleExerciseDuration('moreThan30')}
              className={`p-4 rounded-2xl text-center transition-all border-2 ${
                exerciseDuration === 'moreThan30'
                  ? 'bg-orange-500 border-orange-600 text-white shadow-md'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span className="text-lg font-bold">30 นาทีขึ้นไป</span>
            </button>
          </div>
        </section>
      </main>

      {/* Floating Action Button */}
      <footer className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white to-transparent">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={handleSave}
            disabled={isSubmitting}
            className={`w-full py-5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 active:scale-[0.98] text-white text-2xl font-bold rounded-2xl shadow-2xl shadow-orange-500/30 transition-all flex items-center justify-center gap-3 ${
              isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>กำลังบันทึก...</span>
              </>
            ) : (
              <>
                <span>บันทึกข้อมูล</span>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </>
            )}
          </button>
        </div>
      </footer>
    </div>
  );
};

export default YesterdayHealthDiary;
