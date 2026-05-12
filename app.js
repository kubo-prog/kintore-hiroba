const SCRIPT_URL = "https://script.google.com/macros/s/AKfyczbz2f-Sh_aMDH9WwB1OQEPIYB-PH7Shv94UL7fIi0yPs-IDqtpqvO8CGP-fYrHmtrmp/exec";

let names = Array(20).fill("");
let memo1 = Array(20).fill("");
let memo2 = Array(20).fill("");
let attended = Array(20).fill(false);

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

async function saveAttendance(index) {
  const name = names[index];

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
      memo1: memo1[index],
      memo2: memo2[index]
    })
  });

  attended[index] = true;
  memo1[index] = "";
  memo2[index] = "";
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
  const app = document.getElementById("app");

  app.innerHTML = `
    <div style="max-width:1000px;margin:0 auto;font-family:sans-serif;padding:18px;background:#f5f7fb;min-height:100vh;">
      <div style="background:#1976d2;color:white;padding:18px;border-radius:14px;margin-bottom:16px;">
        <h1 style="margin:0;font-size:28px;">筋トレ広場 出席管理</h1>
        <p style="margin:8px 0 0;">本日の出席：${count} / 20人</p>
      </div>

      <div style="display:flex;gap:10px;margin-bottom:16px;">
        <button id="csvBtn" style="padding:10px 16px;background:#555;color:white;border:none;border-radius:8px;font-size:15px;">
          CSV出力
        </button>
      </div>

      <div id="memberList" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:14px;"></div>
    </div>
  `;

  document.getElementById("csvBtn").addEventListener("click", downloadCSV);

  const list = document.getElementById("memberList");

  for (let i = 0; i < 20; i++) {
    const row = document.createElement("div");

    row.style.border = attended[i] ? "2px solid #2e7d32" : "1px solid #ddd";
    row.style.borderRadius = "14px";
    row.style.padding = "14px";
    row.style.background = attended[i] ? "#e8f5e9" : "white";
    row.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)";

    row.innerHTML = `
      <div style="font-weight:bold;font-size:18px;margin-bottom:8px;">
        ${i + 1}人目 ${attended[i] ? "✅ 出席済み" : ""}
      </div>

      <input 
        value="${names[i] || ""}" 
        placeholder="名前"
        style="width:100%;box-sizing:border-box;padding:10px;font-size:16px;margin-bottom:8px;border-radius:8px;border:1px solid #ccc;"
      >

      <input 
        value="${memo1[i] || ""}" 
        placeholder="備考1：例 10,20,30"
        inputmode="decimal"
        style="width:100%;box-sizing:border-box;padding:10px;font-size:15px;margin-bottom:8px;border-radius:8px;border:1px solid #ccc;"
      >

      <input 
        value="${memo2[i] || ""}" 
        placeholder="備考2"
        style="width:100%;box-sizing:border-box;padding:10px;font-size:15px;margin-bottom:10px;border-radius:8px;border:1px solid #ccc;"
      >

      <button style="width:100%;padding:12px;font-size:16px;background:#1976d2;color:white;border:none;border-radius:10px;">
        出席を記録
      </button>
    `;

    const inputs = row.querySelectorAll("input");
    const button = row.querySelector("button");

    inputs[0].addEventListener("input", (e) => {
      names[i] = e.target.value;
    });

    inputs[0].addEventListener("blur", saveNames);

    inputs[1].addEventListener("input", (e) => {
      memo1[i] = e.target.value.replace(/，/g, ",");
    });

    inputs[2].addEventListener("input", (e) => {
      memo2[i] = e.target.value;
    });

    button.addEventListener("click", () => saveAttendance(i));

    list.appendChild(row);
  }
}

async function startApp() {
  await loadNames();
  renderApp();
}

startApp();
