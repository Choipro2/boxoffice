import { useState, useEffect } from "react";
import { MovieInfo, MovieInfoResponse } from "../types";
import { Clock, Tag, Film, User, Award, Building2, Globe, Heart, AlertCircle, Loader2, Sparkles, MessageSquare, Quote, Copy, Check } from "lucide-react";

interface MovieDetailProps {
  movieCd: string | null;
  movieNmFromList?: string;
}

export function MovieDetail({ movieCd, movieNmFromList }: MovieDetailProps) {
  const [movieInfo, setMovieInfo] = useState<MovieInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // AI Review States
  const [simpleReview, setSimpleReview] = useState<string>("");
  const [aiReview, setAiReview] = useState<string>("");
  const [generatingReview, setGeneratingReview] = useState<boolean>(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (!movieCd) {
      setMovieInfo(null);
      setSimpleReview("");
      setAiReview("");
      setGenerationError(null);
      return;
    }

    const fetchMovieDetail = async () => {
      setLoading(true);
      setError(null);
      setSimpleReview("");
      setAiReview("");
      setGenerationError(null);
      try {
        const response = await fetch(`/api/movieinfo?movieCd=${movieCd}`);
        if (!response.ok) {
          throw new Error("영화 상세 정보를 불러오는데 실패했습니다.");
        }
        const data: MovieInfoResponse = await response.json();
        
        if (data.movieInfoResult && data.movieInfoResult.movieInfo) {
          setMovieInfo(data.movieInfoResult.movieInfo);
        } else {
          throw new Error("상세 정보 데이터를 찾을 수 없습니다.");
        }
      } catch (err: any) {
        console.error("Error fetching detail:", err);
        setError(err.message || "오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchMovieDetail();
  }, [movieCd]);

  const handleGenerateReview = async () => {
    if (!simpleReview.trim() || !movieInfo) return;

    setGeneratingReview(true);
    setGenerationError(null);
    setAiReview("");

    try {
      const directorsStr = movieInfo.directors.map(d => d.peopleNm).join(", ");
      const genresStr = movieInfo.genres.map(g => g.genreNm).join(", ");

      const response = await fetch("/api/review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          movieNm: movieInfo.movieNm,
          directors: directorsStr,
          genres: genresStr,
          openDt: movieInfo.openDt,
          shortReview: simpleReview,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "상세 감상평 생성 도중 오류가 발생했습니다.");
      }

      const data = await response.json();
      setAiReview(data.detailedReview);
    } catch (err: any) {
      console.error("AI Review Generation Error:", err);
      setGenerationError(err.message || "감상평 생성에 실패했습니다.");
    } finally {
      setGeneratingReview(false);
    }
  };

  const handleCopy = () => {
    if (!aiReview) return;
    navigator.clipboard.writeText(aiReview);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!movieCd) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center border border-slate-800 bg-slate-900/20 rounded-2xl">
        <div className="rounded-full bg-slate-800/50 p-4 text-slate-500 mb-3">
          <Film className="h-8 w-8 text-slate-400" />
        </div>
        <h3 className="font-sans text-base font-bold text-white">영화 상세 정보</h3>
        <p className="font-sans text-xs text-slate-500 mt-2 max-w-sm">
          박스오피스 목록에서 영화를 클릭하시면 상세 제작 정보 및 AI 감상평 작성 서비스를 제공해 드립니다.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-[350px] flex-col items-center justify-center p-8 text-center border border-slate-800 bg-slate-900/30 rounded-2xl">
        <Loader2 className="h-8 w-8 text-rose-500 animate-spin mb-3" />
        <p className="font-sans text-sm text-slate-400">영화 상세 정보를 불러오는 중...</p>
        <p className="font-sans text-xs text-rose-500/60 mt-1">{movieNmFromList}</p>
      </div>
    );
  }

  if (error || !movieInfo) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center border border-rose-950/30 bg-rose-950/10 rounded-2xl">
        <AlertCircle className="h-8 w-8 text-rose-500 mb-2" />
        <p className="font-sans text-sm text-rose-400 font-bold">오류가 발생했습니다</p>
        <p className="font-sans text-xs text-slate-400 mt-1">{error || "상세 정보를 불러올 수 없습니다."}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl shadow-black/20 text-left">
        {/* Visual Header Grid Accent */}
        <div className="p-5 sm:p-6 border-b border-slate-800 relative bg-gradient-to-r from-rose-950/20 to-slate-900">
          <div className="absolute right-6 top-6 h-12 w-12 rounded-full border border-rose-500/20 bg-rose-500/5 flex items-center justify-center text-rose-400">
            <Heart className="h-5 w-5 fill-current" />
          </div>

          <span className="font-sans text-[10px] font-extrabold tracking-widest text-rose-500 uppercase bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
            영화코드: {movieInfo.movieCd}
          </span>
          <h2 className="font-sans text-xl sm:text-2xl font-black text-white mt-2 leading-tight">
            {movieInfo.movieNm}
          </h2>
          {movieInfo.movieNmEn && (
            <p className="font-sans text-xs sm:text-sm text-slate-400 mt-0.5 font-medium italic">
              {movieInfo.movieNmEn}
            </p>
          )}

          {/* Quick Tag Badges */}
          <div className="flex flex-wrap gap-2 mt-4">
            {movieInfo.genres.map((g, i) => (
              <span key={i} className="flex items-center gap-1 font-sans text-xs text-slate-300 bg-slate-800 border border-slate-700 rounded-md px-2 py-0.7">
                <Tag className="h-3 w-3 text-rose-400" />
                {g.genreNm}
              </span>
            ))}

            {movieInfo.showTm && (
              <span className="flex items-center gap-1 font-sans text-xs text-slate-300 bg-slate-800 border border-slate-700 rounded-md px-2 py-0.7">
                <Clock className="h-3 w-3 text-rose-400" />
                {movieInfo.showTm}분
              </span>
            )}

            {movieInfo.audits && movieInfo.audits.length > 0 && (
              <span className="flex items-center gap-1 font-sans text-xs text-rose-300 bg-rose-950/30 border border-rose-900/40 rounded-md px-2 py-0.7 font-semibold font-sans">
                <Award className="h-3 w-3 text-rose-400" />
                {movieInfo.audits[0].watchGradeNm}
              </span>
            )}
          </div>
        </div>

        {/* Detail Fields Body */}
        <div className="p-5 sm:p-6 space-y-5.5">
          {/* Release info & stats */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 font-sans text-xs">
            <div className="border border-slate-800 bg-slate-900/40 p-3 rounded-xl flex flex-col gap-0.5">
              <span className="text-slate-500">개봉일</span>
              <span className="text-white font-semibold">{movieInfo.openDt || "정보 없음"}</span>
            </div>
            <div className="border border-slate-800 bg-slate-900/40 p-3 rounded-xl flex flex-col gap-0.5">
              <span className="text-slate-500">제작년도 / 상태</span>
              <span className="text-white font-semibold">
                {movieInfo.prdtYear}년 ({movieInfo.prdtStatNm || "해당없음"})
              </span>
            </div>
          </div>

          {/* Brand Core Directors */}
          <div>
            <h4 className="font-sans text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 mb-2.5">
              <User className="h-4 w-4 text-rose-400" />
              감독
            </h4>
            {movieInfo.directors.length === 0 ? (
              <p className="font-sans text-sm text-slate-500">등록된 감독 정보가 없습니다.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {movieInfo.directors.map((director, idx) => (
                  <div key={idx} className="bg-slate-800/50 border border-slate-800/80 rounded-lg px-3 py-1.5 flex flex-col">
                    <span className="font-sans text-sm text-white font-medium">{director.peopleNm}</span>
                    {director.peopleNmEn && (
                      <span className="font-sans text-[10px] text-slate-400 font-normal">{director.peopleNmEn}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cast Actors */}
          <div>
            <h4 className="font-sans text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 mb-2.5">
              <Film className="h-4 w-4 text-rose-400" />
              주요 출연 배우
            </h4>
            {movieInfo.actors.length === 0 ? (
              <p className="font-sans text-sm text-slate-500">등록된 배우 정보가 없습니다.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {movieInfo.actors.slice(0, 8).map((actor, idx) => (
                  <div key={idx} className="bg-slate-800/40 border border-slate-800/60 rounded-xl p-2.5 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-sans text-xs font-semibold text-white truncate">{actor.peopleNm}</div>
                      {actor.peopleNmEn && (
                        <div className="font-sans text-[10px] text-slate-500 truncate">{actor.peopleNmEn}</div>
                      )}
                    </div>
                    {actor.cast && (
                      <span className="shrink-0 bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 font-sans text-[10px] text-rose-300 font-medium max-w-28 truncate">
                        {actor.cast} 역
                      </span>
                    )}
                  </div>
                ))}
                {movieInfo.actors.length > 8 && (
                  <div className="sm:col-span-2 text-center text-xs text-slate-500 py-1">
                    외 {movieInfo.actors.length - 8}명의 출연진이 더 있습니다.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Nations & Production Companies */}
          <div className="border-t border-slate-800 pt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <h5 className="font-sans text-xs font-bold text-slate-500 flex items-center gap-1 mb-1.5">
                <Globe className="h-3.5 w-3.5 text-slate-500" />
                제작 국가
              </h5>
              <div className="flex flex-wrap gap-1.5">
                {movieInfo.nations.length === 0 ? (
                  <span className="text-xs text-slate-500">정보 없음</span>
                ) : (
                  movieInfo.nations.map((nat, i) => (
                    <span key={i} className="font-sans text-xs bg-slate-800/30 text-slate-300 px-2 py-0.5 rounded border border-slate-800">
                      {nat.nationNm}
                    </span>
                  ))
                )}
              </div>
            </div>

            <div>
              <h5 className="font-sans text-xs font-bold text-slate-500 flex items-center gap-1 mb-1.5">
                <Building2 className="h-3.5 w-3.5 text-slate-500" />
                영화사 정보
              </h5>
              <div className="flex flex-col gap-1 max-h-24 overflow-y-auto pr-1">
                {movieInfo.companys.length === 0 ? (
                  <span className="text-xs text-slate-500">정보 없음</span>
                ) : (
                  movieInfo.companys.slice(0, 3).map((comp, i) => (
                    <div key={i} className="font-sans text-xs text-slate-300">
                      <span className="font-semibold text-slate-200">{comp.companyNm}</span>
                      <span className="text-[10px] text-slate-500 ml-1">({comp.companyPartNm})</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Write simple review and get interactive detailed AI reviews */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-lg relative overflow-hidden text-left">
        <div className="absolute right-0 top-0 w-24 h-24 bg-gradient-to-bl from-rose-500/5 to-transparent pointer-events-none" />
        
        <h3 className="font-sans text-base font-bold text-white flex items-center gap-2 mb-2">
          <Sparkles className="h-5 w-5 text-rose-500 animate-pulse" />
          AI 평론가 감상평 생성기
        </h3>
        <p className="font-sans text-xs text-slate-400 leading-relaxed mb-4">
          영화에 대한 간단한 느낌(예: "배우들의 케미가 돋보이고 OST가 슬펐습니다.")을 적으면, 영화진흥위원회 데이터를 활용하여 전문 평론가 스타일의 심도 있는 감상평을 완벽하게 작성해 드립니다.
        </p>

        {/* Short review input */}
        <div className="space-y-3">
          <div className="relative">
            <textarea
              value={simpleReview}
              onChange={(e) => setSimpleReview(e.target.value)}
              placeholder="여기에 간단한 한 줄 평이나 소감을 편하게 적어주세요..."
              rows={3}
              maxLength={150}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3.5 text-xs text-slate-100 placeholder:text-slate-600 focus:border-rose-500/50 focus:outline-none focus:ring-1 focus:ring-rose-500/20 font-sans leading-relaxed resize-none"
            />
            <span className="absolute bottom-2.5 right-3 font-mono text-[10px] text-slate-600">
              {simpleReview.length}/150
            </span>
          </div>

          <button
            onClick={handleGenerateReview}
            disabled={generatingReview || !simpleReview.trim()}
            className={`w-full flex items-center justify-center gap-1.5 rounded-xl py-3 text-xs font-bold font-sans transition-all duration-200 shadow-sm cursor-pointer ${
              !simpleReview.trim()
                ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-800"
                : "bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white shadow-red-500/5"
            }`}
          >
            {generatingReview ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-white" />
                AI 평론가가 상세 감상평 작성 중...
              </>
            ) : (
              <>
                <MessageSquare className="h-4 w-4 text-white" />
                평론가 스타일 상세 감상평 쓰기
              </>
            )}
          </button>
        </div>

        {/* Generation Error Display */}
        {generationError && (
          <div className="mt-4 p-3.5 bg-rose-950/20 rounded-xl border border-rose-900/30 flex items-start gap-2.5">
            <AlertCircle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
            <p className="font-sans text-xs text-rose-300 leading-relaxed">{generationError}</p>
          </div>
        )}

        {/* AI Result Section */}
        {aiReview && (
          <div className="mt-5 p-4 bg-slate-950/60 rounded-xl border border-rose-950/20 space-y-3 relative">
            <div className="flex items-center justify-between">
              <span className="font-sans text-[10px] font-bold tracking-wider text-rose-400 flex items-center gap-1">
                <Quote className="h-3.5 w-3.5 text-rose-500" />
                AI CRITIQUE FOCUS
              </span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 font-sans text-[10px] font-semibold text-slate-500 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 px-2 py-1 rounded transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="h-3 w-3 text-emerald-400" />
                    <span>복사 완료</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    <span>글 복사</span>
                  </>
                )}
              </button>
            </div>
            
            <div className="font-sans text-xs leading-relaxed text-slate-300 whitespace-pre-line border-l-2 border-rose-500/40 pl-3">
              {aiReview}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
