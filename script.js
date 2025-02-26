window.onload = function () {
  const urlParams = new URLSearchParams(window.location.search);
  const sessionId = urlParams.get("session_id");

  if (!sessionId) {
    window.location = "https://octabyte.io";
  }

  const progressBar = document.getElementById("progress-bar");
  const percentageBar = document.getElementById("percentage-bar");

  const url = "wss://admin.octabyte.app/websocket";

  const connection = new WebSocket(url);

  connection.addEventListener("open", function () {
    subscribe();
  });

  connection.addEventListener("message", function (message) {
    const data = JSON.parse(message.data);

    if (data.type === "auth" && data.status === "ok") {
      subscribe();
    }

    if (data.type === "ping") {
      pong();
    }

    if (
      data.type === "subscription" &&
      data.event === "update" &&
      data.data?.length
    ) {
      updateProgress(data.data[0]);
    }
  });

  function updateProgress(data) {
    const value = data.progress;
    progressBar.value = value;
    percentageBar.textContent = `${value}%`;

    if (value == 100) {
      window.location = data.service_domain;
    }
  }

  function subscribe() {
    connection.send(
      JSON.stringify({
        type: "subscribe",
        collection: "customer_services",
        event: "update",
        query: {
          filter: {
            session_id: sessionId,
          },
          limit: 1,
        },
      })
    );
  }

  function pong() {
    connection.send(
      JSON.stringify({
        type: "pong",
      })
    );
  }
};
