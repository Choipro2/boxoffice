import { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { BoxOfficeList } from "./components/BoxOfficeList";
import { MovieDetail } from "./components/MovieDetail";
import { DailyBoxOfficeItem, DailyBoxOfficeResponse } from "./types";
import { Loader2, AlertCircle, Film, Sparkles, HelpCircle } from "lucide-react";

export default function App() {
  // Calculate yesterday's date relative to the user's system date for default and max value.
  const getYesterdayDateString = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const maxDate = getYesterdayDateString();
  const [selectedDate, setSelectedDate] = useState<string>(maxDate);
  const [items, setItems] = useState<DailyBoxOfficeItem[]>([]);
  const [selectedMovieCd, setSelectedMovieCd] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBoxOffice = async () => {
      setLoading(true);
      setError(null);
      // Clean up previous selected movie or keep if it gets updated
      const apiDateParam = selectedDate.replace(/-/g, "");

      try {
        const response = await fetch(`/api/boxoffice?date=${apiDateParam}`);
        if (!response.ok) {
          throw new Error("KOBIS 박스오피스 데이터를 불러오는데 실패했습니다.");
        }
        const data: DailyBoxOfficeResponse = await response.json();
        
        if (data.boxOfficeResult && data.boxOfficeResult.dailyBoxOfficeList) {
          const list = data.boxOfficeResult.dailyBoxOfficeList;
          setItems(list);
          // Auto-select the 1st movie in the list for a fully populated visual experience
          if (list.length > 0) {
            setSelectedMovieCd(list[0].movieCd);
          } else {
            setSelectedMovieCd(null);
          }
        } else {
          throw new Error("박스오피스 결과가 없거나 잘못된 응답 형식입니다.");
        }
      } catch (err: any) {
        console.error("Fetch boxoffice error:", err);
        setError(err.message || "오류가 발생했습니다.");
        setItems([]);
        setSelectedMovieCd(null);
      } finally {
        setLoading(false);
      }
    };

    fetchBoxOffice();
  }, [selectedDate]);

  const selectedMovieName = items.find(item => item.movieCd === selectedMovieCd)?.movieNm;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-rose-500/30 selection:text-rose-200">
      {/* Top Navigation / Control Header */}
      <Header
        selectedDate={selectedDate}
        maxDate={maxDate}
        onDateChange={setSelectedDate}
      />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:py-8 flex flex-col gap-8">
        {/* Intro Info Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800 p-5 sm:p-6 shadow-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial-[circle_at_right] from-rose-500/10 to-transparent pointer-events-none" />
          
          <div className="space-y-1.5 max-w-2xl relative z-10">
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-rose-500" />
              박스오피스 실시간 주요 트렌드
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              영화진흥위원회(KOBIS)의 API 서비스를 연동하여 실시간 일일 영화 순위 및 누적 관객수, 점유율 등 각종 통계 데이터를 안전하게 중개 서버를 거쳐 표시합니다.
            </p>
          </div>

          <div className="shrink-0 flex items-center bg-slate-800/40 border border-slate-800 rounded-xl px-4 py-3 shrink-0">
            <div className="text-left font-mono">
              <span className="block text-[10px] text-slate-500 uppercase font-semibold">Max Selectable Date</span>
              <span className="text-xs text-rose-400 font-bold">{maxDate} (어제)</span>
            </div>
          </div>
        </div>

        {/* Content Workspace */}
        {error ? (
          <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-rose-950/20 bg-rose-950/5 max-w-md mx-auto my-12 shadow-inner">
            <AlertCircle className="h-10 w-10 text-rose-500 mb-3" />
            <h3 className="font-sans text-base font-bold text-white">데이터 로딩 불가</h3>
            <p className="font-sans text-xs text-slate-400 mt-2 leading-relaxed">
              {error} <br /> API 키 설정 또는 날짜 요청 형식을 다시 한 번 확인해주세요.
            </p>
            <button
              onClick={() => setSelectedDate(maxDate)}
              className="mt-5 px-3.5 py-1.8 font-sans text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded-md transition-colors"
            >
              어제 날짜로 복원하기
            </button>
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="relative flex items-center justify-center">
              <div className="h-16 w-16 rounded-full border-4 border-slate-800 border-t-rose-500 animate-spin absolute" />
              <Film className="h-6 w-6 text-rose-500 animate-pulse" />
            </div>
            <p className="font-sans text-sm text-slate-400 font-medium mt-6">KOBIS 영화 데이터를 불러오고 있습니다...</p>
            <p className="font-sans text-xs text-slate-600 mt-1">네트워크 환경에 따라 수 초가 걸릴 수 있습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            {/* Left Column: Top 10 list */}
            <div className="lg:col-span-7 flex flex-col">
              <BoxOfficeList
                items={items}
                selectedMovieCd={selectedMovieCd}
                onSelectMovie={setSelectedMovieCd}
              />
            </div>

            {/* Right Column: Detailed Info Display */}
            <div className="lg:col-span-5 lg:sticky lg:top-24">
              <MovieDetail
                movieCd={selectedMovieCd}
                movieNmFromList={selectedMovieName}
              />

              {/* Informative Help Guide Card */}
              <div className="mt-4 p-4 rounded-xl border border-slate-800/60 bg-slate-900/20 flex gap-3 text-left">
                <HelpCircle className="h-5 w-5 text-slate-500 shrink-0 mt-0.5" />
                <div className="font-sans text-xs">
                  <h5 className="font-semibold text-slate-400">데이터 출처 및 기준</h5>
                  <p className="text-slate-500 mt-1 leading-relaxed">
                    본 서비스에서 제공되는 순위 데이터는 영화진흥위원회의 OpenAPI 규격을 기반으로 합니다. 일일 박스오피스 정보는 매일 마감 후 순차적으로 업데이트됩니다.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Humble craft metadata footer */}
      <footer className="mt-auto border-t border-slate-900 py-6 px-4 text-center font-sans text-xs text-slate-600">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
          <p>© 2026 KOBIS Box Office Explorer. All rights reserved.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <span>개발 환경 보안 API Gateway 완료</span>
            <span className="text-slate-800">|</span>
            <span>데이터 제공: 영화진흥위원회</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
