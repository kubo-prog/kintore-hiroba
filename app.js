const SCRIPT_URL = "https://script.google.com/macros/s/AKfyczbz2f-Sh_aMDH9WwB1OQEPIYB-PH7Shv94UL7fIi0yPs-IDqtpqvO8CGP-fYrHmtrmp/exec";

let names = Array(20).fill("");
let memo1 = Array(20).fill("");
let memo2 = Array(20).fill("");
let attended = Array(20).fill(false);
let recordDate = new Date().toISOString().split("T")[0];

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
      date: recordDate,
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

function renderApp() {
  const count = attended.filter(Boolean).length;
  const app = document.getElementById("app");

  app.innerHTML = `
    <div style="font-family:sans-serif;background:#f5f7fb;min-height:100vh;padding:16px;">
      <div style="max-width:1200px;margin:0 auto;">
        <div style="background:#1976d2;color:white;padding:18px;border-radius:14px;margin-bottom:14px;">
          <h1 style="margin:0;font-size:26px;">筋トレ広場 出席管理</h1>

          <div style="margin-top:10px;">
            日付：
            <input 
              type="date"
              id="dateInput"
              value="${recordDate}"
              style="padding:6px;font-size:16px;border-radius:6px;border:none;margin-left:8px;"
            >
          </div>

          <p style="margin:8px 0 0;">本日の出席：${count} / 20人</p>
        </div>

        <div style="overflow-x:auto;background:white;border-radius:14px;box-shadow:0 2px 8px rgba(0,0,0,0.08);padding:10px;">
          <table style="width:100%;border-collapse:collapse;min-width:850px;">
            <thead>
              <tr style="background:#eeeeee;">
                <th style="padding:10px;border:1px solid #ddd;width:50px;">No.</th>
                <th style="padding:10px;border:1px solid #ddd;width:260px;">名前</th>
                <th style="padding:10px;border:1px solid #ddd;">備考1 数値</th>
                <th style="padding:10px;border:1px solid #ddd;">備考2</th>
                <th style="padding:10px;border:1px solid #ddd;width:130px;">出席</th>
              </tr>
            </thead>
            <tbody id="memberRows"></tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  document.getElementById("dateInput").addEventListener("input", (e) => {
    recordDate = e.target.value;
  });

  const tbody = document.getElementById("memberRows");

  for (let i = 0; i < 20; i++) {
    const tr = document.createElement("tr");
    tr.style.background = attended[i] ? "#e8f5e9" : "white";

    tr.innerHTML = `
      <td style="padding:8px;border:1px solid #ddd;text-align:center;font-weight:bold;">${i + 1}</td>

      <td style="padding:8px;border:1px solid #ddd;">
        <input 
          value="${names[i] || ""}" 
          placeholder="名前"
          style="width:100%;box-sizing:border-box;padding:9px;font-size:15px;border-radius:6px;border:1px solid #ccc;"
        >
      </td>

      <td style="padding:8px;border:1px solid #ddd;">
        <input 
          value="${memo1[i] || ""}" 
          placeholder="例 10,20,30"
          inputmode="decimal"
          style="width:100%;box-sizing:border-box;padding:9px;font-size:15px;border-radius:6px;border:1px solid #ccc;"
        >
      </td>

      <td style="padding:8px;border:1px solid #ddd;">
        <input 
          value="${memo2[i] || ""}" 
          placeholder="備考2"
          style="width:100%;box-sizing:border-box;padding:9px;font-size:15px;border-radius:6px;border:1px solid #ccc;"
        >
      </td>

      <td style="padding:8px;border:1px solid #ddd;text-align:center;">
        <button style="padding:10px 16px;font-size:15px;background:${attended[i] ? "#2e7d32" : "#1976d2"};color:white;border:none;border-radius:8px;">
          ${attended[i] ? "出席済み" : "出席"}
        </button>
      </td>
    `;

    const inputs = tr.querySelectorAll("input");
    const button = tr.querySelector("button");

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

    tbody.appendChild(tr);
  }
}

async function startApp() {
  await loadNames();
  renderApp();
}

startApp();
