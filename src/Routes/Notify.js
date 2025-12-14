import { useEffect, useState, useRef } from "react";
import { useAxios } from "../contexts/useAxios";
import { useAuth } from "../contexts/AuthProvider";
import Notifications from "../components/Notifications";
import useWindowWidth from "../components/useWindowWidth";
import "../css/Notify.css";

const Notify = () => {
    const { userUuid } = useAuth();
    const [notification, setNotification] = useState([]);
    const [notifyLoading, setNotifyLoading] = useState(false);
    const [notifyPage, setNotifyPage] = useState(1);
    const [notifyHasMore, setNotifyHasMore] = useState(true);
    const width = useWindowWidth();
    const isMobile = width < 768;
    const bottomNotifyRef = useRef(null);
    const api = useAxios();

    const fetchNotifications = async (page = 1) => {
        try {
        setNotifyLoading(true);

        const res = await api.get(`/api/notify/list-and-read?page=${page}&limit=20`, {
            params: { userUuid, page },
        });

        const list = res.data.list || [];

        if (page === 1) {
            setNotification(list);
        } else {
            setNotification((prev) => [...prev, ...list]);
        }

        // 20개 미만이면 더 없음
        setNotifyHasMore(list.length === 20);

        } catch (err) {
        console.error("알람 불러오기 에러:", err);
        } finally {
        setNotifyLoading(false);
        }
    };

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && notifyHasMore && !notifyLoading) {
            const nextPage = notifyPage + 1;
            setNotifyPage(nextPage);
            fetchNotifications(nextPage);
        }
        });

        if (bottomNotifyRef.current) observer.observe(bottomNotifyRef.current);

        return () => observer.disconnect();
    }, [notifyPage, notifyHasMore, notifyLoading]);

    return (
        <div className="notify-container">
            <Notifications notification={notification} setNotification={setNotification} notifyLoading={notifyLoading}/>
            <div ref={bottomNotifyRef} style={{ height: 1 }} />
        </div>
    );
};

export default Notify;