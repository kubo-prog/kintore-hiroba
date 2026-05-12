const SCRIPT_URL = "https://script.google.com/macros/s/AKfyczbz2f-Sh_aMDH9WwB1OQEPIYB-PH7Shv94UL7fIi0yPs-IDqtpqvO8CGP-fYrHmtrmp/exec";

let names = Array(20).fill("");
let memo1 = Array(20).fill("");
let memo2 = Array(20).fill("");
let attended = Array(20).fill(false);
let selectedIndex = 0;

async function loadNames() {
  try {
    const res = await fetch(`${SCRIPT_URL}?action=getNames`);
    const data = await res.json();
    if (data.names && data.names.length > 0) {
      names = [...data.names];
      while (names.length < 20) names.push("");
      names = names.slice(0, 20);
    }
  } catch (e) {
    console.log(e);
  }
}

async function saveNames() {
  await fetch(SCRIPT_URL, {
    method: "POST",
    mode: "no-cors",
    body: JSON.stringify({
      action: "saveNames",
      names: names
    })
  });
}

async function saveAttendance() {
  const name = names[selectedIndex];

  if (!name || !name.trim()) {
    alert("名前を入力してください。");
    return;
  }

  await fetch(SCRIPT_URL, {
    method: "POST",
    mode: "no-cors",
    body: JSON.stringify({
      action: "saveRecord",
      name: name,
      attendance: "出席",
      memo1: memo1[selectedIndex],
      memo2: memo2[selectedIndex]
    })
  });

  attended[selectedIndex] = true;
  memo1[selectedIndex] = "";
  memo2[selectedIndex] = "";
  renderApp();

  alert(`${name} さんの出席を記録しました。`);
}

function downloadCSV() {
  let csv = "番号,名前,出席,備考1,備考2\n";

  for (let i = 0; i < 20; i++) {
    csv += `${i + 1},"${names[i]}","${attended[i] ? "出席" : ""}","${memo1[i]}","${memo2[i]}"\n`;
  }

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "kintore-hiroba.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function renderApp() {
  const count = attended.filter(Boolean).length;
  const selectedName = names[selectedIndex] || "";

  const app = document.getElementById("app");

  app.innerHTML = `
    <div style="font-family:sans-serif;background:#f5f7fb;min-height:100vh;padding:16px;">
      <div style="max-width:1000px;margin:0 auto;">
        <div style="background:#1976d2;color:white;padding:18px;border-radius:14px;margin-bottom:14px;">
          <h1 style="margin:0;font-size:26px;">筋トレ広場 出席管理</h1>
          <p style="margin:8px 0 0;">本日の出席：${count} / 20人</p>
        </div>

        <button id="csvBtn" style="padding:10px 16px;background:#555;color:white;border:none;border-radius:8px;font-size:15px;margin-bottom:14px;">
          CSV出力
        </button>

        <div style="display:grid;grid-template-columns:280px 1fr;gap:16px;align-items:start;">
          <div style="background:white;border-radius:14px;padding:12px;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
            <h2 style="font-size:18px;margin:0 0 10px;">参加者一覧</h2>
            <div id="nameList"></div>
          </div>

          <div style="background:white;border-radius:14px;padding:18px;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
            <h2 style="font-size:22px;margin:0 0 14px;">
              ${selectedIndex + 1}人目 ${attended[selectedIndex] ? "✅ 出席済み" : ""}
            </h2>

            <label style="font-weight:bold;">名前</label>
            <input id="nameInput"
              value="${selectedName}"
              placeholder="名前"
              style="width:100%;box-sizing:border-box;padding:12px;font-size:18px;margin:6px 0 14px;border-radius:8px;border:1px solid #ccc;"
            >

            <label style="font-weight:bold;">備考1（数値：例 10,20,30）</label>
            <input id="memo1Input"
              value="${memo1[selectedIndex] || ""}"
              placeholder="例 10,20,30"
              inputmode="decimal"
              style="width:100%;box-sizing:border-box;padding:12px;font-size:18px;margin:6px 0 14px;border-radius:8px;border:1px solid #ccc;"
            >

            <label style="font-weight:bold;">備考2</label>
            <input id="memo2Input"
              value="${memo2[selectedIndex] || ""}"
              placeholder="備考2"
              style="width:100%;box-sizing:border-box;padding:12px;font-size:18px;margin:6px 0 18px;border-radius:8px;border:1px solid #ccc;"
            >

            <button id="attendBtn" style="width:100%;padding:16px;font-size:18px;background:#1976d2;color:white;border:none;border-radius:10px;">
              出席を記録
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  document.getElementById("csvBtn").addEventListener("click", downloadCSV);

  const nameList = document.getElementById("nameList");

  for (let i = 0; i < 20; i++) {
    const item = document.createElement("button");
    item.textContent = `${i + 1}. ${names[i] || "名前未入力"} ${attended[i] ? "✅" : ""}`;
    item.style.width = "100%";
    item.style.textAlign = "left";
    item.style.padding = "10px";
    item.style.marginBottom = "6px";
    item.style.borderRadius = "8px";
    item.style.border = i === selectedIndex ? "2px solid #1976d2" : "1px solid #ddd";
    item.style.background = attended[i] ? "#e8f5e9" : (i === selectedIndex ? "#e3f2fd" : "#fff");
    item.style.fontSize = "15px";

    item.addEventListener("click", () => {
      selectedIndex = i;
      renderApp();
    });

    nameList.appendChild(item);
  }

  document.getElementById("nameInput").addEventListener("input", (e) => {
    names[selectedIndex] = e.target.value;
  });

  document.getElementById("nameInput").addEventListener("blur", saveNames);

  document.getElementById("memo1Input").addEventListener("input", (e) => {
    memo1[selectedIndex] = e.target.value.replace(/，/g, ",");
  });

  document.getElementById("memo2Input").addEventListener("input", (e) => {
    memo2[selectedIndex] = e.target.value;
  });

  document.getElementById("attendBtn").addEventListener("click", saveAttendance);
}

async function startApp() {
  await loadNames();
  renderApp();
}

startApp();
