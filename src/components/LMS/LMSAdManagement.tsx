import React, { useState, useEffect, useRef } from "react";
import { fetchAllAds, saveAds, type AdItem } from "../../utils/adsApi";
import { toast } from "sonner";
import {
  Plus, Save, Trash2, Eye, EyeOff, X, ChevronUp, ChevronDown,
  GripVertical, Smartphone, Video, Image as ImageIcon, Link, Type
} from "lucide-react";

const PAGE_OPTIONS = [
  { value: 'home', label: 'Home (홈)' },
  { value: 'korean', label: '한국학교' },
  { value: 'international', label: '국제학교' },
  { value: 'certification', label: '인증시험' },
] as const;

const POSITION_OPTIONS = [
  { value: 'top', label: '상단', emoji: '🔼', color: 'text-blue-600 bg-blue-50' },
  { value: 'middle', label: '중단', emoji: '🔹', color: 'text-amber-600 bg-amber-50' },
  { value: 'bottom', label: '하단', emoji: '🔽', color: 'text-green-600 bg-green-50' },
] as const;

export default function LMSAdManagement() {
  const [ads, setAds] = useState<AdItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterPage, setFilterPage] = useState<string>('all');
  const [previewAd, setPreviewAd] = useState<AdItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingFor, setUploadingFor] = useState<string | null>(null);

  useEffect(() => {
    loadAds();
  }, []);

  const loadAds = async () => {
    try {
      setLoading(true);
      const data = await fetchAllAds();
      setAds(data);
    } catch (error) {
      console.error('Error loading ads:', error);
      toast.error('광고 목록을 불러오는데 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await saveAds(ads);
      toast.success('광고가 저장되었습니다');
    } catch (error) {
      console.error('Error saving ads:', error);
      toast.error('광고 저장에 실패했습니다');
    } finally {
      setSaving(false);
    }
  };

  const addNewAd = () => {
    const newAd: AdItem = {
      id: `ad_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      title: '',
      description: '',
      imageUrl: '',
      videoUrl: '',
      linkUrl: '',
      targetPage: 'home',
      position: 'bottom',
      active: true,
      order: ads.length,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setAds(prev => [...prev, newAd]);
    setExpandedId(newAd.id);
  };

  const deleteAd = (id: string) => {
    setAds(prev => prev.filter(a => a.id !== id));
    if (expandedId === id) setExpandedId(null);
  };

  const updateAd = (id: string, updates: Partial<AdItem>) => {
    setAds(prev =>
      prev.map(a => a.id === id ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a)
    );
  };

  const toggleActive = (id: string) => {
    setAds(prev =>
      prev.map(a => a.id === id ? { ...a, active: !a.active, updatedAt: new Date().toISOString() } : a)
    );
  };

  const moveAd = (id: string, direction: 'up' | 'down') => {
    const idx = ads.findIndex(a => a.id === id);
    if (direction === 'up' && idx > 0) {
      const newAds = [...ads];
      [newAds[idx], newAds[idx - 1]] = [newAds[idx - 1], newAds[idx]];
      newAds.forEach((a, i) => a.order = i);
      setAds(newAds);
    }
    if (direction === 'down' && idx < ads.length - 1) {
      const newAds = [...ads];
      [newAds[idx], newAds[idx + 1]] = [newAds[idx + 1], newAds[idx]];
      newAds.forEach((a, i) => a.order = i);
      setAds(newAds);
    }
  };

  const handleImageUpload = (adId: string) => {
    setUploadingFor(adId);
    fileInputRef.current?.click();
  };

  const onFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadingFor) return;

    if (file.size > 500 * 1024) {
      toast.error('이미지 크기는 500KB 이하로 업로드해주세요');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      updateAd(uploadingFor, { imageUrl: reader.result as string });
      setUploadingFor(null);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const filteredAds = filterPage === 'all' ? ads : ads.filter(a => a.targetPage === filterPage);

  const getPageLabel = (page: string) => PAGE_OPTIONS.find(p => p.value === page)?.label || page;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onFileSelected}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-cyan-600" />
            <h2 className="text-xl font-bold text-gray-900">모바일 광고 관리</h2>
          </div>
          <p className="text-sm text-gray-500 mt-1">모바일 랜딩 페이지에 표시되는 광고를 관리합니다</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={addNewAd}
            className="flex items-center gap-1.5 px-3 py-2 bg-cyan-600 text-white rounded-lg text-sm font-medium hover:bg-cyan-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            광고 추가
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilterPage('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            filterPage === 'all' ? 'bg-cyan-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          전체 ({ads.length})
        </button>
        {PAGE_OPTIONS.map(p => {
          const count = ads.filter(a => a.targetPage === p.value).length;
          return (
            <button
              key={p.value}
              onClick={() => setFilterPage(p.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                filterPage === p.value ? 'bg-cyan-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {p.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Ad List */}
      {filteredAds.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <Smartphone className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">등록된 광고가 없습니다</p>
          <button
            onClick={addNewAd}
            className="mt-3 text-cyan-600 text-sm font-medium hover:underline"
          >
            + 새 광고 추가하기
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAds.map((ad, idx) => (
            <div key={ad.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {/* Collapsed header */}
              <div
                className="flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setExpandedId(expandedId === ad.id ? null : ad.id)}
              >
                <GripVertical className="w-4 h-4 text-gray-300 flex-shrink-0" />

                {/* Thumbnail */}
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 flex items-center justify-center">
                  {ad.imageUrl ? (
                    <img src={ad.imageUrl} alt="" className="w-full h-full object-cover" />
                  ) : ad.videoUrl ? (
                    <Video className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ImageIcon className="w-5 h-5 text-gray-300" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {ad.title || '(제목 없음)'}
                    </p>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                      ad.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {ad.active ? '활성' : '비활성'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <p className="text-xs text-gray-500">{getPageLabel(ad.targetPage)}</p>
                    <span className="text-gray-300">·</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                      POSITION_OPTIONS.find(p => p.value === (ad.position || 'bottom'))?.color || 'text-gray-500 bg-gray-50'
                    }`}>
                      {POSITION_OPTIONS.find(p => p.value === (ad.position || 'bottom'))?.label || '하단'}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                  <button onClick={() => moveAd(ad.id, 'up')} className="p-1 text-gray-400 hover:text-gray-600" title="위로">
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button onClick={() => moveAd(ad.id, 'down')} className="p-1 text-gray-400 hover:text-gray-600" title="아래로">
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <button onClick={() => toggleActive(ad.id)} className="p-1 text-gray-400 hover:text-gray-600">
                    {ad.active ? <Eye className="w-4 h-4 text-green-500" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button onClick={() => setPreviewAd(ad)} className="p-1 text-gray-400 hover:text-cyan-600">
                    <Smartphone className="w-4 h-4" />
                  </button>
                  <button onClick={() => deleteAd(ad.id)} className="p-1 text-gray-400 hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Expanded editor */}
              {expandedId === ad.id && (
                <div className="border-t border-gray-100 p-4 space-y-4 bg-gray-50/50">
                  {/* Target page */}
                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-1 block">표시 페이지</label>
                    <select
                      value={ad.targetPage}
                      onChange={e => updateAd(ad.id, { targetPage: e.target.value as AdItem['targetPage'] })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    >
                      {PAGE_OPTIONS.map(p => (
                        <option key={p.value} value={p.value}>{p.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Position */}
                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-2 block">광고 위치</label>
                    <div className="grid grid-cols-3 gap-2">
                      {POSITION_OPTIONS.map(pos => (
                        <button
                          key={pos.value}
                          onClick={() => updateAd(ad.id, { position: pos.value })}
                          className={`flex flex-col items-center gap-1 py-2.5 px-2 rounded-lg border-2 transition-all text-xs font-medium ${
                            (ad.position || 'bottom') === pos.value
                              ? 'border-cyan-500 bg-cyan-50 text-cyan-700 shadow-sm'
                              : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <span className="text-base">{pos.emoji}</span>
                          <span>{pos.label}</span>
                        </button>
                      ))}
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1.5">상단: 헤더 아래 컴팩트형 / 중단: 카드 아래 중간형 / 하단: 콘텐츠 아래 풀사이즈</p>
                  </div>

                  {/* Title */}
                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                      <Type className="w-3.5 h-3.5" /> 제목
                    </label>
                    <input
                      type="text"
                      value={ad.title}
                      onChange={e => updateAd(ad.id, { title: e.target.value })}
                      placeholder="광고 제목을 입력하세요"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-1 block">설명</label>
                    <textarea
                      value={ad.description}
                      onChange={e => updateAd(ad.id, { description: e.target.value })}
                      placeholder="광고 설명을 입력하세요"
                      rows={3}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
                    />
                  </div>

                  {/* Image Upload */}
                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                      <ImageIcon className="w-3.5 h-3.5" /> 이미지
                    </label>
                    {ad.imageUrl ? (
                      <div className="relative">
                        <img src={ad.imageUrl} alt="" className="w-full max-h-48 object-cover rounded-lg border" />
                        <button
                          onClick={() => updateAd(ad.id, { imageUrl: '' })}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleImageUpload(ad.id)}
                          className="flex-1 border-2 border-dashed border-gray-300 rounded-lg py-4 text-center hover:border-cyan-400 hover:bg-cyan-50/50 transition-colors"
                        >
                          <ImageIcon className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                          <span className="text-xs text-gray-500">이미지 업로드 (500KB 이하)</span>
                        </button>
                      </div>
                    )}
                    {/* Image URL input */}
                    <input
                      type="text"
                      value={ad.imageUrl.startsWith('data:') ? '' : ad.imageUrl}
                      onChange={e => updateAd(ad.id, { imageUrl: e.target.value })}
                      placeholder="또는 이미지 URL을 입력하세요"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mt-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    />
                  </div>

                  {/* Video URL */}
                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                      <Video className="w-3.5 h-3.5" /> 동영상 URL
                    </label>
                    <input
                      type="text"
                      value={ad.videoUrl}
                      onChange={e => updateAd(ad.id, { videoUrl: e.target.value })}
                      placeholder="YouTube 임베드 URL (예: https://www.youtube.com/embed/xxxxx)"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    />
                    <p className="text-[10px] text-gray-400 mt-1">YouTube 공유 &gt; 퍼가기 &gt; URL 복사</p>
                  </div>

                  {/* Link URL */}
                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                      <Link className="w-3.5 h-3.5" /> 링크 URL
                    </label>
                    <input
                      type="text"
                      value={ad.linkUrl}
                      onChange={e => updateAd(ad.id, { linkUrl: e.target.value })}
                      placeholder="클릭 시 이동할 URL (선택)"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Mobile Preview Modal */}
      {previewAd && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setPreviewAd(null)}>
          <div className="bg-gray-100 rounded-3xl w-full max-w-[375px] h-[600px] overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            {/* Phone frame header */}
            <div className="bg-white px-4 py-3 flex items-center justify-between border-b">
              <div className="flex items-center gap-2">
                <svg viewBox="0 0 24 32" className="w-4 h-5"><path d="M13.5 1L2 18h8.5L9 31l13-18h-9L13.5 1z" fill="#00bcd4"/></svg>
                <span className="text-sm font-extrabold tracking-tight text-gray-900">AllMyExam</span>
                <span className="text-xs text-gray-400">미리보기</span>
              </div>
              <button onClick={() => setPreviewAd(null)} className="text-gray-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            {/* Preview content */}
            <div className="p-4 overflow-y-auto h-[calc(100%-52px)]">
              <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-2">Sponsored</div>
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                {previewAd.imageUrl && (
                  <div className="w-full aspect-[16/9] overflow-hidden bg-gray-100">
                    <img src={previewAd.imageUrl} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
                {previewAd.videoUrl && !previewAd.imageUrl && (
                  <div className="w-full aspect-video bg-black">
                    <iframe src={previewAd.videoUrl} className="w-full h-full" allowFullScreen title="preview" />
                  </div>
                )}
                {(previewAd.title || previewAd.description) && (
                  <div className="p-3.5">
                    {previewAd.title && <h4 className="text-sm font-bold text-gray-900">{previewAd.title}</h4>}
                    {previewAd.description && <p className="text-xs text-gray-600 mt-1 leading-relaxed">{previewAd.description}</p>}
                  </div>
                )}
                {previewAd.videoUrl && previewAd.imageUrl && (
                  <div className="w-full aspect-video bg-black border-t border-gray-100">
                    <iframe src={previewAd.videoUrl} className="w-full h-full" allowFullScreen title="preview" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}