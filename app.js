const SCRIPT_URL = "https://script.google.com/macros/s/AKfyczbz2f-Sh_aMDH9WwB1OQEPIYB-PH7Shv94UL7fIi0yPs-IDqtpqvO8CGP-fYrHmtrmp/exec";

let names = Array(20).fill("");
let memo1 = Array(20).fill("");
let memo2 = Array(20).fill("");

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
    alert("名前の保存に失敗しました。");
    console.log(e);
  }
}

async function saveAttendance(index) {
  const name = names[index];

  if (!name || !name.trim()) {
    alert("名前を入力してください。");
    return;
  }

  try {
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

    alert(`${name} さんの出席を記録しました。`);

    memo1[index] = "";
    memo2[index] = "";
    renderApp();
  } catch (e) {
    alert("記録に失敗しました。");
    console.log(e);
  }
}

function renderApp() {
  const app = document.getElementById("app");

  app.innerHTML = `
    <div style="max-width:900px;margin:20px auto;font-family:sans-serif;padding:16px;">
      <h1>筋トレ広場 出席管理</h1>
      <p>名前は自動保存されます。出席ボタンを押すとGoogleスプレッドシートに記録されます。</p>
      <div id="memberList"></div>
    </div>
  `;

  const list = document.getElementById("memberList");

  for (let i = 0; i < 20; i++) {
    const row = document.createElement("div");
    row.style.border = "1px solid #ddd";
    row.style.borderRadius = "8px";
    row.style.padding = "12px";
    row.style.marginBottom = "12px";
    row.style.background = "#fafafa";

    row.innerHTML = `
      <div style="font-weight:bold;margin-bottom:6px;">${i + 1}人目</div>
      <input 
        value="${names[i] || ""}" 
        placeholder="名前"
        style="width:100%;padding:8px;font-size:16px;margin-bottom:6px;"
      >
      <input 
        value="${memo1[i] || ""}" 
        placeholder="備考1：例 10,20,30"
        inputmode="decimal"
        style="width:100%;padding:8px;font-size:15px;margin-bottom:6px;"
      >
      <input 
        value="${memo2[i] || ""}" 
        placeholder="備考2"
        style="width:100%;padding:8px;font-size:15px;margin-bottom:8px;"
      >
      <button style="padding:10px 20px;font-size:16px;background:#1976d2;color:white;border:none;border-radius:6px;">
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
