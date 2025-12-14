import Menu from "./Menu";
import "./Home.css";
import { useEffect, useState } from "react";
import axios from "axios";
import HomePosts from "./HomePosts";

const Home = () => {
    const [post, setPost] = useState({});
    const [ranking, setRanking] = useState([]);
    const [isFetching, setIsFetching] = useState(false);
    const [isRankingFetching, setIsRankingFetching] = useState(false);

    useEffect(() => {
        const fetchResults = async () => {
            try {
                setIsFetching(true);

                const res = await axios.get("/api/search", {
                    params: { type: "home", sort: "latest", limit: "5" },
                });

                setPost(res.data.results);

            } catch (err) {
                console.error("검색 오류:", err);
            } finally {
                setIsFetching(false);
            }
        };

        fetchResults();
    }, []);

    useEffect(() => {
        const loadRanking  = async () => {
            try {
                setIsRankingFetching(true);
                const res = await axios.get("/api/ranking/top15");
                setRanking(res.data.rankings);
            } catch (err) {
                console.error("랭킹 불러오기 실패:", err);
                return [];
            } finally {
                setIsRankingFetching(false);
            }
        };
        loadRanking();
    }, []);

    if (isFetching || isRankingFetching) return <div />

    return (
        <div className="home-container">
            <Menu />
            <HomePosts post={post} isFetching={isFetching} ranking={ranking} isRankingFetching={isRankingFetching} />
        </div>
    );
};

export default Home;