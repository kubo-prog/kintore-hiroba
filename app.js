const SCRIPT_URL = "https://docs.google.com/spreadsheets/d/1G196e7sdopztFEfNpLjR2BtOhwkv29FTRnKBhgjES4E/edit?gid=1016937107#gid=1016937107";

let names = Array(20).fill("");
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
  localStorage.setItem(
    "kintore_names_v1",
    JSON.stringify(names)
  );

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

  const name =
    document.getElementById(`name-${index}`).value;

  const memo1 =
    document.getElementById(`memo1-${index}`).value;

  const memo2 =
    document.getElementById(`memo2-${index}`).value;

  try {

    await fetch(SCRIPT_URL, {
      method: "POST",
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

    alert("出席を記録しました");

  } catch (e) {

    alert("保存失敗");

  }
}

function downloadCSV() {

  let csv =
    "日付,No,氏名,数値,備考,出席\n";

  for (let i = 0; i < 20; i++) {

    const name =
      document.getElementById(`name-${i}`).value;

    const memo1 =
      document.getElementById(`memo1-${i}`).value;

    const memo2 =
      document.getElementById(`memo2-${i}`).value;

    csv +=
      `${recordDate},${i + 1},${name},${memo1},${memo2},出席\n`;
  }

  const blob = new Blob(
    [csv],
    { type: "text/csv" }
  );

  const url =
    URL.createObjectURL(blob);

  const a =
    document.createElement("a");

  a.href = url;

  a.download =
    `attendance_${recordDate}.csv`;

  a.click();

  URL.revokeObjectURL(url);
}

function renderApp() {

  let rows = "";

  for (let i = 0; i < 20; i++) {

    rows += `
      <tr>

        <td style="
          padding:8px;
          border:1px solid #ddd;
          text-align:center;
        ">
          ${i + 1}
        </td>

        <td style="
          padding:8px;
          border:1px solid #ddd;
        ">
          <input
            id="name-${i}"
            value="${names[i] || ""}"
            style="
              width:95%;
              padding:8px;
            "
            onchange="
              names[${i}] = this.value;
              saveNames();
            "
          />
        </td>

        <td style="
          padding:8px;
          border:1px solid #ddd;
        ">
          <input
            id="memo1-${i}"
            placeholder="例 10,20,30"
            style="
              width:95%;
              padding:8px;
            "
          />
        </td>

        <td style="
          padding:8px;
          border:1px solid #ddd;
        ">
          <input
            id="memo2-${i}"
            placeholder="備考"
            style="
              width:95%;
              padding:8px;
            "
          />
        </td>

        <td style="
          padding:8px;
          border:1px solid #ddd;
          text-align:center;
        ">
          <button
            onclick="saveAttendance(${i})"
            style="
              background:#1976d2;
              color:white;
              border:none;
              padding:10px 18px;
              border-radius:8px;
              cursor:pointer;
            "
          >
            出席
          </button>
        </td>

      </tr>
    `;
  }

  document.getElementById("app").innerHTML = `

    <div style="
      max-width:1100px;
      margin:auto;
      padding:20px;
      font-family:sans-serif;
    ">

      <div style="
        background:#1976d2;
        color:white;
        padding:20px;
        border-radius:14px;
        margin-bottom:20px;
      ">

        <h1>筋トレ広場 出席管理</h1>

        <div style="
          margin-top:12px;
        ">
          日付：

          <input
            type="date"
            value="${recordDate}"
            onchange="
              recordDate=this.value
            "
            style="
              padding:6px;
              font-size:16px;
            "
          />
        </div>

      </div>

      <button
        onclick="downloadCSV()"
        style="
          background:#555;
          color:white;
          border:none;
          padding:10px 16px;
          border-radius:8px;
          margin-bottom:12px;
          cursor:pointer;
        "
      >
        CSV出力
      </button>

      <div style="
        overflow-x:auto;
        background:white;
        border-radius:14px;
        box-shadow:0 2px 8px rgba(0,0,0,0.08);
      ">

        <table style="
          width:100%;
          border-collapse:collapse;
        ">

          <thead style="
            background:#f0f0f0;
          ">

            <tr>

              <th style="
                padding:10px;
                border:1px solid #ddd;
              ">
                No.
              </th>

              <th style="
                padding:10px;
                border:1px solid #ddd;
              ">
                名前
              </th>

              <th style="
                padding:10px;
                border:1px solid #ddd;
              ">
                備考1 数値
              </th>

              <th style="
                padding:10px;
                border:1px solid #ddd;
              ">
                備考2
              </th>

              <th style="
                padding:10px;
                border:1px solid #ddd;
              ">
                出席
              </th>

            </tr>

          </thead>

          <tbody>

            ${rows}

          </tbody>

        </table>

      </div>

    </div>
  `;
}

function startApp() {

  document.body.innerHTML =
    `<div id="app"></div>`;

  loadNames();
}

startApp();
