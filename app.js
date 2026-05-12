import React, { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "kintore-attendance-app-v2";

const defaultMembers = Array.from({ length: 20 }, (_, i) => `参加者${i + 1}`);

function todayString() {
  const d = new Date();
  return d.toISOString().split("T")[0];
}

function createId() {
  return Math.random().toString(36).substring(2, 10);
}

function makeInitialData() {
  return {
    members: defaultMembers.map((name, index) => ({
      id: createId() + index,
      name,
      active: true,
    })),
    records: {},
  };
}

export default function AttendanceApp() {
  return (
    <div style={{ padding: 20 }}>
      <h1>筋トレ広場 出席管理アプリ</h1>
      <p>アプリ準備中です。</p>
    </div>
  );
}
