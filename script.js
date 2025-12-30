async function loadData() {
  const res = await fetch("/api/data");
  const data = await res.json();

  if (document.getElementById("event")) {
    document.getElementById("event").innerText = data.match.event;
    document.getElementById("score").innerText =
      `${data.match.teamA} ${data.match.scoreA} - ${data.match.scoreB} ${data.match.teamB}`;
  }

  const list = document.getElementById("players");
  if (list) {
    list.innerHTML = "";
    data.players.forEach(p => {
      const li = document.createElement("li");
      li.innerText = `${p.username} (${p.team})`;
      list.appendChild(li);
    });
  }
}

async function signIn() {
  await fetch("/api/player", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({
      username: document.getElementById("username").value,
      team: document.getElementById("team").value
    })
  });
  loadData();
}

async function login() {
  const res = await fetch("/api/admin/login", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ password: document.getElementById("password").value })
  });

  if (res.ok) {
    document.getElementById("adminPanel").classList.remove("hidden");
  } else {
    alert("Wrong password");
  }
}

async function updateMatch() {
  await fetch("/api/admin/update", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({
      match: {
        event: event.value,
        teamA: teamA.value,
        teamB: teamB.value,
        scoreA: scoreA.value,
        scoreB: scoreB.value,
        goals: [],
        points: {}
      }
    })
  });
  alert("Updated!");
}

setInterval(loadData, 2000);
loadData();
