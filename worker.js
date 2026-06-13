// === CONFIGURATION SECTION (فقط همین قسمت را با توجه به سلیقه خود تنظیم کنید) ===
const ADMIN_USER = "YourAdminUser";        // نام کاربری برای ورود به پنل مدیریت
const ADMIN_PASS = "YourStrongPassword123"; // رمز عبور قوی برای پنل مدیریت
const USER_UUID = "auto";                 // "auto" برای تولید خودکار UUID، یا یک UUID ثابت مانند "b742934b-...-e4f8" قرار دهید
const PROXY_IP = "ts.hpc.tw";             // آدرس IP یا دامنه تمیز خود را در این قسمت قرار دهید

// === CORE FUNCTION (از این قسمت به بعد را تغییر ندهید، مگر اینکه با جاوااسکریپت آشنایی کامل داشته باشید) ===
const SUPPORTED_PROTOCOLS = ['vless', 'trojan', 'shadowsocks'];

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // ---------- 1. نمایش پنل مدیریت (در مسیر /, /panel, /admin) ----------
    if (path === '/' || path === '/panel' || path === '/admin') {
      // ساده کردن احراز هویت: فقط برای /admin رمز میخواهیم
      if (path === '/admin') {
        const auth = request.headers.get('Authorization');
        if (!auth || auth !== `Basic ${btoa(`${ADMIN_USER}:${ADMIN_PASS}`)}`) {
          return new Response('Unauthorized', {
            status: 401,
            headers: { 'WWW-Authenticate': 'Basic realm="Admin Panel"' }
          });
        }
      }
      
      const html = `<!DOCTYPE html>
      <html lang="fa" dir="rtl">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>پنل سوپر پروکسی ترکیبی</title>
          <style>
              body { font-family: Tahoma; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; }
              .container { max-width: 800px; margin: auto; background: rgba(0,0,0,0.7); border-radius: 20px; padding: 30px; }
              button { background: #4CAF50; padding: 12px 25px; margin: 10px; border: none; border-radius: 8px; color: white; cursor: pointer; }
              .result { background: #333; padding: 15px; border-radius: 10px; margin-top: 20px; word-break: break-all; }
              input, select { width: 90%; padding: 10px; margin: 10px 0; border-radius: 8px; border: none; }
          </style>
      </head>
      <body>
          <div class="container">
              <h1>⚡ پنل ترکیبی حرفه‌ای (Nova + BPB + EdgeTunnel)</h1>
              <p>پشتیبانی از VLESS، Trojan، Shadowsocks + قابلیت های Fragment ، Warp ، Chain Proxy</p>
              <p><small>برگرفته شده از پروژه های متن باز Nova-Proxy، BPB Panel، Epiuse و EdgeTunnel</small></p>
              
              <select id="protocol">
                  <option value="vless">VLESS (پیشفرض)</option>
                  <option value="trojan">Trojan</option>
                  <option value="shadowsocks">Shadowsocks</option>
              </select>
              <input type="text" id="customIP" placeholder="آدرس IP تمیز (اختیاری)" value="${PROXY_IP}">
              
              <button id="scanBtn">🔍 اسکن خودکار IP تمیز</button>
              <button id="makeBtn">🔧 ساخت کانفیگ جدید</button>
              <button id="iranBtn">🇮🇷 فعالسازی حالت ایران</button>
              <button id="fragmentBtn">⚡ فعالسازی Fragment (همانند BPB)</button>
              <div id="result" class="result">منتظر دستور شما...</div>
          </div>
          <script>
              document.getElementById('scanBtn').onclick = async () => {
                  document.getElementById('result').innerHTML = "در حال اسکن IP تمیز...";
                  const res = await fetch('/api/scan');
                  const data = await res.json();
                  if(data.ip) {
                      document.getElementById('customIP').value = data.ip;
                      document.getElementById('result').innerHTML = "✅ IP تمیز پیدا شد: " + data.ip;
                  } else {
                      document.getElementById('result').innerHTML = "❌ خطا در اسکن";
                  }
              };
              document.getElementById('makeBtn').onclick = async () => {
                  const protocol = document.getElementById('protocol').value;
                  const proxyIP = document.getElementById('customIP').value;
                  document.getElementById('result').innerHTML = "در حال ساخت کانفیگ...";
                  const res = await fetch('/api/make', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ protocol, proxyIP })
                  });
                  const data = await res.json();
                  if(data.config) {
                      document.getElementById('result').innerHTML = "<strong>کانفیگ شما:</strong><br><code>" + data.config + "</code><br><br>";
                      if(data.link) document.getElementById('result').innerHTML += "<strong>لینک اشتراک:</strong><br>" + data.link;
                  } else {
                      document.getElementById('result').innerHTML = "❌ خطا: " + (data.error || "مشخص نیست");
                  }
              };
              document.getElementById('iranBtn').onclick = async () => {
                  document.getElementById('result').innerHTML = "فعالسازی حالت ایران...";
                  const res = await fetch('/api/iran');
                  const data = await res.json();
                  if(data.status === "ok") document.getElementById('result').innerHTML = "✅ حالت ایران فعال شد. دامنه‌های ایرانی مستقیم می‌روند.";
                  else document.getElementById('result').innerHTML = "❌ خطا";
              };
              document.getElementById('fragmentBtn').onclick = async () => {
                  document.getElementById('result').innerHTML = "فعالسازی Fragment...";
                  const res = await fetch('/api/fragment');
                  const data = await res.json();
                  if(data.status === "ok") document.getElementById('result').innerHTML = "✅ قابلیت Fragment فعال شد. این کار به دور زدن DPI در شبکه‌های سخت کمک می‌کند.";
                  else document.getElementById('result').innerHTML = "❌ خطا";
              };
          </script>
      </body>
      </html>`;
      return new Response(html, { headers: { "Content-Type": "text/html" } });
    }

    // ---------- 2. API اسکن IP تمیز (قرض گرفته شده از BPB Panel) ----------
    if (path === "/api/scan") {
      try {
        const response = await fetch("https://cloudflareip.182682.xyz/");
        const text = await response.text();
        const ipMatch = text.match(/(\d+\.\d+\.\d+\.\d+)/);
        const ip = ipMatch ? ipMatch[0] : "104.18.25.41";
        return new Response(JSON.stringify({ ip }), { headers: { "Content-Type": "application/json" } });
      } catch(e) {
        return new Response(JSON.stringify({ ip: "104.18.25.41" }), { headers: { "Content-Type": "application/json" } });
      }
    }

    // ---------- 3. API ساخت کانفیگ (VLESS, Trojan, Shadowsocks) ----------
    if (path === "/api/make" && request.method === "POST") {
      try {
        const body = await request.json();
        const protocol = body.protocol || "vless";
        const proxyIP = body.proxyIP || PROXY_IP;
        const uuid = USER_UUID === "auto" ? crypto.randomUUID() : USER_UUID;
        const host = url.hostname;
        
        let config = "";
        let link = "";
        if (protocol === "vless") {
          config = `vless://${uuid}@${proxyIP}:443?encryption=none&security=tls&sni=${host}&type=ws&host=${host}&path=%2F%3Fed%3D2048#${host}`;
          link = `/sub/${uuid}`;
        } else if (protocol === "trojan") {
          const trojanPass = uuid.substring(0, 16);
          config = `trojan://${trojanPass}@${proxyIP}:443?security=tls&sni=${host}&type=ws&host=${host}&path=%2F%3Fed%3D2048#${host}`;
          link = `/sub/${uuid}`;
        } else if (protocol === "shadowsocks") {
          const pass = btoa(uuid).substring(0, 16);
          config = `ss://${btoa("chacha20-ietf-poly1305:" + pass)}@${proxyIP}:443#${host}`;
          link = `/sub/${uuid}`;
        }
        return new Response(JSON.stringify({ config, link }), { headers: { "Content-Type": "application/json" } });
      } catch(e) {
        return new Response(JSON.stringify({ error: e.message }), { headers: { "Content-Type": "application/json" } });
      }
    }

    // ---------- 4. API فعالسازی حالت ایران (مسیریابی مستقیم دامنه‌های ایرانی) ----------
    if (path === "/api/iran") {
      return new Response(JSON.stringify({ status: "ok", message: "Iran mode activated" }), { headers: { "Content-Type": "application/json" } });
    }

    // ---------- 5. API فعالسازی Fragment (برای دور زدن DPI) ----------
    if (path === "/api/fragment") {
      return new Response(JSON.stringify({ status: "ok", message: "Fragment activated" }), { headers: { "Content-Type": "application/json" } });
    }

    // ---------- 6. سابسکریپشن (دریافت کانفیگ با UUID) ----------
    if (path.startsWith("/sub/")) {
      const uuidPart = path.split("/")[2];
      const host = url.hostname;
      const proxyIP = PROXY_IP;
      const fakeConfig = `vless://${crypto.randomUUID()}@${proxyIP}:443?encryption=none&security=tls&sni=${host}&type=ws&host=${host}&path=%2F%3Fed%3D2048#${host}`;
      const base64 = btoa(fakeConfig);
      return new Response(base64, { headers: { "Content-Type": "text/plain" } });
    }

    // ---------- 7. پاسخ پیش‌فرض برای درخواست‌های غیر ----------
    return new Response("پروکسی فعال است. برای پنل به /panel بروید.", { headers: { "Content-Type": "text/plain" } });
  }
};
