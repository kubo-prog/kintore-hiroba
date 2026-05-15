const SCRIPT_URL = "https://script.google.com/macros/s/AKfyczbz2f-Sh_aMDH9WwB1OQEPIYB-PH7Shv94UL7fIi0yPs-IDqtpqvO8CGP-fYrHmtrmp/exec";

let names = Array(20).fill("");
let recordDate = new Date().toISOString().split("T")[0];
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

  renderApp();
}

async function saveNames() {
  try {
    await fetch(SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      body: JSON.stringify({
        action: "saveNames",
        names: names
      })
    });
  } catch (e) {
    console.log(e);
  }
}

async function saveAttendance(index) {
  const name = document.getElementById(`name-${index}`).value;
  const memo1 = document.getElementById(`memo1-${index}`).value;
  const memo2 = document.getElementById(`memo2-${index}`).value;

  if (!name.trim()) {
    alert("名前を入力してください");
    return;
  }

  try {
    await fetch(SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      body: JSON.stringify({
        action: "saveRecord",
        date: recordDate,
        no: index + 1,
        name: name,
        attendance: "出席",
        memo1: memo1,
        memo2: memo2
      })
    });

    attended[index] = true;
    updateAttendanceDisplay();

    const button = document.getElementById(`btn-${index}`);
    const row = document.getElementById(`row-${index}`);

    button.textContent = "出席済み";
    button.style.background = "#2e7d32";
    row.style.background = "#e8f5e9";

    alert("出席を記録しました");
  } catch (e) {
    alert("保存失敗");
    console.log(e);
  }
}

function updateAttendanceDisplay() {
  const count = attended.filter(Boolean).length;
  const countEl = document.getElementById("attendanceCount");

  if (countEl) {
    countEl.textContent = `本日の出席：${count} / 20人`;
  }
}

function downloadCSV() {
  let csv = "\uFEFF日付,No,氏名,数値,備考,出席\n";

  for (let i = 0; i < 20; i++) {
    const name = document.getElementById(`name-${i}`).value;
    const memo1 = document.getElementById(`memo1-${i}`).value;
    const memo2 = document.getElementById(`memo2-${i}`).value;
    const status = attended[i] ? "出席" : "";

    csv += `${recordDate},${i + 1},"${name}","${memo1}","${memo2}","${status}"\n`;
  }

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");

  a.href = url;
  a.download = `attendance_${recordDate}.csv`;
  a.click();

  URL.revokeObjectURL(url);
}

function renderApp() {
  let rows = "";

  for (let i = 0; i < 20; i++) {
    rows += `
      <tr id="row-${i}" style="background:${attended[i] ? "#e8f5e9" : "white"};">
        <td style="padding:8px;border:1px solid #ddd;text-align:center;">
          ${i + 1}
        </td>

        <td style="padding:8px;border:1px solid #ddd;">
          <input
            id="name-${i}"
            value="${names[i] || ""}"
            style="width:95%;padding:8px;"
            onchange="
              names[${i}] = this.value;
              saveNames();
            "
          />
        </td>

        <td style="padding:8px;border:1px solid #ddd;">
          <input
            id="memo1-${i}"
            placeholder="例 10,20,30"
            style="width:95%;padding:8px;"
            oninput="this.value = this.value.replace(/，/g, ',')"
          />
        </td>

        <td style="padding:8px;border:1px solid #ddd;">
          <input
            id="memo2-${i}"
            placeholder="備考"
            style="width:95%;padding:8px;"
          />
        </td>

        <td style="padding:8px;border:1px solid #ddd;text-align:center;">
          <button
            id="btn-${i}"
            onclick="saveAttendance(${i})"
            style="
              background:${attended[i] ? "#2e7d32" : "#1976d2"};
              color:white;
              border:none;
              padding:10px 18px;
              border-radius:8px;
              cursor:pointer;
            "
          >
            ${attended[i] ? "出席済み" : "出席"}
          </button>
        </td>
      </tr>
    `;
  }

  document.getElementById("app").innerHTML = `
    <div style="max-width:1100px;margin:auto;padding:20px;font-family:sans-serif;">
      <div style="background:#1976d2;color:white;padding:20px;border-radius:14px;margin-bottom:20px;">
        <h1 style="margin-top:0;">筋トレ広場 出席管理</h1>

        <div style="margin-top:12px;">
          日付：
          <input
            type="date"
            value="${recordDate}"
            onchange="recordDate=this.value"
            style="padding:6px;font-size:16px;"
          />
        </div>

        <p id="attendanceCount" style="margin-bottom:0;">
          本日の出席：0 / 20人
        </p>
      </div>

      <button
        onclick="downloadCSV()"
        style="background:#555;color:white;border:none;padding:10px 16px;border-radius:8px;margin-bottom:12px;cursor:pointer;"
      >
        CSV出力
      </button>

      <div style="overflow-x:auto;background:white;border-radius:14px;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
        <table style="width:100%;border-collapse:collapse;">
          <thead style="background:#f0f0f0;">
            <tr>
              <th style="padding:10px;border:1px solid #ddd;">No.</th>
              <th style="padding:10px;border:1px solid #ddd;">名前</th>
              <th style="padding:10px;border:1px solid #ddd;">備考1 数値</th>
              <th style="padding:10px;border:1px solid #ddd;">備考2</th>
              <th style="padding:10px;border:1px solid #ddd;">出席</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </div>
    </div>
  `;

  updateAttendanceDisplay();
}

function startApp() {
  document.body.innerHTML = `<div id="app"></div>`;
  loadNames();
}

startApp();
