import { DailyBoxOfficeItem } from "../types";
import { TrendingUp, TrendingDown, Minus, Play, User, Users, Calendar, Award } from "lucide-react";

interface BoxOfficeListProps {
  items: DailyBoxOfficeItem[];
  selectedMovieCd: string | null;
  onSelectMovie: (movieCd: string) => void;
}

export function BoxOfficeList({ items, selectedMovieCd, onSelectMovie }: BoxOfficeListProps) {
  
  const formatNumber = (numStr: string) => {
    return Number(numStr).toLocaleString();
  };

  const formatAudiConcise = (numStr: string) => {
    const num = Number(numStr);
    if (num >= 10000) {
      return (num / 10000).toFixed(1) + "만 명";
    }
    return num.toLocaleString() + "명";
  };

  // Quick helper to determine rank change visual indications
  const renderRankChange = (item: DailyBoxOfficeItem) => {
    if (item.rankOldAndNew === "NEW") {
      return (
        <span className="flex items-center gap-0.5 rounded bg-cyan-500/10 px-1.5 py-0.5 text-[0.65rem] font-bold text-cyan-400 border border-cyan-500/20 shadow-sm animate-pulse">
          NEW
        </span>
      );
    }

    const val = Number(item.rankInten);
    if (val > 0) {
      return (
        <span className="flex items-center gap-0.5 font-mono text-xs font-semibold text-rose-500">
          <TrendingUp className="h-3 w-3" />
          {val}
        </span>
      );
    } else if (val < 0) {
      return (
        <span className="flex items-center gap-0.5 font-mono text-xs font-semibold text-sky-400">
          <TrendingDown className="h-3 w-3" />
          {Math.abs(val)}
        </span>
      );
    } else {
      return (
        <span className="flex items-center justify-center font-mono text-xs font-semibold text-slate-500">
          <Minus className="h-3 w-3" />
        </span>
      );
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between px-1">
        <h2 className="font-sans text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Award className="h-4.5 w-4.5 text-rose-500" />
          일일 박스오피스 순위 (TOP 10)
        </h2>
        <span className="font-mono text-xs text-slate-500">
          영화 클릭 시 상세 정보 조회
        </span>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 py-16 text-center">
          <p className="font-sans text-sm text-slate-400">해당 날짜의 박스오피스 데이터가 없습니다.</p>
          <p className="font-sans text-xs text-slate-600 mt-1">KOBIS 서버의 정산 마감이나 다른 날짜를 선택해주세요.</p>
        </div>
      ) : (
        <div className="grid gap-2.5">
          {items.map((item) => {
            const isSelected = selectedMovieCd === item.movieCd;
            const sharePercent = parseFloat(item.salesShare) || 0;

            return (
              <button
                key={item.movieCd}
                onClick={() => onSelectMovie(item.movieCd)}
                className={`group relative flex flex-col md:flex-row md:items-center justify-between gap-3 rounded-xl border p-3 text-left transition-all duration-200 outline-none select-none cursor-pointer ${
                  isSelected
                    ? "border-rose-500/50 bg-rose-500/5 shadow-md shadow-rose-950/20 ring-1 ring-rose-500/20"
                    : "border-slate-800 bg-slate-900/50 hover:border-slate-700 hover:bg-slate-800/40"
                }`}
              >
                {/* Active indicator bar */}
                {isSelected && (
                  <div className="absolute left-0 top-3 bottom-3 w-1 rounded-r bg-rose-500" />
                )}

                {/* Left Side: Rank, Change, Movie Meta */}
                <div className="flex items-center gap-3.5 flex-1 min-w-0">
                  {/* Rank Display Bundle */}
                  <div className="flex flex-col items-center justify-center w-11 h-11 rounded-lg bg-slate-900 border border-slate-800 shrink-0 group-hover:border-slate-700 transition-colors">
                    <span className="font-sans text-lg font-extrabold text-white leading-none">
                      {item.rank}
                    </span>
                    <div className="flex items-center justify-center h-4.5 mt-0.5">
                      {renderRankChange(item)}
                    </div>
                  </div>

                  {/* Movie Title & Open Date */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-sans text-sm sm:text-base font-bold text-white group-hover:text-rose-400 transition-colors truncate">
                      {item.movieNm}
                    </h3>
                    <div className="flex items-center flex-wrap gap-x-2.5 gap-y-1 mt-1 font-sans text-xs text-slate-400">
                      <span className="flex items-center gap-1 shrink-0">
                        <Calendar className="h-3 w-3 text-slate-500" />
                        개봉 {item.openDt}
                      </span>
                      <span className="hidden sm:inline text-slate-700">•</span>
                      <span className="shrink-0 bg-slate-800 text-slate-300 font-medium px-1.5 py-0.5 rounded text-[10px]">
                        누적관객: {formatAudiConcise(item.audiAcc)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Side: Audience count and Market share bar */}
                <div className="flex flex-row md:flex-col items-end justify-between md:justify-center shrink-0 w-full md:w-44 border-t border-slate-800 md:border-t-0 pt-2 md:pt-0">
                  {/* Daily Audi Count */}
                  <div className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5 text-slate-500" />
                    <span className="font-sans text-xs text-slate-400">당일</span>
                    <span className="font-mono text-sm font-semibold text-white">
                      {formatNumber(item.audiCnt)}
                    </span>
                    <span className="font-sans text-xs text-slate-400">명</span>
                  </div>

                  {/* Progress bar of sales share */}
                  <div className="w-2/5 md:w-full mt-1.5 flex flex-col gap-0.5">
                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                      <span>점유율</span>
                      <span className="text-slate-300 font-bold">{sharePercent}%</span>
                    </div>
                    <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isSelected ? "bg-rose-500" : "bg-slate-600"
                        }`}
                        style={{ width: `${Math.min(100, Math.max(2, sharePercent))}%` }}
                      />
                    </div>
                  </div>
                </div>

              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
