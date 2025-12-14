import { useAuth } from "../../contexts/AuthProvider";
import "./Profile.css";
import ProfileHeader from "./ProfileHeader";
import ProfilePosts from "./ProfilePosts";
import { useSearchParams, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import Spinner from "../../components/Spinner";
import { useAxios } from "../../contexts/useAxios";

const Profile = () => {
    const { userUuid, userRole } = useAuth();
    const { profileId } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    const [list, setList] = useState([]);
    const [sort, setSort] = useState("latest")
    const [counts, setCounts] = useState({
        diary: 0,
        routine: 0,
        highlight: 0,
        community: 0,
    });
    const [isFollowed, setIsFollowed] = useState(false);
    const [notify, setNotify] = useState(null); // ← 여기에 notify 저장
    const [isLoading, setIsLoading] = useState(true);
    const [postLoading, setPostLoading] = useState(false);
    const [statusLoading, setStatusLoading] = useState(false);
    const [routine, setRoutine] = useState(null);
    const [showSelectedDay, setShowSelectedDay] = useState("월");
    const [profile, setProfile] = useState(null);
    const type = searchParams.get("type") || "myroutine";
    const api = useAxios();

    const myProfile = userUuid === profileId

    useEffect(() => {
        if (!profileId) return;

        const fetchProfile = async () => {
            try {
            setIsLoading(true);

            // 1️⃣ 프로필 + counts + mainRoutine 가져오기
            const res = await api.get(`/api/profiles/${profileId}`);

            const profileData = res.data.profile;
            const countsData = res.data.counts;
            const mainRoutine = res.data.mainRoutine;

            setProfile(profileData);
            setCounts(countsData);

            // 2️⃣ mainRoutine이 있으면 blocks 가공
            if (mainRoutine && mainRoutine.blocks) {
                const allBlockIds = [
                ...new Set(
                    Object.values(mainRoutine.blocks)
                    .flatMap(dayBlocks => dayBlocks)
                ),
                ];

                if (allBlockIds.length) {
                const blockRes = await api.get(
                    `/api/myroutine/blocks?ids=${allBlockIds.join(",")}`
                );
                const blockMap = Object.fromEntries(
                    blockRes.data.blocks.map(b => [b.copyId, b])
                );

                const hydratedBlocks = Object.fromEntries(
                    Object.entries(mainRoutine.blocks).map(([day, blockRefs]) => [
                    day,
                    blockRefs
                        .map(ref => {
                        const blockData = blockMap[ref];
                        if (!blockData) return null;
                        return {
                            ...blockData,
                            blockId: ref,
                            instanceId: uuidv4(),
                        };
                        })
                        .filter(Boolean),
                    ])
                );

                setRoutine({ ...mainRoutine, blocks: hydratedBlocks });
                } else {
                setRoutine(mainRoutine);
                }
            } else {
                setRoutine(null);
            }
            } catch (err) {
            console.error("Profile fetch error:", err);
            } finally {
            setIsLoading(false);
            }
        };

        fetchProfile();
    }, [profileId]);

    useEffect(() => {
        if (!profileId || !type) return;

        const fetchPostList = async () => {
            try {
            setPostLoading(true);
            const res = await api.get("/api/posts/post-list", {
                params: { type, userUuid: profileId, sort }
            });

            setList(res.data.results);
            } catch (err) {
            console.error("fetchPostList error:", err);
            } finally {
                setPostLoading(false);
            }
        };

        fetchPostList();
    }, [type, profileId, sort]);

    useEffect(() => {
        if (!userUuid) return;

        const getFollowStatus = async () => {
            try {
                setStatusLoading(true);
                const res = await api.get("/api/follow/status", {
                    params: { userUuid, profileId },
                });

                setIsFollowed(res.data.isFollowed);
                setNotify(res.data.notify); // ← notify 상태에 저장!
            } catch (err) {
                console.error("팔로우 상태 확인 오류:", err);
            } finally {
                setStatusLoading(false);
            }
        };

        getFollowStatus();
    }, [userUuid, profileId]);

    const handleTypeClick = (t) => {
        setSearchParams({ type: t });
    };

    if (statusLoading || isLoading || !userUuid|| !profileId) return <div className="profile-container"><Spinner /></div>;

    return (
        <div className="profile-container">
            <ProfileHeader 
                profile={profile} 
                counts={counts} 
                profileId={profileId} 
                userUuid={userUuid} 
                isFollowed={isFollowed} 
                myProfile={myProfile}
                notify={notify} 
                setNotify={setNotify}
                setIsFollowed={setIsFollowed}
                userRole={userRole}
            />
            <ProfilePosts 
                type={type} 
                handleTypeClick={handleTypeClick} 
                list={list} 
                postLoading={postLoading} 
                setSort={setSort} 
                sort={sort} 
                routine={routine}
                showSelectedDay={showSelectedDay}
                setShowSelectedDay={setShowSelectedDay}
                isPublic={profile.isPublic}
            />
        </div>
    );
};

export default Profile;