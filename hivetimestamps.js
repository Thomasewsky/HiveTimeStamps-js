// hivetimestamps.js (embed version)
window.HiveTimestamp = {
  timestampPost: function ({ author, permlink, title, body }) {
    const combined = title + body + author + permlink;
    const encoder = new TextEncoder();
    crypto.subtle.digest("SHA-256", encoder.encode(combined)).then(buffer => {
      const hashArray = Array.from(new Uint8Array(buffer));
      const filehash = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

      const jsonData = {
        type: "post",
        author,
        permlink,
        hash: filehash,
        timestamp: new Date().toISOString()
      };

      if (!window.hive_keychain) {
        alert("Hive Keychain is not installed.");
        return;
      }

      window.hive_keychain.requestCustomJson(
        author.startsWith("@") ? author.slice(1) : author,
        "hivetimestamp",
        "Posting",
        JSON.stringify(jsonData),
        "Timestamp this post",
        function (res) {
          if (res.success) {
            const receipt = {
              ...jsonData,
              network: "Hive",
              txid: res.result.id,
              explorer: `https://hiveblocks.com/tx/${res.result.id}`
            };

            const blob = new Blob([JSON.stringify(receipt, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${permlink}.hts`;
            a.click();

            alert("✅ Timestamp created and saved.");
          } else {
            alert("❌ Could not sign timestamp.");
          }
        }
      );
    });
  }
};
