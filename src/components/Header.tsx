import { Film, Calendar, Clapperboard } from "lucide-react";

interface HeaderProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  maxDate: string;
}

export function Header({ selectedDate, onDateChange, maxDate }: HeaderProps) {
  // Format selected date nicely for display, e.g. "2026년 05월 28일"
  const formatDateKorean = (dateStr: string) => {
    if (!dateStr) return "";
    const [yyyy, mm, dd] = dateStr.split("-");
    const dateObj = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
    const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
    const dayName = weekdays[dateObj.getDay()];
    return `${yyyy}년 ${mm}월 ${dd}일 (${dayName})`;
  };

  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    onDateChange(`${yyyy}-${mm}-${dd}`);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const nextDateStr = `${yyyy}-${mm}-${dd}`;
    
    if (nextDateStr <= maxDate) {
      onDateChange(nextDateStr);
    }
  };

  const isNextDisabled = selectedDate >= maxDate;

  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40 px-4 py-3 sm:px-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Logo and Brand */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-red-600 shadow-lg shadow-red-500/10">
            <Clapperboard className="h-5.5 w-5.5 text-white" />
          </div>
          <div>
            <h1 className="font-sans text-xl font-bold tracking-tight text-white flex items-center gap-2">
              KOBIS <span className="text-rose-500 font-extrabold text-[0.8rem] tracking-wider uppercase bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">BOX OFFICE</span>
            </h1>
            <p className="font-sans text-xs text-slate-400">한국영화진흥위원회 실시간 일일 박스오피스 정보</p>
          </div>
        </div>

        {/* Date Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Main Select Action */}
          <div className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/60 p-1 shadow-sm">
            <button
              onClick={handlePrevDay}
              className="px-2.5 py-1.5 font-sans text-xs font-semibold text-slate-300 hover:text-white rounded-md hover:bg-slate-700 transition-colors"
              title="이전 날짜"
            >
              이전 일
            </button>
            
            <div className="relative flex items-center px-1.5">
              <Calendar className="absolute left-3.5 h-4 w-4 text-rose-500 pointer-events-none" />
              <input
                type="date"
                value={selectedDate}
                max={maxDate}
                onChange={(e) => {
                  if (e.target.value) {
                    onDateChange(e.target.value);
                  }
                }}
                className="pl-8 pr-2.5 py-1.5 font-sans text-xs font-semibold text-white bg-transparent border-0 focus:ring-0 cursor-pointer outline-none w-34 [color-scheme:dark]"
              />
            </div>

            <button
              onClick={handleNextDay}
              disabled={isNextDisabled}
              className={`px-2.5 py-1.5 font-sans text-xs font-semibold rounded-md transition-colors ${
                isNextDisabled
                  ? "text-slate-600 cursor-not-allowed"
                  : "text-slate-300 hover:text-white hover:bg-slate-700"
              }`}
              title="다음 날짜"
            >
              다음 일
            </button>
          </div>

          {/* Pretty Date text badge */}
          <div className="hidden lg:flex items-center gap-1.5. bg-slate-800/30 text-rose-400 rounded-lg px-3 py-2 font-mono text-xs font-bold ring-1 ring-slate-700/50">
            {formatDateKorean(selectedDate)}
          </div>
        </div>
      </div>
    </header>
  );
}
