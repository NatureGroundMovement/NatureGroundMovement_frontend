import PostList from "../Community/PostList";
import DiaryList from "../Diary/DiaryList";
import HighlightList from "../Highlight/HighlightList";
import RoutineList from "../Routine/RoutineList";
import "./HomePosts.css";
import HomeRanking from "./HomeRanking";
import { useNavigate } from "react-router-dom";
import useWindowWidth from "../../components/useWindowWidth";

const HomePosts = ({ post, isFetching, ranking, isRankingFetching }) => {
    const navigate = useNavigate();
    const width = useWindowWidth();
    const isMobile = width < 768;

    if (!isMobile) return (
        <div className="home-posts">
            <div>
                <div style={{ flex: "1" }}>
                    <section>
                        <div className="home-posts-header">
                            <h3>뜨고 있는 운동루틴</h3>
                            <button onClick={() => navigate("/routine")}>더보기 <span>{">"}</span></button>
                        </div>
                        <RoutineList routines={post[1]?.results.slice(0, 4)} isLoading={isFetching} />
                    </section>
                    <section>
                        <div className="home-posts-header">
                            <h3>이번 주 최고 하이라이트</h3>
                            <button onClick={() => navigate("/highlight")}>더보기 <span>{">"}</span></button>
                        </div>
                        <HighlightList highlights={post[2]?.results} isLoading={isFetching} />
                    </section>
                </div>
                <HomeRanking ranking={ranking} isRankingFetching={isRankingFetching}/>
            </div>
            <section>
                <div className="home-posts-header">
                    <h3>인기 있는 운동일지</h3>
                    <button onClick={() => navigate("/diary")}>더보기 <span>{">"}</span></button>
                </div>
                <DiaryList todayDiaries={post[0]?.results.slice(0, 4)} isLoading={isFetching} isSearch={true}/>
            </section>
            <section>
                <div className="home-posts-header">
                    <h3>주목 받는 게시글</h3>
                    <button onClick={() => navigate("/community")}>더보기 <span>{">"}</span></button>
                </div>
                <PostList posts={post[3]?.results} isLoading={isFetching} />
            </section>
        </div>
    );

    if (isMobile) return (
        <div className="mobile-home-posts">
            <section>
                <div className="home-posts-header">
                    <h3>뜨고 있는 운동루틴</h3>
                    <button onClick={() => navigate("/routine")}>더보기 <span>{">"}</span></button>
                </div>
                <RoutineList routines={post[1]?.results.slice(0, 4)} isLoading={isFetching} />
            </section>
            <section>
                <div className="home-posts-header">
                    <h3>이번 주 최고 하이라이트</h3>
                    <button onClick={() => navigate("/highlight")}>더보기 <span>{">"}</span></button>
                </div>
                <HighlightList highlights={post[2]?.results} isLoading={isFetching} />
            </section>
            <HomeRanking ranking={ranking} isRankingFetching={isRankingFetching}/>
            <section>
                <div className="home-posts-header">
                    <h3>인기 있는 운동일지</h3>
                    <button onClick={() => navigate("/diary")}>더보기 <span>{">"}</span></button>
                </div>
                <DiaryList todayDiaries={post[0]?.results.slice(0, 4)} isLoading={isFetching} isSearch={true}/>
            </section>
            <section>
                <div className="home-posts-header">
                    <h3>주목 받는 게시글</h3>
                    <button onClick={() => navigate("/community")}>더보기 <span>{">"}</span></button>
                </div>
                <PostList posts={post[3]?.results} isLoading={isFetching} />
            </section>
        </div>
    )
};

export default HomePosts;