import React, { useState, useRef } from 'react';
import { useLifeForge } from '../context/LifeForgeContext';
import { NutritionMeal, MealType } from '../types/lifeforge';
import { getTodayDateStr } from '../utils/initialState';
import {
  Utensils,
  Plus,
  Trash2,
  Edit2,
  Camera,
  Upload,
  AlertTriangle,
  Sparkles,
  Check,
  RefreshCw,
  HelpCircle,
} from 'lucide-react';

export const NutritionView: React.FC = () => {
  const { state, addNutritionMeal, updateNutritionMeal, deleteNutritionMeal } = useLifeForge();
  const today = getTodayDateStr();

  const [activeSubTab, setActiveSubTab] = useState<'meals' | 'food-ai'>('meals');
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState<NutritionMeal | null>(null);

  // Manual Meal Form
  const [mealType, setMealType] = useState<MealType>('Lunch');
  const [foodsInput, setFoodsInput] = useState('');
  const [calories, setCalories] = useState('500');
  const [protein, setProtein] = useState('25');
  const [carbs, setCarbs] = useState('65');
  const [fat, setFat] = useState('15');
  const [time, setTime] = useState(new Date().toTimeString().slice(0, 5));
  const [date, setDate] = useState(today);
  const [portionNotes, setPortionNotes] = useState('');

  // Food Photo AI Vision States
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageNotes, setImageNotes] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);
  const [photoError, setPhotoError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const todayMeals = state.nutritionMeals.filter((m) => m.date === today);
  const totalCalories = todayMeals.reduce((a, b) => a + b.calories, 0);
  const totalProtein = todayMeals.reduce((a, b) => a + b.protein, 0);
  const totalCarbs = todayMeals.reduce((a, b) => a + b.carbs, 0);
  const totalFat = todayMeals.reduce((a, b) => a + b.fat, 0);

  // Sample food images for testing AI vision instantly
  const demoImages = [
    {
      name: 'Rice, Chicken & Dal Plate',
      url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80',
    },
    {
      name: 'South Indian Idli & Sambar',
      url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&auto=format&fit=crop&q=80',
    },
    {
      name: 'Egg & Avocado Toast Bowl',
      url: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=500&auto=format&fit=crop&q=80',
    },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setPhotoError('Image file is too large (max 10MB).');
        return;
      }
      setPhotoError('');
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedImage(event.target?.result as string);
        setAnalysisResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectDemoImage = async (url: string) => {
    setPhotoError('');
    setSelectedImage(url);
    setAnalysisResult(null);
  };

  const handleAnalyzePhoto = async () => {
    if (!selectedImage) return;
    setIsAnalyzing(true);
    setPhotoError('');

    try {
      // If it's a URL, convert or send as needed; for local uploaded base64 data:
      let base64ToSend = selectedImage;
      if (selectedImage.startsWith('http')) {
        // Fetch image and convert to base64
        const resp = await fetch(selectedImage);
        const blob = await resp.blob();
        base64ToSend = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
      }

      const res = await fetch('/api/food/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64ToSend,
          notes: imageNotes,
        }),
      });

      if (!res.ok) throw new Error('AI Vision inspection encountered an issue.');
      const data = await res.json();
      setAnalysisResult(data);
    } catch (err: any) {
      setPhotoError(err.message || 'Failed to inspect image with Local AI Vision.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleConfirmAiMeal = () => {
    if (!analysisResult) return;
    addNutritionMeal({
      mealType: analysisResult.mealType || 'Lunch',
      foods: analysisResult.detectedFoods || ['Nutritious Meal'],
      calories: Number(analysisResult.calories) || 500,
      protein: Number(analysisResult.protein) || 25,
      carbs: Number(analysisResult.carbs) || 60,
      fat: Number(analysisResult.fat) || 15,
      time: new Date().toTimeString().slice(0, 5),
      date: today,
      aiEstimated: true,
      portionNotes: analysisResult.portionNotes,
      photoUrl: selectedImage || undefined,
    });

    // Reset and switch back to meals tab
    setAnalysisResult(null);
    setSelectedImage(null);
    setActiveSubTab('meals');
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const foodsArray = foodsInput
      .split(',')
      .map((f) => f.trim())
      .filter(Boolean);

    if (foodsArray.length === 0) return;

    if (editingMeal) {
      updateNutritionMeal(editingMeal.id, {
        mealType,
        foods: foodsArray,
        calories: Number(calories) || 0,
        protein: Number(protein) || 0,
        carbs: Number(carbs) || 0,
        fat: Number(fat) || 0,
        time,
        date,
        portionNotes,
      });
    } else {
      addNutritionMeal({
        mealType,
        foods: foodsArray,
        calories: Number(calories) || 0,
        protein: Number(protein) || 0,
        carbs: Number(carbs) || 0,
        fat: Number(fat) || 0,
        time,
        date,
        aiEstimated: false,
        portionNotes,
      });
    }
    setIsManualModalOpen(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <span>Metabolic Fuel & Dietary Intake</span>
            <span aria-hidden="true">·</span>
            <span>Food Photo Vision AI</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-display">
            Nutrition & Meals
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Today: {totalCalories} kcal · Protein: {totalProtein}g · Carbs: {totalCarbs}g · Fat: {totalFat}g
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Sub-tab switcher */}
          <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveSubTab('meals')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                activeSubTab === 'meals'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Meal Logs
            </button>
            <button
              onClick={() => setActiveSubTab('food-ai')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                activeSubTab === 'food-ai'
                  ? 'bg-indigo-600 text-white'
                  : 'text-indigo-400 hover:text-indigo-300'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Food Photo AI</span>
            </button>
          </div>

          <button
            onClick={() => {
              setEditingMeal(null);
              setMealType('Lunch');
              setFoodsInput('');
              setCalories('500');
              setProtein('25');
              setCarbs('60');
              setFat('15');
              setTime(new Date().toTimeString().slice(0, 5));
              setDate(today);
              setPortionNotes('');
              setIsManualModalOpen(true);
            }}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Log Manually</span>
          </button>
        </div>
      </div>

      {/* Main Content: Food Photo AI Tab vs Meal Logs Tab */}
      {activeSubTab === 'food-ai' ? (
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 mb-1">
                <Camera className="w-4 h-4" />
                <span>Food Photo AI Inspection</span>
              </div>
              <h2 className="text-lg font-bold text-white">Visual Nutrition Estimator</h2>
              <p className="text-xs text-slate-400 max-w-xl mt-1 leading-relaxed">
                Take or upload a picture of your plate (e.g. Idli, Rice & Chicken Curry, Dal). Local AI Vision identifies dishes, estimates macronutrients, and suggests portion questions.
              </p>
            </div>
          </div>

          {/* Mandatory Disclaimer Banner */}
          <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-800/50 flex items-start gap-2.5 text-xs text-amber-200">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Mandatory Note:</strong> AI-based estimate. Actual nutritional values may vary depending on portion size, ingredients and preparation.
            </p>
          </div>

          {/* Upload / Demo Image Picker */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-slate-950/50 flex flex-col items-center justify-center min-h-[180px]"
              >
                <Upload className="w-8 h-8 text-indigo-400 mb-2" />
                <span className="text-xs font-semibold text-white">Upload plate photo</span>
                <span className="text-[11px] text-slate-500 mt-0.5">PNG, JPG, WEBP up to 10MB</span>
              </div>

              <div>
                <span className="text-xs font-medium text-slate-400 block mb-2">Or test with demo sample plates:</span>
                <div className="flex flex-wrap gap-2">
                  {demoImages.map((img, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleSelectDemoImage(img.url)}
                      className="text-xs px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500 text-slate-300 transition-colors"
                    >
                      {img.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Portion / Ingredient Context (Optional)
                </label>
                <input
                  type="text"
                  value={imageNotes}
                  onChange={(e) => setImageNotes(e.target.value)}
                  placeholder="e.g. 1.5 cups rice, homemade chicken curry without extra oil"
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {photoError && <div className="text-xs text-rose-400">{photoError}</div>}

              {selectedImage && (
                <button
                  onClick={handleAnalyzePhoto}
                  disabled={isAnalyzing}
                  className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Inspecting food plate with Local AI Vision...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Analyze Photo with Vision AI</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Preview & Results */}
            <div className="space-y-4">
              {selectedImage ? (
                <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950 h-52 relative">
                  <img
                    src={selectedImage}
                    alt="Food preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="rounded-xl border border-slate-800 bg-slate-950/40 h-52 flex items-center justify-center text-xs text-slate-600">
                  Image preview will appear here
                </div>
              )}

              {/* Analysis Result Card */}
              {analysisResult && (
                <div className="p-4 rounded-xl bg-slate-950 border border-indigo-900/60 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      AI Detected Items
                    </span>
                    <span className="text-[11px] text-emerald-400 font-medium">
                      Confidence: {analysisResult.confidence}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {analysisResult.detectedFoods.map((f: string, idx: number) => (
                      <span
                        key={idx}
                        className="text-xs px-2.5 py-1 rounded-lg bg-indigo-950/80 text-indigo-200 border border-indigo-800/60"
                      >
                        {f}
                      </span>
                    ))}
                  </div>

                  <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-800 text-center font-mono">
                    <div className="p-2 bg-slate-900 rounded-lg">
                      <span className="text-[10px] text-slate-400 block font-sans">Calories</span>
                      <span className="text-xs font-bold text-white">{analysisResult.calories}</span>
                    </div>
                    <div className="p-2 bg-slate-900 rounded-lg">
                      <span className="text-[10px] text-slate-400 block font-sans">Protein</span>
                      <span className="text-xs font-bold text-indigo-300">{analysisResult.protein}g</span>
                    </div>
                    <div className="p-2 bg-slate-900 rounded-lg">
                      <span className="text-[10px] text-slate-400 block font-sans">Carbs</span>
                      <span className="text-xs font-bold text-amber-300">{analysisResult.carbs}g</span>
                    </div>
                    <div className="p-2 bg-slate-900 rounded-lg">
                      <span className="text-[10px] text-slate-400 block font-sans">Fat</span>
                      <span className="text-xs font-bold text-rose-300">{analysisResult.fat}g</span>
                    </div>
                  </div>

                  {analysisResult.portionClarifications?.length > 0 && (
                    <div className="text-[11px] text-slate-400 bg-slate-900 p-2.5 rounded-lg flex items-start gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-slate-300 font-medium">Clarification tip: </span>
                        <span>{analysisResult.portionClarifications[0]}</span>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleConfirmAiMeal}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Confirm & Add to Nutrition Database</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Meals History List */
        <div className="space-y-3">
          {state.nutritionMeals.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800/80">
              <Utensils className="w-8 h-8 text-slate-600 mx-auto mb-3" />
              <h4 className="text-sm font-semibold text-slate-300">No meals logged yet</h4>
              <p className="text-xs text-slate-500 mt-1">
                Log meals manually or tell AI: <em className="text-slate-400">"Morning I ate idli, lunch rice and chicken"</em>
              </p>
            </div>
          ) : (
            state.nutritionMeals.map((meal) => (
              <div
                key={meal.id}
                className="p-4 rounded-xl bg-slate-900/70 border border-slate-800/90 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-rose-950/80 border border-rose-800/60 text-rose-400 shrink-0 mt-0.5">
                    <Utensils className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-white">{meal.mealType}</h3>
                      {meal.aiEstimated && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-950 border border-indigo-800/60 text-indigo-300">
                          AI Estimated
                        </span>
                      )}
                      <span className="text-xs text-slate-500">{meal.time}</span>
                    </div>

                    <p className="text-xs text-slate-300 mt-1">
                      {meal.foods.join(', ')}
                    </p>

                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-1.5 font-mono">
                      <span>{meal.calories} kcal</span>
                      <span aria-hidden="true" className="text-slate-700">·</span>
                      <span className="text-indigo-300">{meal.protein}g protein</span>
                      <span aria-hidden="true" className="text-slate-700">·</span>
                      <span className="text-amber-300">{meal.carbs}g carbs</span>
                      <span aria-hidden="true" className="text-slate-700">·</span>
                      <span className="text-rose-300">{meal.fat}g fat</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => deleteNutritionMeal(meal.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Manual Meal Modal */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button
              onClick={() => setIsManualModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-sm"
            >
              ✕
            </button>

            <h3 className="text-lg font-bold text-white mb-4 font-display">Log Meal</h3>

            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Meal Type</label>
                  <select
                    value={mealType}
                    onChange={(e) => setMealType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Breakfast">Breakfast</option>
                    <option value="Lunch">Lunch</option>
                    <option value="Dinner">Dinner</option>
                    <option value="Snack">Snack</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Time</label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Food Items (comma separated)
                </label>
                <input
                  type="text"
                  value={foodsInput}
                  onChange={(e) => setFoodsInput(e.target.value)}
                  placeholder="e.g. Steamed Rice, Chicken Curry, Dal Tadka"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">Calories</label>
                  <input
                    type="number"
                    value={calories}
                    onChange={(e) => setCalories(e.target.value)}
                    className="w-full px-2.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">Protein (g)</label>
                  <input
                    type="number"
                    value={protein}
                    onChange={(e) => setProtein(e.target.value)}
                    className="w-full px-2.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">Carbs (g)</label>
                  <input
                    type="number"
                    value={carbs}
                    onChange={(e) => setCarbs(e.target.value)}
                    className="w-full px-2.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">Fat (g)</label>
                  <input
                    type="number"
                    value={fat}
                    onChange={(e) => setFat(e.target.value)}
                    className="w-full px-2.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white bg-slate-800 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md transition-all"
                >
                  Save Meal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
