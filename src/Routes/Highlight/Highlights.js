import { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./Highlights.css";
import HighlightList from "./HighlightList";
import useWindowWidth from "../../components/useWindowWidth";

const Highlights = () => {
  const [latestHighlights, setLatestHighlights] = useState([]);
  const [popularHighlights, setPopularHighlights] = useState([]);
  const [viewedHighlights, setViewedHighlights] = useState([]);

  // 랜덤 + 무한스크롤 상태
  const [randomHighlights, setRandomHighlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const fetching = useRef(false);
  const loadedIds = useRef([]); // 랜덤으로 이미 로드된 postId들
  const observerTarget = useRef(null);

  const width = useWindowWidth();
  const isMobile = width < 768;

  const BATCH_SIZE = isMobile ? 21 : 20;

  /** 최초 전체 데이터를 불러오기 */
  useEffect(() => {
    const fetchHighlights = async () => {
      try {
        setLoading(true);

        const res = await axios.get(`/api/highlights`);

        setLatestHighlights(res.data.latest || []);
        setPopularHighlights(res.data.popular || []);
        setViewedHighlights(res.data.viewed || []);

        // 랜덤 초기 1차 데이터
        const initialRandom = res.data.random || [];
        setRandomHighlights(initialRandom);
        loadedIds.current = initialRandom.map((v) => v.postId);
      } catch (error) {
        console.error("🚨 하이라이트 불러오기 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHighlights();
  }, []);

  /** 랜덤 API 호출 함수 */
  const fetchMoreRandom = async () => {
    if (fetching.current) return;
    fetching.current = true;

    try {
      const res = await axios.get(
        `/api/highlights/random?limit=${BATCH_SIZE}&exclude=${loadedIds.current.join(",")}`
      );

      const newItems = res.data;
      if (newItems.length > 0) {
        setRandomHighlights((prev) => [...prev, ...newItems]);
        loadedIds.current.push(...newItems.map((v) => v.postId));
      }
    } catch (err) {
      console.error("🚨 랜덤 로드 실패:", err);
    } finally {
      fetching.current = false;
    }
  };

  /** IntersectionObserver: 랜덤 전용 무한 스크롤 */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchMoreRandom();
        }
      },
      { threshold: 1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) observer.unobserve(observerTarget.current);
    };
  }, []);

  return (
    <div className="highlights-container">
      {/* 인기순 */}
      <section className="highlight-section">
        <h2>🔥 이번 주 인기 하이라이트</h2>
        <HighlightList highlights={popularHighlights} loading={loading} />
      </section>

      {/* 조회순 */}
      <section className="highlight-section">
        <h2>👀 이번 주 조회수 높은 하이라이트</h2>
        <HighlightList highlights={viewedHighlights} loading={loading} />
      </section>

      {/* 최신순 */}
      <section className="highlight-section">
        <h2>✨ 이번 주 최신 하이라이트</h2>
        <HighlightList highlights={latestHighlights} loading={loading} />
      </section>

      {/* 랜덤 + 무한스크롤 */}
      <section className="highlight-section">
        <h2>🎲 랜덤 하이라이트</h2>

        <HighlightList highlights={randomHighlights} loading={loading} />

        {/* 무한스크롤 트리거 */}
        <div ref={observerTarget} style={{ height: "30px" }} />
      </section>
    </div>
  );
};

export default Highlights;
