const SCRIPT_URL = "https://script.google.com/a/macros/hiu.ac.jp/s/AKfycbz5pA6RN8L54a3cAVqTenPgpYqqNjYJ4jFF2HeOg6zVVi7dT4N0YV_8njgGUKHqzM4_/exec";

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

      while (names.length < 20) {
        names.push("");
      }

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
  try {
    const res = await fetch(SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify({
        action: "saveRecord",
        date: recordDate,
        no: index + 1,
        name: names[index],
        attendance: attended[index] ? "出席" : "欠席",
        memo1: memo1[index],
        memo2: memo2[index]
      })
    });

    alert("出席を記録しました");

  } catch (e) {
    console.log(e);
    alert("保存失敗");
  }
}

function updateAttendanceDisplay() {
  const count = attended.filter(Boolean).length;
  const el = document.getElementById("attendanceCount");

  if (el) {
    el.textContent = `本日の出席：${count} / 20人`;
  }
}

function downloadCSV() {
  let csv =
    "日付,No,氏名,出席,数値,備考\n";

  for (let i = 0; i < 20; i++) {
    csv += `${recordDate},${i + 1},"${names[i]}","${attended[i] ? "出席" : "欠席"}","${memo1[i]}","${memo2[i]}"\n`;
  }

  const blob = new Blob([csv], {
    type: "text/csv"
  });

  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `筋トレ広場_${recordDate}.csv`;
  a.click();

  URL.revokeObjectURL(url);
}

function renderApp() {
  document.body.innerHTML = `
  <div style="font-family:sans-serif;padding:20px;background:#f5f5f5;min-height:100vh;">

    <div style="background:#1565c0;color:white;padding:20px;border-radius:14px;margin-bottom:20px;">
      <h1>筋トレ広場 出席管理</h1>

      <div style="margin-top:10px;">
        日付：
        <input
          type="date"
          id="dateInput"
          value="${recordDate}"
          style="padding:6px;font-size:16px;border-radius:6px;border:none;"
        >
      </div>

      <p id="attendanceCount" style="margin-top:10px;">
        本日の出席：0 / 20人
      </p>
    </div>

    <button
      id="csvBtn"
      style="padding:10px 16px;background:#444;color:white;border:none;border-radius:8px;margin-bottom:20px;"
    >
      CSV出力
    </button>

    <div style="overflow:auto;background:white;padding:10px;border-radius:14px;">
      <table style="width:100%;border-collapse:collapse;min-width:900px;">
        <thead>
          <tr style="background:#eeeeee;">
            <th style="padding:10px;border:1px solid #ddd;">No.</th>
            <th style="padding:10px;border:1px solid #ddd;">名前</th>
            <th style="padding:10px;border:1px solid #ddd;">備考1 数値</th>
            <th style="padding:10px;border:1px solid #ddd;">備考2</th>
            <th style="padding:10px;border:1px solid #ddd;">出席</th>
          </tr>
        </thead>

        <tbody id="memberRows"></tbody>
      </table>
    </div>
  </div>
  `;

  document.getElementById("dateInput")
    .addEventListener("change", (e) => {
      recordDate = e.target.value;
    });

  document.getElementById("csvBtn")
    .addEventListener("click", downloadCSV);

  const tbody = document.getElementById("memberRows");

  for (let i = 0; i < 20; i++) {

    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td style="padding:8px;border:1px solid #ddd;text-align:center;">
        ${i + 1}
      </td>

      <td style="padding:8px;border:1px solid #ddd;">
        <input
          value="${names[i]}"
          style="width:95%;padding:8px;"
          id="name-${i}"
        >
      </td>

      <td style="padding:8px;border:1px solid #ddd;">
        <input
          value="${memo1[i]}"
          placeholder="例 10,20,30"
          style="width:95%;padding:8px;"
          id="memo1-${i}"
        >
      </td>

      <td style="padding:8px;border:1px solid #ddd;">
        <input
          value="${memo2[i]}"
          placeholder="備考"
          style="width:95%;padding:8px;"
          id="memo2-${i}"
        >
      </td>

      <td style="padding:8px;border:1px solid #ddd;text-align:center;">
        <button
          id="btn-${i}"
          style="
            padding:10px 16px;
            border:none;
            border-radius:8px;
            color:white;
            background:${attended[i] ? "#2e7d32" : "#1565c0"};
          "
        >
          ${attended[i] ? "出席済み" : "出席"}
        </button>
      </td>
    `;

    tbody.appendChild(tr);

    document.getElementById(`name-${i}`)
      .addEventListener("change", (e) => {
        names[i] = e.target.value;
        saveNames();
      });

    document.getElementById(`memo1-${i}`)
      .addEventListener("change", (e) => {
        memo1[i] = e.target.value;
      });

    document.getElementById(`memo2-${i}`)
      .addEventListener("change", (e) => {
        memo2[i] = e.target.value;
      });

    document.getElementById(`btn-${i}`)
      .addEventListener("click", async () => {

        attended[i] = !attended[i];

        updateAttendanceDisplay();

        document.getElementById(`btn-${i}`).textContent =
          attended[i] ? "出席済み" : "出席";

        document.getElementById(`btn-${i}`).style.background =
          attended[i] ? "#2e7d32" : "#1565c0";

        await saveAttendance(i);
      });
  }

  updateAttendanceDisplay();
}

loadNames();
