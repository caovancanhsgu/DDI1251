import React, { useState, useRef } from 'react';
import { 
  X, 
  PenTool, 
  Check, 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  Heading1, 
  Heading2, 
  Highlighter, 
  Type, 
  Sparkles,
  RotateCcw,
  ExternalLink,
  Link as LinkIcon
} from 'lucide-react';
import { StudyMaterial } from '../types';

interface DocumentReaderModalProps {
  material: StudyMaterial | null;
  onClose: () => void;
  onToggleComplete?: (id: string) => void;
  onSaveNotes: (id: string, notes: string, url?: string) => void;
}

export const DocumentReaderModal: React.FC<DocumentReaderModalProps> = ({
  material,
  onClose,
  onSaveNotes,
}) => {
  if (!material) return null;

  const [personalNote, setPersonalNote] = useState<string>(material.userNotes || '');
  const [docUrl, setDocUrl] = useState<string>(material.url || '');
  const [isSaved, setIsSaved] = useState(false);
  const [fontSizeClass, setFontSizeClass] = useState<'text-xs' | 'text-sm' | 'text-base' | 'text-lg'>('text-sm');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleNoteSave = () => {
    onSaveNotes(material.id, personalNote, docUrl);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleOpenUrl = () => {
    if (!docUrl) return;
    const finalUrl = docUrl.startsWith('http') ? docUrl : `https://${docUrl}`;
    window.open(finalUrl, '_blank', 'noopener,noreferrer');
  };

  // Selection formatting helper
  const applyFormatting = (prefix: string, suffix: string = '', defaultText: string = '') => {
    if (!textareaRef.current) return;
    const el = textareaRef.current;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selectedText = personalNote.substring(start, end) || defaultText;
    const replacement = `${prefix}${selectedText}${suffix}`;

    const newContent = personalNote.substring(0, start) + replacement + personalNote.substring(end);
    setPersonalNote(newContent);

    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length);
    }, 0);
  };

  // Insert template
  const insertTemplate = () => {
    const template = `📌 I. TÓM TẮT LÝ THUYẾT TRỌNG TÂM:
- 

💡 II. CÔNG THỨC & QUY TẮC CẦN GHI NHỚ:
- 

⚠️ III. CÁC DẠNG BÀI TẬP HAY GẶP & LỖI SAI CẦN TRÁNH:
- 

🎯 IV. MỤC TIÊU & PHƯƠNG PHÁP ÔN LUYỆN:
- `;
    if (!personalNote.trim()) {
      setPersonalNote(template);
    } else {
      setPersonalNote(prev => prev + '\n\n' + template);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-slate-800">
        {/* Header */}
        <div className="p-5 sm:px-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 text-xs font-bold bg-indigo-50 text-indigo-700 rounded-md border border-indigo-200">
                {material.subject}
              </span>
              <span className="px-2 py-0.5 text-xs font-semibold bg-slate-100 text-slate-700 rounded-md border border-slate-200">
                {material.category}
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <PenTool className="w-5 h-5 text-indigo-600" />
              <span>Tài Liệu Môn Thi: {material.title || material.subject}</span>
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body: Web Link Box + Toolbar + Text Area */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {/* Document Web Link Section */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 p-3.5 rounded-2xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-2xs">
            <div className="flex-1 flex items-center space-x-2">
              <LinkIcon className="w-4 h-4 text-blue-600 shrink-0" />
              <input
                type="url"
                value={docUrl}
                onChange={(e) => setDocUrl(e.target.value)}
                placeholder="Dán đường dẫn web tài liệu / Google Drive / PDF tại đây..."
                className="w-full bg-white px-3 py-1.5 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
            {docUrl && (
              <button
                type="button"
                onClick={handleOpenUrl}
                className="flex items-center justify-center space-x-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-xs transition-colors shrink-0 cursor-pointer"
              >
                <span>Chuyển Hướng Link</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Nội dung đề cương ôn thi & ghi chú môn học
            </label>
            {isSaved && (
              <span className="text-xs text-emerald-600 font-bold flex items-center space-x-1 animate-pulse">
                <Check className="w-3.5 h-3.5" />
                <span>Đã lưu thành công!</span>
              </span>
            )}
          </div>

          {/* Formatting Toolbar */}
          <div className="bg-slate-100/90 border border-slate-200/90 p-2 rounded-2xl flex flex-wrap items-center gap-1.5 shadow-2xs">
            {/* Bold */}
            <button
              type="button"
              onClick={() => applyFormatting('**', '**', 'văn bản in đậm')}
              title="In đậm (Bold)"
              className="p-1.5 bg-white hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer border border-slate-200"
            >
              <Bold className="w-4 h-4" />
            </button>

            {/* Italic */}
            <button
              type="button"
              onClick={() => applyFormatting('*', '*', 'văn bản in nghiêng')}
              title="In nghiêng (Italic)"
              className="p-1.5 bg-white hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer border border-slate-200"
            >
              <Italic className="w-4 h-4" />
            </button>

            {/* Underline */}
            <button
              type="button"
              onClick={() => applyFormatting('<u>', '</u>', 'văn bản gạch chân')}
              title="Gạch chân (Underline)"
              className="p-1.5 bg-white hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer border border-slate-200"
            >
              <Underline className="w-4 h-4" />
            </button>

            <div className="w-px h-5 bg-slate-300 mx-1" />

            {/* Heading 1 */}
            <button
              type="button"
              onClick={() => applyFormatting('# ', '', 'Tiêu đề lớn')}
              title="Tiêu đề lớn (H1)"
              className="p-1.5 bg-white hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer border border-slate-200"
            >
              <Heading1 className="w-4 h-4" />
            </button>

            {/* Heading 2 */}
            <button
              type="button"
              onClick={() => applyFormatting('## ', '', 'Tiêu đề vừa')}
              title="Tiêu đề vừa (H2)"
              className="p-1.5 bg-white hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer border border-slate-200"
            >
              <Heading2 className="w-4 h-4" />
            </button>

            <div className="w-px h-5 bg-slate-300 mx-1" />

            {/* Bullet List */}
            <button
              type="button"
              onClick={() => applyFormatting('- ', '', 'Ý chính')}
              title="Danh sách dấu gạch đầu dòng"
              className="p-1.5 bg-white hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer border border-slate-200"
            >
              <List className="w-4 h-4" />
            </button>

            {/* Numbered List */}
            <button
              type="button"
              onClick={() => applyFormatting('1. ', '', 'Bước thực hiện')}
              title="Danh sách đánh số"
              className="p-1.5 bg-white hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer border border-slate-200"
            >
              <ListOrdered className="w-4 h-4" />
            </button>

            {/* Highlight */}
            <button
              type="button"
              onClick={() => applyFormatting('🟡 [ ', ' ]', 'Nội dung quan trọng')}
              title="Đánh dấu nổi bật"
              className="p-1.5 bg-white hover:bg-slate-200 text-amber-600 rounded-lg text-xs font-bold transition-colors cursor-pointer border border-slate-200"
            >
              <Highlighter className="w-4 h-4" />
            </button>

            <div className="w-px h-5 bg-slate-300 mx-1" />

            {/* Font Size Selector */}
            <div className="flex items-center space-x-1 bg-white p-1 rounded-lg border border-slate-200">
              <Type className="w-3.5 h-3.5 text-slate-500 ml-1" />
              <select
                value={fontSizeClass}
                onChange={(e) => setFontSizeClass(e.target.value as any)}
                title="Thay đổi cỡ chữ hiển thị"
                className="text-xs bg-transparent text-slate-700 font-semibold focus:outline-none cursor-pointer"
              >
                <option value="text-xs">Cỡ chữ nhỏ (12px)</option>
                <option value="text-sm">Cỡ chữ vừa (14px)</option>
                <option value="text-base">Cỡ chữ lớn (16px)</option>
                <option value="text-lg">Cỡ chữ rất lớn (18px)</option>
              </select>
            </div>

            {/* Insert Outline Template */}
            <button
              type="button"
              onClick={insertTemplate}
              title="Chèn khung cấu trúc đề cương mẫu"
              className="flex items-center space-x-1 px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold transition-colors cursor-pointer border border-indigo-200 ml-auto"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>+ Mẫu Đề Cương</span>
            </button>
          </div>

          {/* Main Textarea */}
          <textarea
            ref={textareaRef}
            rows={13}
            value={personalNote}
            onChange={(e) => setPersonalNote(e.target.value)}
            placeholder="Nhập nội dung đề cương ôn thi... Bạn có thể bôi đen văn bản và dùng thanh công cụ phía trên để in đậm, in nghiêng, chèn danh sách hoặc tiêu đề."
            className={`w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors leading-relaxed font-sans ${fontSizeClass}`}
          />
        </div>

        {/* Footer */}
        <div className="p-4 px-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setPersonalNote('')}
            className="flex items-center space-x-1 text-slate-500 hover:text-rose-600 text-xs font-semibold cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Xóa trắng ô</span>
          </button>

          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              onClick={handleNoteSave}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-500/20 cursor-pointer"
            >
              Lưu Đề Cương
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
