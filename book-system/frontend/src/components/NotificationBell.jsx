import React, { useEffect, useRef, useState } from "react";
import {
  getNotifications,
  markAllNotificationsRead,
} from "../api/notifications";

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const boxRef = useRef(null);

  const load = async () => {
    try {
      const res = await getNotifications();
      if (res.success) {
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (err) {
      console.error("notification error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const timer = setInterval(load, 15000); // refresh mỗi 15s
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const onClick = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const handleMarkAll = async () => {
    try {
      await markAllNotificationsRead();
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div ref={boxRef} style={{ position: "relative" }}>
      <button
        className="btn btn-ghost btn-sm"
        onClick={() => setOpen((o) => !o)}
        style={{ position: "relative", fontSize: 16 }}
        title="Thông báo"
      >
        🔔
        {unreadCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: -4,
              right: -4,
              background: "var(--red, #e57373)",
              color: "#fff",
              borderRadius: 10,
              fontSize: 11,
              padding: "1px 6px",
              fontWeight: 700,
            }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            width: 340,
            maxHeight: 380,
            overflowY: "auto",
            background: "var(--surface, #1a1f2e)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 8,
            boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "10px 14px",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <strong style={{ fontSize: 14 }}>Thông báo</strong>
            {unreadCount > 0 && (
              <button
                className="btn btn-ghost btn-sm"
                onClick={handleMarkAll}
                style={{ fontSize: 12 }}
              >
                Đọc tất cả
              </button>
            )}
          </div>

          {loading ? (
            <p className="text-dim mono" style={{ padding: 14, fontSize: 13 }}>
              &gt; loading...
            </p>
          ) : notifications.length === 0 ? (
            <p className="text-dim" style={{ padding: 14, fontSize: 13 }}>
              Chưa có thông báo nào.
            </p>
          ) : (
            notifications.map((n) => (
              <div
                key={n._id}
                style={{
                  padding: "10px 14px",
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                  background: n.isRead
                    ? "transparent"
                    : "rgba(80,180,255,0.06)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 8,
                  }}
                >
                  <strong
                    style={{
                      fontSize: 13,
                      color: n.isRead ? "inherit" : "var(--cyan, #4fc3f7)",
                    }}
                  >
                    {n.title}
                  </strong>
                  {!n.isRead && (
                    <span
                      style={{ color: "var(--cyan, #4fc3f7)", fontSize: 10 }}
                    >
                      ●
                    </span>
                  )}
                </div>
                <p
                  className="text-dim"
                  style={{ margin: "4px 0 0", fontSize: 12.5 }}
                >
                  {n.message}
                </p>
                <p
                  className="text-dim mono"
                  style={{ margin: "6px 0 0", fontSize: 11 }}
                >
                  {new Date(n.createdAt).toLocaleString("vi-VN")}
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
