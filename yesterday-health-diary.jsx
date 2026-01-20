import React, { useState, useEffect } from 'react';
import liff from '@line/liff';

const YesterdayHealthDiary = () => {
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [riskFactors, setRiskFactors] = useState([]);
  const [positiveHabits, setPositiveHabits] = useState([]);
  const [exerciseDuration, setExerciseDuration] = useState(null);
  const [symptoms, setSymptoms] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userId, setUserId] = useState(null);
  const [displayName, setDisplayName] = useState('');
  const [liffReady, setLiffReady] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    body: true,
    habits: false,
    exercise: false,
    symptoms: false
  });

  // Initialize LIFF
  useEffect(() => {
    const initLiff = async () => {
      try {
        await liff.init({ liffId: '2008652706-R8VImhAe' });

        if (liff.isLoggedIn()) {
          const profile = await liff.getProfile();
          setUserId(profile.userId);
          setDisplayName(profile.displayName);
        } else {
          liff.login();
        }
        setLiffReady(true);
      } catch (error) {
        console.error('LIFF initialization failed:', error);
        setLiffReady(true); // Set ready even on error to allow use outside LINE
      }
    };

    initLiff();
  }, []);

  // Retrieve user's last data after LIFF is ready
  useEffect(() => {
    const retrieveLastData = async () => {
      if (!userId || !liffReady) return;

      setIsLoadingData(true);
      try {
        const response = await fetch('https://n8n.srv1159869.hstgr.cloud/webhook/LSM_retrieve', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId })
        });

        if (response.ok) {
          const result = await response.json();
          console.log('Retrieved data:', result);

          // Handle different response formats
          const data = result.data || result;

          if (data && data.weight !== undefined) {
            setWeight(data.weight.toString());
          }
          if (data && data.height !== undefined) {
            setHeight(data.height.toString());
          }
        }
      } catch (error) {
        console.error('Error retrieving last data:', error);
        // Don't show alert, just use defaults
      } finally {
        setIsLoadingData(false);
      }
    };

    retrieveLastData();
  }, [userId, liffReady]);

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
        bg: 'bg-gray-50',
        text: 'text-gray-500',
        badge: 'bg-gray-100 text-gray-600'
      };
    }

    // BMI categories for Asian population
    if (bmi < 18.5) {
      return {
        bg: 'bg-blue-50',
        text: 'text-blue-600',
        badge: 'bg-blue-100 text-blue-600'
      }; // Underweight
    } else if (bmi < 23) {
      return {
        bg: 'bg-green-50',
        text: 'text-green-600',
        badge: 'bg-green-100 text-green-600'
      }; // Normal
    } else if (bmi < 25) {
      return {
        bg: 'bg-yellow-50',
        text: 'text-yellow-600',
        badge: 'bg-yellow-100 text-yellow-600'
      }; // Overweight
    } else if (bmi < 30) {
      return {
        bg: 'bg-orange-50',
        text: 'text-orange-600',
        badge: 'bg-orange-100 text-orange-600'
      }; // Obese I
    } else {
      return {
        bg: 'bg-red-50',
        text: 'text-red-600',
        badge: 'bg-red-100 text-red-700'
      }; // Obese II
    }
  };

  const getBMIStatus = () => {
    const bmi = parseFloat(calculateBMI());
    if (isNaN(bmi)) return '';

    if (bmi < 18.5) return 'ผอม';
    if (bmi < 23) return 'ปกติ';
    if (bmi < 25) return 'น้ำหนักเกิน';
    if (bmi < 30) return 'อ้วน';
    return 'อ้วนมาก';
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

  const handleHeightChange = (value) => {
    // Allow only numbers
    const cleaned = value.replace(/[^\d]/g, '');
    if (cleaned.length <= 3) {
      setHeight(cleaned || '');
    }
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

  const symptomOptions = [
    { id: 'headache', icon: '🤕', label: 'ปวดศีรษะ', description: '' },
    { id: 'dizziness', icon: '😵', label: 'วิงเวียน หน้ามืด', description: '' },
    { id: 'fatigue', icon: '😩', label: 'อ่อนเพลีย เหนื่อยง่าย', description: '' },
    { id: 'blurredVision', icon: '👁️', label: 'ตาพร่ามัว', description: '' },
    { id: 'nosebleed', icon: '🩸', label: 'เลือดกำเดาไหล', description: '' },
    { id: 'chestPain', icon: '💔', label: 'เจ็บหน้าอก', description: '' },
    { id: 'breathlessness', icon: '😮‍💨', label: 'หายใจเหนื่อย', description: '' },
    { id: 'weakLimbs', icon: '🦵', label: 'แขนขาอ่อนแรง', description: '' },
    { id: 'swelling', icon: '🫧', label: 'ตัวบวม', description: '' },
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

  const toggleSymptom = (id) => {
    setSymptoms(prev =>
      prev.includes(id)
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
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
      symptoms,
      bmi: calculateBMI(),
      date: new Date().toISOString(),
      userId: userId || 'anonymous', // Include LINE UserID
      displayName: displayName || '',
      liffReady: liffReady
    };

    try {
      const response = await fetch('https://n8n.srv1159869.hstgr.cloud/webhook/LSM', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        alert('บันทึกข้อมูลเรียบร้อยแล้ว! 🎉');

        // Close LIFF window and return to LINE OA
        if (liff.isInClient()) {
          liff.closeWindow();
        }
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

  // Chevron Icon Component
  const ChevronIcon = ({ expanded }) => (
    <svg
      className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );

  // Pin Icon Component
  const PinIcon = () => (
    <svg className="w-4 h-4 text-rose-500" viewBox="0 0 24 24" fill="currentColor">
      <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z" />
    </svg>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Orange Gradient Header */}
      <header className="bg-gradient-to-r from-orange-400 to-orange-500 pt-8 pb-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-400/90 to-orange-600/90"></div>
        <div className="relative z-10 max-w-lg mx-auto text-center">
          <h1 className="text-2xl font-bold text-white mb-2">บันทึกสุขภาพประจำวัน</h1>
          {displayName && (
            <p className="text-orange-100 text-sm">สวัสดี {displayName} 👋</p>
          )}
        </div>
      </header>

      {/* Mascot */}
      <div className="relative z-20 -mt-12 mb-4 flex justify-center">
        <div className="w-24 h-24 bg-white rounded-full shadow-lg flex items-center justify-center overflow-hidden border-4 border-white">
          <img
            src="/Nurse.png"
            alt="หมอปลาทอง"
            className="w-20 h-20 object-contain"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.parentElement.innerHTML = '<span class="text-4xl">🐟</span>';
            }}
          />
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-lg mx-auto px-4 pb-32 space-y-4 -mt-2">

        {/* Body Measurements Section */}
        <section className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Section Header */}
          <button
            onClick={() => toggleSection('body')}
            className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-xl">⚖️</span>
              </div>
              <div className="text-left">
                <h2 className="text-lg font-semibold text-gray-800">น้ำหนักและส่วนสูง</h2>
                <p className="text-sm text-gray-500">(ไม่บังคับ)</p>
              </div>
            </div>
            <ChevronIcon expanded={expandedSections.body} />
          </button>

          {/* Expanded Content */}
          {expandedSections.body && (
            <div className="px-5 pb-5 space-y-4">
              {/* Saved Data Indicator */}
              {(weight || height) && (
                <div className="flex items-start gap-2 bg-rose-50 rounded-xl p-3">
                  <PinIcon />
                  <p className="text-sm text-rose-600">
                    ข้อมูลที่บันทึกไว้: น้ำหนัก <span className="font-bold">{weight || '-'} kg</span> | ส่วนสูง <span className="font-bold">{height || '-'} cm</span> | BMI <span className="font-bold">{calculateBMI()}</span>
                  </p>
                </div>
              )}

              {/* Weight & Height Inputs */}
              <div className="grid grid-cols-2 gap-4">
                {/* Weight Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">น้ำหนักปัจจุบัน</label>
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={weight}
                      onChange={(e) => handleWeightChange(e.target.value)}
                      className="w-full px-4 py-3 text-xl font-semibold text-gray-800 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                      placeholder="0"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">kg</span>
                  </div>
                </div>

                {/* Height Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">ส่วนสูงปัจจุบัน</label>
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={height}
                      onChange={(e) => handleHeightChange(e.target.value)}
                      className="w-full px-4 py-3 text-xl font-semibold text-gray-800 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                      placeholder="0"
                      maxLength={3}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">cm</span>
                  </div>
                </div>
              </div>

              {/* BMI Display Card */}
              <div className={`${getBMIColor().bg} rounded-xl p-4`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">BMI ปัจจุบัน</p>
                    <p className={`text-3xl font-bold ${getBMIColor().text}`}>
                      {calculateBMI()} <span className="text-sm font-normal text-gray-500">kg/m²</span>
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getBMIColor().badge}`}>
                    {getBMIStatus() || '-'}
                  </span>
                </div>
                {getBMITip() && (
                  <p className="text-sm text-gray-600 mt-3 pt-3 border-t border-gray-200/50">
                    {getBMITip()}
                  </p>
                )}
              </div>
            </div>
          )}
        </section>

        {/* Health Habits Section */}
        <section className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Section Header */}
          <button
            onClick={() => toggleSection('habits')}
            className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center">
                <span className="text-xl">📋</span>
              </div>
              <div className="text-left">
                <h2 className="text-lg font-semibold text-gray-800">เมื่อวานทำอะไรบ้าง?</h2>
                <p className="text-sm text-gray-500">ข้อไหนไม่มีข้ามได้เลย</p>
              </div>
            </div>
            <ChevronIcon expanded={expandedSections.habits} />
          </button>

          {/* Expanded Content */}
          {expandedSections.habits && (
            <div className="px-5 pb-5 space-y-3">
              {/* Selected Count */}
              {(riskFactors.length > 0 || positiveHabits.length > 0) && (
                <div className="flex items-start gap-2 bg-orange-50 rounded-xl p-3">
                  <PinIcon />
                  <p className="text-sm text-orange-700">
                    เลือกไว้แล้ว <span className="font-bold">{riskFactors.length + positiveHabits.length}</span> ข้อ
                  </p>
                </div>
              )}

              {/* Risk Factors */}
              <div className="space-y-2">
                {riskOptions.map(option => {
                  const isSelected = riskFactors.includes(option.id);
                  return (
                    <button
                      key={option.id}
                      onClick={() => toggleRiskFactor(option.id)}
                      className={`w-full p-4 rounded-xl text-left transition-all border-2 ${isSelected
                        ? 'bg-rose-500 border-rose-500 text-white shadow-md'
                        : 'bg-gray-50 border-gray-100 text-gray-700 hover:border-gray-200'
                        }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{option.icon}</span>
                        <div className="flex-1">
                          <p className="text-base font-semibold leading-tight">{option.label}</p>
                          {option.description && (
                            <p className={`text-xs mt-1 leading-relaxed ${isSelected ? 'text-rose-100' : 'text-gray-500'}`}>
                              {option.description}
                            </p>
                          )}
                        </div>
                        {isSelected && (
                          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Divider */}
              <div className="border-t border-gray-100 my-3"></div>

              {/* Positive Habits */}
              <div className="space-y-2">
                {positiveOptions.map(option => {
                  const isSelected = positiveHabits.includes(option.id);
                  return (
                    <button
                      key={option.id}
                      onClick={() => togglePositiveHabit(option.id)}
                      className={`w-full p-4 rounded-xl text-left transition-all border-2 ${isSelected
                        ? 'bg-emerald-500 border-emerald-500 text-white shadow-md'
                        : 'bg-gray-50 border-gray-100 text-gray-700 hover:border-gray-200'
                        }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{option.icon}</span>
                        <div className="flex-1">
                          <p className="text-base font-semibold leading-tight">{option.label}</p>
                          {option.description && (
                            <p className={`text-xs mt-1 leading-relaxed ${isSelected ? 'text-emerald-100' : 'text-gray-500'}`}>
                              {option.description}
                            </p>
                          )}
                        </div>
                        {isSelected && (
                          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        {/* Exercise Section */}
        <section className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Section Header */}
          <button
            onClick={() => toggleSection('exercise')}
            className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-xl">🏃‍♂️</span>
              </div>
              <div className="text-left">
                <h2 className="text-lg font-semibold text-gray-800">ออกกำลังกาย</h2>
                <p className="text-sm text-gray-500">เดินเร็ว วิ่ง ขี่จักรยาน ว่ายน้ำ</p>
              </div>
            </div>
            <ChevronIcon expanded={expandedSections.exercise} />
          </button>

          {/* Expanded Content */}
          {expandedSections.exercise && (
            <div className="px-5 pb-5 space-y-3">
              {/* Selected Indicator */}
              {exerciseDuration && (
                <div className="flex items-start gap-2 bg-blue-50 rounded-xl p-3">
                  <PinIcon />
                  <p className="text-sm text-blue-700">
                    เลือกไว้: <span className="font-bold">{exerciseDuration === 'lessThan30' ? 'น้อยกว่า 30 นาที' : '30 นาทีขึ้นไป'}</span>
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => toggleExerciseDuration('lessThan30')}
                  className={`p-4 rounded-xl text-center transition-all border-2 ${exerciseDuration === 'lessThan30'
                    ? 'bg-orange-500 border-orange-500 text-white shadow-md'
                    : 'bg-gray-50 border-gray-100 text-gray-700 hover:border-gray-200'
                    }`}
                >
                  <span className="text-lg font-bold">น้อยกว่า 30 นาที</span>
                </button>
                <button
                  onClick={() => toggleExerciseDuration('moreThan30')}
                  className={`p-4 rounded-xl text-center transition-all border-2 ${exerciseDuration === 'moreThan30'
                    ? 'bg-orange-500 border-orange-500 text-white shadow-md'
                    : 'bg-gray-50 border-gray-100 text-gray-700 hover:border-gray-200'
                    }`}
                >
                  <span className="text-lg font-bold">30 นาทีขึ้นไป</span>
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Symptoms Section */}
        <section className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Section Header */}
          <button
            onClick={() => toggleSection('symptoms')}
            className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-xl">🩺</span>
              </div>
              <div className="text-left">
                <h2 className="text-lg font-semibold text-gray-800">อาการผิดปกติวันนี้</h2>
                <p className="text-sm text-gray-500">(ไม่มีข้ามได้)</p>
              </div>
            </div>
            <ChevronIcon expanded={expandedSections.symptoms} />
          </button>

          {/* Expanded Content */}
          {expandedSections.symptoms && (
            <div className="px-5 pb-5 space-y-3">
              {/* Selected Indicator */}
              {symptoms.length > 0 && (
                <div className="flex items-start gap-2 bg-red-50 rounded-xl p-3">
                  <PinIcon />
                  <p className="text-sm text-red-700">
                    เลือกไว้แล้ว <span className="font-bold">{symptoms.length}</span> อาการ
                  </p>
                </div>
              )}

              <div className="space-y-2">
                {symptomOptions.map(option => {
                  const isSelected = symptoms.includes(option.id);
                  return (
                    <button
                      key={option.id}
                      onClick={() => toggleSymptom(option.id)}
                      className={`w-full p-4 rounded-xl text-left transition-all border-2 ${isSelected
                          ? 'bg-red-500 border-red-500 text-white shadow-md'
                          : 'bg-gray-50 border-gray-100 text-gray-700 hover:border-gray-200'
                        }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{option.icon}</span>
                        <div className="flex-1">
                          <p className="text-base font-semibold leading-tight">{option.label}</p>
                          {option.description && (
                            <p className={`text-xs mt-1 leading-relaxed ${isSelected ? 'text-red-100' : 'text-gray-500'}`}>
                              {option.description}
                            </p>
                          )}
                        </div>
                        {isSelected && (
                          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Floating Action Button */}
      <footer className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white to-transparent">
        <div className="max-w-lg mx-auto">
          <button
            onClick={handleSave}
            disabled={isSubmitting}
            className={`w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 active:scale-[0.98] text-white text-xl font-bold rounded-2xl shadow-xl shadow-orange-500/30 transition-all flex items-center justify-center gap-3 ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
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
